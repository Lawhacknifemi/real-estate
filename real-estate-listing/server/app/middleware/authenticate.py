from flask import request
import firebase_admin
from firebase_admin import auth, credentials
from functools import wraps

def authenticate_user(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        # Check if Firebase Admin SDK is initialized
        try:
            import firebase_admin
            if not firebase_admin._apps:
                return {
                    'message': 'Firebase Admin SDK is not initialized. Please set up Firebase environment variables on the backend.',
                    'error': 'firebase_not_configured'
                }, 503
        except ImportError:
            return {
                'message': 'Firebase Admin SDK is not available.',
                'error': 'firebase_not_available'
            }, 503
        
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return {'message': 'No token provided'}, 400
        
        # Extract token from "Bearer <token>" format
        try:
            if auth_header.startswith('Bearer '):
                token = auth_header.split('Bearer ')[1]
            else:
                token = auth_header
            
            from firebase_admin import auth
            user = auth.verify_id_token(token)
            request.user = user
        except ValueError as e:
            # Firebase not initialized
            print(f"Firebase not initialized: {e}")
            return {
                'message': 'Firebase Admin SDK is not initialized. Please configure Firebase credentials on the backend.',
                'error': 'firebase_not_initialized'
            }, 503
        except Exception as e:
            print(f"Authentication error: {e}")
            return {'message': 'Invalid token provided.', 'error': str(e)}, 401
        return f(*args, **kwargs)
    return wrap
