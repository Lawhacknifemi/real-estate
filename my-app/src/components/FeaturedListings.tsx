import Link from 'next/link';
import PropertyCard from './PropertyCard';
import { Property } from '@/types/property';

interface FeaturedListingsProps {
  properties: Property[];
}

export default function FeaturedListings({ properties }: FeaturedListingsProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <h2 className="text-3xl font-bold text-gray-900 px-6">TODAY&apos;S FEATURED LISTINGS</h2>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <Link
            href="/listings"
            className="inline-block mt-6 px-6 py-2 border-2 border-teal-400 text-teal-400 font-medium rounded hover:bg-teal-400 hover:text-white transition-colors"
          >
            View All Listings
          </Link>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}



