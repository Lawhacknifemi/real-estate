import PageLayout from '@/components/PageLayout';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">About LIST FLEX SPACE</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Your trusted platform for listing and discovering flexible space properties
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              LIST FLEX SPACE is dedicated to connecting property owners, investors, and businesses
              in the flexible space market. We provide a comprehensive platform that makes it easy
              to list, discover, and transact on flex space properties whether you&apos;re looking
              to buy, sell, or lease.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our mission is to simplify the commercial real estate process and help you find your
              next flexible space opportunity with confidence and ease.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Transparency</h3>
              <p className="text-gray-600">
                We believe in building trust through transparency. All property listings are verified
                and accurate information is our priority.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                We&apos;re constantly innovating to provide the best tools and features for our users,
                making property listing and discovery seamless.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Focus</h3>
              <p className="text-gray-600">
                We&apos;re committed to building a strong community of property owners, investors, and
                businesses working together to grow the flex space market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team/Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-lg text-gray-700 mb-8">
              Have questions or want to learn more? We&apos;d love to hear from you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sales & Support</h3>
                <p className="text-gray-600 mb-4">Need help with your listing or have questions?</p>
                <a href="tel:313-484-4670" className="text-blue-600 hover:text-blue-700 font-medium text-lg">
                  313-484-4670
                </a>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Business Hours</h3>
                <p className="text-gray-600 mb-2">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}



