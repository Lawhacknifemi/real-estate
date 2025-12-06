from app.extensions import db
from datetime import datetime
import json

class Purchase(db.Model):
    id = db.Column(db.String, primary_key=True)
    property_id = db.Column(db.String, db.ForeignKey('property.id'), index=True, unique=False)
    buyer_id = db.Column(db.String, index=True, unique=False)  # Firebase user ID
    buyer_name = db.Column(db.String, index=False, unique=False)
    buyer_email = db.Column(db.String, index=False, unique=False)
    buyer_phone = db.Column(db.String, index=False, unique=False)
    message = db.Column(db.Text, index=False, unique=False)
    status = db.Column(db.String, default='pending', index=False, unique=False)  # pending, approved, rejected
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Purchase "{self.id}">'

    def serialize(self):
        return {
            "id": self.id,
            "property_id": self.property_id,
            "buyer_id": self.buyer_id,
            "buyer_name": self.buyer_name,
            "buyer_email": self.buyer_email,
            "buyer_phone": self.buyer_phone,
            "message": self.message,
            "status": self.status,
            "date_created": self.date_created.isoformat() if self.date_created else None
        }



