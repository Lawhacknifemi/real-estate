# How to Run the Real Estate Listing Application

This is a full-stack application with a React/TypeScript frontend and a Flask backend.

## Prerequisites

- **Node.js** (v14 or higher) and **npm**
- **Python** (3.8 or higher) and **pip**
- **PostgreSQL** (optional - SQLite will be used as fallback if DATABASE_URI is not set)
- **Firebase** account and credentials

## Setup Instructions

### 1. Backend Setup (Flask Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **On macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```
   - **On Windows:**
     ```bash
     venv\Scripts\activate
     ```

4. Upgrade pip, setuptools, and wheel (recommended):
   ```bash
   pip install --upgrade pip setuptools wheel
   ```

5. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   
   **Note:** If you encounter build errors with `greenlet` or `grpcio` on Python 3.12+, the requirements.txt has been updated to use `>=` instead of `==` for these packages to allow compatible newer versions.

6. Set up environment variables:
   Create a `.env` file in the `server/` directory with the following variables:
   ```env
   SECRET_KEY=your-secret-key-here
   DATABASE_URI=postgresql://user:password@localhost:5432/dbname
   # Or leave DATABASE_URI unset to use SQLite (myDB.db)
   
   # Firebase credentials
   type=service_account
   project_id=your-project-id
   private_key_id=your-private-key-id
   private_key="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   client_email=your-client-email
   client_id=your-client-id
   auth_uri=https://accounts.google.com/o/oauth2/auth
   token_uri=https://oauth2.googleapis.com/token
   auth_provider_x509_cert_url=https://www.googleapis.com/oauth2/v1/certs
   client_x509_cert_url=your-client-x509-cert-url
   universe_domain=googleapis.com
   BUCKET=your-firebase-storage-bucket
   ```

7. Run the Flask server:
   ```bash
   python run.py
   ```
   
   Or using Flask's development server:
   ```bash
   flask run
   ```
   
   The server will run on `http://127.0.0.1:5000` by default.

### 2. Frontend Setup (React Client)

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173` (Vite's default port).

### 3. Running Both Servers

You'll need to run both the backend and frontend simultaneously:

**Terminal 1 - Backend:**
```bash
cd server
source venv/bin/activate  # or venv\Scripts\activate on Windows
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## Accessing the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:5000

## Additional Commands

### Frontend
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- The Flask app uses SQLite by default if `DATABASE_URI` is not set
- Database file will be created as `myDB.db` in the server directory

## Troubleshooting

1. **Port already in use:** Change the port in the respective config files
2. **Firebase errors:** Ensure all Firebase environment variables are correctly set
3. **Database connection issues:** Check your `DATABASE_URI` or ensure SQLite file permissions
4. **CORS errors:** The Flask app has CORS enabled, but ensure the frontend is pointing to the correct backend URL

## Notes

- The frontend is configured to connect to `http://127.0.0.1:5000` for local development (see `client/src/config/index.ts`)
- Make sure both servers are running for the application to work properly
- The backend requires Firebase credentials to function properly

