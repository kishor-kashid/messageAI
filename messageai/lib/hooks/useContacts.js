/**
 * useContacts Hook
 * 
 * Manages contact state with real-time Firestore sync and local database persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getContacts as getFirestoreContacts,
  addContact as addFirestoreContact,
  removeContact as removeFirestoreContact,
  searchUserByEmail,
  subscribeToContacts,
  isContact as checkIsContact,
} from '../firebase/firestore';
import {
  saveContact,
  getContacts as getLocalContacts,
  deleteContact as deleteLocalContact,
  searchContacts as searchLocalContacts,
  bulkSaveContacts,
} from '../database/contacts';

/**
 * Custom hook for contact management
 * @returns {Object} Contact state and functions
 */
export function useContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial contacts from local database, then sync with Firestore
  useEffect(() => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    let unsubscribe = null;

    async function initializeContacts() {
      try {
        setLoading(true);
        setError(null);

        // 1. Load from local database first (instant)
        const localContacts = await getLocalContacts();
        if (localContacts.length > 0) {
          setContacts(localContacts);
        }

        // 2. Subscribe to real-time updates from Firestore
        unsubscribe = subscribeToContacts(user.uid, async (firestoreContacts) => {
          // Update state with Firestore data
          setContacts(firestoreContacts);

          // Sync to local database
          if (firestoreContacts.length > 0) {
            try {
              await bulkSaveContacts(firestoreContacts);
            } catch (err) {
              console.error('Failed to sync contacts to local DB:', err);
            }
          }
        });

        setLoading(false);
      } catch (err) {
        console.error('Error initializing contacts:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    initializeContacts();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  /**
   * Add a new contact by email
   * @param {string} email - Email of user to add
   * @returns {Promise<Object>} Added contact user profile
   */
  const addContact = useCallback(async (email) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // 1. Search for user by email in Firestore
      const foundUser = await searchUserByEmail(email);
      
      if (!foundUser) {
        throw new Error('User not found');
      }

      // 2. Check if already a contact
      const alreadyContact = await checkIsContact(user.uid, foundUser.id);
      if (alreadyContact) {
        throw new Error('User is already in your contacts');
      }

      // 3. Add to Firestore (this will trigger real-time update)
      await addFirestoreContact(user.uid, foundUser.id);

      // 4. Save to local database
      await saveContact(foundUser);

      return foundUser;
    } catch (err) {
      console.error('Error adding contact:', err);
      throw err;
    }
  }, [user]);

  /**
   * Remove a contact
   * @param {string} contactId - Contact user ID to remove
   * @returns {Promise<void>}
   */
  const removeContact = useCallback(async (contactId) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // 1. Remove from Firestore (this will trigger real-time update)
      await removeFirestoreContact(user.uid, contactId);

      // 2. Remove from local database
      await deleteLocalContact(contactId);
    } catch (err) {
      console.error('Error removing contact:', err);
      throw err;
    }
  }, [user]);

  /**
   * Search contacts locally by name or email
   * @param {string} query - Search query
   * @returns {Promise<Array>} Filtered contacts
   */
  const searchContacts = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      return contacts;
    }

    try {
      // Search in local database for fast results
      const results = await searchLocalContacts(query);
      return results;
    } catch (err) {
      console.error('Error searching contacts:', err);
      // Fallback to in-memory search
      const lowerQuery = query.toLowerCase();
      return contacts.filter(contact => 
        contact.displayName?.toLowerCase().includes(lowerQuery) ||
        contact.email?.toLowerCase().includes(lowerQuery)
      );
    }
  }, [contacts]);

  /**
   * Refresh contacts from Firestore
   * @returns {Promise<void>}
   */
  const refreshContacts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const firestoreContacts = await getFirestoreContacts(user.uid);
      setContacts(firestoreContacts);
      
      // Sync to local database
      if (firestoreContacts.length > 0) {
        await bulkSaveContacts(firestoreContacts);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing contacts:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [user]);

  /**
   * Check if a user is in contacts
   * @param {string} userId - User ID to check
   * @returns {boolean} True if user is a contact
   */
  const isContact = useCallback((userId) => {
    return contacts.some(contact => contact.id === userId);
  }, [contacts]);

  return {
    contacts,
    loading,
    error,
    addContact,
    removeContact,
    searchContacts,
    refreshContacts,
    isContact,
  };
}


