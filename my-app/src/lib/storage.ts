// Firebase Storage utilities for uploading images
import { getStorage, ref, uploadBytes, getDownloadURL, StorageReference } from 'firebase/storage';
import { app } from './firebase';

// Initialize Firebase Storage
let storage: ReturnType<typeof getStorage> | null = null;

if (app) {
  try {
    storage = getStorage(app);
    console.log('[STORAGE] Firebase Storage initialized');
    console.log('[STORAGE] Storage bucket:', storage.app.options.storageBucket);
  } catch (error) {
    console.error('[STORAGE] Failed to initialize Firebase Storage:', error);
  }
} else {
  console.warn('[STORAGE] Firebase app not initialized, Storage unavailable');
}

/**
 * Upload an image file to Firebase Storage
 * @param file - The image file to upload
 * @param path - Optional custom path (defaults to 'properties/{timestamp}_{filename}')
 * @returns Promise<string> - The download URL of the uploaded image
 */
export async function uploadImage(file: File, path?: string): Promise<string> {
  console.log('[STORAGE] uploadImage called');
  console.log('[STORAGE] Storage instance:', storage ? 'exists' : 'null');
  console.log('[STORAGE] File:', file.name, 'Size:', file.size, 'Type:', file.type);
  
  if (!storage) {
    console.error('[STORAGE] Storage is null!');
    throw new Error('Firebase Storage is not initialized. Please configure Firebase in your .env.local file.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Generate a unique path if not provided
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
  const storagePath = path || `properties/${timestamp}_${randomId}_${fileName}`;

  try {
    console.log('[STORAGE] Starting upload for:', file.name);
    console.log('[STORAGE] Storage path:', storagePath);
    console.log('[STORAGE] Storage bucket:', storage.app.options.storageBucket);
    
    // Create a reference to the file location
    console.log('[STORAGE] Creating storage reference...');
    const storageRef = ref(storage, storagePath);
    console.log('[STORAGE] Storage reference created:', storageRef.fullPath);
    
    // Upload the file with metadata
    const metadata = {
      contentType: file.type,
    };
    
    console.log('[STORAGE] Calling uploadBytes...');
    console.log('[STORAGE] File size:', file.size, 'bytes');
    
    // Call uploadBytes directly - timeout is handled at component level
    console.log('[STORAGE] Waiting for uploadBytes to complete...');
    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('[STORAGE] Upload complete! Snapshot:', snapshot);
    console.log('[STORAGE] Getting download URL...');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('[STORAGE] Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error('[STORAGE] Error uploading image:', error);
    console.error('[STORAGE] Error type:', typeof error);
    console.error('[STORAGE] Error code:', error?.code);
    console.error('[STORAGE] Error message:', error?.message);
    console.error('[STORAGE] Error stack:', error?.stack);
    
    // Provide more specific error messages
    if (error?.code === 'storage/unauthorized') {
      throw new Error('You do not have permission to upload images. Please check Firebase Storage rules.');
    } else if (error?.code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    } else if (error?.code === 'storage/retry-limit-exceeded') {
      throw new Error('Upload failed due to CORS configuration. Please configure CORS for Firebase Storage (see FIREBASE_STORAGE_CORS_FIX.md).');
    } else if (error?.code === 'storage/unknown') {
      throw new Error('An unknown error occurred during upload. Please check your internet connection and try again.');
    } else if (error?.message?.includes('timeout') || error?.message?.includes('CORS')) {
      throw new Error('Upload failed due to CORS configuration. Please configure CORS for Firebase Storage (see FIREBASE_STORAGE_CORS_FIX.md).');
    }
    
    throw new Error(`Failed to upload image: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Upload multiple images with timeout
 * @param files - Array of image files to upload
 * @returns Promise<string[]> - Array of download URLs
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  console.log('[STORAGE] uploadImages called with', files.length, 'files');
  
  if (!storage) {
    console.error('[STORAGE] Storage is null in uploadImages!');
    throw new Error('Firebase Storage is not initialized. Please configure Firebase in your .env.local file.');
  }

  if (files.length === 0) {
    console.log('[STORAGE] No files to upload');
    return [];
  }

  try {
    console.log(`[STORAGE] Starting upload of ${files.length} images...`);
    
    // Upload one at a time to avoid overwhelming Firebase
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`[STORAGE] Uploading image ${i + 1}/${files.length}: ${file.name}`);
      
      try {
        const url = await uploadImage(file);
        urls.push(url);
        console.log(`[STORAGE] Image ${i + 1} uploaded successfully`);
      } catch (error: any) {
        console.error(`[STORAGE] Failed to upload image ${i + 1}:`, error);
        throw error; // Stop on first error
      }
    }
    
    console.log(`[STORAGE] Successfully uploaded ${urls.length} images`);
    return urls;
  } catch (error: any) {
    console.error('[STORAGE] Error uploading images:', error);
    console.error('[STORAGE] Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    throw new Error(`Failed to upload images: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Check if Firebase Storage is available
 */
export function isStorageAvailable(): boolean {
  return storage !== null;
}

