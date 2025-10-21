/**
 * Authentication Context for MessageAI MVP
 * 
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useState, useEffect } from 'react';
import { subscribeToAuthState } from '../firebase/auth';
import { getUserProfile } from '../firebase/firestore';

export const AuthContext = createContext({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  refreshProfile: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to manually refresh user profile
  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (err) {
        console.error('Error refreshing profile:', err);
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          setUser(firebaseUser);
          
          // Fetch user profile from Firestore
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } else {
          // User is signed out
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    error,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

