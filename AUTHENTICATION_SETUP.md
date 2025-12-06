# Authentication Setup Guide

This guide explains how to set up authentication for the real estate application, allowing sellers to upload properties and buyers to purchase them.

## Features

- **User Authentication**: Firebase-based authentication with email/password and Google sign-in
- **Role-Based Access**: Users can sign up as either a "Seller" (to list properties) or "Buyer" (to purchase properties)
- **Property Upload**: Authenticated sellers can submit new properties
- **Property Purchase**: Authenticated buyers can submit purchase requests for properties

## Frontend Setup (Next.js)

### 1. Firebase Configuration

Create a `.env.local` file in the `my-app` directory with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

### 2. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Enable "Google" (optional, for Google sign-in)
4. Get your Firebase config from Project Settings > General > Your apps

### 3. Running the Frontend

```bash
cd my-app
pnpm install
pnpm dev
```

The app will be available at `http://localhost:3000`

## Backend Setup (Flask)

### 1. Firebase Admin SDK Setup

Set the following environment variables for Firebase Admin SDK:

```bash
export type="service_account"
export project_id="your_project_id"
export private_key_id="your_private_key_id"
export private_key="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
export client_email="your_client_email"
export client_id="your_client_id"
export auth_uri="https://accounts.google.com/o/oauth2/auth"
export token_uri="https://oauth2.googleapis.com/token"
export auth_provider_x509_cert_url="https://www.googleapis.com/oauth2/v1/certs"
export client_x509_cert_url="your_cert_url"
export universe_domain="googleapis.com"
export BUCKET="your_storage_bucket"
```

Or create a `.env` file in the `real-estate-listing/server` directory.

### 2. Initialize Database

Make sure the Purchase model is included:

```bash
cd real-estate-listing/server
python init_db.py
```

### 3. Running the Backend

```bash
cd real-estate-listing/server
python run.py
```

The API will be available at `http://127.0.0.1:5000`

## Usage

### For Sellers

1. **Sign Up as Seller**:
   - Go to `/login`
   - Click "Sign Up"
   - Select "Sell/List Properties" as your role
   - Complete the registration form

2. **Submit a Property**:
   - Navigate to `/submit-property`
   - Fill in the property details
   - Submit the form
   - Your property will be automatically associated with your account

### For Buyers

1. **Sign Up as Buyer**:
   - Go to `/login`
   - Click "Sign Up"
   - Select "Buy Properties" as your role
   - Complete the registration form

2. **Purchase a Property**:
   - Browse properties at `/listings`
   - Click on a property to view details
   - Click "Purchase / Request Information"
   - Fill in your contact information
   - Submit the purchase request

## API Endpoints

### Authentication Required

All endpoints that require authentication expect a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

### Property Endpoints

- `POST /property/new_property/<realtor_id>` - Create a new property (Seller only)
- `POST /property/purchase/<property_id>` - Submit a purchase request (Buyer only)
- `GET /property/all_properties` - Get all properties (Public)
- `GET /property/<property_id>` - Get property details (Public)
- `GET /property/search_properties` - Search properties (Public)

## Database Models

### Purchase Model

The Purchase model tracks purchase requests:

- `id`: Unique purchase ID
- `property_id`: ID of the property being purchased
- `buyer_id`: Firebase user ID of the buyer
- `buyer_name`, `buyer_email`, `buyer_phone`: Buyer contact information
- `message`: Optional message from buyer
- `status`: Purchase status (pending, approved, rejected)
- `date_created`: Timestamp of the purchase request

## Troubleshooting

### Firebase Not Initialized

If you see warnings about Firebase not being configured:
- Make sure all environment variables are set correctly
- Check that the Firebase Admin SDK credentials are valid
- The app will continue to work for public endpoints, but authentication features will be disabled

### Authentication Errors

- Verify that Firebase Authentication is enabled in the Firebase Console
- Check that the Firebase config in `.env.local` matches your Firebase project
- Ensure the backend has the correct Firebase Admin SDK credentials

### Property Creation Fails

- Make sure you're logged in as a seller
- Verify that all required fields are filled in
- Check the browser console and backend logs for error messages

## Next Steps

- Add email notifications for purchase requests
- Implement property image upload functionality
- Add seller dashboard to manage properties
- Add buyer dashboard to view purchase history
- Implement payment processing (if needed)



