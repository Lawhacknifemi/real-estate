// Backend-based image upload (no CORS issues!)
import { API_BASE_URL } from './api';

/**
 * Upload images to the backend server
 * The backend handles storage (local filesystem or cloud storage)
 * This avoids CORS issues since uploads go through the backend
 */
export async function uploadImagesToBackend(files: File[], authToken: string): Promise<string[]> {
  console.log('[BACKEND-UPLOAD] Starting upload of', files.length, 'images to backend...');
  
  if (files.length === 0) {
    return [];
  }

  try {
    // Create FormData to send files
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });

    console.log('[BACKEND-UPLOAD] Sending request to backend...');
    
    // Upload to backend endpoint
    const response = await fetch(`${API_BASE_URL}/utils/upload_images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`, // Backend will verify Firebase token
      },
      body: formData, // Don't set Content-Type header - browser will set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Failed to upload images: ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrls = data.image_urls || [];
    
    console.log('[BACKEND-UPLOAD] Success! Got', imageUrls.length, 'image URLs');
    console.log('[BACKEND-UPLOAD] URLs:', imageUrls);
    
    return imageUrls;
  } catch (error: any) {
    console.error('[BACKEND-UPLOAD] Error uploading images:', error);
    throw new Error(`Failed to upload images: ${error?.message || 'Unknown error'}`);
  }
}

