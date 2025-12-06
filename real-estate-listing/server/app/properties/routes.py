from app.properties import bp
from app.models.property import Property
from app.models.realtor import Realtor
from app.models.purchase import Purchase
from flask import jsonify, request
from app.extensions import db
import uuid
import os
import requests
from app.middleware.authenticate import authenticate_user
from app.middleware.admin import require_admin
from sqlalchemy import func


# Get all properties
@bp.route('/property/all_properties')
def get_all_properties():
    page_number = request.args.get('page', 1, type=int)
    # Query the table with all properties
    pagination_properties = Property.query.filter(
        Property.active == True).paginate(page=page_number, per_page=20)

    # If properties is None return a empty list
    if pagination_properties == None:
        return jsonify({"properties": [], "pages": 0}), 200
    # Extract pagination items and number of pages
    properties = pagination_properties.items
    number_of_pages = pagination_properties.pages
    # init an empty list
    list_items_with_images = []

    # Iterate the properties while appending the list with images of the property
    for property_item in properties:
        listed_property = property_item.serialize()
        listed_property["property_images"] = property_item.get_property_images()
        list_items_with_images.append(listed_property)

    response_data = {
        "properties": list_items_with_images,
        "pages": number_of_pages
    }
    return jsonify(response_data)


# Get a property of a specific ID
@bp.get('/property/<property_id>')
def get_property(property_id):
    print(f"[BACKEND] Fetching property with ID: {property_id}")
    # Query the db for the property of `id`
    result = Property.query.get(property_id)
    # Check if property is not found
    if result == None:
        print(f"[BACKEND] Property {property_id} not found in database")
        # Return error msg
        return jsonify({"msg": f"property of id {property_id} not found"}), 200
    # Get the images of the property and return only the url
    property_images = result.get_property_images()
    print(f"[BACKEND] Found property: {result.id}, {result.address}, {len(property_images)} images")
    print(f"[BACKEND] Property data from DB:")
    print(f"  - bedrooms (unitCount): {result.bedrooms}")
    print(f"  - size (acreage): {result.size}")
    print(f"  - property_type: {result.property_type}")
    print(f"  - price: {result.price}")
    
    # Get realtor contact information
    realtor = Realtor.query.get(result.owner_id)
    realtor_info = None
    if realtor:
        realtor_info = {
            "contact_name": realtor.company_name,
            "contact_email": realtor.company_mail,
            "contact_phone": realtor.contact,
            "realtor_id": realtor.realtor_id,  # Add Firebase user ID for ownership check
        }
        print(f"[BACKEND] Realtor contact info:")
        print(f"  - name: {realtor.company_name}")
        print(f"  - email: {realtor.company_mail}")
        print(f"  - phone: {realtor.contact}")
        print(f"  - realtor_id (Firebase): {realtor.realtor_id}")
    
    # Convert the property values to dictionary
    property_id_result = result.serialize()
    # Append the value of property_images with a list of images of the property
    property_id_result["property_images"] = property_images
    # Add realtor contact information
    if realtor_info:
        property_id_result["realtor"] = realtor_info
    
    print(f"[BACKEND] Serialized property data:")
    print(f"  - bedrooms: {property_id_result.get('bedrooms')}")
    print(f"  - size: {property_id_result.get('size')}")
    print(f"  - property_type: {property_id_result.get('property_type')}")
    return jsonify(property_id_result), 200


