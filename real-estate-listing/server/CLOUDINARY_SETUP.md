# Cloudinary Setup Guide

## Why Cloudinary?

✅ **No CORS issues** - Uploads through your backend  
✅ **Image optimization** - Automatic compression, resizing, format conversion  
✅ **CDN delivery** - Fast image loading worldwide  
✅ **Free tier** - 25GB storage, 25GB bandwidth/month  
✅ **Easy setup** - Simple API, great documentation  

## Step 1: Sign Up for Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com/users/register/free)
2. Sign up for a free account (no credit card required)
3. Verify your email

## Step 2: Get Your Credentials

1. After logging in, go to your **Dashboard**
2. You'll see your **Account Details**:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

⚠️ **Keep these credentials secure!** Never commit them to git.

## Step 3: Install Cloudinary

The Cloudinary package is already in `requirements.txt`. Install it:

```bash
cd real-estate-listing/server
pip install cloudinary==1.36.0
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

## Step 4: Configure Environment Variables

Set these environment variables in your Flask server:

### Option A: Export in Terminal (Temporary)

```bash
cd real-estate-listing/server

export USE_CLOUDINARY=true
export CLOUDINARY_CLOUD_NAME="your-cloud-name"
export CLOUDINARY_API_KEY="your-api-key"
export CLOUDINARY_API_SECRET="your-api-secret"
```

### Option B: Create `.env` File (Recommended)

Create a `.env` file in `real-estate-listing/server/`:

```env
# Cloudinary Configuration
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Disable other storage options (optional)
USE_LOCAL_STORAGE=false
USE_FIREBASE_STORAGE=false
```

**Important:** Add `.env` to `.gitignore` (already done) to keep credentials secure!

### Option C: Load from `.env` Automatically

If you want to use `.env` file, make sure `python-dotenv` is installed (already in requirements.txt), and add this to `app/__init__.py`:

```python
from dotenv import load_dotenv
load_dotenv()  # Load .env file
```

## Step 5: Restart Flask Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
cd real-estate-listing/server
python run.py
```

You should see:
```
[UPLOAD] Cloudinary configured
```

## Step 6: Test Image Upload

1. Go to your submit property page
2. Select images and submit
3. Check Flask server logs - you should see:
   ```
   [UPLOAD] Uploaded to Cloudinary: https://res.cloudinary.com/...
   ```

4. Images will be stored in Cloudinary and served via their CDN!

## Image URLs

Cloudinary URLs look like:
```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/properties/uuid/image.jpg
```

These URLs are:
- ✅ **Optimized** - Automatically compressed
- ✅ **Fast** - Served via CDN
- ✅ **Secure** - HTTPS by default
- ✅ **Transformable** - Can resize/format on-the-fly

## Image Transformations (Optional)

Cloudinary supports on-the-fly image transformations. You can modify the upload code to add transformations:

```python
result = cloudinary.uploader.upload(
    image,
    folder=f"properties/{image_id}",
    public_id=f"{image_id}_{index}",
    resource_type="image",
    transformation=[
        {"width": 1200, "height": 800, "crop": "limit"},  # Max size
        {"quality": "auto"},  # Auto optimize quality
        {"format": "auto"}   # Auto format (webp if supported)
    ]
)
```

Or transform URLs when displaying:
```
https://res.cloudinary.com/.../image/upload/w_800,h_600,c_fill/properties/...
```

## Storage Priority

The upload endpoint tries storage methods in this order:

1. **Cloudinary** (if `USE_CLOUDINARY=true`)
2. **Firebase Storage** (if `USE_FIREBASE_STORAGE=true`)
3. **Local Storage** (if `USE_LOCAL_STORAGE=true`)

If one fails, it automatically falls back to the next.

## Free Tier Limits

Cloudinary free tier includes:
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ 25GB monthly net viewing bandwidth
- ✅ Unlimited transformations

For most small-to-medium apps, this is plenty!

## Production Tips

1. **Set up monitoring** - Cloudinary dashboard shows usage
2. **Use folders** - Organize images by property/user
3. **Enable auto-format** - Serve WebP to modern browsers
4. **Set up backups** - Export important images periodically
5. **Monitor usage** - Upgrade if you exceed free tier

## Troubleshooting

### "Cloudinary not configured"
- Check environment variables are set correctly
- Verify `USE_CLOUDINARY=true`
- Restart Flask server after setting variables

### "Invalid credentials"
- Double-check Cloud Name, API Key, and API Secret
- Make sure there are no extra spaces or quotes
- Verify credentials in Cloudinary Dashboard

### "Upload failed"
- Check internet connection
- Verify Cloudinary account is active
- Check Cloudinary dashboard for errors
- Check Flask server logs for detailed error messages

### Images not displaying
- Verify image URLs are saved correctly in database
- Check Cloudinary dashboard to see if images uploaded
- Test image URLs directly in browser

## Security Best Practices

1. ✅ **Never commit credentials to git** - Use `.env` file (already in `.gitignore`)
2. ✅ **Use environment variables** - Don't hardcode credentials
3. ✅ **Rotate API keys** - If credentials are ever exposed
4. ✅ **Use signed URLs** - For private images (optional)
5. ✅ **Set upload limits** - Prevent abuse

## Next Steps

- ✅ Images are now uploading to Cloudinary!
- ✅ Check your Cloudinary dashboard to see uploaded images
- ✅ Images are automatically optimized and served via CDN
- ✅ No CORS issues - everything works smoothly!

Enjoy fast, optimized image uploads! 🚀

