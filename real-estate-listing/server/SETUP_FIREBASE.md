# Quick Firebase Admin SDK Setup

## Easiest Method: Use JSON File

1. **Get the Service Account JSON:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: **real-estate-5eb1f**
   - Click ⚙️ (gear icon) → **Project settings**
   - Go to **Service accounts** tab
   - Click **"Generate new private key"**
   - A JSON file will download

2. **Save the File:**
   - Rename the downloaded file to: `firebase-service-account.json`
   - Place it in: `real-estate-listing/server/` (same directory as `run.py`)

3. **Restart Flask Server:**
   ```bash
   # Stop current server (Ctrl+C)
   cd real-estate-listing/server
   python run.py
   ```

4. **Verify:**
   You should see: `✓ Firebase Admin SDK initialized from firebase-service-account.json`

That's it! Authentication should now work.

## Alternative: Environment Variables

If you prefer environment variables, see `BACKEND_FIREBASE_SETUP.md` for detailed instructions.

## Security Note

⚠️ **Never commit `firebase-service-account.json` to git!** It's already in `.gitignore`, but double-check.



