'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export type UserRole = 'seller' | 'buyer';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: UserRole;
  realtorId?: string; // For sellers who are also realtors
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  checkAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load user profile from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          setUserProfile(JSON.parse(savedProfile));
        } catch (e) {
          console.error('Error parsing saved profile:', e);
        }
      }
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Load or create user profile
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          try {
            const profile = JSON.parse(savedProfile);
            if (profile.uid === firebaseUser.uid) {
              setUserProfile(profile);
            } else {
              // Create new profile for this user
              const newProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || profile.displayName || null,
                role: profile.role || 'buyer'
              };
              setUserProfile(newProfile);
              localStorage.setItem('userProfile', JSON.stringify(newProfile));
            }
          } catch (e) {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || null,
              role: 'buyer'
            };
            setUserProfile(newProfile);
            localStorage.setItem('userProfile', JSON.stringify(newProfile));
          }
        } else {
          // Create default profile
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || null,
            role: 'buyer'
          };
          setUserProfile(newProfile);
          localStorage.setItem('userProfile', JSON.stringify(newProfile));
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem('userProfile');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase authentication is not configured. Please set up Firebase credentials in .env.local file. See AUTHENTICATION_SETUP.md for instructions.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, role: UserRole, displayName?: string) => {
    if (!auth) {
      throw new Error('Firebase authentication is not configured. Please set up Firebase credentials in .env.local file. See AUTHENTICATION_SETUP.md for instructions.');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile
    const profile: UserProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: displayName || userCredential.user.displayName || null,
      role: role
    };
    
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    // Update display name if provided
    if (displayName && userCredential.user) {
      // Note: updateProfile requires additional setup, skipping for now
    }
  };

  const signOutUser = async () => {
    if (!auth) {
      return;
    }
    await signOut(auth);
    setUserProfile(null);
    localStorage.removeItem('userProfile');
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase authentication is not configured. Please set up Firebase credentials in .env.local file. See AUTHENTICATION_SETUP.md for instructions.');
    }
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Create or update profile
    const savedProfile = localStorage.getItem('userProfile');
    let profile: UserProfile;
    
    if (savedProfile) {
      try {
        profile = JSON.parse(savedProfile);
        if (profile.uid !== userCredential.user.uid) {
          profile = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            role: 'buyer'
          };
        }
      } catch (e) {
        profile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          role: 'buyer'
        };
      }
    } else {
      profile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        role: 'buyer'
      };
    }
    
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const updateUserRole = async (role: UserRole) => {
    if (!userProfile) {
      throw new Error('User not logged in');
    }
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      role
    };
    
    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
  };

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
      const response = await fetch(`${API_BASE_URL}/admin/check`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[ADMIN CHECK] Response:', data);
        setIsAdmin(data.is_admin === true);
        if (!data.is_admin) {
          console.warn('[ADMIN CHECK] User is not admin. Email:', user.email);
          console.warn('[ADMIN CHECK] Admin emails configured:', data.admin_emails_configured);
        }
      } else {
        console.error('[ADMIN CHECK] Failed to check admin status:', response.status, response.statusText);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  // Check admin status when user changes
  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut: signOutUser,
    signInWithGoogle,
    updateUserRole,
    checkAdminStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

