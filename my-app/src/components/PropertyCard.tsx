import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/listings/${property.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Labels */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            <span className="bg-red-700 text-white text-xs px-3 py-1.5 rounded-md font-bold shadow-lg" style={{ color: '#ffffff' }}>
              {property.type}
            </span>
            <span className="bg-blue-800 text-white text-xs px-3 py-1.5 rounded-md font-bold shadow-lg" style={{ color: '#ffffff' }}>
              {property.listingType}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-5">
          <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          <p className="text-gray-600 mb-4">{property.location}</p>
          <p className="text-2xl font-bold text-gray-900 mb-4">{formatPrice(property.price)}</p>
          
          <div className="space-y-2 text-sm text-gray-700">
            {property.acreage && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600">►</span>
                <span>Acreage: {property.acreage} Acres</span>
              </div>
            )}
            {property.unitCount && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600">►</span>
                <span>Unit Count: {property.unitCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}



