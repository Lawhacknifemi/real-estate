#!/usr/bin/env python3
"""
Quick script to verify Firebase Admin SDK setup
Run this after adding firebase-service-account.json
"""

import os
import json
import sys

def check_firebase_setup():
    """Check if Firebase Admin SDK is properly configured"""
    print("🔍 Checking Firebase Admin SDK setup...\n")
    
    # Check 1: File exists
    service_account_path = os.path.join(os.path.dirname(__file__), 'firebase-service-account.json')
    print(f"1. Checking for firebase-service-account.json...")
    if os.path.exists(service_account_path):
        print(f"   ✅ File found: {service_account_path}")
    else:
        print(f"   ❌ File NOT found: {service_account_path}")
        print(f"   📝 Please download it from Firebase Console and place it here")
        return False
    
    # Check 2: File is valid JSON
    print(f"\n2. Validating JSON file...")
    try:
        with open(service_account_path, 'r') as f:
            data = json.load(f)
        print(f"   ✅ JSON is valid")
    except json.JSONDecodeError as e:
        print(f"   ❌ Invalid JSON: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error reading file: {e}")
        return False
    
    # Check 3: Required fields
    print(f"\n3. Checking required fields...")
    required_fields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email']
    missing_fields = []
    for field in required_fields:
        if field not in data:
            missing_fields.append(field)
    
    if missing_fields:
        print(f"   ❌ Missing required fields: {', '.join(missing_fields)}")
        return False
    else:
        print(f"   ✅ All required fields present")
        print(f"   📋 Project ID: {data.get('project_id', 'N/A')}")
        print(f"   📋 Client Email: {data.get('client_email', 'N/A')}")
    
    # Check 4: Try to initialize Firebase Admin SDK
    print(f"\n4. Testing Firebase Admin SDK initialization...")
    try:
        import firebase_admin
        from firebase_admin import credentials
        
        # Clear any existing apps
        if firebase_admin._apps:
            firebase_admin.delete_app(firebase_admin.get_app())
        
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        print(f"   ✅ Firebase Admin SDK initialized successfully!")
        
        # Clean up
        firebase_admin.delete_app(firebase_admin.get_app())
        return True
    except ImportError:
        print(f"   ❌ firebase-admin not installed")
        print(f"   💡 Run: pip install firebase-admin")
        return False
    except Exception as e:
        print(f"   ❌ Failed to initialize: {e}")
        return False

if __name__ == '__main__':
    success = check_firebase_setup()
    print("\n" + "="*50)
    if success:
        print("✅ All checks passed! Firebase Admin SDK is ready.")
        print("💡 Restart your Flask server to use it.")
    else:
        print("❌ Setup incomplete. Please fix the issues above.")
    print("="*50)
    sys.exit(0 if success else 1)


