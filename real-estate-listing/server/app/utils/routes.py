from app.utils import bp
from app.middleware.authenticate import authenticate_user
import os
from flask import request, jsonify
import requests
from firebase_admin import credentials, storage
# from google.cloud import storage
import uuid

# Cloudinary import (optional - only if configured)
try:
    import cloudinary
    import cloudinary.uploader
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False

# Send mail::


@bp.post('/utils/send_mail')
def send_mail():
    data = request.get_json()
    email = phone_number = full_names = message = agent_email = None

    if data:
        if 'email' in data:
            email = data['email']
        if 'phone_number' in data:
            phone_number = data['phone_number']
        if 'full_names' in data:
            full_names = data['full_names']
        if 'message' in data:
            message = data['message']
        if 'agent_email' in data:
            agent_email = data['agent_email']

    subject = "Property Inquiry"

    # Assuming getSecret() is implemented to retrieve the API key
    api_key = os.environ.get("MAIL_KEY")

    # HTML Template
    html_template = '''
                        <html>
                        <head>
                        </head>
                        <body>
                            <h1>{full_names}</h1>
                            <h1>{email}</h1>
                            <h1>{phone_number}</h1>
                            <br>
                            <p>{message}</p>
                        </body>
                        </html>
                    '''
    
    endpoint = 'https://api.brevo.com/v3/smtp/email'
    headers = {
        'accept': 'application/json',
        'api-key': str(api_key),
        'content-type': 'application/json'
    }
    payload = {
        'sender': {'email': "254realtors.homes@gmail.com"},
        'to': [{"email": agent_email}],
        'replyTo': {'email': email},
        'subject': subject,
        'htmlContent': html_template.format(full_names=full_names, email=email, phone_number=phone_number, message=message)}

    try:
        response = requests.post(endpoint, headers=headers, json=payload)

        if not response.ok:
            return jsonify({'result': 'error'}), 500

        return jsonify({'result': 'success'}), 200
    except Exception as e:
        print(e)
        return jsonify({'result': 'error'}), 500


# Upload images - supports Cloudinary, Firebase Storage, and local storage
@bp.post('/utils/upload_images')
@authenticate_user
def upload_images():
    """
    Upload images to server storage.
    Supports (in priority order):
    1. Cloudinary (if configured - recommended for production)
    2. Firebase Storage (if configured)
    3. Local file storage (default fallback - no CORS issues)
    """
    images = request.files

    if not images:
        return jsonify({'error': 'No images uploaded!'}), 400

    image_urls = []
    image_id = uuid.uuid4()
    
    # Configuration: Priority order - Cloudinary > Firebase > Local
    USE_CLOUDINARY = os.environ.get('USE_CLOUDINARY', 'false').lower() == 'true'
    USE_FIREBASE_STORAGE = os.environ.get('USE_FIREBASE_STORAGE', 'false').lower() == 'true'
    USE_LOCAL_STORAGE = os.environ.get('USE_LOCAL_STORAGE', 'true').lower() == 'true'
    
    # Configure Cloudinary if enabled
    if USE_CLOUDINARY and CLOUDINARY_AVAILABLE:
        cloudinary.config(
            cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
            api_key=os.environ.get('CLOUDINARY_API_KEY'),
            api_secret=os.environ.get('CLOUDINARY_API_SECRET')
        )
        print("[UPLOAD] Cloudinary configured")
    
    # Create uploads directory if using local storage
    if USE_LOCAL_STORAGE:
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'properties')
        os.makedirs(upload_dir, exist_ok=True)
    
    try:
        for index, image in images.items():
            if not image.filename:
                continue
                
            # Sanitize filename
            safe_filename = "".join(c for c in image.filename if c.isalnum() or c in (' ', '-', '_', '.')).strip()
            safe_filename = safe_filename.replace(' ', '_')
            
            uploaded = False
            
            # Try Cloudinary first (if configured)
            if USE_CLOUDINARY and CLOUDINARY_AVAILABLE:
                try:
                    # Reset file pointer to beginning
                    image.seek(0)
                    
                    # Upload to Cloudinary
                    result = cloudinary.uploader.upload(
                        image,
                        folder=f"properties/{image_id}",
                        public_id=f"{image_id}_{index}",
                        resource_type="image",
                        overwrite=False
                    )
                    image_url = result.get('secure_url') or result.get('url')
                    image_urls.append(image_url)
                    print(f"[UPLOAD] Uploaded to Cloudinary: {image_url}")
                    uploaded = True
                except Exception as e:
                    print(f"[UPLOAD] Cloudinary upload failed: {e}")
                    # Fall back to next option
            
            # Try Firebase Storage (if Cloudinary failed or not configured)
            if not uploaded and USE_FIREBASE_STORAGE:
                try:
                    image.seek(0)  # Reset file pointer
                    bucket = storage.bucket()
                    image_path = f'images/{image_id}/{safe_filename}'
                    blob = bucket.blob(image_path)
                    blob.upload_from_file(image, content_type=image.content_type)
                    blob.make_public()
                    image_url = blob.public_url
                    image_urls.append(image_url)
                    print(f"[UPLOAD] Uploaded to Firebase: {image_url}")
                    uploaded = True
                except Exception as e:
                    print(f"[UPLOAD] Firebase upload failed: {e}")
                    # Fall back to local storage
            
            # Local file storage (fallback or default)
            if not uploaded and USE_LOCAL_STORAGE:
                try:
                    image.seek(0)  # Reset file pointer
                    file_extension = os.path.splitext(safe_filename)[1] or '.jpg'
                    unique_filename = f"{image_id}_{index}{file_extension}"
                    file_path = os.path.join(upload_dir, unique_filename)
                    
                    image.save(file_path)
                    
                    # Generate URL (relative to server)
                    base_url = request.host_url.rstrip('/')
                    image_url = f"{base_url}uploads/properties/{unique_filename}"
                    image_urls.append(image_url)
                    print(f"[UPLOAD] Uploaded locally: {image_url}")
                    uploaded = True
                except Exception as e:
                    print(f"[UPLOAD] Local upload failed: {e}")
            
            if not uploaded:
                print(f"[UPLOAD] Failed to upload image {index} with all methods")
    
    except Exception as e:
        print(f"[UPLOAD] Error uploading images: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to upload images: {str(e)}'}), 500
    
    if not image_urls:
        return jsonify({'error': 'Failed to upload any images'}), 500
    
    return jsonify({'image_urls': image_urls}), 200
