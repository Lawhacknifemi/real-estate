// API configuration and utilities for connecting to Flask backend

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';

// Backend property structure (from Flask API)
interface BackendProperty {
  id: string;
  owner_id: string;
  location: string;
  description: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  category: string;
  price: number;
  property_type: string;
  active: boolean;
  date_created: string;
  property_images: string[];
  size: string;
  realtor?: {
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
  };
}

// Log backend property for debugging
function logBackendProperty(backendProp: BackendProperty) {
  console.log('[TRANSFORM] Backend property received:', {
    id: backendProp.id,
    address: backendProp.address,
    bedrooms: backendProp.bedrooms,
    size: backendProp.size,
    property_type: backendProp.property_type,
    price: backendProp.price,
    category: backendProp.category
  });
}

// Frontend property structure
export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  acreage?: number;
  unitCount?: number;
  type: 'Traditional Site' | 'Other';
  listingType: 'Sale' | 'Lease';
  image: string;
  description?: string;
}

// Transform backend property to frontend format
function transformProperty(backendProp: BackendProperty): Property {
  // Log the raw backend data
  logBackendProperty(backendProp);
  
  // Use first image if available, otherwise use a default
  const image = backendProp.property_images && backendProp.property_images.length > 0
    ? backendProp.property_images[0]
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop';

  // Parse size to get acreage if it's in a parseable format
  // Backend saves size as string like "7.93 acres" or just "7.93"
  let acreage: number | undefined;
  if (backendProp.size && backendProp.size.trim() !== '') {
    const sizeMatch = backendProp.size.match(/(\d+\.?\d*)/);
    if (sizeMatch) {
      acreage = parseFloat(sizeMatch[1]);
      console.log('[TRANSFORM] Parsed acreage from size:', backendProp.size, '→', acreage);
    } else {
      console.warn('[TRANSFORM] Could not parse acreage from size:', backendProp.size);
    }
  } else {
    console.log('[TRANSFORM] No size field provided');
  }

  // Map property_type to listingType
  // Backend: property_type is 'Commercial' for Sale, 'Lease' for Lease
  // Frontend: listingType is 'Sale' or 'Lease'
  let listingType: 'Sale' | 'Lease' = 'Sale';
  if (backendProp.property_type) {
    const propType = backendProp.property_type.toLowerCase();
    if (propType === 'lease') {
      listingType = 'Lease';
    } else if (propType === 'commercial' || propType === 'sale') {
      listingType = 'Sale';
    }
  }

  const transformed = {
    id: backendProp.id,
    title: backendProp.address || backendProp.location || 'Property',
    location: backendProp.location,
    price: backendProp.price,
    acreage: acreage,
    unitCount: backendProp.bedrooms > 0 ? backendProp.bedrooms : undefined, // Backend uses bedrooms field for unit count
    type: backendProp.category === 'Traditional Site' ? 'Traditional Site' : 'Other',
    listingType: listingType,
    image: image,
    description: backendProp.description,
    property_images: backendProp.property_images || [], // Preserve all images
    owner_id: backendProp.owner_id, // Include owner ID for ownership checks
    active: backendProp.active !== undefined ? backendProp.active : true, // Include active status
    realtor: backendProp.realtor, // Include realtor contact information
  };
  
  console.log('[TRANSFORM] Final transformed property:', {
    acreage: transformed.acreage,
    unitCount: transformed.unitCount,
    listingType: transformed.listingType,
    price: transformed.price,
    raw_backend_bedrooms: backendProp.bedrooms,
    raw_backend_size: backendProp.size,
    raw_backend_property_type: backendProp.property_type
  });
  
  return transformed;
}

// Fetch all properties from backend
export async function getAllProperties(page: number = 1): Promise<{ properties: Property[]; pages: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/property/all_properties?page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      properties: data.properties.map(transformProperty),
      pages: data.pages || 0,
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    // Return empty result on error
    return { properties: [], pages: 0 };
  }
}

// Fetch recently added properties
export async function getRecentlyAddedProperties(): Promise<Property[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/property/recently_added`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recently added properties: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map(transformProperty);
  } catch (error) {
    console.error('Error fetching recently added properties:', error);
    return [];
  }
}

// Fetch a single property by ID
export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    console.log('[API] Fetching property with ID:', id);
    const url = `${API_BASE_URL}/property/${id}`;
    console.log('[API] Request URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[API] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Error response:', errorText);
      throw new Error(`Failed to fetch property: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[API] Response data:', data);
    
    if (data.msg) {
      // Property not found
      console.warn('[API] Property not found message:', data.msg);
      return null;
    }

    const transformed = transformProperty(data);
    console.log('[API] Transformed property:', transformed);
    return transformed;
  } catch (error) {
    console.error('[API] Error fetching property:', error);
    return null;
  }
}

