from app import create_app
from app.extensions import db
from app.models import property, realtor, favorite, realtor_follower, purchase, vendor, blog

app = create_app()

with app.app_context():
    # Create all database tables
    db.create_all()
    print("Database tables created successfully!")

