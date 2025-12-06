# Firebase Credentials Guide

This guide shows you exactly where to find each Firebase credential and how to add them to your app.

## Step 1: Create or Select a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard (you can skip Google Analytics for now if you want)

## Step 2: Add a Web App to Your Firebase Project

1. In your Firebase project dashboard, click the **Web icon** (`</>`) or **"Add app"** > **Web**
2. Register your app:
   - **App nickname**: "Real Estate App" (or any name you prefer)
   - **Firebase Hosting**: You can skip this for now (uncheck the box)
3. Click **"Register app"**

## Step 3: Copy Your Firebase Configuration

After registering, you'll see a screen with code that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyExample123456789",
  authDomain: "my-project.firebaseapp.com",
  projectId: "my-project",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**These are the 6 credentials you need!**

### Alternative: Get from Project Settings

If you already have a web app registered:

1. Click the **gear icon** (⚙️) next to "Project Overview" in the left sidebar
2. Select **"Project settings"**
3. Scroll down to the **"Your apps"** section
4. Click on your web app (or the **Web icon** `</>` to add a new one)
5. You'll see the same configuration object

## Step 4: Map Firebase Credentials to Environment Variables

Here's how each Firebase config value maps to your `.env.local` file:

| Firebase Config Key | Environment Variable | Example Value |
|---------------------|---------------------|---------------|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyExample123456789` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `my-project.firebaseapp.com` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `my-project` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `my-project.appspot.com` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123456789012:web:abcdef123456` |

## Step 5: Create Your `.env.local` File

1. In your `my-app` directory, create a file named `.env.local`
2. Add the following content, replacing the values with your actual Firebase credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyExample123456789
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Backend API URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

## Step 6: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** (in the left sidebar)
2. Click **"Get started"** if you haven't enabled it yet
3. Click on **"Sign-in method"** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"
5. (Optional) Enable **Google** sign-in:
   - Click on "Google"
   - Toggle "Enable" to ON
   - Enter a project support email
   - Click "Save"

## Step 7: Restart Your Development Server

After creating/updating `.env.local`:

```bash
# Stop your current server (Ctrl+C or Cmd+C)
# Then restart:
cd my-app
pnpm dev
```

## Complete Example `.env.local` File

Here's what a complete `.env.local` file should look like (with example values):

```env
# Firebase Configuration - Replace these with your actual values from Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC7X8Y9Z0a1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=realestate-app-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=realestate-app-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=realestate-app-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321098
NEXT_PUBLIC_FIREBASE_APP_ID=1:987654321098:web:abc123def456ghi789

# Backend API URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

## Important Notes

1. **Never commit `.env.local` to git** - It's already in `.gitignore`, but double-check it's not tracked
2. **All variables must start with `NEXT_PUBLIC_`** - This is required for Next.js to expose them to the browser
3. **No quotes needed** - Don't wrap values in quotes in `.env.local`
4. **Restart required** - You must restart the dev server after changing environment variables

## Verification

After setting up, you should:
- See no "Firebase authentication is not configured" errors
- Be able to click the login/signup buttons (they won't be disabled)
- The yellow warning banner on the login page should disappear

## Troubleshooting

**Can't find the config?**
- Make sure you've added a **Web app** to your Firebase project
- Check Project Settings > General > Your apps section

**Values look wrong?**
- Make sure you're copying from the `firebaseConfig` object, not from other sections
- Double-check there are no extra spaces or quotes

**Still not working?**
- Verify all 6 variables are present in `.env.local`
- Make sure the file is named exactly `.env.local` (not `.env` or `.env.local.txt`)
- Restart your development server
- Check the browser console for specific error messages



