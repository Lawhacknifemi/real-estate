'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import ShareButtons from '@/components/ShareButtons';
import PurchaseModal from '@/components/PurchaseModal';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';
import { getPropertyById, purchaseProperty, delistProperty, relistProperty, deleteProperty, getMyProperties } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ListingDetailPageProps {
  params: Promise<{
    id: string;
  }> | {
    id: string;
  };
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [myProperties, setMyProperties] = useState<Property[]>([]);

  // Handle both sync and async params (Next.js 15+)
  useEffect(() => {
    async function getParams() {
      const resolvedParams = params instanceof Promise ? await params : params;
      setPropertyId(resolvedParams.id);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    if (!propertyId) return;
    
    const id = propertyId; // Capture value for TypeScript type narrowing
    async function fetchProperty() {
      try {
        console.log('[PROPERTY-DETAIL] Fetching property with ID:', id);
        const data = await getPropertyById(id);
        console.log('[PROPERTY-DETAIL] Received data:', data);
        if (data) {
          console.log('[PROPERTY-DETAIL] Property details:', {
            acreage: data.acreage,
            unitCount: data.unitCount,
            price: data.price,
            listingType: data.listingType,
            type: data.type
          });
        } else {
          console.warn('[PROPERTY-DETAIL] Property not found for ID:', id);
        }
        setProperty(data);
      } catch (error) {
        console.error('[PROPERTY-DETAIL] Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [propertyId]);

  // Check if current user owns this property
  useEffect(() => {
    function checkOwnership() {
      if (!user || !userProfile || userProfile.role !== 'seller' || !property) {
        setIsOwner(false);
        return;
      }

      // Simple check: compare Firebase user ID with property's realtor Firebase ID
      const userFirebaseId = user.uid;
      const propertyOwnerFirebaseId = property.realtor?.realtor_id;
      
      console.log('[OWNERSHIP] Checking ownership:', {
        userFirebaseId,
        propertyOwnerFirebaseId,
        match: userFirebaseId === propertyOwnerFirebaseId,
        property: property.id
      });
      
      setIsOwner(userFirebaseId === propertyOwnerFirebaseId);
    }
    checkOwnership();
  }, [user, userProfile, property]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading property...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!property) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
            <Link
              href="/listings"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Listings
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePurchaseSuccess = () => {
    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 5000);
  };

  const handleDelist = async () => {
    if (!user || !property || !confirm('Are you sure you want to delist this property? It will be hidden from public listings.')) {
      return;
    }

    setActionLoading('delist');
    try {
      const token = await user.getIdToken();
      await delistProperty(property.id, token);
      // Refresh property data
      const data = await getPropertyById(property.id);
      setProperty(data);
      alert('Property delisted successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to delist property');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRelist = async () => {
    if (!user || !property) return;

    setActionLoading('relist');
    try {
      const token = await user.getIdToken();
      await relistProperty(property.id, token);
      // Refresh property data
      const data = await getPropertyById(property.id);
      setProperty(data);
      alert('Property relisted successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to relist property');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!user || !property || !confirm('Are you sure you want to permanently delete this property? This action cannot be undone.')) {
      return;
    }

    setActionLoading('delete');
    try {
      const token = await user.getIdToken();
      await deleteProperty(property.id, token);
      alert('Property deleted successfully');
      router.push('/my-listings');
    } catch (error: any) {
      alert(error.message || 'Failed to delete property');
      setActionLoading(null);
    }
  };

  return (
    <PageLayout>
      {/* Purchase Success Message */}
      {purchaseSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="font-medium">Purchase request submitted successfully!</p>
          <p className="text-sm">We'll contact you soon.</p>
        </div>
      )}

      {/* Property Images */}
      <section className="relative h-[500px] w-full overflow-hidden">
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto px-4">
            <div className="flex gap-3 mb-4">
              <span className="bg-red-700 text-white text-sm px-4 py-2 rounded-md font-bold shadow-lg" style={{ color: '#ffffff' }}>
                {property.type}
              </span>
              <span className="bg-blue-800 text-white text-sm px-4 py-2 rounded-md font-bold shadow-lg" style={{ color: '#ffffff' }}>
                {property.listingType}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{property.title}</h1>
            <p className="text-xl">{property.location}</p>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Property Description</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {property.description || 'No description available.'}
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Price</div>
                    <div className="text-2xl font-bold text-gray-900">{formatPrice(property.price)}</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Acreage</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {property.acreage ? `${property.acreage} Acres` : 'Not specified'}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Unit Count</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {property.unitCount ? `${property.unitCount} Units` : 'Not specified'}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Listing Type</div>
                    <div className="text-2xl font-bold text-gray-900">{property.listingType}</div>
                  </div>
                </div>
                
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
                    <h4 className="text-lg font-bold text-blue-900 mb-3">🔍 Debug Information</h4>
                    <div className="bg-white p-4 rounded border border-blue-200">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-700 w-24">Acreage:</span>
                          <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {property.acreage !== undefined && property.acreage !== null 
                              ? `${property.acreage} (${typeof property.acreage})` 
                              : 'undefined/null'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-700 w-24">Unit Count:</span>
                          <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {property.unitCount !== undefined && property.unitCount !== null 
                              ? `${property.unitCount} (${typeof property.unitCount})` 
                              : 'undefined/null'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-700 w-24">Price:</span>
                          <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {property.price} ({typeof property.price})
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-700 w-24">Listing Type:</span>
                          <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {property.listingType}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-700 w-24">Property Type:</span>
                          <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {property.type}
                          </span>
                        </div>
                      </div>
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-semibold text-blue-700 hover:text-blue-900">
                          View Full Property Object
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-900 text-green-400 text-xs rounded overflow-auto max-h-64">
                          {JSON.stringify(property, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Images Gallery */}
              {property.property_images && property.property_images.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Photo Gallery</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {property.property_images.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`${property.title} - View ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-8 sticky top-24">
                {/* Owner Actions */}
                {isOwner && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3">Manage Your Listing</h4>
                    <div className="space-y-2">
                      {property.active ? (
                        <button
                          onClick={handleDelist}
                          disabled={actionLoading !== null}
                          className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {actionLoading === 'delist' ? 'Delisting...' : 'Delist Property'}
                        </button>
                      ) : (
                        <button
                          onClick={handleRelist}
                          disabled={actionLoading !== null}
                          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {actionLoading === 'relist' ? 'Relisting...' : 'Relist Property'}
                        </button>
                      )}
                      <button
                        onClick={handleDelete}
                        disabled={actionLoading !== null}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {actionLoading === 'delete' ? 'Deleting...' : 'Delete Property'}
                      </button>
                      <Link
                        href="/my-listings"
                        className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                      >
                        View All My Listings
                      </Link>
                    </div>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Price</p>
                    <p className="text-3xl font-bold text-blue-600">{formatPrice(property.price)}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">Interested in this property?</p>
                    
                    {/* Contact Information */}
                    {property.realtor && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        {property.realtor.contact_name && (
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-semibold">Contact:</span> {property.realtor.contact_name}
                          </p>
                        )}
                        {property.realtor.contact_phone && (
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-semibold">Phone:</span> {property.realtor.contact_phone}
                          </p>
                        )}
                        {property.realtor.contact_email && (
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Email:</span> {property.realtor.contact_email}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {property.realtor?.contact_phone ? (
                      <a
                        href={`tel:${property.realtor.contact_phone.replace(/\D/g, '')}`}
                        className="block w-full text-center bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors mb-3 font-medium"
                      >
                        Call Now: {property.realtor.contact_phone}
                      </a>
                    ) : (
                      <a
                        href="tel:313-484-4670"
                        className="block w-full text-center bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors mb-3 font-medium"
                      >
                        Call Now: 313-484-4670
                      </a>
                    )}
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="block w-full text-center bg-teal-400 text-white py-3 px-6 rounded-lg hover:bg-teal-500 transition-colors font-medium"
                    >
                      Purchase / Request Information
                    </button>
                  </div>
                  <ShareButtons url={`/listings/${property.id}`} title={property.title} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Listings */}
      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/listings"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to All Listings
          </Link>
        </div>
      </section>

      {/* Purchase Modal */}
      <PurchaseModal
        propertyId={property.id}
        propertyTitle={property.title}
        propertyPrice={property.price}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </PageLayout>
  );
}
