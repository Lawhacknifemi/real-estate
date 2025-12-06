from app.blogs import bp
from app.models.blog import Blog
from flask import jsonify, request
from app.extensions import db
import uuid
from app.middleware.authenticate import authenticate_user
from app.middleware.admin import require_admin
from datetime import datetime

# Get all published blogs (public endpoint)
@bp.get('/blogs')
def get_all_blogs():
    category = request.args.get('category', None)
    page = request.args.get('page', 1, type=int)
    
    query = Blog.query.filter_by(published=True, active=True)
    
    if category:
        query = query.filter_by(category=category)
    
    pagination_result = query.order_by(Blog.date_published.desc()).paginate(page=page, per_page=10)
    
    if pagination_result is None:
        return jsonify({"blogs": [], "pages": 0}), 200
    
    return jsonify({
        "blogs": [blog.serialize() for blog in pagination_result.items],
        "pages": pagination_result.pages,
        "current_page": page
    }), 200

# Get blog by ID (public endpoint)
@bp.get('/blogs/<blog_id>')
def get_blog(blog_id):
    blog = Blog.query.get(blog_id)
    if blog is None:
        return jsonify({"message": "Blog not found"}), 404
    
    # Increment views
    blog.views = (blog.views or 0) + 1
    db.session.commit()
    
    return jsonify(blog.serialize()), 200

# Admin: Create blog
@bp.post('/blogs/admin/create')
@authenticate_user
@require_admin
def admin_create_blog():
    request_data = request.get_json()
    if not request_data:
        return jsonify({"message": "Invalid request data"}), 400
    
    admin_email = request.user.get('email', '')
    admin_name = request.user.get('name', admin_email.split('@')[0])
    
    new_blog = Blog(
        id=str(uuid.uuid4()),
        title=request_data.get('title', ''),
        content=request_data.get('content', ''),
        excerpt=request_data.get('excerpt', ''),
        author=request_data.get('author', admin_name),
        author_email=admin_email,
        featured_image_url=request_data.get('featured_image_url', ''),
        category=request_data.get('category', ''),
        tags=','.join(request_data.get('tags', [])) if isinstance(request_data.get('tags'), list) else request_data.get('tags', ''),
        published=request_data.get('published', False),
        active=True,
        views=0
    )
    
    if new_blog.published:
        new_blog.date_published = datetime.utcnow()
    
    try:
        db.session.add(new_blog)
        db.session.commit()
        print(f"[ADMIN] Blog {new_blog.id} created by admin {admin_email}")
        return jsonify({
            "message": "Blog created successfully",
            "blog": new_blog.serialize()
        }), 201
    except Exception as e:
        print(f"[ADMIN] Error creating blog: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Admin: Update blog
@bp.patch('/blogs/admin/update/<blog_id>')
@authenticate_user
@require_admin
def admin_update_blog(blog_id):
    blog = Blog.query.get(blog_id)
    if blog is None:
        return jsonify({"message": "Blog not found"}), 404
    
    request_data = request.get_json()
    if not request_data:
        return jsonify({"message": "Invalid request data"}), 400
    
    # Update fields
    if 'title' in request_data:
        blog.title = request_data['title']
    if 'content' in request_data:
        blog.content = request_data['content']
    if 'excerpt' in request_data:
        blog.excerpt = request_data['excerpt']
    if 'author' in request_data:
        blog.author = request_data['author']
    if 'featured_image_url' in request_data:
        blog.featured_image_url = request_data['featured_image_url']
    if 'category' in request_data:
        blog.category = request_data['category']
    if 'tags' in request_data:
        blog.tags = ','.join(request_data['tags']) if isinstance(request_data['tags'], list) else request_data['tags']
    
    # Handle publish status
    was_published = blog.published
    if 'published' in request_data:
        blog.published = request_data['published']
        if blog.published and not was_published:
            blog.date_published = datetime.utcnow()
    
    try:
        db.session.commit()
        print(f"[ADMIN] Blog {blog_id} updated by admin {request.user.get('email')}")
        return jsonify({
            "message": "Blog updated successfully",
            "blog": blog.serialize()
        }), 200
    except Exception as e:
        print(f"[ADMIN] Error updating blog: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Admin: Delete blog
@bp.delete('/blogs/admin/delete/<blog_id>')
@authenticate_user
@require_admin
def admin_delete_blog(blog_id):
    blog = Blog.query.get(blog_id)
    if blog is None:
        return jsonify({"message": "Blog not found"}), 404
    
    try:
        db.session.delete(blog)
        db.session.commit()
        print(f"[ADMIN] Blog {blog_id} deleted by admin {request.user.get('email')}")
        return jsonify({"message": "Blog deleted successfully"}), 200
    except Exception as e:
        print(f"[ADMIN] Error deleting blog: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Admin: Get all blogs (including unpublished)
@bp.get('/blogs/admin/all')
@authenticate_user
@require_admin
def admin_get_all_blogs():
    include_unpublished = request.args.get('include_unpublished', 'false').lower() == 'true'
    page = request.args.get('page', 1, type=int)
    
    query = Blog.query.filter_by(active=True)
    if not include_unpublished:
        query = query.filter_by(published=True)
    
    pagination_result = query.order_by(Blog.date_created.desc()).paginate(page=page, per_page=20)
    
    if pagination_result is None:
        return jsonify({"blogs": [], "pages": 0}), 200
    
    return jsonify({
        "blogs": [blog.serialize() for blog in pagination_result.items],
        "pages": pagination_result.pages,
        "current_page": page
    }), 200

