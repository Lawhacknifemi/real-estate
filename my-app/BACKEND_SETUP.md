# Backend Integration Setup

This Next.js frontend is now connected to the Flask backend from `real-estate-listing/server`.

## Prerequisites

1. **Backend must be running** on `http://127.0.0.1:5000`
   - See `../real-estate-listing/SETUP.md` for backend setup instructions
   - Make sure the database is initialized (run `python init_db.py` in the server directory)

## Configuration

### Environment Variables

Create a `.env.local` file in the `my-app` directory:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

If your backend is running on a different URL, update this value.

## API Integration

The frontend uses the following backend endpoints:

- `GET /property/all_properties?page={page}` - Get all properties with pagination
- `GET /property/recently_added` - Get recently added properties
- `GET /property/{id}` - Get a single property by ID
- `GET /property/search_properties` - Search properties with filters

## Data Mapping

The backend property structure is automatically transformed to match the frontend `Property` interface:

- `address` or `location` → `title`
- `location` → `location`
- `price` → `price`
- `size` → parsed to `acreage`
- `bedrooms` → `unitCount` (placeholder)
- `property_images[0]` → `image`
- `description` → `description`

## Running the Application

1. **Start the backend** (in one terminal):
   ```bash
   cd ../real-estate-listing/server
   python run.py
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   cd my-app
   npm run dev
   ```

3. **Open your browser** to `http://localhost:3000`

## Features

- ✅ Home page fetches recently added properties from backend
- ✅ Listings page fetches all properties with pagination
- ✅ Property detail page fetches individual property data
- ✅ Search functionality (ready to use with backend search endpoint)
- ✅ Error handling for API failures

## Troubleshooting

### Blank Page or No Properties

1. **Check backend is running**: Visit `http://127.0.0.1:5000` in your browser
2. **Check API connection**: Open browser console (F12) and look for network errors
3. **Verify database**: Make sure you've run `python init_db.py` in the server directory
4. **Check CORS**: Backend should allow requests from `http://localhost:3000`

### API Errors

- Check browser console for detailed error messages
- Verify `NEXT_PUBLIC_API_URL` in `.env.local` matches your backend URL
- Ensure backend CORS is configured to allow requests from the frontend origin

## Next Steps

- Add more properties through the backend API
- Implement authentication if needed
- Add more search filters
- Enhance property detail page with all images from `property_images` array



