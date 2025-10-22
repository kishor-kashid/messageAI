/**
 * useAuth Hook for MessageAI MVP
 * 
 * Provides easy access to authentication state and methods
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  signUpWithEmail as firebaseSignUp,
  signInWithEmail as firebaseSignIn,
  signOut as firebaseSignOut,
} from '../firebase/auth';
import { createUserProfile, updateUserProfile } from '../firebase/firestore';
import { uploadProfilePicture } from '../firebase/storage';

/**
 * Custom hook to access authentication
 * @returns {Object} Authentication state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, userProfile, loading, error, refreshProfile, logout } = context;

  /**
   * Sign up a new user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} User object
   */
  const signUp = async (email, password) => {
    try {
      const user = await firebaseSignUp(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Sign in an existing user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} User object
   */
  const signIn = async (email, password) => {
    try {
      const user = await firebaseSignIn(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    try {
      await firebaseSignOut();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Complete user profile setup (onboarding)
   * @param {string} userId
   * @param {Object} profileData - { displayName, profilePictureUri }
   * @returns {Promise<void>}
   */
  const completeProfile = async (userId, profileData) => {
    try {
      const { displayName, profilePictureUri } = profileData;

      // Upload profile picture if provided
      let profilePictureUrl = null;
      if (profilePictureUri) {
        profilePictureUrl = await uploadProfilePicture(userId, profilePictureUri);
      }

      // Create user profile in Firestore
      await createUserProfile(userId, {
        email: user.email,
        displayName,
        photoURL: profilePictureUrl || '',
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Update user profile
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>}
   */
  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // If updating profile picture, upload it first
      if (updates.profilePictureUri) {
        const profilePictureUrl = await uploadProfilePicture(
          user.uid,
          updates.profilePictureUri
        );
        updates.photoURL = profilePictureUrl;
        delete updates.profilePictureUri;
      }

      await updateUserProfile(user.uid, updates);
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    logout: logout || signOut, // Support both logout and signOut
    completeProfile,
    updateProfile,
    refreshProfile,
  };
}

