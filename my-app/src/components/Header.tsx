'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [selectedRegion, setSelectedRegion] = useState<'USA' | 'UK'>('USA');
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm">
      {/* Top bar */}
      <div className="border-b border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-sm">
            <div className="text-gray-700">
              Sales/Support: <a href="tel:313-484-4670" className="text-blue-600 hover:underline">313-484-4670</a>
            </div>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="text-xs lg:text-sm">We defaulted to the {selectedRegion} based on your region. You can change your regions</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRegion('USA')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      selectedRegion === 'USA'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    USA
                  </button>
                  <button
                    onClick={() => setSelectedRegion('UK')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      selectedRegion === 'UK'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    UK
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                    >
                      <span>{userProfile?.displayName || user.email || 'User'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{userProfile?.displayName || user.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{userProfile?.role || 'buyer'}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Profile
                        </Link>
                        {userProfile?.role === 'seller' && (
                          <Link
                            href="/submit-property"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Submit Property
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-semibold"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
                    Log In / Sign Up →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo and main header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-blue-600">LIST</span>
              <span className="text-teal-500"> FLEX SPACE</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">YOUR NEXT FLEXIBLE SPACE OPPORTUNITY</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-200">
        <div className="container mx-auto px-4">
          <ul className="flex flex-wrap gap-4 md:gap-8 py-4">
            <li>
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm md:text-base">
                Home
              </Link>
            </li>
            <li>
              <Link href="/listings" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm md:text-base">
                Listings
              </Link>
            </li>
            <li>
              <Link href="/vendors" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm md:text-base">
                Vendors
              </Link>
            </li>
            <li>
              <Link href="/industry-insights" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm md:text-base">
                Industry Insights
              </Link>
            </li>
            <li>
              <Link href="/submit-property" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm md:text-base">
                Submit Property
              </Link>
            </li>
            {/* Advertise link hidden - will be implemented later */}
            {/* <li>
              <Link href="/advertise" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm md:text-base">
                Advertise
              </Link>
            </li> */}
            <li>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm md:text-base">
                About Us
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

