# Image Upload Troubleshooting

## Issue: App Stuck in "Uploading Images..." Loop

If your app is stuck showing "Uploading Images..." and never completes, here's how to fix it:

## Quick Fixes

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for error messages. Look for:
- Firebase Storage errors
- Network errors
- Permission errors

### 2. Check Firebase Storage Rules

Go to [Firebase Console](https://console.firebase.google.com/) → Storage → Rules

Your rules should allow authenticated uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{allPaths=**} {
      allow read: if true;  // Allow public reads
      allow write: if request.auth != null;  // Allow authenticated writes
    }
  }
}
```

**Important**: Make sure you're logged in when trying to upload!

### 3. Check Environment Variables

Make sure `.env.local` has:
```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=real-estate-5eb1f.firebasestorage.app
```

Then **restart your Next.js dev server** after changing `.env.local`.

### 4. Test Storage Connection

Open browser console and run:
```javascript
// Check if Firebase Storage is initialized
import { getStorage } from 'firebase/storage';
import { app } from '@/lib/firebase';
const storage = getStorage(app);
console.log('Storage bucket:', storage.app.options.storageBucket);
```

### 5. Common Error Codes

- **storage/unauthorized**: Storage rules don't allow upload
  - Fix: Update Firebase Storage rules (see #2 above)
  
- **storage/canceled**: Upload was canceled
  - Fix: Try again
  
- **storage/unknown**: Network or unknown error
  - Fix: Check internet connection, check browser console for details

## What I've Fixed

1. ✅ Added timeout (5 minutes per image) to prevent infinite hanging
2. ✅ Better error logging to console
3. ✅ Property submission continues even if images fail (shows warning)
4. ✅ More specific error messages
5. ✅ Authentication check before upload

## Next Steps

1. **Check browser console** - Look for the error messages I added
2. **Check Firebase Storage rules** - Make sure authenticated uploads are allowed
3. **Try uploading again** - The app should now show a proper error message instead of hanging

## Still Stuck?

If it's still hanging:
1. Open browser console (F12)
2. Look for error messages starting with "Starting upload" or "Error uploading"
3. Share the error message you see

The app will now continue submitting the property even if images fail, so you can at least submit properties without images while we fix the upload issue.


