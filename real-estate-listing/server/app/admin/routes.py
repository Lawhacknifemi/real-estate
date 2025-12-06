from app.admin import bp
from flask import jsonify, request
from app.middleware.authenticate import authenticate_user
from app.middleware.admin import require_admin
import os

# Check if user is admin
@bp.get('/admin/check')
@authenticate_user
def check_admin():
    user_email = request.user.get('email', '').lower()
    if not user_email:
        return jsonify({"is_admin": False, "reason": "No email in token"}), 200
    
    # Get admin emails from environment variable
    admin_emails_raw = os.environ.get('ADMIN_EMAILS', '')
    admin_emails = admin_emails_raw.split(',')
    admin_emails = [email.strip().lower() for email in admin_emails if email.strip()]
    
    is_admin = user_email in admin_emails
    
    # Debug logging
    print(f"[ADMIN CHECK] User email: {user_email}")
    print(f"[ADMIN CHECK] Admin emails configured: {admin_emails}")
    print(f"[ADMIN CHECK] Is admin: {is_admin}")
    
    return jsonify({
        "is_admin": is_admin,
        "email": request.user.get('email', ''),
        "admin_emails_configured": len(admin_emails) > 0
    }), 200

