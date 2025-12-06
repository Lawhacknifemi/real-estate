from datetime import datetime
from app.extensions import db

# Vendor model
class Vendor(db.Model):
    id = db.Column(db.String, primary_key=True)
    vendor_id = db.Column(db.String, index=True, unique=True)  # Firebase user ID
    company_name = db.Column(db.String, index=False, unique=False)
    description = db.Column(db.Text, index=False, unique=False)
    category = db.Column(db.String, index=True, unique=False)  # e.g., "Construction & Development"
    services = db.Column(db.Text, index=False, unique=False)  # Comma-separated or JSON
    email = db.Column(db.String, index=False, unique=False, nullable=True)
    phone = db.Column(db.String, index=False, unique=False, nullable=True)
    website_url = db.Column(db.String, index=False, unique=False, nullable=True)
    location = db.Column(db.String, index=False, unique=False, nullable=True)
    logo_url = db.Column(db.String, index=False, unique=False, nullable=True)
    verified = db.Column(db.Boolean, index=False, default=False, unique=False)
    active = db.Column(db.Boolean, index=False, default=True, unique=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Vendor "{self.company_name}">'

    def serialize(self):
        return {
            "id": self.id,
            "vendor_id": self.vendor_id,
            "company_name": self.company_name,
            "description": self.description,
            "category": self.category,
            "services": self.services,
            "email": self.email,
            "phone": self.phone,
            "website_url": self.website_url,
            "location": self.location,
            "logo_url": self.logo_url,
            "verified": self.verified,
            "active": self.active,
            "date_created": self.date_created.isoformat() if self.date_created else None,
        }

