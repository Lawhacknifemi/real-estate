'use client';

import PageLayout from '@/components/PageLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/contexts/AuthContext';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(true);

  useEffect(() => {
    setFirebaseConfigured(isFirebaseConfigured());
  }, []);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'buyer' as UserRole,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          setIsLoading(false);
          return;
        }

        const displayName = `${formData.firstName} ${formData.lastName}`.trim();
        await signUp(formData.email, formData.password, formData.role, displayName || undefined);
        router.push('/');
      } else {
        await signIn(formData.email, formData.password);
        router.push('/');
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed. Please try again.');
      console.error('Google auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <section className="py-20 bg-gray-50 min-h-[calc(100vh-200px)] flex items-center">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Toggle between Login and Sign Up */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 font-medium transition-colors border-b-2 ${
                  isLogin
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 font-medium transition-colors border-b-2 ${
                  !isLogin
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>

            {!firebaseConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
                <p className="font-semibold mb-2">⚠️ Firebase Authentication Not Configured</p>
                <p className="text-sm mb-2">
                  To enable authentication features, you need to set up Firebase credentials.
                </p>
                <p className="text-sm">
                  <strong>Quick Setup:</strong>
                </p>
                <ol className="text-sm list-decimal list-inside mt-2 space-y-1">
                  <li>Create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file in the <code className="bg-yellow-100 px-1 rounded">my-app</code> directory</li>
                  <li>Add your Firebase configuration (see <code className="bg-yellow-100 px-1 rounded">.env.local.example</code> or <code className="bg-yellow-100 px-1 rounded">AUTHENTICATION_SETUP.md</code>)</li>
                  <li>Restart the development server</li>
                </ol>
                <p className="text-sm mt-2">
                  Without Firebase, you can still browse properties, but login and property submission features will be disabled.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required={!isLogin}
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required={!isLogin}
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-900 mb-3">
                      I want to: *
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        formData.role === 'buyer'
                          ? 'border-blue-600 bg-blue-100'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}>
                        <input
                          type="radio"
                          name="role"
                          value="buyer"
                          checked={formData.role === 'buyer'}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="text-2xl mb-1">🛒</div>
                          <div className="font-semibold text-sm text-gray-900">Buy Properties</div>
                        </div>
                      </label>
                      <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        formData.role === 'seller'
                          ? 'border-blue-600 bg-blue-100'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}>
                        <input
                          type="radio"
                          name="role"
                          value="seller"
                          checked={formData.role === 'seller'}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="text-2xl mb-1">🏠</div>
                          <div className="font-semibold text-sm text-gray-900">Sell/List Properties</div>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600">
                      {formData.role === 'buyer' 
                        ? '✓ Browse and purchase properties from sellers' 
                        : '✓ List and manage your properties for sale or lease'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      You can change this later in your profile settings.
                    </p>
                  </div>
                </>
              )}

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

              {!isLogin && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!isLogin && (
                  <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters</p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                </div>
              )}

              {!isLogin && (
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !firebaseConfigured}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {!firebaseConfigured 
                  ? 'Firebase Not Configured' 
                  : (isLoading ? 'Please wait...' : (isLogin ? 'Log In' : 'Create Account'))}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">Or continue with</p>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || !firebaseConfigured}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}



