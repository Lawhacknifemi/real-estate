# Step-by-Step: Fix Firebase Admin SDK

## Quick Setup (5 minutes)

### Step 1: Get Service Account JSON from Firebase Console

1. **Open Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `real-estate-5eb1f`
3. **Go to Project Settings**:
   - Click the ⚙️ **gear icon** (top left, next to "Project Overview")
   - Click **"Project settings"**
4. **Go to Service Accounts tab**:
   - Click the **"Service accounts"** tab at the top
5. **Generate Private Key**:
   - Click the **"Generate new private key"** button
   - A popup will appear - click **"Generate key"**
   - A JSON file will download (e.g., `real-estate-5eb1f-firebase-adminsdk-xxxxx.json`)

### Step 2: Save the File

1. **Rename** the downloaded file to: `firebase-service-account.json`
2. **Move** it to: `/Users/sheriflawal/Dev/realestate-app/real-estate-listing/server/`
   - It should be in the same folder as `run.py`

### Step 3: Verify File Location

Run this command to check:
```bash
cd /Users/sheriflawal/Dev/realestate-app/real-estate-listing/server
ls -la firebase-service-account.json
```

You should see the file listed.

### Step 4: Restart Flask Server

1. **Stop** your current Flask server (press `Ctrl+C` in the terminal where it's running)
2. **Restart** it:
   ```bash
   cd /Users/sheriflawal/Dev/realestate-app/real-estate-listing/server
   python run.py
   ```

3. **Look for this message**:
   ```
   ✓ Firebase Admin SDK initialized from firebase-service-account.json
   ```

### Step 5: Test It

Try submitting a property from the frontend. It should work now! 🎉

## Troubleshooting

### File not found?
- Make sure the file is named exactly: `firebase-service-account.json`
- Make sure it's in: `real-estate-listing/server/` (same folder as `run.py`)
- Check the file path: `ls -la firebase-service-account.json`

### Still getting error?
- Make sure you restarted the Flask server after adding the file
- Check the server console for error messages
- Verify the JSON file is valid: `cat firebase-service-account.json | python -m json.tool`

### Security Note
⚠️ **Never commit this file to git!** It contains sensitive credentials. It's already in `.gitignore`, but double-check.


