from flask import Blueprint

bp = Blueprint("favorites", __name__)

from app.favorites import routes