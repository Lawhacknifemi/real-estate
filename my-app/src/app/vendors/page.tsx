'use client';

import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllVendors, Vendor } from '@/lib/api';
import Image from 'next/image';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const vendorCategories = [
    {
      name: 'Construction & Development',
      description: 'Find contractors, builders, and development companies specializing in flex space facilities.',
      icon: '🏗️',
    },
    {
      name: 'Property Management',
      description: 'Professional property management services for your flex space operations.',
      icon: '📋',
    },
    {
      name: 'Legal & Financial Services',
      description: 'Attorneys and financial advisors experienced in commercial real estate transactions.',
      icon: '⚖️',
    },
    {
      name: 'Marketing & Advertising',
      description: 'Marketing experts to help promote your property listings and reach the right audience.',
      icon: '📢',
    },
    {
      name: 'Maintenance & Services',
      description: 'Maintenance providers, security services, and facility management companies.',
      icon: '🔧',
    },
    {
      name: 'Technology Solutions',
      description: 'Software and technology solutions for property management and operations.',
      icon: '💻',
    },
  ];

  useEffect(() => {
    async function fetchVendors() {
      setLoading(true);
      try {
        const data = await getAllVendors(selectedCategory || undefined, false);
        setVendors(data);
      } catch (error: any) {
        console.error('Error fetching vendors:', error);
        // Error is already handled in getAllVendors, which returns empty array
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, [selectedCategory]);

  // Group vendors by category
  const vendorsByCategory = vendorCategories.reduce((acc, category) => {
    const categoryVendors = vendors.filter(v => v.category === category.name);
    if (categoryVendors.length > 0) {
      acc[category.name] = categoryVendors;
    }
    return acc;
  }, {} as Record<string, Vendor[]>);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Vendors & Service Providers</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Connect with trusted professionals and service providers for your flex space needs
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Service Categories</h2>
            
            {/* Category Filter */}
            <div className="mb-8 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {vendorCategories.map((category) => {
                const count = vendors.filter(v => v.category === category.name).length;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {vendorCategories.map((category, index) => {
                const categoryVendors = vendors.filter(v => v.category === category.name);
                return (
                  <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{category.name}</h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {categoryVendors.length} {categoryVendors.length === 1 ? 'vendor' : 'vendors'}
                      </span>
                      <Link
                        href={`/vendors/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                      >
                        View Vendors
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vendors List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading vendors...</p>
              </div>
            ) : selectedCategory ? (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedCategory} Vendors ({vendorsByCategory[selectedCategory]?.length || 0})
                </h3>
                {vendorsByCategory[selectedCategory] && vendorsByCategory[selectedCategory].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendorsByCategory[selectedCategory].map((vendor) => (
                      <div key={vendor.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        {vendor.logo_url && (
                          <div className="relative h-24 w-24 mx-auto mb-4">
                            <Image
                              src={vendor.logo_url}
                              alt={vendor.company_name}
                              fill
                              className="object-contain rounded-lg"
                            />
                          </div>
                        )}
                        <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">{vendor.company_name}</h4>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{vendor.description}</p>
                        {vendor.services && (
                          <p className="text-gray-700 text-sm mb-4">
                            <span className="font-semibold">Services:</span> {vendor.services}
                          </p>
                        )}
                        <div className="space-y-2 text-sm">
                          {vendor.location && (
                            <p className="text-gray-600">📍 {vendor.location}</p>
                          )}
                          {vendor.phone && (
                            <p className="text-gray-600">📞 {vendor.phone}</p>
                          )}
                          {vendor.email && (
                            <p className="text-gray-600">✉️ {vendor.email}</p>
                          )}
                          {vendor.website_url && (
                            <a
                              href={vendor.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                            >
                              Visit Website
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No vendors found in this category yet.</p>
                    <Link
                      href="/advertise"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Become a Vendor
                    </Link>
                  </div>
                )}
              </div>
            ) : vendors.length > 0 ? (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">All Vendors ({vendors.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      {vendor.logo_url && (
                        <div className="relative h-24 w-24 mx-auto mb-4">
                          <Image
                            src={vendor.logo_url}
                            alt={vendor.company_name}
                            fill
                            className="object-contain rounded-lg"
                          />
                        </div>
                      )}
                      <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">{vendor.company_name}</h4>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                          {vendor.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{vendor.description}</p>
                      {vendor.services && (
                        <p className="text-gray-700 text-sm mb-4">
                          <span className="font-semibold">Services:</span> {vendor.services}
                        </p>
                      )}
                      <div className="space-y-2 text-sm">
                        {vendor.location && (
                          <p className="text-gray-600">📍 {vendor.location}</p>
                        )}
                        {vendor.phone && (
                          <p className="text-gray-600">📞 {vendor.phone}</p>
                        )}
                        {vendor.email && (
                          <p className="text-gray-600">✉️ {vendor.email}</p>
                        )}
                        {vendor.website_url && (
                          <a
                            href={vendor.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                          >
                            Visit Website
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">No vendors registered yet.</p>
                <Link
                  href="/advertise"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Become the First Vendor
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Become a Vendor Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Become a Vendor</h2>
            <p className="text-lg text-gray-700 mb-8">
              Are you a service provider looking to reach property owners and investors in the flex space market?
              Join our vendor network for free and connect with potential clients. Your profile will be live immediately.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up</h3>
                <p className="text-gray-600 text-sm">Create your vendor profile and list your services</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Connecting</h3>
                <p className="text-gray-600 text-sm">Your profile goes live immediately - connect with property owners and grow your business</p>
              </div>
            </div>
            <Link
              href="/advertise"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Join as a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Vendor Support</h2>
            <p className="text-lg text-gray-700 mb-8">
              Need help setting up your vendor profile or have questions about our vendor program?
            </p>
            <div className="bg-gray-50 p-8 rounded-lg inline-block">
              <p className="text-gray-700 mb-4">Contact our vendor relations team:</p>
              <a href="tel:313-484-4670" className="text-blue-600 hover:text-blue-700 font-medium text-xl">
                313-484-4670
              </a>
              <p className="text-gray-600 mt-2">or</p>
              <a href="mailto:vendors@listflexspace.com" className="text-blue-600 hover:text-blue-700 font-medium">
                vendors@listflexspace.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}



