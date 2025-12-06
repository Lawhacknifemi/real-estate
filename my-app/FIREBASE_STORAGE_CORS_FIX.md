# Fix Firebase Storage CORS Error

## The Problem
You're seeing CORS errors when trying to upload images:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

## Solution: Configure CORS for Firebase Storage

You need to configure CORS on your Firebase Storage bucket to allow uploads from `localhost:3000`.

### Option 1: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `real-estate-5eb1f`
3. Go to **Storage** → **Settings** (gear icon)
4. Scroll down to **CORS configuration**
5. Click **Edit CORS configuration**
6. Replace the content with:
   ```json
   [
     {
       "origin": ["http://localhost:3000", "http://127.0.0.1:3000"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"]
     }
   ]
   ```
7. Click **Save**

### Option 2: Using gcloud CLI (If you have it installed)

1. Create a file called `cors.json`:
   ```json
   [
     {
       "origin": ["http://localhost:3000", "http://127.0.0.1:3000"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"]
     }
   ]
   ```

2. Run this command:
   ```bash
   gsutil cors set cors.json gs://real-estate-5eb1f.firebasestorage.app
   ```

### Option 3: Using Firebase CLI

1. Install Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   ```

2. Login:
   ```bash
   firebase login
   ```

3. Create `cors.json` file (same as Option 2)

4. Set CORS:
   ```bash
   gsutil cors set cors.json gs://real-estate-5eb1f.firebasestorage.app
   ```

## After Configuring CORS

1. **Wait 1-2 minutes** for the CORS configuration to propagate
2. **Hard refresh your browser** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. **Try uploading an image again**

## Verify CORS is Working

After configuring, you should see:
- ✅ No CORS errors in the console
- ✅ `[STORAGE] Upload complete!` in the logs
- ✅ Green success message with image URLs

## Important Notes

- **CORS is different from Storage Rules** - you need both configured correctly
- **Storage Rules** control who can read/write (authentication)
- **CORS** controls which origins can make requests (browser security)
- For production, add your production domain to the `origin` array

## Production Setup

When deploying to production, update CORS to include your production domain:
```json
[
  {
    "origin": [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://yourdomain.com"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"]
  }
]
```

