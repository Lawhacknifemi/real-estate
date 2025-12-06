# Why Frontend Auth Works But Backend Doesn't

## Two Different Firebase SDKs

### 1. Frontend Firebase (Client SDK) ✅ WORKING
- **Location**: `my-app/src/lib/firebase.ts`
- **Credentials**: `NEXT_PUBLIC_FIREBASE_*` from `.env.local`
- **Purpose**: User authentication (sign in, sign up)
- **Status**: ✅ Working - That's why Google sign-in works!

### 2. Backend Firebase Admin SDK ❌ NOT INITIALIZED
- **Location**: `real-estate-listing/server/app/__init__.py`
- **Credentials**: `firebase-service-account.json` (missing!)
- **Purpose**: Verify tokens from frontend
- **Status**: ❌ Not initialized - That's why you get the error!

## The Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Frontend Firebase (Client SDK) ✅
   - Creates an ID token
   - User is authenticated in browser
   ↓
3. Frontend sends token to backend API
   ↓
4. Backend tries to verify token
   ↓
5. Backend Firebase Admin SDK ❌
   - Can't verify because not initialized
   - Returns error
```

## Why Two Different SDKs?

- **Frontend SDK**: Public credentials, runs in browser, authenticates users
- **Backend Admin SDK**: Private credentials, runs on server, verifies tokens

## Solution

Get the service account JSON file from Firebase Console and place it in:
```
real-estate-listing/server/firebase-service-account.json
```

See `real-estate-listing/server/SETUP_FIREBASE.md` for detailed instructions.


