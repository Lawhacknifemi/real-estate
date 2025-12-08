'use client';

import PageLayout from '@/components/PageLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { registerVendor } from '@/lib/api';

export default function AdvertisePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formType, setFormType] = useState<'vendor' | 'property'>('vendor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    website: '',
    services: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    timeline: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formType === 'vendor') {
      // Vendor registration
      if (!user) {
        setError('Please log in to register as a vendor.');
        return;
      }

      if (!formData.businessName || !formData.description || !formData.category || !formData.services) {
        setError('Please fill in all required fields (Business Name, Description, Category, Services).');
        return;
      }

      setIsSubmitting(true);
      try {
        const token = await user.getIdToken();
        await registerVendor({
          company_name: formData.businessName,
          description: formData.description,
          category: formData.category,
          services: formData.services,
          email: formData.email || user.email || '',
          phone: formData.phone,
          website_url: formData.website,
          location: formData.location,
        }, token);
        
        setSuccess(true);
        setTimeout(() => {
          router.push('/vendors');
        }, 2000);
      } catch (error: any) {
        console.error('Error registering vendor:', error);
        setError(error.message || 'Failed to register vendor. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Property advertising (existing behavior)
      console.log('Property advertising submission:', formData);
      alert('Thank you for your interest! Our team will contact you soon.');
      router.push('/');
    }
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Advertise With Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Reach thousands of property owners, investors, and businesses in the flex space market
          </p>
        </div>
      </section>

      {/* Advertising Options */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 mb-8 border-b border-gray-200">
              <button
                onClick={() => setFormType('vendor')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  formType === 'vendor'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Vendor Advertising
              </button>
              <button
                onClick={() => setFormType('property')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  formType === 'property'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Property Advertising
              </button>
            </div>

            {formType === 'vendor' ? (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Register as a Vendor</h2>
                <p className="text-gray-600 mb-8">
                  Join our vendor directory and connect with property owners and investors. Create your vendor profile
                  and start reaching potential clients. Registration is free and your profile will be live immediately.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Property Advertising</h2>
                <p className="text-gray-600 mb-8">
                  Get your property listing featured prominently on our platform. Increase visibility and
                  connect with more qualified buyers and tenants.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">Featured Listing</h3>
                    <p className="text-3xl font-bold text-blue-600 mb-2">$199</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Featured on homepage</li>
                      <li>• Top of search results</li>
                      <li>• Highlighted badge</li>
                      <li>• 30-day duration</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-600 p-6 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">Premium Placement</h3>
                    <p className="text-3xl font-bold text-blue-600 mb-2">$499</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Banner placement</li>
                      <li>• Homepage spotlight</li>
                      <li>• Email newsletter feature</li>
                      <li>• 60-day duration</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Form */}
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {formType === 'vendor' ? 'Vendor Registration Form' : 'Get Started'}
              </h3>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  Vendor registered successfully! Redirecting to vendors page...
                </div>
              )}
              
              {formType === 'vendor' && !user && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
                  Please log in to register as a vendor. <Link href="/login" className="font-medium underline">Log in here</Link>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                      {formType === 'vendor' ? 'Business Name' : 'Company Name'} *
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {formType === 'vendor' && (
                  <>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Service Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        style={{ color: '#111827' }}
                      >
                        <option value="" style={{ color: '#111827' }}>Select a category</option>
                        <option value="Construction & Development" style={{ color: '#111827' }}>Construction & Development</option>
                        <option value="Property Management" style={{ color: '#111827' }}>Property Management</option>
                        <option value="Legal & Financial Services" style={{ color: '#111827' }}>Legal & Financial Services</option>
                        <option value="Marketing & Advertising" style={{ color: '#111827' }}>Marketing & Advertising</option>
                        <option value="Maintenance & Services" style={{ color: '#111827' }}>Maintenance & Services</option>
                        <option value="Technology Solutions" style={{ color: '#111827' }}>Technology Solutions</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-2">
                        Services Offered *
                      </label>
                      <textarea
                        id="services"
                        name="services"
                        required
                        value={formData.services}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Describe your services (e.g., Construction, Renovation, Maintenance...)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Dallas, TX"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us more about your advertising needs..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                      Advertising Budget
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select budget range</option>
                      <option value="under-500">Under $500</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-5000">$1,000 - $5,000</option>
                      <option value="over-5000">Over $5,000</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                      Timeline
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select timeline</option>
                      <option value="immediate">Immediate</option>
                      <option value="1-month">Within 1 month</option>
                      <option value="3-months">Within 3 months</option>
                      <option value="6-months">Within 6 months</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || success}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : formType === 'vendor' ? 'Register as Vendor' : 'Submit Inquiry'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}



