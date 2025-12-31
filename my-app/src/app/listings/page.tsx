'use client';

import PageLayout from '@/components/PageLayout';
import PropertyCard from '@/components/PropertyCard';
import { Property } from '@/types/property';
import Link from 'next/link';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllProperties, searchProperties } from '@/lib/api';

function ListingsContent() {
  const searchParams = useSearchParams();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    listingType: searchParams.get('listingType') || '',
    location: searchParams.get('location') || '',
    search: searchParams.get('search') || '',
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.location]);

  // Fetch properties from backend
  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        if (filters.search) {
          // Use search API if search is applied
          const result = await searchProperties({
            search_term: filters.search,
            page: currentPage,
          });
          setAllProperties(result.results);
          setTotalPages(result.pages);
        } else if (filters.location) {
          // Use search API for location filter
          const result = await searchProperties({
            search_term: filters.location,
            page: currentPage,
          });
          setAllProperties(result.results);
          setTotalPages(result.pages);
        } else {
          // Fetch all properties when no filters
          const result = await getAllProperties(currentPage);
          console.log('Fetched properties:', result.properties.length, 'Total pages:', result.pages);
          setAllProperties(result.properties);
          setTotalPages(result.pages);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setAllProperties([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [currentPage, filters.search, filters.location]);

  const filteredProperties = useMemo(() => {
    let filtered = [...allProperties];

    // Only apply client-side filters if they're not already handled by the backend
    // The backend handles search and location, so we only filter by listingType here
    if (filters.listingType) {
      filtered = filtered.filter(
        (p) => p.listingType.toLowerCase() === filters.listingType.toLowerCase()
      );
    }

    // Note: search and location filters are handled by the backend API
    // We don't need to filter them again on the client side

    return filtered;
  }, [allProperties, filters.listingType]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }));
  };

  return (
    <PageLayout>
      {/* Page Header */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Property Listings</h1>
          <p className="text-gray-600">Find your next flexible space opportunity</p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="border-b border-gray-200 py-6 sticky top-0 bg-white z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
              <select
                value={filters.listingType}
                onChange={(e) => handleFilterChange('listingType', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-medium"
                style={{ color: '#111827' }}
              >
                <option value="" style={{ color: '#111827' }}>All Types</option>
                <option value="Sale" style={{ color: '#111827' }}>For Sale</option>
                <option value="Lease" style={{ color: '#111827' }}>For Lease</option>
              </select>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-medium"
                style={{ color: '#111827' }}
              >
                <option value="" style={{ color: '#111827' }}>All Locations</option>
                <option value="IA" style={{ color: '#111827' }}>Iowa</option>
                <option value="TX" style={{ color: '#111827' }}>Texas</option>
                <option value="LA" style={{ color: '#111827' }}>Louisiana</option>
                <option value="GA" style={{ color: '#111827' }}>Georgia</option>
                <option value="Newton" style={{ color: '#111827' }}>Newton</option>
                <option value="Paris" style={{ color: '#111827' }}>Paris</option>
                <option value="Monroe" style={{ color: '#111827' }}>Monroe</option>
                <option value="Dallas" style={{ color: '#111827' }}>Dallas</option>
                <option value="Houston" style={{ color: '#111827' }}>Houston</option>
                <option value="Atlanta" style={{ color: '#111827' }}>Atlanta</option>
              </select>
              <input
                type="text"
                placeholder="Search properties..."
                value={filters.search}
                onChange={handleSearchChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] bg-white text-gray-900 placeholder:text-gray-400"
                style={{ color: '#111827' }}
              />
              {(filters.listingType || filters.location || filters.search) && (
                <button
                  onClick={() => setFilters({ listingType: '', location: '', search: '' })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">Loading properties...</p>
            </div>
          ) : filteredProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
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
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg mb-4">No properties found matching your criteria</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setFilters({ listingType: '', location: '', search: '' })}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
                <Link
                  href="/submit-property"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Your Property
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </PageLayout>
    }>
      <ListingsContent />
    </Suspense>
  );
}
