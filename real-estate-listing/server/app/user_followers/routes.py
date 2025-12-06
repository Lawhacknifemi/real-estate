from app.user_followers import bp
from app.models.realtor_follower import Realtor_follower
from app.models.realtor import Realtor
from flask import jsonify, request
from app.extensions import db
from app.middleware.authenticate import authenticate_user

# Get realtor followers


@bp.get('/realtor_followers/<realtor_id>')
def get_realtor_followers(realtor_id):
   
    followers = [follower.follower_id for follower in Realtor.query.get(realtor_id).followers]
    return jsonify(followers), 200


# Check if user has followed realtor

@bp.get('/realtor_followers/check_user_follows_realtor/<realtor_id>/<user_id>')
@authenticate_user
def check_follow_by_user(realtor_id, user_id):
    result = Realtor_follower.query.filter(
        Realtor_follower.follower_id == user_id, Realtor_follower.followed_id == realtor_id).first()

    if result is None:
        return jsonify("False"), 200

    return jsonify("True"), 200

# follow/unfollow realtor


@bp.post('/realtor_followers/follow/<realtor_id>')
@authenticate_user
def follow(realtor_id):
    request_data = request.get_json()

    if request_data['action'] == 'follow':
        new_follow = Realtor_follower(
            follower_id=request_data['user_id'], followed_id=realtor_id)
        try:
            db.session.add(new_follow)
            db.session.commit()
            return jsonify("Followed"), 200
        except:
            db.session.rollback()
            return "An error occured", 500

    elif request_data['action'] == 'unfollow':
        try:
            db.session.delete(Realtor_follower.query.filter(
                Realtor_follower.follower_id == request_data['user_id']).first())
            db.session.commit()
            
            return jsonify("Unfollowed"), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return "An error occured", 500
    return 'error'
