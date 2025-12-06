from app.vendors import bp
from app.models.vendor import Vendor
from flask import jsonify, request
from app.extensions import db
import uuid
from app.middleware.authenticate import authenticate_user
from app.middleware.admin import require_admin

# Get all vendors
@bp.get('/vendors')
def get_all_vendors():
    category = request.args.get('category', None)
    # Removed verified_only filter - all vendors are now auto-verified
    
    query = Vendor.query.filter_by(active=True)
    
    if category:
        query = query.filter_by(category=category)
    
    vendors = query.order_by(Vendor.date_created.desc()).all()
    
    return jsonify({
        "vendors": [vendor.serialize() for vendor in vendors]
    }), 200

# Get vendor by ID
@bp.get('/vendors/<vendor_id>')
def get_vendor(vendor_id):
    vendor = Vendor.query.get(vendor_id)
    if vendor is None:
        return jsonify({"message": "Vendor not found"}), 404
    
    return jsonify(vendor.serialize()), 200

# Register/create a vendor
@bp.post('/vendors/register')
@authenticate_user
def register_vendor():
    # Get Firebase user ID from token
    firebase_user_id = request.user.get('uid')
    if not firebase_user_id:
        return jsonify({"message": "User ID not found in token"}), 401
    
    # Check if vendor already exists
    existing_vendor = Vendor.query.filter_by(vendor_id=firebase_user_id).first()
    if existing_vendor:
        return jsonify({"message": "Vendor profile already exists", "vendor_id": existing_vendor.id}), 400
    
    request_data = request.get_json()
    if not request_data:
        return jsonify({"message": "Invalid request data"}), 400
    
    # Create new vendor
    new_vendor = Vendor(
        id=str(uuid.uuid4()),
        vendor_id=firebase_user_id,
        company_name=request_data.get('company_name', ''),
        description=request_data.get('description', ''),
        category=request_data.get('category', ''),
        services=request_data.get('services', ''),
        email=request_data.get('email', request.user.get('email', '')),
        phone=request_data.get('phone', ''),
        website_url=request_data.get('website_url', ''),
        location=request_data.get('location', ''),
        logo_url=request_data.get('logo_url', ''),
        verified=True,  # Auto-verified, no verification process needed
        active=True
    )
    
    try:
        db.session.add(new_vendor)
        db.session.commit()
        print(f"[BACKEND] Vendor {new_vendor.id} registered successfully")
        return jsonify({
            "message": "Vendor registered successfully",
            "vendor_id": new_vendor.id
        }), 201
    except Exception as e:
        print(f"[BACKEND] Error registering vendor: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Update vendor profile
@bp.patch('/vendors/<vendor_id>')
@authenticate_user
def update_vendor(vendor_id):
    # Get Firebase user ID from token
    firebase_user_id = request.user.get('uid')
    if not firebase_user_id:
        return jsonify({"message": "User ID not found in token"}), 401
    
    vendor = Vendor.query.get(vendor_id)
    if vendor is None:
        return jsonify({"message": "Vendor not found"}), 404
    
    # Verify ownership
    if vendor.vendor_id != firebase_user_id:
        return jsonify({"message": "You don't have permission to update this vendor profile"}), 403
    
    request_data = request.get_json()
    if not request_data:
        return jsonify({"message": "Invalid request data"}), 400
    
    # Update vendor fields
    if 'company_name' in request_data:
        vendor.company_name = request_data['company_name']
    if 'description' in request_data:
        vendor.description = request_data['description']
    if 'category' in request_data:
        vendor.category = request_data['category']
    if 'services' in request_data:
        vendor.services = request_data['services']
    if 'email' in request_data:
        vendor.email = request_data['email']
    if 'phone' in request_data:
        vendor.phone = request_data['phone']
    if 'website_url' in request_data:
        vendor.website_url = request_data['website_url']
    if 'location' in request_data:
        vendor.location = request_data['location']
    if 'logo_url' in request_data:
        vendor.logo_url = request_data['logo_url']
    
    try:
        db.session.commit()
        print(f"[BACKEND] Vendor {vendor_id} updated successfully")
        return jsonify({
            "message": "Vendor updated successfully",
            "vendor": vendor.serialize()
        }), 200
    except Exception as e:
        print(f"[BACKEND] Error updating vendor: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Get vendors by category
@bp.get('/vendors/category/<category>')
def get_vendors_by_category(category):
    vendors = Vendor.query.filter_by(category=category, active=True).order_by(Vendor.date_created.desc()).all()
    
    return jsonify({
        "vendors": [vendor.serialize() for vendor in vendors],
        "category": category
    }), 200

# Admin: Delete vendor
@bp.delete('/vendors/admin/delete/<vendor_id>')
@authenticate_user
@require_admin
def admin_delete_vendor(vendor_id):
    vendor = Vendor.query.get(vendor_id)
    if vendor is None:
        return jsonify({"message": "Vendor not found"}), 404
    
    try:
        db.session.delete(vendor)
        db.session.commit()
        print(f"[ADMIN] Vendor {vendor_id} deleted by admin {request.user.get('email')}")
        return jsonify({"message": "Vendor deleted successfully"}), 200
    except Exception as e:
        print(f"[ADMIN] Error deleting vendor: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Admin: Deactivate vendor (delist)
@bp.patch('/vendors/admin/deactivate/<vendor_id>')
@authenticate_user
@require_admin
def admin_deactivate_vendor(vendor_id):
    vendor = Vendor.query.get(vendor_id)
    if vendor is None:
        return jsonify({"message": "Vendor not found"}), 404
    
    try:
        vendor.active = False
        db.session.commit()
        print(f"[ADMIN] Vendor {vendor_id} deactivated by admin {request.user.get('email')}")
        return jsonify({"message": "Vendor deactivated successfully"}), 200
    except Exception as e:
        print(f"[ADMIN] Error deactivating vendor: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Admin: Activate vendor (relist)
@bp.patch('/vendors/admin/activate/<vendor_id>')
@authenticate_user
@require_admin
def admin_activate_vendor(vendor_id):
    vendor = Vendor.query.get(vendor_id)
    if vendor is None:
        return jsonify({"message": "Vendor not found"}), 404
    
    try:
        vendor.active = True
        db.session.commit()
        print(f"[ADMIN] Vendor {vendor_id} activated by admin {request.user.get('email')}")
        return jsonify({"message": "Vendor activated successfully"}), 200
    except Exception as e:
        print(f"[ADMIN] Error activating vendor: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Admin: Get all vendors (including inactive)
@bp.get('/vendors/admin/all')
@authenticate_user
@require_admin
def admin_get_all_vendors():
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    
    query = Vendor.query
    if not include_inactive:
        query = query.filter_by(active=True)
    
    vendors = query.order_by(Vendor.date_created.desc()).all()
    
    print(f"[ADMIN] Fetching vendors - include_inactive: {include_inactive}, found: {len(vendors)} vendors")
    if include_inactive:
        inactive_count = sum(1 for v in vendors if not v.active)
        print(f"[ADMIN] Inactive vendors: {inactive_count}")
    
    return jsonify({
        "vendors": [vendor.serialize() for vendor in vendors]
    }), 200

