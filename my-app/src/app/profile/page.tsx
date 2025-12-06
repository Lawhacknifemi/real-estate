'use client';

import PageLayout from '@/components/PageLayout';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, userProfile, updateUserRole, signOut } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRoleChange = async (newRole: 'buyer' | 'seller') => {
    if (!userProfile || userProfile.role === newRole) return;

    setIsUpdating(true);
    setMessage(null);

    try {
      await updateUserRole(newRole);
      setMessage({ type: 'success', text: `Your account has been updated to ${newRole === 'seller' ? 'Seller' : 'Buyer'}.` });
      
      // If switching to seller, redirect to submit property page
      if (newRole === 'seller') {
        setTimeout(() => {
          router.push('/submit-property');
        }, 1500);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update role. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user || !userProfile) {
    return (
      <PageLayout>
        <section className="py-20 bg-gray-50 min-h-[calc(100vh-200px)] flex items-center">
          <div className="container mx-auto px-4 max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log In
            </Link>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="py-12 bg-gray-50 min-h-[calc(100vh-200px)]">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            {/* User Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{userProfile.displayName || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{userProfile.email || user.email || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <p className="text-gray-900 capitalize font-semibold">
                    {userProfile.role === 'seller' ? '🏠 Seller' : '🛒 Buyer'}
                  </p>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Change Account Type</h2>
              <p className="text-gray-600 mb-4">
                Switch between Buyer and Seller roles. Sellers can list properties, while Buyers can purchase them.
              </p>

              {message && (
                <div className={`mb-4 px-4 py-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleRoleChange('buyer')}
                  disabled={isUpdating || userProfile.role === 'buyer'}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    userProfile.role === 'buyer'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-3xl mb-2">🛒</div>
                  <h3 className="font-bold text-gray-900 mb-2">Buyer</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Browse and purchase properties
                  </p>
                  {userProfile.role === 'buyer' && (
                    <span className="text-sm text-blue-600 font-medium">Current Role</span>
                  )}
                </button>

                <button
                  onClick={() => handleRoleChange('seller')}
                  disabled={isUpdating || userProfile.role === 'seller'}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    userProfile.role === 'seller'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-3xl mb-2">🏠</div>
                  <h3 className="font-bold text-gray-900 mb-2">Seller</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    List and manage your properties
                  </p>
                  {userProfile.role === 'seller' && (
                    <span className="text-sm text-blue-600 font-medium">Current Role</span>
                  )}
                </button>
              </div>

              {isUpdating && (
                <div className="mt-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Updating...</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {userProfile.role === 'seller' && (
                  <>
                    <Link
                      href="/submit-property"
                      className="block w-full text-center bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Submit a Property
                    </Link>
                    <Link
                      href="/my-listings"
                      className="block w-full text-center bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      My Listings
                    </Link>
                  </>
                )}
                <Link
                  href="/listings"
                  className="block w-full text-center bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Browse Properties
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    router.push('/');
                  }}
                  className="block w-full text-center bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}



