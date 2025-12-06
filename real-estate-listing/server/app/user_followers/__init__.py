from flask import Blueprint

bp = Blueprint("realtor_followers", __name__)

from app.user_followers import routes