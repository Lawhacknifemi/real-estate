from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from config import import_firebase_variables
from app.extensions import db
from app.main import bp as main_bp
from app.realtors import bp as realtors_bp
from app.favorites import bp as favorites_bp
from app.properties import bp as properties_bp
from app.user_followers import bp as user_followers_bp
from app.utils import bp as utils_bp
from app.vendors import bp as vendors_bp
from app.admin import bp as admin_bp
from app.blogs import bp as blogs_bp
import firebase_admin
from firebase_admin import credentials
import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
# Server directory is the parent of the app directory
server_dir = os.path.dirname(basedir)

# Load environment variables from .env file (in server directory)
env_path = os.path.join(server_dir, '.env')
load_dotenv(env_path)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Configure CORS to allow requests from Next.js frontend
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}}, supports_credentials=True)
    # Initialize Flask extensions here
    # Init db
    db.init_app(app)

    # Register blueprints here
    app.register_blueprint(main_bp)
    app.register_blueprint(favorites_bp)
    app.register_blueprint(properties_bp)
    app.register_blueprint(user_followers_bp)
    app.register_blueprint(realtors_bp)
    app.register_blueprint(utils_bp)
    app.register_blueprint(vendors_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(blogs_bp)
    
    # Serve uploaded images
    uploads_dir = os.path.join(server_dir, 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    
    @app.route('/uploads/properties/<filename>')
    def uploaded_file(filename):
        """Serve uploaded property images"""
        return send_from_directory(os.path.join(uploads_dir, 'properties'), filename)
    #projects/603732657929/secrets/FIREBASE_KEYS
    # Initialize Firebase Admin SDK
    firebase_initialized = False
    
    # Try to load from JSON file first (easier setup)
    # Look in server directory (where run.py is), not app directory
    service_account_path = os.path.join(server_dir, 'firebase-service-account.json')
    if os.path.exists(service_account_path):
        try:
            cred = credentials.Certificate(service_account_path)
            if not firebase_admin._apps:
                bucket = os.environ.get('BUCKET', 'real-estate-5eb1f.appspot.com')
                firebase_admin.initialize_app(cred, { 'storageBucket': bucket })
                firebase_initialized = True
                print("✓ Firebase Admin SDK initialized from firebase-service-account.json")
        except Exception as e:
            print(f"Warning: Failed to initialize Firebase from JSON file: {e}")
    
    # If not loaded from file, try environment variables
    if not firebase_initialized:
        firebase_vars = import_firebase_variables()
        
        if firebase_vars.get("private_key") and firebase_vars.get("project_id"):
            try:
                cred = credentials.Certificate(firebase_vars)
                if not firebase_admin._apps:
                    bucket = os.environ.get('BUCKET', 'real-estate-5eb1f.appspot.com')
                    firebase_admin.initialize_app(cred, { 'storageBucket': bucket })
                    firebase_initialized = True
                    print("✓ Firebase Admin SDK initialized from environment variables")
            except Exception as e:
                print(f"Warning: Failed to initialize Firebase: {e}")
                print("The app will continue without Firebase functionality.")
    
    if not firebase_initialized:
        print("⚠️  Warning: Firebase Admin SDK is not initialized. Firebase features will be disabled.")
        print("To enable Firebase, either:")
        print("  1. Place firebase-service-account.json in the server directory, OR")
        print("  2. Set Firebase environment variables (see BACKEND_FIREBASE_SETUP.md)")

    return app
