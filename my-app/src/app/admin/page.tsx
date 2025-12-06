'use client';

import PageLayout from '@/components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  adminGetAllVendors, 
  adminDeleteVendor, 
  adminDeactivateVendor, 
  adminActivateVendor,
  adminGetAllProperties,
  adminDeleteProperty,
  adminDeactivateProperty,
  adminActivateProperty,
  adminGetAllBlogs,
  adminCreateBlog,
  adminUpdateBlog,
  adminDeleteBlog,
  Vendor,
  Blog
} from '@/lib/api';
import { Property } from '@/types/property';
import Image from 'next/image';
import Link from 'next/link';
import { uploadImagesToBackend } from '@/lib/backend-storage';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'vendors' | 'properties' | 'blogs'>('vendors');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [includeUnpublished, setIncludeUnpublished] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    featured_image_url: '',
    category: '',
    tags: '',
    published: false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, activeTab, includeInactive, includeUnpublished, currentPage]);

  const fetchData = async () => {
    if (!user || !isAdmin) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      if (activeTab === 'vendors') {
        const data = await adminGetAllVendors(includeInactive, token);
        setVendors(data);
      } else if (activeTab === 'properties') {
        const result = await adminGetAllProperties(currentPage, includeInactive, token);
        setProperties(result.properties);
        setTotalPages(result.pages);
      } else if (activeTab === 'blogs') {
        const result = await adminGetAllBlogs(currentPage, includeUnpublished, token);
        setBlogs(result.blogs);
        setTotalPages(result.pages);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!user || !confirm('Are you sure you want to permanently delete this vendor? This action cannot be undone.')) {
      return;
    }
    setActionLoading(`delete-vendor-${vendorId}`);
    setMessage(null);
    try {
      await adminDeleteVendor(vendorId, await user.getIdToken());
      setMessage({ type: 'success', text: 'Vendor deleted successfully!' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete vendor' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVendorStatus = async (vendorId: string, isActive: boolean) => {
    if (!user) return;
    setActionLoading(`${isActive ? 'deactivate' : 'activate'}-vendor-${vendorId}`);
    setMessage(null);
    try {
      if (isActive) {
        await adminDeactivateVendor(vendorId, await user.getIdToken());
        setMessage({ type: 'success', text: 'Vendor deactivated successfully!' });
      } else {
        await adminActivateVendor(vendorId, await user.getIdToken());
        setMessage({ type: 'success', text: 'Vendor activated successfully!' });
      }
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update vendor status' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!user || !confirm('Are you sure you want to permanently delete this property? This action cannot be undone.')) {
      return;
    }
    setActionLoading(`delete-property-${propertyId}`);
    setMessage(null);
    try {
      await adminDeleteProperty(propertyId, await user.getIdToken());
      setMessage({ type: 'success', text: 'Property deleted successfully!' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete property' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePropertyStatus = async (propertyId: string, isActive: boolean) => {
    if (!user) return;
    setActionLoading(`${isActive ? 'deactivate' : 'activate'}-property-${propertyId}`);
    setMessage(null);
    try {
      if (isActive) {
        await adminDeactivateProperty(propertyId, await user.getIdToken());
        setMessage({ type: 'success', text: 'Property deactivated successfully!' });
      } else {
        await adminActivateProperty(propertyId, await user.getIdToken());
        setMessage({ type: 'success', text: 'Property activated successfully!' });
      }
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update property status' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!user || !confirm('Are you sure you want to permanently delete this blog? This action cannot be undone.')) {
      return;
    }
    setActionLoading(`delete-blog-${blogId}`);
    setMessage(null);
    try {
      await adminDeleteBlog(blogId, await user.getIdToken());
      setMessage({ type: 'success', text: 'Blog deleted successfully!' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete blog' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 10MB' });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Clear URL when uploading file
      setBlogFormData({ ...blogFormData, featured_image_url: '' });
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSaveBlog = async () => {
    if (!user || !blogFormData.title || !blogFormData.content || !blogFormData.excerpt) {
      setMessage({ type: 'error', text: 'Please fill in all required fields (Title, Content, Excerpt)' });
      return;
    }

    setActionLoading('save-blog');
    setMessage(null);
    try {
      const token = await user.getIdToken();
      const tags = blogFormData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      // Upload image if selected
      let imageUrl = blogFormData.featured_image_url;
      if (selectedImage) {
        setUploadingImage(true);
        try {
          const uploadedUrls = await uploadImagesToBackend([selectedImage], token);
          if (uploadedUrls.length > 0) {
            imageUrl = uploadedUrls[0];
          }
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          setMessage({ type: 'error', text: 'Failed to upload image. You can still save with just a URL.' });
        } finally {
          setUploadingImage(false);
        }
      }
      
      if (editingBlog) {
        await adminUpdateBlog(editingBlog.id, {
          title: blogFormData.title,
          content: blogFormData.content,
          excerpt: blogFormData.excerpt,
          author: blogFormData.author,
          featured_image_url: imageUrl,
          category: blogFormData.category,
          tags: tags,
          published: blogFormData.published,
        }, token);
        setMessage({ type: 'success', text: 'Blog updated successfully!' });
      } else {
        await adminCreateBlog({
          title: blogFormData.title,
          content: blogFormData.content,
          excerpt: blogFormData.excerpt,
          author: blogFormData.author,
          featured_image_url: imageUrl,
          category: blogFormData.category,
          tags: tags,
          published: blogFormData.published,
        }, token);
        setMessage({ type: 'success', text: 'Blog created successfully!' });
      }
      
      setShowBlogForm(false);
      setEditingBlog(null);
      setSelectedImage(null);
      setImagePreview(null);
      setBlogFormData({
        title: '',
        content: '',
        excerpt: '',
        author: '',
        featured_image_url: '',
        category: '',
        tags: '',
        published: false,
      });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save blog' });
    } finally {
      setActionLoading(null);
      setUploadingImage(false);
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setBlogFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      author: blog.author,
      featured_image_url: blog.featured_image_url || '',
      category: blog.category || '',
      tags: blog.tags?.join(', ') || '',
      published: blog.published,
    });
    setShowBlogForm(true);
  };

  if (!user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access the admin panel.</p>
            <Link href="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Log In
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have admin privileges to access this page.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Go Home
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage vendors and properties</p>
        </div>
      </section>

      {message && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('vendors');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'vendors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Vendors ({vendors.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('properties');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'properties'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Properties ({properties.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('blogs');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'blogs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Blogs
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex items-center gap-4 flex-wrap">
            {(activeTab === 'vendors' || activeTab === 'properties') && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(e) => {
                    setIncludeInactive(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">Show Inactive</span>
              </label>
            )}
            {activeTab === 'blogs' && (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUnpublished}
                    onChange={(e) => {
                      setIncludeUnpublished(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Show Unpublished</span>
                </label>
                <button
                  onClick={() => {
                    setEditingBlog(null);
                    setBlogFormData({
                      title: '',
                      content: '',
                      excerpt: '',
                      author: '',
                      featured_image_url: '',
                      category: '',
                      tags: '',
                      published: false,
                    });
                    setShowBlogForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  + Create New Blog
                </button>
              </>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : activeTab === 'vendors' ? (
            vendors.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-lg mb-4">No vendors found.</p>
                <p className="text-gray-500 text-sm">Vendors will appear here once they register.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor) => (
                <div key={vendor.id} className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                  !vendor.active ? 'opacity-75 border-yellow-400 bg-yellow-50' : 'border-gray-200'
                }`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{vendor.company_name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {vendor.category}
                    </span>
                    {!vendor.active && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{vendor.description}</p>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {vendor.email && <p>✉️ {vendor.email}</p>}
                    {vendor.phone && <p>📞 {vendor.phone}</p>}
                    {vendor.location && <p>📍 {vendor.location}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleVendorStatus(vendor.id, vendor.active)}
                        disabled={actionLoading !== null}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 ${
                          vendor.active
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {actionLoading === `deactivate-vendor-${vendor.id}` || actionLoading === `activate-vendor-${vendor.id}`
                          ? '...'
                          : vendor.active
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      disabled={actionLoading !== null}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {actionLoading === `delete-vendor-${vendor.id}` ? 'Deleting...' : 'Delete Vendor'}
                    </button>
                  </div>
                </div>
              ))}
              </div>
            )
          ) : activeTab === 'properties' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${
                    !property.active ? 'opacity-75 border-2 border-gray-300' : ''
                  }`}>
                    <Link href={`/listings/${property.id}`}>
                      <div className="relative h-48 w-full">
                        <Image
                          src={property.image}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                        {!property.active && (
                          <div className="absolute top-2 right-2 bg-yellow-700 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                            Inactive
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{property.location}</p>
                      <p className="text-2xl font-bold text-gray-900 mb-4">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(property.price)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTogglePropertyStatus(property.id, property.active || false)}
                          disabled={actionLoading !== null}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 ${
                            property.active
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {actionLoading === `deactivate-property-${property.id}` || actionLoading === `activate-property-${property.id}`
                            ? '...'
                            : property.active
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          disabled={actionLoading !== null}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm disabled:opacity-50"
                        >
                          {actionLoading === `delete-property-${property.id}` ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Blog Form Modal */}
              {showBlogForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {editingBlog ? 'Edit Blog' : 'Create New Blog'}
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={blogFormData.title}
                          onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="Blog title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Excerpt *
                        </label>
                        <textarea
                          value={blogFormData.excerpt}
                          onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="Short summary for preview"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content *
                        </label>
                        <textarea
                          value={blogFormData.content}
                          onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                          rows={12}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono text-sm"
                          placeholder="Full blog content (supports HTML or plain text)"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Author
                          </label>
                          <input
                            type="text"
                            value={blogFormData.author}
                            onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Author name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            value={blogFormData.category}
                            onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                          >
                            <option value="">Select category</option>
                            <option value="Market Trends">Market Trends</option>
                            <option value="Operations">Operations</option>
                            <option value="Investment">Investment</option>
                            <option value="Technology">Technology</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Featured Image
                        </label>
                        <div className="space-y-4">
                          {/* Image Upload Option */}
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Upload Image:</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                              disabled={uploadingImage}
                            />
                            {selectedImage && (
                              <div className="mt-2">
                                <div className="relative inline-block">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={imagePreview || ''}
                                    alt="Preview"
                                    className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                  >
                                    ×
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{selectedImage.name}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* OR Divider */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="text-sm text-gray-500">OR</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                          </div>
                          
                          {/* Image URL Option */}
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Image URL:</label>
                            <input
                              type="url"
                              value={blogFormData.featured_image_url}
                              onChange={(e) => {
                                setBlogFormData({ ...blogFormData, featured_image_url: e.target.value });
                                // Clear uploaded image when URL is entered
                                if (e.target.value) {
                                  setSelectedImage(null);
                                  setImagePreview(null);
                                }
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                              placeholder="https://example.com/image.jpg"
                              disabled={!!selectedImage}
                            />
                            {blogFormData.featured_image_url && !selectedImage && (
                              <div className="mt-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={blogFormData.featured_image_url}
                                  alt="Preview"
                                  className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        {uploadingImage && (
                          <p className="text-sm text-blue-600 mt-2">Uploading image...</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={blogFormData.tags}
                          onChange={(e) => setBlogFormData({ ...blogFormData, tags: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="tag1, tag2, tag3"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={blogFormData.published}
                            onChange={(e) => setBlogFormData({ ...blogFormData, published: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700 font-medium">Publish immediately</span>
                        </label>
                      </div>
                    </div>
                    <div className="p-6 border-t border-gray-200 flex gap-4 justify-end">
                      <button
                        onClick={() => {
                          setShowBlogForm(false);
                          setEditingBlog(null);
                          setBlogFormData({
                            title: '',
                            content: '',
                            excerpt: '',
                            author: '',
                            featured_image_url: '',
                            category: '',
                            tags: '',
                            published: false,
                          });
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveBlog}
                        disabled={actionLoading === 'save-blog'}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading === 'save-blog' ? 'Saving...' : editingBlog ? 'Update Blog' : 'Create Blog'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Blogs List */}
              {blogs.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-lg mb-4">No blogs found.</p>
                  <button
                    onClick={() => {
                      setEditingBlog(null);
                      setSelectedImage(null);
                      setImagePreview(null);
                      setBlogFormData({
                        title: '',
                        content: '',
                        excerpt: '',
                        author: '',
                        featured_image_url: '',
                        category: '',
                        tags: '',
                        published: false,
                      });
                      setShowBlogForm(true);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Your First Blog
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                      <div key={blog.id} className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                        !blog.published ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                      }`}>
                        {blog.featured_image_url && (
                          <div className="relative h-32 w-full mb-4 rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={blog.featured_image_url}
                              alt={blog.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          {blog.category && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {blog.category}
                            </span>
                          )}
                          {!blog.published && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Draft
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{blog.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{blog.excerpt}</p>
                        <div className="text-xs text-gray-500 mb-4">
                          {blog.author && <p>By {blog.author}</p>}
                          {blog.date_published && (
                            <p>Published: {new Date(blog.date_published).toLocaleDateString()}</p>
                          )}
                          <p>Views: {blog.views || 0}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditBlog(blog)}
                            disabled={actionLoading !== null}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id)}
                            disabled={actionLoading !== null}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm disabled:opacity-50"
                          >
                            {actionLoading === `delete-blog-${blog.id}` ? '...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
}

