# Fix Firebase Storage Rules

## The Problem
Your upload is timing out, which usually means Firebase Storage rules are blocking the upload.

## Quick Fix

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `real-estate-5eb1f`
3. **Go to Storage**: Click "Storage" in the left menu
4. **Click "Rules" tab**
5. **Replace the rules with this**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public reads
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow authenticated writes to properties folder
    match /properties/{allPaths=**} {
      allow write: if request.auth != null;
    }
    
    // Allow authenticated writes to any path (for now)
    match /{allPaths=**} {
      allow write: if request.auth != null;
    }
  }
}
```

6. **Click "Publish"**

## Test It

After updating the rules:
1. Make sure you're **logged in** to your app
2. Try uploading an image again
3. Check the browser console for `[STORAGE]` logs

## What the Rules Do

- **`allow read: if true`** - Anyone can view images (public)
- **`allow write: if request.auth != null`** - Only logged-in users can upload

## Still Not Working?

If it still times out after updating rules:
1. Check browser console for `[STORAGE]` logs
2. Make sure you're logged in (check the auth state)
3. Verify the storage bucket in `.env.local` matches Firebase Console


