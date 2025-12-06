# Quick Fix: Firebase Admin SDK Setup

## The Problem
Your backend is running, but Firebase Admin SDK is not initialized. This is needed to verify authentication tokens from the frontend.

## Solution: Get Firebase Service Account JSON

### Step 1: Download the Service Account Key

1. Go to: https://console.firebase.google.com/
2. Select your project: **real-estate-5eb1f**
3. Click the **⚙️ gear icon** (top left) → **Project settings**
4. Click the **"Service accounts"** tab
5. Click **"Generate new private key"** button
6. A JSON file will download (something like `real-estate-5eb1f-firebase-adminsdk-xxxxx.json`)

### Step 2: Save the File

1. **Rename** the downloaded file to: `firebase-service-account.json`
2. **Move** it to: `/Users/sheriflawal/Dev/realestate-app/real-estate-listing/server/`
   - It should be in the same folder as `run.py`

### Step 3: Restart Flask Server

```bash
# Stop current server (Ctrl+C)
cd real-estate-listing/server
python run.py
```

You should see:
```
✓ Firebase Admin SDK initialized from firebase-service-account.json
```

### Step 4: Test

Try submitting a property again from the frontend. It should work now! 🎉

## Security Note

⚠️ **Never commit this file to git!** It's already in `.gitignore`, but keep it secure.

## Alternative: Environment Variables

If you prefer environment variables instead of a JSON file, see `BACKEND_FIREBASE_SETUP.md` for instructions.



