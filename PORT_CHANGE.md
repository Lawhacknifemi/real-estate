# Port Change: 5000 → 5001

## What Changed

The Flask backend server has been changed from port **5000** to port **5001** because:

- **Port 5000 is used by macOS AirPlay Receiver** by default
- This was causing conflicts and preventing the Flask server from starting

## What You Need to Do

### 1. Restart Your Next.js Frontend

The `.env.local` file has been updated, but you need to **restart your Next.js dev server** for the change to take effect:

```bash
# Stop the current server (Ctrl+C)
cd my-app
pnpm dev
```

### 2. Start the Flask Backend on Port 5001

```bash
cd real-estate-listing/server
python run.py
```

You should now see:
```
* Running on http://127.0.0.1:5001
```

### 3. Verify It's Working

Test the API:
```bash
curl http://127.0.0.1:5001/property/recently_added
```

## Files Changed

- ✅ `real-estate-listing/server/run.py` - Changed port to 5001
- ✅ `my-app/.env.local` - Updated `NEXT_PUBLIC_API_URL` to port 5001
- ✅ `my-app/src/lib/api.ts` - Updated default fallback to port 5001

## Alternative: Disable AirPlay Receiver (if you prefer port 5000)

If you want to use port 5000 instead:

1. Go to **System Settings** → **General** → **AirDrop & Handoff**
2. Turn off **AirPlay Receiver**
3. Change the port back to 5000 in `run.py` and `.env.local`

But using port 5001 is easier and recommended! 🚀



