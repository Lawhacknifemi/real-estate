'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'seller' | 'buyer';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole && userProfile?.role !== requiredRole) {
        // Redirect based on role mismatch
        if (requiredRole === 'seller' && userProfile?.role === 'buyer') {
          alert('This page is for sellers only. Please update your account type to list properties.');
          router.push('/');
        } else {
          router.push('/');
        }
      }
    }
  }, [user, userProfile, loading, requiredRole, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    return null; // Will redirect
  }

  return <>{children}</>;
}