// Search properties
export async function searchProperties(params: {
  search_term?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  category?: string;
  property_type?: string;
  page?: number;
}): Promise<{ results: Property[]; pages: number }> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.search_term) queryParams.append('search_term', params.search_term);
    if (params.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params.bedrooms) queryParams.append('bedrooms', params.bedrooms.toString());
    if (params.bathrooms) queryParams.append('bathrooms', params.bathrooms.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.property_type) queryParams.append('property_type', params.property_type);
    if (params.page) queryParams.append('page', params.page.toString());

    const response = await fetch(`${API_BASE_URL}/property/search_properties?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search properties: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      results: data.results.map(transformProperty),
      pages: data.pages || 0,
    };
  } catch (error) {
    console.error('Error searching properties:', error);
    return { results: [], pages: 0 };
  }
}

// Create a new property (requires authentication)
export async function createProperty(
  realtorId: string,
  propertyData: {
    address: string;
    location: string;
    description: string;
    bedrooms: number;
    bathrooms: number;
    category: string;
    price: number;
    property_type: string;
    size: string;
    property_images: string[];
  },
  authToken: string
): Promise<string> {
  try {
    const url = `${API_BASE_URL}/property/new_property/${realtorId}`;
    console.log('Creating property at:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        
        // Provide helpful error messages
        if (response.status === 503 && errorData.error === 'firebase_not_initialized') {
          errorMessage = 'Backend Firebase is not configured. Please set up Firebase Admin SDK on the backend server.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (response.status === 400) {
          errorMessage = errorData.message || 'Invalid request. Please check your input.';
        }
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = `Server error: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error(
        `Cannot connect to backend server at ${API_BASE_URL}. ` +
        `Please make sure the Flask server is running on port 5000. ` +
        `Check: 1) Is the server running? 2) Is the URL correct? 3) Are there CORS issues?`
      );
    }
    console.error('Error creating property:', error);
    throw error;
  }
}

// Purchase/Book a property (for buyers)
export async function purchaseProperty(
  propertyId: string,
  buyerInfo: {
    name: string;
    email: string;
    phone: string;
    message?: string;
  },
  authToken: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/property/purchase/${propertyId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(buyerInfo),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to purchase property: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error purchasing property:', error);
    throw error;
  }
}

// Get all properties for the current user (seller)
export async function getMyProperties(authToken: string, page: number = 1, includeInactive: boolean = false): Promise<{ properties: Property[]; pages: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/property/my_properties?page=${page}&include_inactive=${includeInactive}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      properties: data.properties.map(transformProperty),
      pages: data.pages || 0,
    };
  } catch (error) {
    console.error('Error fetching my properties:', error);
    return { properties: [], pages: 0 };
  }
}

// Delist a property (set active=false)
export async function delistProperty(propertyId: string, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/property/delist/${propertyId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to delist property: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error delisting property:', error);
    throw error;
  }
}

// Relist a property (set active=true)
export async function relistProperty(propertyId: string, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/property/relist/${propertyId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to relist property: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error relisting property:', error);
    throw error;
  }
}

// Delete a property permanently
export async function deleteProperty(propertyId: string, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/property/delete/${propertyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to delete property: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
}

// Vendor interfaces
export interface Vendor {
  id: string;
  vendor_id: string;
  company_name: string;
  description: string;
  category: string;
  services: string;
  email?: string;
  phone?: string;
  website_url?: string;
  location?: string;
  logo_url?: string;
  verified: boolean;
  active: boolean;
  date_created?: string;
}

// Get all vendors
export async function getAllVendors(category?: string, verifiedOnly: boolean = false): Promise<Vendor[]> {
  try {
    let url = `${API_BASE_URL}/vendors`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (verifiedOnly) params.append('verified_only', 'true');
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vendors: ${response.statusText}`);
    }

    const data = await response.json();
    return data.vendors || [];
  } catch (error: any) {
    console.error('Error fetching vendors:', error);
    // Check if it's a network error (server not running)
    if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError' || error?.message?.includes('NetworkError')) {
      console.warn('⚠️ Backend server may not be running. Please start the Flask server:');
      console.warn('   cd real-estate-listing/server && python run.py');
      // Return empty array gracefully instead of throwing
    }
    return [];
  }
}

// Get vendors by category
export async function getVendorsByCategory(category: string): Promise<Vendor[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/vendors/category/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vendors: ${response.statusText}`);
    }

    const data = await response.json();
    return data.vendors || [];
  } catch (error) {
    console.error('Error fetching vendors by category:', error);
    return [];
  }
}