# post a property to the db
@bp.post('/property/new_property/<realtor_id>')
@authenticate_user
def create_property(realtor_id):
    # Get Firebase user ID from token
    firebase_user_id = request.user.get('uid')
    if not firebase_user_id:
        return jsonify({"message": "User ID not found in token"}), 401
    
    # Get request data once (can only call get_json() once per request)
    request_data = request.get_json()
    if not request_data:
        return jsonify({"message": "Invalid request data"}), 400
    
    # Check if realtor exists, if not create one
    user = Realtor.query.filter_by(realtor_id=firebase_user_id).first()
    if user is None:
        # Auto-create a realtor profile for the seller
        user_email = request.user.get('email', '')
        user_name = request.user.get('name', 'Seller')
        
        user = Realtor(
            id=str(uuid.uuid4()),
            realtor_id=firebase_user_id,
            company_name=request_data.get('contact_name', request_data.get('company_name', user_name)),
            description=request_data.get('description', 'Property seller'),
            profile_picture=request_data.get('profile_picture', ''),
            company_mail=request_data.get('contact_email', user_email),
            website_url=request_data.get('website_url', ''),
            contact=request_data.get('contact', '')
        )
        db.session.add(user)
        db.session.flush()  # Flush to get the ID without committing
    else:
        # Update realtor contact info if provided
        if request_data.get('contact_name'):
            user.company_name = request_data.get('contact_name', user.company_name)
        if request_data.get('contact_email'):
            user.company_mail = request_data.get('contact_email', user.company_mail)
        if request_data.get('contact'):
            user.contact = request_data.get('contact', user.contact)
        db.session.flush()
    
    # Always use the realtor's database ID (user.id) as the owner_id
    # The realtor_id parameter in the URL is just for routing, we use the actual realtor's ID
    actual_realtor_id = user.id

    # Get property images from request
    property_images = request_data.get('property_images', [])
    print(f"[BACKEND] Received property_images: {len(property_images)} images")
    if property_images:
        print(f"[BACKEND] First image URL: {property_images[0][:100]}...")
    else:
        print("[BACKEND] No images provided")

    # Log the data being saved
    print(f"[BACKEND] Property data being saved:")
    print(f"  - bedrooms (unitCount): {request_data.get('bedrooms')}")
    print(f"  - size (acreage): {request_data.get('size', '')}")
    print(f"  - property_type: {request_data.get('property_type')}")
    print(f"  - price: {request_data.get('price')}")
    print(f"  - address: {request_data.get('address')}")
    print(f"  - location: {request_data.get('location')}")

    # Create a new property
    new_property = Property(id=str(uuid.uuid4()),
                            owner_id=actual_realtor_id,
                            location=request_data['location'],
                            description=request_data['description'],
                            property_images=property_images,
                            address=request_data['address'],
                            bedrooms=request_data['bedrooms'],
                            bathrooms=request_data['bathrooms'],
                            category=request_data['category'],
                            price=request_data['price'],
                            property_type=request_data['property_type'],
                            size=request_data.get("size", ""))

    try:
        db.session.add(new_property)
        db.session.commit()
        
        # Verify images were saved
        saved_images = new_property.get_property_images()
        print(f"[BACKEND] Property {new_property.id} created successfully")
        print(f"[BACKEND] Saved {len(saved_images)} images to database")
        if saved_images:
            print(f"[BACKEND] First saved image: {saved_images[0][:100]}...")
        
        # Verify all data was saved correctly
        print(f"[BACKEND] Verified saved property data:")
        print(f"  - bedrooms (unitCount): {new_property.bedrooms}")
        print(f"  - size (acreage): {new_property.size}")
        print(f"  - property_type: {new_property.property_type}")
        print(f"  - price: {new_property.price}")

        return jsonify({
            "message": f"Property {new_property.id} created successfully", 
            "property_id": new_property.id,
            "images_saved": len(saved_images)
        }), 201
    except Exception as e:
        print(f"[BACKEND] Error creating property: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Admin: Delete property
@bp.delete('/property/admin/delete/<property_id>')
@authenticate_user
@require_admin
def admin_delete_property(property_id):
    property_details = Property.query.get(property_id)
    if property_details is None:
        return jsonify({"message": "Property not found"}), 404
    
    try:
        db.session.delete(property_details)
        db.session.commit()
        print(f"[ADMIN] Property {property_id} deleted by admin {request.user.get('email')}")
        return jsonify({"message": "Property deleted successfully"}), 200
    except Exception as e:
        print(f"[ADMIN] Error deleting property: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Admin: Deactivate property (delist)
@bp.patch('/property/admin/deactivate/<property_id>')
@authenticate_user
@require_admin
def admin_deactivate_property(property_id):
    property_details = Property.query.get(property_id)
    if property_details is None:
        return jsonify({"message": "Property not found"}), 404
    
    try:
        property_details.active = False
        db.session.commit()
        print(f"[ADMIN] Property {property_id} deactivated by admin {request.user.get('email')}")
        return jsonify({"message": "Property deactivated successfully"}), 200
    except Exception as e:
        print(f"[ADMIN] Error deactivating property: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Admin: Activate property (relist)
@bp.patch('/property/admin/activate/<property_id>')
@authenticate_user
@require_admin
def admin_activate_property(property_id):
    property_details = Property.query.get(property_id)
    if property_details is None:
        return jsonify({"message": "Property not found"}), 404
    
    try:
        property_details.active = True
        db.session.commit()
        print(f"[ADMIN] Property {property_id} activated by admin {request.user.get('email')}")
        return jsonify({"message": "Property activated successfully"}), 200
    except Exception as e:
        print(f"[ADMIN] Error activating property: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Admin: Get all properties (including inactive)
@bp.get('/property/admin/all')
@authenticate_user
@require_admin
def admin_get_all_properties():
    page_number = request.args.get('page', 1, type=int)
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    
    query = Property.query
    if not include_inactive:
        query = query.filter(Property.active == True)
    
    pagination_result = query.order_by(Property.date_created.desc()).paginate(page=page_number, per_page=20)
    
    if pagination_result is None:
        return jsonify({"properties": [], "pages": 0}), 200
    
    serialized_results = []
    for property_item in pagination_result.items:
        item = property_item.serialize()
        item["property_images"] = property_item.get_property_images()
        # Include realtor info
        realtor = Realtor.query.get(property_item.owner_id)
        if realtor:
            item["realtor"] = {
                "company_name": realtor.company_name,
                "contact_email": realtor.company_mail,
                "contact_phone": realtor.contact,
                "realtor_id": realtor.realtor_id,
            }
        serialized_results.append(item)
    
    return jsonify({
        "properties": serialized_results,
        "pages": pagination_result.pages
    }), 200


# Update property
@bp.patch('/property/update_property/<realtor_id>/<property_id>')
@authenticate_user
def update_property(realtor_id, property_id):
    property_details = Property.query.get(property_id)
    request_data = request.get_json()

    if property_details is None:
        return "Bad request", 404
    print(property_details.owner_id, realtor_id)
    if str(property_details.owner_id) != str(realtor_id):
        return jsonify("Not the owner of property"), 403

    try:
        property_details.location = request_data['location']
        property_details.description = request_data['description']
        property_details.property_images = request_data['property_images']
        property_details.address = request_data['address']
        property_details.bedrooms = request_data['bedrooms']
        property_details.bathrooms = request_data['bathrooms']
        property_details.category = request_data['category']
        property_details.price = request_data['price']
        property_details.property_type = request_data['property_type']
        db.session.commit()

        updated_property = Property.query.get(property_id)
        updated_property_images = updated_property.get_property_images()

        serialized_property = updated_property.serialize()
        serialized_property['property_images'] = updated_property_images

        return jsonify(serialized_property), 200
    except Exception as e:
        print(e)
        db.session.rollback()
        return "An error occured", 500


# Update property availability
@bp.patch('/property/update_property_availability/<realtor_id>/<property_id>')
@authenticate_user
def update_property_availability(realtor_id, property_id):
    property_details = Property.query.get(property_id)
    request_data = request.get_json()

    if property_details is None:
        return "Bad request", 404

    if str(property_details.owner_id) != str(realtor_id):
        return "Not owner", 403

    try:
        if request_data['action'] == 'activate':
            property_details.active = True
            db.session.commit()
            return "Activated property!", 200
        elif request_data['action'] == 'deactivate':
            property_details.active = False
            db.session.commit()
            return "Deactivated property!", 200
        else:
            return "Bad request", 404

    except Exception as e:
        return "An error occured", 500


# Delist property (set active=False)
@bp.patch('/property/delist/<property_id>')
@authenticate_user
def delist_property(property_id):
    # Get Firebase user ID from token
    firebase_user_id = request.user.get('uid')
    if not firebase_user_id:
        return jsonify({"message": "User ID not found in token"}), 401
    
    # Find realtor by Firebase user ID
    realtor = Realtor.query.filter_by(realtor_id=firebase_user_id).first()
    if not realtor:
        return jsonify({"message": "Realtor profile not found"}), 404
    
    # Get property
    property_details = Property.query.get(property_id)
    if property_details is None:
        return jsonify({"message": "Property not found"}), 404
    
    # Verify ownership
    if str(property_details.owner_id) != str(realtor.id):
        return jsonify({"message": "You don't have permission to delist this property"}), 403
    
    try:
        property_details.active = False
        db.session.commit()
        print(f"[BACKEND] Property {property_id} delisted by {firebase_user_id}")
        return jsonify({"message": "Property delisted successfully"}), 200
    except Exception as e:
        print(f"[BACKEND] Error delisting property: {e}")
        db.session.rollback()
        return jsonify({"message": "An error occurred"}), 500


# Relist property (set active=True)
@bp.patch('/property/relist/<property_id>')
@authenticate_user
def relist_property(property_id):
    # Get Firebase user ID from token
    firebase_user_id = request.user.get('uid')
    if not firebase_user_id:
        return jsonify({"message": "User ID not found in token"}), 401
    
    # Find realtor by Firebase user ID
    realtor = Realtor.query.filter_by(realtor_id=firebase_user_id).first()
    if not realtor:
        return jsonify({"message": "Realtor profile not found"}), 404
    
    # Get property
    property_details = Property.query.get(property_id)
    if property_details is None:
        return jsonify({"message": "Property not found"}), 404
    
    # Verify ownership
    if str(property_details.owner_id) != str(realtor.id):
        return jsonify({"message": "You don't have permission to relist this property"}), 403
    
    try:
        property_details.active = True
        db.session.commit()
        print(f"[BACKEND] Property {property_id} relisted by {firebase_user_id}")
        return jsonify({"message": "Property relisted successfully"}), 200
    except Exception as e:
        print(f"[BACKEND] Error relisting property: {e}")
        db.session.rollback()
        return jsonify({"message": "An error occurred"}), 500


# Delete property
@bp.delete('/property/delete/<property_id>')
@authenticate_user
def delete_property(property_id):
    # Get Firebase user ID from token
    firebase_user_id = request.user.get('uid')
    if not firebase_user_id:
        return jsonify({"message": "User ID not found in token"}), 401
    
    # Find realtor by Firebase user ID
    realtor = Realtor.query.filter_by(realtor_id=firebase_user_id).first()
    if not realtor:
        return jsonify({"message": "Realtor profile not found"}), 404
    
    # Get property
    property_details = Property.query.get(property_id)
    if property_details is None:
        return jsonify({"message": "Property not found"}), 404
    
    # Verify ownership
    if str(property_details.owner_id) != str(realtor.id):
        return jsonify({"message": "You don't have permission to delete this property"}), 403
    
    try:
        db.session.delete(property_details)
        db.session.commit()
        print(f"[BACKEND] Property {property_id} deleted by {firebase_user_id}")
        return jsonify({"message": "Property deleted successfully"}), 200
    except Exception as e:
        print(f"[BACKEND] Error deleting property: {e}")
        db.session.rollback()
        return jsonify({"message": "An error occurred"}), 500


# Get all properties for current user (seller)
@bp.get('/property/my_properties')
@authenticate_user
def get_my_properties():
    # Get Firebase user ID from token
    firebase_user_id = request.user.get('uid')
    if not firebase_user_id:
        return jsonify({"message": "User ID not found in token"}), 401
    
    # Find realtor by Firebase user ID
    realtor = Realtor.query.filter_by(realtor_id=firebase_user_id).first()
    if not realtor:
        return jsonify({"properties": [], "pages": 0}), 200
    
    page_number = request.args.get('page', 1, type=int)
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    
    # Get all properties for this realtor
    query = Property.query.filter_by(owner_id=realtor.id)
    if not include_inactive:
        query = query.filter(Property.active == True)
    
    pagination_result = query.order_by(Property.date_created.desc()).paginate(page=page_number, per_page=20)
    
    if pagination_result is None:
        return jsonify({"properties": [], "pages": 0}), 200
    
    serialized_results = []
    for property_item in pagination_result.items:
        item = property_item.serialize()
        item["property_images"] = property_item.get_property_images()
        serialized_results.append(item)
    
    return jsonify({
        "properties": serialized_results,
        "pages": pagination_result.pages
    }), 200


# Search properties
@bp.get('/property/search_properties')
def search_properties():
    # Extract all arguments from request
    search_text = request.args.get('search_term')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    bedrooms = request.args.get('bedrooms')
    bathrooms = request.args.get('bathrooms')
    category = request.args.get('category')
    property_type = request.args.get('property_type')
    max_area = request.args.get("max_area")
    page_number = request.args.get('page', 1, type=int)

    # print(request.args, len(category))

    # define the base query with the search conditions
    query = Property.query.filter(
        db.or_(
            db.or_(
                func.lower(Property.location).like(
                    '%{}%'.format(search_text.lower())),
                func.lower(Property.category).like(
                    '%{}%'.format(search_text.lower())),
                func.lower(Property.description).like(
                    '%{}%'.format(search_text.lower())),
                func.lower(Property.address).like(
                    '%{}%'.format(search_text.lower()))
            )
        )
    )

    # add additional filters based on the search criteria
    if len(category):
        query = query.filter(Property.category == category.lower())
        print("category")
    if len(property_type):
        query = query.filter(Property.property_type == property_type)
        print("type")
    if min_price and not (min_price == "" or min_price == "0"):
        query = query.filter(Property.price >= int(min_price))
        print("min-price")
    if max_price and not (max_price == "" or max_price == "0"):
        query = query.filter(Property.price <= int(max_price))
        print("max-price")
    if bathrooms and not (bathrooms == "" or bathrooms == "0"):
        query = query.filter(Property.bathrooms <= int(bathrooms))
        print("bath")
    if bedrooms and not (bedrooms == "" or bedrooms == "0"):
        query = query.filter(Property.bedrooms <= int(bedrooms))
        print("beds")
    if max_area and not (max_area == "" or max_area == "0"):
        query = query.filter(Property.size >= int(max_area))
        print("size")

    # query all searches
    results = query.paginate(page=page_number, per_page=20)

    if results is None:
        return jsonify({"results": [], "pages": 0}), 200

    list_items_with_images = []
    # Iterate the properties while appending the list with images of the property
    for property_item in results.items:
        listed_property = property_item.serialize()
        listed_property["property_images"] = property_item.get_property_images()
        list_items_with_images.append(listed_property)

    return jsonify({"results": list_items_with_images, "pages": results.pages})


# Recently added properties
@bp.get('/property/recently_added')
def search_recently_added():
    results = Property.query.order_by(Property.date_created.desc()).limit(4)

    if results is None:
        return jsonify([]), 200

    recent_properties = []
    for item in results:
        recent_properties.append(item.serialize())

    return jsonify(recent_properties)


# Purchase/Book a property
@bp.post('/property/purchase/<property_id>')
@authenticate_user
def purchase_property(property_id):
    # Verify property exists
    property = Property.query.get(property_id)
    if property is None:
        return jsonify({"message": "Property not found"}), 404
    
    # Get buyer info from request
    request_data = request.get_json()
    buyer_id = request.user.get('uid')  # Firebase user ID from token
    
    if not buyer_id:
        return jsonify({"message": "User ID not found in token"}), 401
    
    # Get realtor (property owner) information
    realtor = Realtor.query.get(property.owner_id)
    if not realtor:
        return jsonify({"message": "Property owner not found"}), 404
    
    realtor_email = realtor.company_mail
    if not realtor_email:
        return jsonify({"message": "Property owner email not found"}), 404
    
    # Create purchase record
    new_purchase = Purchase(
        id=str(uuid.uuid4()),
        property_id=property_id,
        buyer_id=buyer_id,
        buyer_name=request_data.get('name', ''),
        buyer_email=request_data.get('email', ''),
        buyer_phone=request_data.get('phone', ''),
        message=request_data.get('message', ''),
        status='pending'
    )
    
    try:
        db.session.add(new_purchase)
        db.session.commit()
        
        # Send email to realtor
        try:
            send_purchase_email(
                buyer_name=request_data.get('name', ''),
                buyer_email=request_data.get('email', ''),
                buyer_phone=request_data.get('phone', ''),
                buyer_message=request_data.get('message', ''),
                realtor_email=realtor_email,
                property_title=property.address or property.location,
                property_price=property.price,
                property_location=property.location
            )
            print(f"[PURCHASE] Email sent to realtor: {realtor_email}")
        except Exception as email_error:
            print(f"[PURCHASE] Failed to send email: {email_error}")
            # Don't fail the purchase if email fails
            import traceback
            traceback.print_exc()
        
        return jsonify({
            "message": "Purchase request submitted successfully",
            "purchase_id": new_purchase.id
        }), 201
    except Exception as e:
        print(f"[PURCHASE] Error: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({"message": "An error occurred"}), 500


def send_purchase_email(buyer_name, buyer_email, buyer_phone, buyer_message, realtor_email, property_title, property_price, property_location):
    """Send purchase request email to realtor using Brevo API"""
    
    api_key = os.environ.get("MAIL_KEY")
    if not api_key:
        print("[EMAIL] MAIL_KEY not configured, skipping email")
        return
    
    subject = f"New Purchase Request: {property_title}"
    
    # Format price
    formatted_price = f"${property_price:,.0f}" if property_price else "Price not specified"
    
    # HTML Template
    html_template = '''
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .property-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2563eb; }
            .buyer-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .label { font-weight: bold; color: #4b5563; }
            .value { color: #111827; margin-bottom: 10px; }
            .message-box { background-color: #eff6ff; padding: 15px; border-radius: 5px; margin-top: 15px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0;">New Property Purchase Request</h1>
            </div>
            <div class="content">
                <p>You have received a new purchase request for your property listing.</p>
                
                <div class="property-info">
                    <h2 style="margin-top: 0; color: #2563eb;">Property Details</h2>
                    <div class="value"><span class="label">Property:</span> {property_title}</div>
                    <div class="value"><span class="label">Location:</span> {property_location}</div>
                    <div class="value"><span class="label">Price:</span> {property_price}</div>
                </div>
                
                <div class="buyer-info">
                    <h2 style="margin-top: 0; color: #2563eb;">Buyer Information</h2>
                    <div class="value"><span class="label">Name:</span> {buyer_name}</div>
                    <div class="value"><span class="label">Email:</span> <a href="mailto:{buyer_email}">{buyer_email}</a></div>
                    <div class="value"><span class="label">Phone:</span> <a href="tel:{buyer_phone}">{buyer_phone}</a></div>
                </div>
                
                {message_section}
                
                <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-radius: 5px;">
                    <p style="margin: 0;"><strong>Next Steps:</strong></p>
                    <p style="margin: 5px 0;">Please contact the buyer at their email or phone number to proceed with the purchase.</p>
                </div>
            </div>
            <div class="footer">
                <p>This is an automated email from your real estate listing platform.</p>
            </div>
        </div>
    </body>
    </html>
    '''
    
    # Add message section if provided
    if buyer_message:
        message_section = f'''
        <div class="message-box">
            <h3 style="margin-top: 0; color: #2563eb;">Buyer's Message:</h3>
            <p style="white-space: pre-wrap;">{buyer_message}</p>
        </div>
        '''
    else:
        message_section = '<p style="color: #6b7280; font-style: italic;">No additional message provided.</p>'
    
    # Format the email
    html_content = html_template.format(
        property_title=property_title,
        property_location=property_location,
        property_price=formatted_price,
        buyer_name=buyer_name,
        buyer_email=buyer_email,
        buyer_phone=buyer_phone,
        message_section=message_section
    )
    
    endpoint = 'https://api.brevo.com/v3/smtp/email'
    headers = {
        'accept': 'application/json',
        'api-key': str(api_key),
        'content-type': 'application/json'
    }
    payload = {
        'sender': {'email': "254realtors.homes@gmail.com", 'name': 'Real Estate Platform'},
        'to': [{"email": realtor_email}],
        'replyTo': {'email': buyer_email, 'name': buyer_name},
        'subject': subject,
        'htmlContent': html_content
    }
    
    response = requests.post(endpoint, headers=headers, json=payload)
    
    if not response.ok:
        print(f"[EMAIL] Brevo API error: {response.status_code} - {response.text}")
        raise Exception(f"Email sending failed: {response.status_code}")
    
    print(f"[EMAIL] Purchase request email sent successfully to {realtor_email}")
