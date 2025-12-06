// Firebase configuration and initialization
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Check if Firebase environment variables are set
const hasFirebaseConfig = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Firebase configuration
const firebaseConfig = hasFirebaseConfig ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
} : null;

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (firebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase configuration not found. Authentication features will be disabled.');
  console.warn('To enable Firebase, create a .env.local file with your Firebase credentials.');
}

export { app, auth };

// Export a helper to check if Firebase is configured
export const isFirebaseConfigured = () => {
  return auth !== null;
};

