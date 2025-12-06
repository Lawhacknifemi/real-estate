# How to Start the Backend Server

## Quick Start

1. **Open a new terminal window/tab**

2. **Navigate to the server directory:**
   ```bash
   cd /Users/sheriflawal/Dev/realestate-app/real-estate-listing/server
   ```

3. **Start the Flask server:**
   ```bash
   python run.py
   ```

4. **You should see:**
   ```
   * Running on http://127.0.0.1:5000
   * Debug mode: on
   ```

5. **Keep this terminal open** - the server needs to keep running

## Verify It's Working

In another terminal, test the API:
```bash
curl http://127.0.0.1:5000/property/recently_added
```

You should get a JSON response with properties.

## Troubleshooting

### Port 5000 Already in Use

If you see "Address already in use":
```bash
# Find what's using port 5000
lsof -ti:5000

# Kill it (replace PID with the number from above)
kill -9 <PID>

# Or use a different port by editing run.py
```

### Python Not Found

If `python` doesn't work, try:
```bash
python3 run.py
```

### Module Not Found Errors

Make sure you're in a virtual environment with dependencies installed:
```bash
cd real-estate-listing/server
pip install -r requirements.txt
```

## Running Both Servers

You need **two terminal windows**:

**Terminal 1 - Backend (Flask):**
```bash
cd real-estate-listing/server
python run.py
```

**Terminal 2 - Frontend (Next.js):**
```bash
cd my-app
pnpm dev
```

Both should be running simultaneously!



