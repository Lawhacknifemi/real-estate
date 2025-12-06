'use client';

import PageLayout from '@/components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProperties, delistProperty, relistProperty, deleteProperty } from '@/lib/api';
import { Property } from '@/types/property';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function MyListingsPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user && userProfile?.role === 'seller') {
      fetchProperties();
    }
  }, [user, userProfile, includeInactive, currentPage]);

  const fetchProperties = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const result = await getMyProperties(token, currentPage, includeInactive);
      setProperties(result.properties);
      setTotalPages(result.pages);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setMessage({ type: 'error', text: 'Failed to load your properties' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelist = async (propertyId: string) => {
    if (!user || !confirm('Are you sure you want to delist this property? It will be hidden from public listings.')) {
      return;
    }

    setActionLoading(propertyId);
    setMessage(null);
    try {
      const token = await user.getIdToken();
      await delistProperty(propertyId, token);
      setMessage({ type: 'success', text: 'Property delisted successfully' });
      fetchProperties();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delist property' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRelist = async (propertyId: string) => {
    if (!user) return;

    setActionLoading(propertyId);
    setMessage(null);
    try {
      const token = await user.getIdToken();
      await relistProperty(propertyId, token);
      setMessage({ type: 'success', text: 'Property relisted successfully' });
      fetchProperties();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to relist property' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!user || !confirm('Are you sure you want to permanently delete this property? This action cannot be undone.')) {
      return;
    }

    setActionLoading(propertyId);
    setMessage(null);
    try {
      const token = await user.getIdToken();
      await deleteProperty(propertyId, token);
      setMessage({ type: 'success', text: 'Property deleted successfully' });
      fetchProperties();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete property' });
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || userProfile?.role !== 'seller') {
    return (
      <ProtectedRoute requiredRole="seller">
        <PageLayout>
          <section className="py-20 bg-gray-50 min-h-[calc(100vh-200px)]">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600">Only sellers can access this page.</p>
            </div>
          </section>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <PageLayout>
      <section className="py-12 bg-gray-50 min-h-[calc(100vh-200px)]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Listings</h1>
              <p className="text-gray-600">Manage your property listings</p>
            </div>
            <Link
              href="/submit-property"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add New Property
            </Link>
          </div>

          {/* Filter Toggle */}
          <div className="mb-6 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => {
                  setIncludeInactive(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Show delisted properties</span>
            </label>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Properties List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading your properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No properties found</h3>
              <p className="mt-2 text-gray-600">
                {includeInactive 
                  ? "You don't have any properties yet." 
                  : "You don't have any active properties. Check 'Show delisted properties' to see all listings."}
              </p>
              <Link
                href="/submit-property"
                className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Listing
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden ${
                      !property.active ? 'opacity-75 border-2 border-gray-300' : ''
                    }`}
                  >
                    <Link href={`/listings/${property.id}`}>
                      <div className="relative h-48 w-full">
                        <Image
                          src={property.image}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                        {!property.active && (
                          <div className="absolute top-2 right-2 bg-yellow-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-yellow-900 z-10" style={{ color: '#ffffff' }}>
                            Delisted
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/listings/${property.id}`}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{property.location}</p>
                        <p className="text-2xl font-bold text-blue-600 mb-4">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                          }).format(property.price)}
                        </p>
                      </Link>
                      
                      <div className="flex gap-2 mt-4">
                        {property.active ? (
                          <button
                            onClick={() => handleDelist(property.id)}
                            disabled={actionLoading === property.id}
                            className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {actionLoading === property.id ? 'Delisting...' : 'Delist'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRelist(property.id)}
                            disabled={actionLoading === property.id}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {actionLoading === property.id ? 'Relisting...' : 'Relist'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(property.id)}
                          disabled={actionLoading === property.id}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {actionLoading === property.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
}

