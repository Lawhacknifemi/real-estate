from app.extensions import db 

# Property image model


class Favorite(db.Model):
    id = db.Column(db.String, primary_key=True)
    property_id = db.Column(db.String, db.ForeignKey('property.id', ondelete='CASCADE'),
                            index=True, unique=False)
    user_id = db.Column(db.String, index=True, unique=False)

    def __repr__(self):
        return f'{self.user_id} likes {self.property_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "property_id": self.property_id,
            "user_id": self.user_id
        }
