# Backend Image Upload Setup

## ✅ Solution Implemented

I've implemented **backend-based image upload** which completely avoids CORS issues!

## How It Works

1. **Frontend** → Sends images to Flask backend (`/utils/upload_images`)
2. **Backend** → Stores images locally in `server/uploads/properties/`
3. **Backend** → Serves images via `/uploads/properties/<filename>`
4. **Database** → Saves image URLs

## Benefits

✅ **No CORS issues** - Uploads go through your backend  
✅ **No Firebase Storage CORS configuration needed**  
✅ **Works immediately** - No additional setup required  
✅ **Secure** - Requires authentication (Firebase token)  
✅ **Flexible** - Can easily switch to cloud storage later  

## Testing

1. **Start your Flask server** (if not already running):
   ```bash
   cd real-estate-listing/server
   python run.py
   ```

2. **Go to submit property page** in your Next.js app

3. **Select images and submit** - Images will upload through the backend!

4. **Check the uploads folder**:
   ```bash
   ls real-estate-listing/server/uploads/properties/
   ```

## What Changed

### Backend (`real-estate-listing/server/`)

1. **`app/utils/routes.py`** - Updated upload endpoint to support local storage
2. **`app/__init__.py`** - Added route to serve uploaded images

### Frontend (`my-app/`)

1. **`src/lib/backend-storage.ts`** - New module for backend uploads
2. **`src/app/submit-property/page.tsx`** - Now uses backend upload instead of Firebase Storage

## Image URLs

Images are served at:
- **Local dev**: `http://127.0.0.1:5001/uploads/properties/<filename>`
- **Production**: `https://yourdomain.com/uploads/properties/<filename>`

## Production Considerations

For production, you may want to:

1. **Use cloud storage** (S3, Cloudinary, etc.) instead of local files
2. **Add image optimization** (resize, compress)
3. **Set up CDN** for faster image delivery
4. **Add backup strategy** for uploaded images

The backend code is already structured to easily switch to cloud storage - just update the upload logic in `app/utils/routes.py`.

## Switching Back to Firebase Storage

If you want to use Firebase Storage later (after fixing CORS):

1. Set environment variable: `USE_FIREBASE_STORAGE=true`
2. Configure Firebase Storage CORS (see `FIREBASE_STORAGE_CORS_FIX.md`)
3. Restart Flask server

## Troubleshooting

### Images not uploading?

1. Check Flask server is running on port 5001
2. Check browser console for errors
3. Check Flask server logs for `[UPLOAD]` messages
4. Verify `server/uploads/properties/` directory exists

### Images not displaying?

1. Check image URLs in database
2. Verify images exist in `server/uploads/properties/`
3. Check Flask server can serve static files
4. Check browser network tab for 404 errors

### Permission errors?

1. Make sure `server/uploads/` directory is writable
2. Check Flask server has write permissions

