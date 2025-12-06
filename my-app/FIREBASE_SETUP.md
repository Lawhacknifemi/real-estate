# Firebase Setup for Authentication

## Quick Setup

1. **Get your Firebase credentials** (see detailed guide below or `FIREBASE_CREDENTIALS_GUIDE.md`)

2. **Create a `.env.local` file** in the `my-app` directory (same level as `package.json`)

3. **Add the following environment variables with your actual Firebase values:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

## Where to Get Firebase Credentials

**Option 1: From Firebase Console (Recommended)**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Click the **Web icon** (`</>`) or go to **Project Settings** (gear icon) > **General** tab
4. Scroll down to **Your apps** section
5. Click the **Web** icon (`</>`) to add a web app (if you haven't already)
6. Copy the values from the `firebaseConfig` object shown

**For detailed step-by-step instructions with screenshots descriptions, see `FIREBASE_CREDENTIALS_GUIDE.md`**

4. **Enable Authentication:**

   - In Firebase Console, go to **Authentication** > **Sign-in method**
   - Enable **Email/Password** provider
   - (Optional) Enable **Google** provider for Google sign-in

5. **Restart your development server:**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
```

## Example `.env.local` file

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyExample123456789
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

## Troubleshooting

- **Error: "Firebase authentication is not configured"**
  - Make sure `.env.local` exists in the `my-app` directory
  - Verify all environment variables start with `NEXT_PUBLIC_`
  - Restart the development server after creating/updating `.env.local`
  - Check that the file is not in `.gitignore` (it should be ignored, but the file should exist locally)

- **Authentication still not working after setup**
  - Check the browser console for specific error messages
  - Verify that Email/Password authentication is enabled in Firebase Console
  - Make sure you're using the correct project credentials

## Note

The `.env.local` file is automatically ignored by git (it's in `.gitignore`), so your Firebase credentials won't be committed to the repository.

