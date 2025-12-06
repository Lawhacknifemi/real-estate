# Fix: uploadBytes Timing Out

## The Problem
`uploadBytes` is timing out after 10 seconds, which means Firebase Storage is blocking your uploads. This is **almost always** a Firebase Storage Rules issue.

## ✅ Quick Fix (2 minutes)

### Step 1: Update Firebase Storage Rules

1. Go to: https://console.firebase.google.com/project/real-estate-5eb1f/storage/rules
2. Click the **"Rules"** tab
3. **Replace everything** with this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public reads
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow authenticated users to write
    match /{allPaths=**} {
      allow write: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

### Step 2: Verify You're Logged In

Make sure you're logged in to your app before trying to upload images. The rules require authentication (`request.auth != null`).

### Step 3: Try Again

1. Refresh your app
2. Make sure you're logged in
3. Try uploading an image again

## 🔍 Why This Happens

Firebase Storage rules default to blocking all uploads. If you haven't set up rules, uploads will hang/timeout because Firebase is silently rejecting them.

## 🚀 Workaround (Use Now)

While you fix the rules, you can:
1. **Submit properties without images** - Just don't select any images
2. **Use the "Skip images" button** - If upload starts, click this to bypass it
3. **Add images later** - You can update properties with images after fixing the rules

## 📝 Test After Fixing Rules

After updating the rules, check the browser console. You should see:
- `[STORAGE] Calling uploadBytes...`
- `[STORAGE] Upload complete!` ← This means it worked!

If you still see timeouts, check:
- Are you logged in? (Check auth state)
- Is the storage bucket correct in `.env.local`?
- Are there any network errors in the console?

## Still Not Working?

If it still times out after updating rules:
1. Check browser console for `[STORAGE]` logs
2. Verify you're authenticated (check if `user` exists)
3. Try a smaller image file (< 1MB) to test
4. Check Firebase Console → Storage → Files to see if anything is uploading


