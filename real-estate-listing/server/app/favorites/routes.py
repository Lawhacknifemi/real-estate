from app.favorites import bp
from app.models.favorite import Favorite
from app.models.property import Property
from flask import jsonify, request
from app.extensions import db
import uuid
from app.middleware.authenticate import authenticate_user

# Get user favorites


@bp.get('/favorites/<user_id>')
@authenticate_user
def get_user_favorites(user_id):
    page_number = request.args.get("page", 1, type=int)
    pagination_result = Favorite.query.filter_by(
        user_id=user_id).paginate(page=page_number, per_page=20)

    favorite_items = [
        item.property_id for item in pagination_result.items]

    # print(favorite_items)
    if favorite_items is None:
        return jsonify({"properties": [], "pages": 0}), 200
    try:
        favorite_items_with_details = []
        for item in favorite_items:
            item_results = Property.query.get(item)
            serialized_results = item_results.serialize()
            serialized_results["property_images"] = item_results.get_property_images(
            )
            favorite_items_with_details.append(serialized_results)
        return jsonify({"properties": favorite_items_with_details, "pages": pagination_result.pages}), 200
    except Exception as e:
        return jsonify(e), 500

# Add property to favorites


@bp.post('/favorites/add_to_favorites')
def add_to_favorite():
    request_data = request.get_json()
    result = Favorite.query.filter(
        Favorite.property_id == request_data['property_id'], Favorite.user_id == request_data['user_id']).first()

    if request_data['action'] == "add":
        if result != None:
            return jsonify(result.serialize()), 200
        new_favorite = Favorite(id=str(uuid.uuid4()),
                                property_id=request_data['property_id'],
                                user_id=request_data['user_id'])

        db.session.add(new_favorite)
        try:
            db.session.commit()
            return jsonify(new_favorite.serialize()), 201
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify("An error occurred"), 500
    elif request_data['action'] == "remove":
        db.session.delete(result)
        db.session.commit()
        return jsonify("Removed from favorites")
# Check property is already user favorite


@bp.get('/favorites/check_property/<user_id>/<property_id>')
def check_property_exists(user_id, property_id):
    result = Favorite.query.filter(
        Favorite.property_id == property_id, Favorite.user_id == user_id).first()

    if result is None:
        return jsonify("False")
    return jsonify("True")
