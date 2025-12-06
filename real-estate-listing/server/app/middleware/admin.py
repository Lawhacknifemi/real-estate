from functools import wraps
from flask import request, jsonify
import os

def require_admin(f):
    """
    Decorator to require admin privileges.
    Checks if the authenticated user's email is in the ADMIN_EMAILS environment variable.
    """
    @wraps(f)
    def wrap(*args, **kwargs):
        # First check authentication
        if not hasattr(request, 'user') or not request.user:
            return jsonify({"message": "Authentication required"}), 401
        
        user_email = request.user.get('email', '')
        if not user_email:
            return jsonify({"message": "User email not found in token"}), 401
        
        # Get admin emails from environment variable (comma-separated)
        admin_emails = os.environ.get('ADMIN_EMAILS', '').split(',')
        admin_emails = [email.strip().lower() for email in admin_emails if email.strip()]
        
        if not admin_emails:
            return jsonify({
                "message": "Admin access not configured. Please set ADMIN_EMAILS environment variable.",
                "error": "admin_not_configured"
            }), 503
        
        # Check if user email is in admin list
        if user_email.lower() not in admin_emails:
            return jsonify({
                "message": "Admin access required. You don't have permission to perform this action.",
                "error": "insufficient_permissions"
            }), 403
        
        return f(*args, **kwargs)
    return wrap

