import { NextRequest, NextResponse } from 'next/server';

// In production, this would connect to a database
// This is a simplified version - you'd fetch from your database here
const properties = [
  {
    id: '1',
    title: 'Space Rental',
    location: 'Newton, IA',
    price: 2500000,
    acreage: 7.93,
    unitCount: 320,
    type: 'Traditional Site',
    listingType: 'Sale',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop',
    description: 'Prime self-storage facility located in Newton, IA. This well-maintained property offers 320 units across 7.93 acres.',
  },
  {
    id: '2',
    title: 'Blue Water Storage - Paris',
    location: 'Paris, TX',
    price: 2300000,
    acreage: 5.07,
    unitCount: 335,
    type: 'Traditional Site',
    listingType: 'Sale',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
    description: 'Established storage facility in Paris, TX with 335 units.',
  },
  {
    id: '3',
    title: 'Inside the Box Self Storage',
    location: 'Monroe, LA',
    price: 575000,
    acreage: 8.52,
    unitCount: 156,
    type: 'Traditional Site',
    listingType: 'Sale',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1974&auto=format&fit=crop',
    description: 'Smaller facility with great potential for expansion.',
  },
];

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = context.params;
  const property = properties.find((p) => p.id === id);

  if (!property) {
    return NextResponse.json(
      { error: 'Property not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(property);
}



