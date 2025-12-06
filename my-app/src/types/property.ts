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
  property_images?: string[]; // Array of all property images
  owner_id?: string; // Realtor ID who owns this property
  active?: boolean; // Whether the property is active/listed
  realtor?: {
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    realtor_id?: string; // Firebase user ID of the realtor
  };
}



