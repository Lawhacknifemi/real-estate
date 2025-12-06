# Image Upload Guide

## ✅ What's Been Added

Image upload functionality has been added to the property submission form! You can now:

1. **Select multiple images** (up to 10)
2. **Preview images** before submitting
3. **Remove images** before uploading
4. **Upload images** to Firebase Storage automatically
5. **Images are included** in your property listing

## 🔧 Setup Required

Make sure your `.env.local` file includes the Firebase Storage bucket:

```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=real-estate-5eb1f.firebasestorage.app
```

Or if using the older format:
```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=real-estate-5eb1f.appspot.com
```

## 📝 How to Use

1. **Go to Submit Property page** (`/submit-property`)
2. **Fill in property details** as usual
3. **Click the image upload area** or drag and drop images
4. **Select up to 10 images** (PNG, JPG, GIF)
5. **Preview your images** - you can remove any before submitting
6. **Click "Submit Property"**
   - Images will upload first
   - Then the property will be created with image URLs

## 🎨 Features

- **Image Preview**: See thumbnails of selected images
- **Remove Images**: Click the X button on any preview to remove it
- **Upload Progress**: See "Uploading Images..." status
- **Error Handling**: Clear error messages if upload fails
- **Automatic Storage**: Images are stored in Firebase Storage under `properties/` folder

## 🔒 Security

- Images are uploaded directly from the browser to Firebase Storage
- Each image gets a unique path: `properties/{timestamp}_{filename}`
- Only authenticated sellers can upload images
- File types are validated (images only)

## 🐛 Troubleshooting

### "Image upload is not available"
- Check that `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is set in `.env.local`
- Restart your Next.js dev server after adding the variable

### "Failed to upload images"
- Check your internet connection
- Verify Firebase Storage is enabled in Firebase Console
- Check browser console for detailed error messages

### Images not showing after upload
- Check that Firebase Storage rules allow public read access
- Verify the image URLs are being saved correctly

## 📚 Technical Details

- **Storage Library**: Firebase Storage (client-side)
- **Upload Method**: Direct upload from browser
- **File Path**: `properties/{timestamp}_{filename}`
- **Max Images**: 10 per property
- **File Size**: Limited by Firebase Storage rules (default 5MB per file)


