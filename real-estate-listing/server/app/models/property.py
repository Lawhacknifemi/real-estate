from datetime import datetime
from app.extensions import db
import pickle
import json
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import TypeDecorator, Text

# SQLite-compatible JSON array type
class JSONArray(TypeDecorator):
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return []

# Property model


class Property(db.Model):
    id = db.Column(db.String, primary_key=True)
    owner_id = db.Column(db.String, db.ForeignKey('realtor.id'),
                         index=True, unique=False)
    location = db.Column(db.String, index=True, unique=False)
    description = db.Column(db.Text, index=False, unique=False)
    address = db.Column(db.String, index=False, unique=False)
    bedrooms = db.Column(db.Integer, index=False, unique=False)
    bathrooms = db.Column(db.Integer, index=False, unique=False)
    category = db.Column(db.String, index=False, unique=False)
    price = db.Column(db.Float, index=False, unique=False)
    property_type = db.Column(db.String, index=False, unique=False)
    active = db.Column(db.Boolean, index=False, default=True, unique=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    # Use JSONArray for SQLite compatibility, ARRAY for PostgreSQL
    property_images = db.Column(
        JSONArray(), default=[], index=False, unique=False)
    size = db.Column(db.String, index=False, unique=False)

    def get_property_images(self):
        if isinstance(self.property_images, str):
            return json.loads(self.property_images)
        return self.property_images if self.property_images else []

    def __repr__(self):
        return f'<Property "{self.id}">'

    # Return all properties in dictionary
    def serialize(self):
        return {
            "id": self.id,
            "owner_id": self.owner_id,
            "location": self.location,
            "description": self.description,
            "address": self.address,
            "bedrooms": self.bedrooms,
            "bathrooms": self.bathrooms,
            "category": self.category,
            "price": self.price,
            "property_type": self.property_type,
            "active": self.active,
            "date_created": self.date_created,
            "property_images": self.property_images,
            "size": self.size
        }
