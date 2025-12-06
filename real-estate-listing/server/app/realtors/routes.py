from app.realtors import bp
from app.models.realtor import Realtor
from app.models.property import Property
from flask import jsonify, request
from app.extensions import db
import uuid
from app.middleware.authenticate import authenticate_user

# Gets all realtors


@bp.route('/realtors')
def get_realtors():
    realtors = Realtor.query.all()
    if realtors is None:
        return jsonify([]), 200
    return jsonify([realtor.serialize() for realtor in realtors]), 200


# Registers a new realtor
@bp.post('/realtor/register_profile')
@authenticate_user
def register_realtor():
    request_data = request.get_json()
    new_realtor = Realtor(id=str(uuid.uuid4()),
                          realtor_id=request_data['user_id'],
                          company_name=request_data['company_name'],
                          description=request_data['description'],
                          profile_picture=request_data['profile_picture'],
                          company_mail=request_data['company_mail'],
                          website_url=request_data['website_url'],
                          contact=request_data['contact'])

    try:
        db.session.add(new_realtor)
        db.session.commit()
        return jsonify(new_realtor.serialize()), 201
    except Exception as e:
        print(e)
        db.session.rollback()
        return "An error occured!", 500

# Update realtor details


@bp.patch('/realtor/update_details/<realtor_id>')
@authenticate_user
def update_realtor_details(realtor_id):
    realtor_details = Realtor.query.get(realtor_id)
    request_data = request.get_json()

    if realtor_details is None:
        return "bad request", 404

    try:
        realtor_details.company_name = request_data['company_name']
        realtor_details.description = request_data['description']
        realtor_details.profile_picture = request_data['profile_picture']
        realtor_details.company_mail = request_data['company_mail']
        realtor_details.website_url = request_data['website_url']
        realtor_details.contact = request_data['contact']
        db.session.commit()
        return jsonify(Realtor.query.get(realtor_id).serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(e), 500

# Get realtor by ID


@bp.get('/realtor/get_realtor/<id>')
def get_realtor(id):
    result = Realtor.query.get(id)
    if result is None:
        return f"User of ID {id} not found"

    return jsonify(result.serialize()), 200

# Get all realtor properties


@bp.get('/realtor/realtor_properties/<realtor_id>')
def get_realtor_properties(realtor_id):

    page_number = request.args.get("page", 1, type=int)
    pagination_result = Realtor.query.get(
        realtor_id).properties.filter(Property.active == True).paginate(page=page_number, per_page=20)

    print(pagination_result.items)

    if pagination_result is None:
        return jsonify({"properties": [], "pages": 0})

    if len(pagination_result.items) == 0:
        return jsonify({"properties": [], "pages": 0})

    serialized_results = []
    for property_item in pagination_result.items:
        item = property_item.serialize()
        images = property_item.get_property_images()
        item["property_images"] = images
        serialized_results.append(item)

    return jsonify({"properties": serialized_results, "pages": pagination_result.pages}), 200

# Get realtor active properties


@bp.get('/realtor/active_or_paused_properties/<realtor_id>')
@authenticate_user
def get_realtor_active_or_paused_properties(realtor_id):
    page_number = request.args.get("page", 1, type=int)
    status = request.args.get('status')

    pagination_result = None

    if status == "active":
        pagination_result = Realtor.query.get(realtor_id).properties.filter(
            Property.active == True).paginate(page=page_number, per_page=10)

    elif status == "paused":
        pagination_result = Realtor.query.get(realtor_id).properties.filter(
            Property.active == False).paginate(page=page_number, per_page=10)
    else:
        return jsonify({"error": "No status available"})

    if pagination_result is None:
        return jsonify({"properties": [], "pages": 0})

    serialized_results = []
    for property_item in pagination_result.items:
        item = property_item.serialize()
        images = property_item.get_property_images()
        item["property_images"] = images
        serialized_results.append(item)

    return jsonify({"properties": serialized_results, "pages": pagination_result.pages}), 200


# Activate/Deactivate account status

@bp.patch('/realtor/account_status/<realtor_id>')
@authenticate_user
def change_account_status(realtor_id):
    realtor_details = Realtor.query.get(realtor_id)
    request_data = request.get_json()

    if realtor_details is None:
        return "bad request", 404
    try:
        if request_data['action'] == 'activate':
            realtor_details.active = True
            db.session.commit()
            return jsonify(Realtor.query.get(realtor_id).serialize()), 200
        elif request_data['action'] == 'deactivate':
            realtor_details.active = False
            db.session.commit()
            return jsonify(Realtor.query.get(realtor_id).serialize()), 200
        else:
            return "bad request", 404
    except Exception as e:
        return "An error occured", 500


# Get realtor by user ID
@bp.get('/realtor/get_realtor_by_user_id/<user_id>')
@authenticate_user
def get_realtor_by_user_id(user_id):
    realtor_details = Realtor.query.filter(
        Realtor.realtor_id == user_id).first()
    print(realtor_details)
    if realtor_details is None:
        return jsonify("None"), 200
    return jsonify(realtor_details.serialize()), 200
