'use client';

import PageLayout from '@/components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createProperty } from '@/lib/api';
import { uploadImages, isStorageAvailable } from '@/lib/storage';
import { uploadImagesToBackend } from '@/lib/backend-storage';
import LocationAutocomplete from '@/components/LocationAutocomplete';

export default function SubmitPropertyPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    acreage: '',
    unitCount: '',
    type: 'Traditional Site',
    listingType: 'Sale',
    description: '',
    email: '',
    phone: '',
    contactName: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [skipImages, setSkipImages] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; urls: string[]; error?: string } | null>(null);

  // Redirect if not a seller
  useEffect(() => {
    if (userProfile && userProfile.role !== 'seller') {
      router.push('/login?redirect=submit-property&role=seller');
    }
  }, [userProfile, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setError('Please select only image files.');
      return;
    }

    // Limit to 10 images
    const newFiles = [...selectedImages, ...validFiles].slice(0, 10);
    setSelectedImages(newFiles);

    // Create previews
    const newPreviews: string[] = [];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        newPreviews.push(preview);
        if (newPreviews.length === newFiles.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user || userProfile?.role !== 'seller') {
      setError('You must be logged in as a seller to submit properties.');
      router.push('/login?redirect=submit-property&role=seller');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to Firebase Storage first (with timeout protection)
      let imageUrls: string[] = [];
      
      // Skip images if user clicked "Skip Images" button
      if (skipImages) {
        console.log('[UPLOAD] Skipping image upload as requested by user');
        imageUrls = [];
      } else if (selectedImages.length > 0) {
        // Try to upload, but don't block submission if it fails
        setUploadingImages(true);
        console.log(`[UPLOAD] Starting upload of ${selectedImages.length} images...`);
        console.log('[UPLOAD] Storage available:', isStorageAvailable());
        console.log('[UPLOAD] User authenticated:', !!user);
        
        // Create a timeout (15 seconds) - give more time for upload
        const uploadTimeout = new Promise<string[]>((resolve) => {
          setTimeout(() => {
            console.warn('[UPLOAD] Timeout after 15 seconds');
            resolve([]); // Return empty array instead of rejecting
          }, 15000); // 15 second timeout
        });

        try {
          console.log('[UPLOAD] Using backend upload (no CORS issues!)...');
          // Clear any previous status at the start
          setUploadStatus(null);
          
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          // Get auth token for backend upload
          const authToken = await user.getIdToken();
          
          // Use backend upload instead of Firebase Storage (avoids CORS)
          const uploadPromise = uploadImagesToBackend(selectedImages, authToken)
            .then(urls => {
              console.log('[UPLOAD] Backend upload success! Got', urls.length, 'URLs');
              return urls;
            })
            .catch(error => {
              console.warn('[UPLOAD] Backend upload error:', error?.message);
              // Try Firebase Storage as fallback if backend fails
              console.log('[UPLOAD] Falling back to Firebase Storage...');
              return uploadImages(selectedImages).catch(() => []);
            });
          
          // Race between upload and timeout
          imageUrls = await Promise.race([uploadPromise, uploadTimeout]);
          
          // Only set status after we know the final result
          if (imageUrls.length > 0) {
            console.log('[UPLOAD] Upload completed successfully');
            console.log('[UPLOAD] Image URLs that will be saved:', imageUrls);
            setUploadStatus({ success: true, urls: imageUrls });
          } else if (selectedImages.length > 0) {
            console.warn('[UPLOAD] No images uploaded (timeout or error) - continuing without images');
            setUploadStatus({ success: false, urls: [], error: 'Upload timed out or failed. Please try again.' });
          } else {
            setUploadStatus(null); // No images selected
          }
          setUploadingImages(false);
        } catch (uploadError: any) {
          setUploadingImages(false);
          console.warn('[UPLOAD] Upload failed, continuing without images:', uploadError?.message);
          
          // Only show error if we don't have URLs
          if (imageUrls.length === 0) {
            setUploadStatus({ success: false, urls: [], error: uploadError?.message || 'Upload failed' });
          } else {
            // If we have URLs, show success
            setUploadStatus({ success: true, urls: imageUrls });
          }
          
          // Continue without images if we have none
          imageUrls = imageUrls.length > 0 ? imageUrls : [];
        }
      } else {
        console.log('[UPLOAD] No images selected');
        setUploadingImages(false);
      }

      // The backend will auto-create a realtor profile if one doesn't exist
      // We can use any placeholder - the backend uses the Firebase user ID from the token
      const realtorId = 'temp-realtor-id'; // This is just for routing, backend uses token to find/create realtor
      
      const propertyData = {
        address: formData.title,
        location: formData.location,
        description: formData.description,
        bedrooms: parseInt(formData.unitCount) || 0,
        bathrooms: 1,
        category: formData.type,
        price: parseFloat(formData.price),
        property_type: formData.listingType === 'Sale' ? 'Commercial' : 'Lease',
        size: formData.acreage ? `${formData.acreage} acres` : '',
        property_images: imageUrls,
        // Contact information for the realtor
        contact_name: formData.contactName,
        contact_email: formData.email,
        contact: formData.phone,
      };

      console.log('[SUBMIT] Submitting property with data:', {
        ...propertyData,
        property_images_count: imageUrls.length,
        property_images: imageUrls.length > 0 ? `${imageUrls.length} URLs` : 'none',
        raw_form_data: {
          acreage: formData.acreage,
          unitCount: formData.unitCount,
          price: formData.price,
          listingType: formData.listingType
        }
      });

      const result = await createProperty(realtorId, propertyData, await user.getIdToken());
      console.log('[SUBMIT] Property created successfully:', result);
      
      // Show success message with image info
      if (imageUrls.length > 0) {
        console.log('[SUBMIT] ✅ Property created with', imageUrls.length, 'images');
        console.log('[SUBMIT] Image URLs:', imageUrls);
      } else {
        console.log('[SUBMIT] ⚠️ Property created without images');
      }
      
    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitSuccess(false);
      setFormData({
        title: '',
        location: '',
        price: '',
        acreage: '',
        unitCount: '',
        type: 'Traditional Site',
        listingType: 'Sale',
        description: '',
        email: '',
        phone: '',
        contactName: '',
      });
        setSelectedImages([]);
        setImagePreviews([]);
        setSkipImages(false);
        router.push('/listings');
    }, 3000);
    } catch (error: any) {
      console.error('[SUBMIT] Error submitting property:', error);
      console.error('[SUBMIT] Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        code: error?.code
      });
      
      let errorMessage = error?.message || error?.toString() || 'Failed to submit property. Please try again.';
      
      // Provide more helpful error messages
      if (errorMessage.includes('Cannot connect to backend') || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Backend server is not running. Please start the Flask server on port 5001.';
      } else if (errorMessage.includes('Firebase')) {
        errorMessage = 'Backend authentication is not configured. Please set up Firebase Admin SDK on the backend.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        errorMessage = 'Permission denied. Please check Firebase Storage rules allow authenticated uploads.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Upload timed out. You can submit the property without images using the "Skip images" button.';
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
      setUploadingImages(false);
      setSkipImages(false);
    }
  };

  if (!user || userProfile?.role !== 'seller') {
    return (
      <PageLayout>
        <section className="py-20 bg-gray-50 min-h-[calc(100vh-200px)] flex items-center">
          <div className="container mx-auto px-4 max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Seller Account Required</h2>
            <p className="text-gray-600 mb-6">You need to be logged in as a seller to submit properties.</p>
            <Link
              href="/login?redirect=submit-property&role=seller"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log In / Sign Up as Seller
            </Link>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Page Header */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Your Property</h1>
          <p className="text-gray-600">List your flex space property for sale or lease</p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            {submitSuccess ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Submitted Successfully!</h2>
                <p className="text-gray-600 mb-6">Thank you for submitting your property. Our team will review it and contact you soon.</p>
                <button
                  onClick={() => router.push('/listings')}
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View All Listings
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Information</h2>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Basic Information
                    </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Property Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Metro Storage Facility"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                        <span className="text-xs text-gray-500 font-normal ml-2">(City, State)</span>
                      </label>
                      <LocationAutocomplete
                        value={formData.location}
                        onChange={(value) => setFormData({ ...formData, location: value })}
                        placeholder="Start typing city or state..."
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-2">
                        Listing Type *
                      </label>
                      <select
                        id="listingType"
                        name="listingType"
                        required
                        value={formData.listingType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="Sale">For Sale</option>
                        <option value="Lease">For Lease</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                        <span className="text-xs text-gray-500 font-normal ml-2">(USD)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</div>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        required
                        value={formData.price}
                        onChange={handleChange}
                          placeholder="2,500,000"
                        min="0"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      {formData.price && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                          }).format(Number(formData.price))}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="acreage" className="block text-sm font-medium text-gray-700 mb-2">
                        Acreage
                      </label>
                      <input
                        type="number"
                        id="acreage"
                        name="acreage"
                        value={formData.acreage}
                        onChange={handleChange}
                        placeholder="e.g., 7.93"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="unitCount" className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Count
                      </label>
                      <input
                        type="number"
                        id="unitCount"
                        name="unitCount"
                        value={formData.unitCount}
                        onChange={handleChange}
                        placeholder="e.g., 320"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Property Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="Traditional Site">Traditional Site</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Description
                    </h3>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Property Description
                        <span className="text-xs text-gray-500 font-normal ml-2">(Optional but recommended)</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                        placeholder="Describe your property in detail... Include features, amenities, nearby attractions, etc."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 placeholder:text-gray-400"
                    />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.description.length} characters
                      </p>
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Property Images
                    </h3>
                    <div>

                      <p className="text-xs text-gray-500 mb-4">
                        Upload high-quality images of your property. You can upload up to 10 images.
                      </p>
                      <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="images"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                              className="w-10 h-10 mb-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (max 10 images)</p>
                          </div>
                          <input
                            id="images"
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isSubmitting || uploadingImages}
                          />
                        </label>
                      </div>

                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                disabled={isSubmitting || uploadingImages}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                                title="Remove image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {uploadingImages && (
                        <div className="text-center py-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-sm font-medium text-blue-600">Uploading images... This may take a moment.</p>
                          </div>
                          <p className="text-xs text-blue-500 mt-2">If this takes too long, click "Skip Images" below</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSkipImages(true);
                              setUploadingImages(false);
                              setSelectedImages([]);
                              setImagePreviews([]);
                              setError('Images skipped. Property will be submitted without images.');
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Skip images and submit without them
                          </button>
                        </div>
                      )}

                      {uploadStatus && (
                        <div className={`py-4 rounded-lg border ${
                          uploadStatus.success 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          {uploadStatus.success ? (
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-green-600 font-medium">
                                  ✅ Successfully uploaded {uploadStatus.urls.length} image{uploadStatus.urls.length !== 1 ? 's' : ''}!
                                </p>
                              </div>
                              {uploadStatus.urls.length > 0 && (
                                <details className="mt-2 text-left">
                                  <summary className="text-xs text-green-600 cursor-pointer hover:text-green-700">
                                    View uploaded image URLs ({uploadStatus.urls.length})
                                  </summary>
                                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto bg-white p-2 rounded">
                                    {uploadStatus.urls.map((url, idx) => (
                                      <a 
                                        key={idx} 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block text-xs text-green-700 hover:text-green-800 break-all"
                                      >
                                        {idx + 1}. {url.substring(0, 60)}...
                                      </a>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <p className="text-red-600 font-medium">❌ Image upload failed</p>
                              </div>
                              {uploadStatus.error && (
                                <p className="text-xs text-red-500 mt-1">{uploadStatus.error}</p>
                              )}
                              <p className="text-xs text-red-600 mt-2">
                                You can still submit the property without images, or check Firebase Storage rules.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          id="contactName"
                          name="contactName"
                          required
                          value={formData.contactName}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(555) 123-4567"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 bg-gray-50 -mx-8 -mb-8 px-8 pb-8 rounded-b-lg">
                    <p className="text-sm text-gray-600">
                      * Required fields must be filled
                    </p>
                    <div className="flex gap-4 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => router.back()}
                        className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || uploadingImages}
                        className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Submit Property
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

    </PageLayout>
  );
}

