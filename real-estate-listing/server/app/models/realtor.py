from datetime import datetime
from app.extensions import db

# Realtor model


class Realtor(db.Model):
    id = db.Column(db.String, primary_key=True)
    realtor_id = db.Column(db.String, index=True, unique=True)
    company_name = db.Column(db.String, index=False, unique=False)
    description = db.Column(db.Text, index=False, unique=False)
    profile_picture = db.Column(db.String, index=False, unique=False)
    company_mail = db.Column(db.String, index=False,
                             unique=False, nullable=True)
    website_url = db.Column(db.String, index=False,
                            unique=False, nullable=True)
    contact = db.Column(db.String, index=False, unique=False, nullable=True)
    active = db.Column(db.Boolean, index=False, default=True, unique=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    properties = db.relationship(
        'Property', backref='realtor', lazy='dynamic', cascade='all, delete, delete-orphan')
    followers = db.relationship(
        'Realtor_follower', backref="realtor",  cascade='all, delete, delete-orphan')

    def __repr__(self):
        return f'<Realtor "{self.company_name}">'

    def serialize(self):
        return {
            "id": self.id,
            "realtor_id": self.realtor_id,
            "company_name": self.company_name,
            "description": self.description,
            "profile_picture": self.profile_picture,
            "date_created": self.date_created,
            "company_mail": self.company_mail,
            "active": self.active,
            "website_url": self.website_url,
            "contact": self.contact,
        }
