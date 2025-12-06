# Image Storage Options

## Current Implementation: Backend Upload (Recommended)

✅ **No CORS issues** - Images upload through your Flask backend  
✅ **Simple setup** - No additional configuration needed  
✅ **Works immediately** - No Firebase Storage CORS configuration required  

### How It Works

1. Frontend sends images to Flask backend (`/utils/upload_images`)
2. Backend stores images locally in `server/uploads/properties/`
3. Backend serves images via `/uploads/properties/<filename>`
4. Image URLs are saved to database

### Configuration

The backend uses **local file storage by default**. To change this:

**Environment Variables** (in your Flask server):
- `USE_LOCAL_STORAGE=true` (default) - Store images on server filesystem
- `USE_FIREBASE_STORAGE=false` (default) - Use Firebase Storage instead

## Alternative Options

### Option 1: Firebase Storage (Current - Has CORS Issues)

**Pros:**
- Scalable cloud storage
- CDN delivery
- Free tier available

**Cons:**
- ❌ Requires CORS configuration (current issue)
- Requires Firebase setup
- More complex

**To use:** Configure CORS (see `FIREBASE_STORAGE_CORS_FIX.md`)

### Option 2: Cloudinary (Recommended for Production)

**Pros:**
- ✅ No CORS issues
- Image optimization/transformation
- CDN delivery
- Free tier: 25GB storage, 25GB bandwidth/month

**Setup:**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get API credentials
3. Install: `pip install cloudinary`
4. Update backend to use Cloudinary SDK

### Option 3: AWS S3

**Pros:**
- Scalable
- Reliable
- Industry standard

**Cons:**
- Requires AWS account
- More complex setup
- Costs money (but very cheap)

### Option 4: Local Storage (Current Default)

**Pros:**
- ✅ No setup needed
- ✅ No CORS issues
- ✅ Works immediately

**Cons:**
- Not scalable (server disk space)
- No CDN (slower for users far from server)
- Need to backup manually

**Good for:** Development and small deployments

## Switching Storage Options

### To Use Backend Upload (Current - Recommended)

Already implemented! Just use the app - it uploads through the backend by default.

### To Use Firebase Storage

1. Configure CORS (see `FIREBASE_STORAGE_CORS_FIX.md`)
2. Set environment variable: `USE_FIREBASE_STORAGE=true`
3. Restart Flask server

### To Use Cloudinary

1. Sign up at cloudinary.com
2. Get your credentials
3. Install: `pip install cloudinary`
4. Update `app/utils/routes.py` to use Cloudinary SDK
5. Set environment variables with Cloudinary credentials

## Production Recommendations

For production, consider:

1. **Cloudinary** - Best balance of features and ease of use
2. **AWS S3 + CloudFront** - Most scalable, industry standard
3. **Backend upload to cloud storage** - Keep backend upload but store in S3/Cloudinary

The current backend upload can be easily modified to store files in any cloud storage service while keeping the same API.