// Register as a vendor
export async function registerVendor(vendorData: {
  company_name: string;
  description: string;
  category: string;
  services: string;
  email?: string;
  phone?: string;
  website_url?: string;
  location?: string;
  logo_url?: string;
}, authToken: string): Promise<Vendor> {
  try {
    const response = await fetch(`${API_BASE_URL}/vendors/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(vendorData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to register vendor: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering vendor:', error);
    throw error;
  }
}

// Admin API functions
export async function adminDeleteVendor(vendorId: string, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/vendors/admin/delete/${vendorId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to delete vendor: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
}

export async function adminDeactivateVendor(vendorId: string, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/vendors/admin/deactivate/${vendorId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to deactivate vendor: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deactivating vendor:', error);
    throw error;
  }
}

export async function adminActivateVendor(vendorId: string, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/vendors/admin/activate/${vendorId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to activate vendor: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error activating vendor:', error);
    throw error;
  }
}

export async function adminGetAllVendors(includeInactive: boolean = false, authToken: string): Promise<Vendor[]> {
  try {
    const url = `${API_BASE_URL}/vendors/admin/all?include_inactive=${includeInactive ? 'true' : 'false'}`;
    console.log('[ADMIN] Fetching vendors with include_inactive:', includeInactive, 'URL:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch vendors: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('[ADMIN] Received vendors:', data.vendors?.length || 0, 'include_inactive:', includeInactive);
    return data.vendors || [];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
}

export async function adminDeleteProperty(propertyId: string, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/property/admin/delete/${propertyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to delete property: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
}

export async function adminDeactivateProperty(propertyId: string, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/property/admin/deactivate/${propertyId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to deactivate property: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deactivating property:', error);
    throw error;
  }
}

export async function adminActivateProperty(propertyId: string, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/property/admin/activate/${propertyId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to activate property: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error activating property:', error);
    throw error;
  }
}

export async function adminGetAllProperties(page: number = 1, includeInactive: boolean = false, authToken: string): Promise<{ properties: Property[]; pages: number }> {
  try {
    const url = `${API_BASE_URL}/property/admin/all?page=${page}&include_inactive=${includeInactive}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      properties: data.properties.map(transformProperty),
      pages: data.pages || 0,
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}

// Blog interfaces
export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  author_email?: string;
  featured_image_url?: string;
  category?: string;
  tags?: string[];
  published: boolean;
  active: boolean;
  views: number;
  date_created?: string;
  date_published?: string;
}

// Get all published blogs
export async function getAllBlogs(category?: string, page: number = 1): Promise<{ blogs: Blog[]; pages: number; current_page: number }> {
  try {
    let url = `${API_BASE_URL}/blogs?page=${page}`;
    if (category && category !== 'All') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      blogs: data.blogs || [],
      pages: data.pages || 0,
      current_page: data.current_page || page,
    };
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
      console.warn('⚠️ Backend server may not be running. Please start the Flask server.');
    }
    return { blogs: [], pages: 0, current_page: page };
  }
}

// Get blog by ID
export async function getBlogById(blogId: string): Promise<Blog | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch blog: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

// Admin: Create blog
export async function adminCreateBlog(blogData: {
  title: string;
  content: string;
  excerpt: string;
  author?: string;
  featured_image_url?: string;
  category?: string;
  tags?: string[];
  published?: boolean;
}, authToken: string): Promise<Blog> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to create blog: ${response.statusText}`);
    }

    const data = await response.json();
    return data.blog;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
}

// Admin: Update blog
export async function adminUpdateBlog(blogId: string, blogData: {
  title?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  featured_image_url?: string;
  category?: string;
  tags?: string[];
  published?: boolean;
}, authToken: string): Promise<Blog> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/admin/update/${blogId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to update blog: ${response.statusText}`);
    }

    const data = await response.json();
    return data.blog;
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
}

// Admin: Delete blog
export async function adminDeleteBlog(blogId: string, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/admin/delete/${blogId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to delete blog: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
}

// Admin: Get all blogs (including unpublished)
export async function adminGetAllBlogs(page: number = 1, includeUnpublished: boolean = false, authToken: string): Promise<{ blogs: Blog[]; pages: number; current_page: number }> {
  try {
    const url = `${API_BASE_URL}/blogs/admin/all?page=${page}&include_unpublished=${includeUnpublished ? 'true' : 'false'}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      blogs: data.blogs || [],
      pages: data.pages || 0,
      current_page: data.current_page || page,
    };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
}

