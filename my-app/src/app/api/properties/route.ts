import { NextRequest, NextResponse } from 'next/server';
import { Property } from '@/types/property';

// In production, this would connect to a database
let properties: Property[] = [
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const listingType = searchParams.get('listingType');
  const location = searchParams.get('location');
  const search = searchParams.get('search');

  let filteredProperties = [...properties];

  if (listingType) {
    filteredProperties = filteredProperties.filter(
      (p) => p.listingType.toLowerCase() === listingType.toLowerCase()
    );
  }

  if (location) {
    filteredProperties = filteredProperties.filter((p) =>
      p.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredProperties = filteredProperties.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.location.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
    );
  }

  return NextResponse.json(filteredProperties);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'location', 'price', 'listingType'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new property
    const newProperty: Property = {
      id: Date.now().toString(),
      title: body.title,
      location: body.location,
      price: Number(body.price),
      acreage: body.acreage ? Number(body.acreage) : undefined,
      unitCount: body.unitCount ? Number(body.unitCount) : undefined,
      type: body.type || 'Traditional Site',
      listingType: body.listingType,
      image: body.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop',
      description: body.description || '',
    };

    properties.push(newProperty);

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}



