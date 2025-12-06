#!/bin/bash

# Firebase Storage CORS Configuration Script
# This script helps configure CORS for Firebase Storage

echo "🔧 Firebase Storage CORS Configuration"
echo "========================================"
echo ""

# Check if gcloud is installed
if ! command -v gsutil &> /dev/null; then
    echo "❌ gsutil is not installed."
    echo ""
    echo "To install gsutil:"
    echo "  1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    echo "  2. Run: gcloud init"
    echo ""
    echo "OR use Option 1 in FIREBASE_STORAGE_CORS_FIX.md (Firebase Console)"
    exit 1
fi

# Create CORS configuration file
cat > cors.json << 'EOF'
[
  {
    "origin": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"]
  }
]
EOF

echo "✅ Created cors.json file"
echo ""
echo "Setting CORS configuration for Firebase Storage bucket..."
echo ""

# Set CORS
gsutil cors set cors.json gs://real-estate-5eb1f.firebasestorage.app

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CORS configuration applied successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Wait 1-2 minutes for changes to propagate"
    echo "  2. Hard refresh your browser (Cmd+Shift+R / Ctrl+Shift+R)"
    echo "  3. Try uploading an image again"
else
    echo ""
    echo "❌ Failed to set CORS configuration"
    echo ""
    echo "Alternative: Use Firebase Console method (see FIREBASE_STORAGE_CORS_FIX.md)"
fi

# Clean up
rm -f cors.json

