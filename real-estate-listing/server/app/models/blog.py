from datetime import datetime
from app.extensions import db

# Blog model
class Blog(db.Model):
    id = db.Column(db.String, primary_key=True)
    title = db.Column(db.String, index=False, unique=False)
    content = db.Column(db.Text, index=False, unique=False)  # Full blog content (can be HTML or markdown)
    excerpt = db.Column(db.Text, index=False, unique=False)  # Short summary for preview
    author = db.Column(db.String, index=False, unique=False)  # Author name
    author_email = db.Column(db.String, index=False, unique=False)  # Admin email who created it
    featured_image_url = db.Column(db.String, index=False, unique=False, nullable=True)
    category = db.Column(db.String, index=True, unique=False, nullable=True)  # e.g., "Market Trends", "Investment Tips"
    tags = db.Column(db.Text, index=False, unique=False, nullable=True)  # Comma-separated tags
    published = db.Column(db.Boolean, index=False, default=False, unique=False)
    active = db.Column(db.Boolean, index=False, default=True, unique=False)
    views = db.Column(db.Integer, index=False, default=0, unique=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    date_published = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<Blog "{self.title}">'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "excerpt": self.excerpt,
            "author": self.author,
            "author_email": self.author_email,
            "featured_image_url": self.featured_image_url,
            "category": self.category,
            "tags": self.tags.split(',') if self.tags else [],
            "published": self.published,
            "active": self.active,
            "views": self.views,
            "date_created": self.date_created.isoformat() if self.date_created else None,
            "date_published": self.date_published.isoformat() if self.date_published else None,
        }

