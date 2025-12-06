from app.extensions import db
# User followers model


class Realtor_follower(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.String, index=True, unique=False)
    followed_id = db.Column(db.String, db.ForeignKey(
        'realtor.id'), index=True, unique=False)
    
    def __repr__(self):
        return f'<{self.follower_id} follows "{self.followed_id}">'
