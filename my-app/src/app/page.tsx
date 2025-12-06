import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import FeaturedListings from '@/components/FeaturedListings';
import IndustryInsights from '@/components/IndustryInsights';
import { getRecentlyAddedProperties } from '@/lib/api';

export default async function Home() {
  // Fetch recently added properties from the backend
  const featuredProperties = await getRecentlyAddedProperties();
  
  // If no properties, show empty state or fallback
  const displayProperties = featuredProperties.length > 0 
    ? featuredProperties.slice(0, 3) // Show first 3
    : [];

  return (
    <PageLayout>
      <Hero />
      <FeaturedListings properties={displayProperties} />
      <IndustryInsights />
    </PageLayout>
  );
}
