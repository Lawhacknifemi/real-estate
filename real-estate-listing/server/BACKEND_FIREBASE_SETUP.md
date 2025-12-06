# Backend Firebase Admin SDK Setup

The backend needs Firebase Admin SDK credentials to verify authentication tokens from the frontend.

## Quick Setup

### Option 1: Using Environment Variables (Recommended)

1. **Get Firebase Admin SDK Credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (`real-estate-5eb1f`)
   - Click the **gear icon** (⚙️) → **Project settings**
   - Go to the **Service accounts** tab
   - Click **"Generate new private key"**
   - A JSON file will download - **keep this secure!**

2. **Extract Values from the JSON:**
   The downloaded JSON file contains all the credentials you need. It looks like this:
   ```json
   {
     "type": "service_account",
     "project_id": "real-estate-5eb1f",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "...@...iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "...",
     "universe_domain": "googleapis.com"
   }
   ```

3. **Set Environment Variables:**
   
   **On macOS/Linux:**
   ```bash
   cd real-estate-listing/server
   
   export type="service_account"
   export project_id="real-estate-5eb1f"
   export private_key_id="<from_json_file>"
   export private_key="<from_json_file>"
   export client_email="<from_json_file>"
   export client_id="<from_json_file>"
   export auth_uri="https://accounts.google.com/o/oauth2/auth"
   export token_uri="https://oauth2.googleapis.com/token"
   export auth_provider_x509_cert_url="https://www.googleapis.com/oauth2/v1/certs"
   export client_x509_cert_url="<from_json_file>"
   export universe_domain="googleapis.com"
   export BUCKET="real-estate-5eb1f.appspot.com"
   ```

   **Or create a `.env` file** in `real-estate-listing/server/`:
   ```env
   type=service_account
   project_id=real-estate-5eb1f
   private_key_id=your_private_key_id
   private_key="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   client_email=your-service-account@real-estate-5eb1f.iam.gserviceaccount.com
   client_id=your_client_id
   auth_uri=https://accounts.google.com/o/oauth2/auth
   token_uri=https://oauth2.googleapis.com/token
   auth_provider_x509_cert_url=https://www.googleapis.com/oauth2/v1/certs
   client_x509_cert_url=your_cert_url
   universe_domain=googleapis.com
   BUCKET=real-estate-5eb1f.appspot.com
   ```

   **Important:** For the `private_key`, keep the `\n` characters as they are, or replace `\\n` with actual newlines.

4. **Restart the Flask Server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   cd real-estate-listing/server
   python run.py
   ```

### Option 2: Using a Service Account JSON File

1. **Download the service account JSON** (same as Option 1, step 1)

2. **Save it securely** in `real-estate-listing/server/` as `firebase-service-account.json`

3. **Update `app/__init__.py`** to load from file:
   ```python
   # In app/__init__.py, replace the Firebase initialization with:
   import os
   service_account_path = os.path.join(basedir, 'firebase-service-account.json')
   if os.path.exists(service_account_path):
       cred = credentials.Certificate(service_account_path)
       firebase_admin.initialize_app(cred)
   ```

4. **Add `firebase-service-account.json` to `.gitignore`** (never commit this file!)

## Verification

After setting up, when you start the Flask server, you should **NOT** see:
```
Warning: Firebase environment variables not set. Firebase features will be disabled.
```

Instead, the server should start without Firebase warnings.

## Testing

1. **Start the Flask server:**
   ```bash
   cd real-estate-listing/server
   python run.py
   ```

2. **Try to submit a property** from the frontend while logged in

3. **Check the terminal** - you should see successful authentication instead of:
   ```
   Authentication error: The default Firebase app does not exist.
   ```

## Troubleshooting

### "Firebase Admin SDK is not initialized"
- Make sure all environment variables are set
- Check that `private_key` includes the `\n` characters (newlines)
- Restart the Flask server after setting environment variables

### "Invalid token provided"
- Make sure the frontend Firebase config matches the backend project
- Verify that Email/Password authentication is enabled in Firebase Console
- Check that you're logged in on the frontend

### Environment Variables Not Loading
- If using a `.env` file, you may need to install `python-dotenv`:
  ```bash
  pip install python-dotenv
  ```
- Then add to `app/__init__.py`:
  ```python
  from dotenv import load_dotenv
  load_dotenv()
  ```

## Security Notes

⚠️ **IMPORTANT:**
- Never commit the service account JSON file or `.env` file to git
- The service account has admin access to your Firebase project
- Keep these credentials secure and private
- Rotate keys if they're ever exposed



