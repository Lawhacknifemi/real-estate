#!/bin/bash

# Cloudinary Setup Helper Script
# This script helps you set up Cloudinary for image uploads

echo "☁️  Cloudinary Setup Helper"
echo "============================"
echo ""

# Check if .env file exists
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    echo "📄 Found existing .env file"
    read -p "Do you want to add Cloudinary config to it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        APPEND_MODE=true
    else
        APPEND_MODE=false
    fi
else
    APPEND_MODE=true
fi

echo ""
echo "Please enter your Cloudinary credentials:"
echo "(You can find these in your Cloudinary Dashboard)"
echo ""

read -p "Cloud Name: " CLOUD_NAME
read -p "API Key: " API_KEY
read -sp "API Secret: " API_SECRET
echo ""

if [ -z "$CLOUD_NAME" ] || [ -z "$API_KEY" ] || [ -z "$API_SECRET" ]; then
    echo "❌ Error: All credentials are required!"
    exit 1
fi

if [ "$APPEND_MODE" = true ]; then
    # Append to .env file
    {
        echo ""
        echo "# Cloudinary Configuration"
        echo "USE_CLOUDINARY=true"
        echo "CLOUDINARY_CLOUD_NAME=$CLOUD_NAME"
        echo "CLOUDINARY_API_KEY=$API_KEY"
        echo "CLOUDINARY_API_SECRET=$API_SECRET"
        echo ""
        echo "# Disable other storage (optional)"
        echo "# USE_LOCAL_STORAGE=false"
        echo "# USE_FIREBASE_STORAGE=false"
    } >> "$ENV_FILE"
    
    echo "✅ Added Cloudinary configuration to .env file"
else
    # Show export commands
    echo ""
    echo "Run these commands to set environment variables:"
    echo ""
    echo "export USE_CLOUDINARY=true"
    echo "export CLOUDINARY_CLOUD_NAME=$CLOUD_NAME"
    echo "export CLOUDINARY_API_KEY=$API_KEY"
    echo "export CLOUDINARY_API_SECRET=$API_SECRET"
fi

echo ""
echo "📦 Installing Cloudinary package..."
pip install cloudinary==1.36.0

if [ $? -eq 0 ]; then
    echo "✅ Cloudinary installed successfully!"
else
    echo "❌ Failed to install Cloudinary"
    echo "Try: pip install cloudinary==1.36.0"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Restart your Flask server"
echo "  2. Try uploading an image"
echo "  3. Check Cloudinary dashboard to see uploaded images"
echo ""
echo "For more details, see CLOUDINARY_SETUP.md"

