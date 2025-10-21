/**
 * Presence System for MessageAI
 * 
 * Manages user online/offline status and last seen timestamps
 */

import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Set user as online in Firestore
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function setOnline(userId) {
  try {
    const presenceRef = doc(db, 'presence', userId);
    await setDoc(presenceRef, {
      userId,
      isOnline: true,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    console.log(`✅ User ${userId} set to online`);
  } catch (error) {
    console.error('Error setting user online:', error);
    throw error;
  }
}

/**
 * Set user as offline in Firestore
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function setOffline(userId) {
  try {
    const presenceRef = doc(db, 'presence', userId);
    await setDoc(presenceRef, {
      userId,
      isOnline: false,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    console.log(`🔴 User ${userId} set to offline`);
  } catch (error) {
    console.error('Error setting user offline:', error);
    throw error;
  }
}

/**
 * Get user's presence status
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Presence object or null
 */
export async function getUserPresence(userId) {
  try {
    const presenceRef = doc(db, 'presence', userId);
    const presenceSnap = await getDoc(presenceRef);
    
    if (presenceSnap.exists()) {
      return {
        ...presenceSnap.data(),
        id: presenceSnap.id,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user presence:', error);
    return null;
  }
}

/**
 * Listen to a user's presence updates in real-time
 * @param {string} userId - User ID to listen to
 * @param {Function} callback - Callback function with presence data
 * @returns {Function} Unsubscribe function
 */
export function listenToPresence(userId, callback) {
  try {
    const presenceRef = doc(db, 'presence', userId);
    
    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        const presenceData = {
          ...snapshot.data(),
          id: snapshot.id,
        };
        callback(presenceData);
      } else {
        // User has no presence record - assume offline
        callback({
          userId,
          isOnline: false,
          lastSeen: null,
        });
      }
    }, (error) => {
      console.error('Error listening to presence:', error);
      callback({
        userId,
        isOnline: false,
        lastSeen: null,
      });
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to presence:', error);
    return () => {}; // Return empty unsubscribe function
  }
}

/**
 * Listen to multiple users' presence updates
 * @param {string[]} userIds - Array of user IDs to listen to
 * @param {Function} callback - Callback function with presence map
 * @returns {Function} Unsubscribe function that stops all listeners
 */
export function listenToMultiplePresences(userIds, callback) {
  const unsubscribes = [];
  const presenceMap = {};
  
  // Set up listener for each user
  userIds.forEach(userId => {
    const unsubscribe = listenToPresence(userId, (presenceData) => {
      presenceMap[userId] = presenceData;
      // Call callback with updated map
      callback({ ...presenceMap });
    });
    
    unsubscribes.push(unsubscribe);
  });
  
  // Return function that unsubscribes all listeners
  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
}

/**
 * Get presence status for multiple users (one-time fetch)
 * @param {string[]} userIds - Array of user IDs
 * @returns {Promise<Object>} Map of userId -> presence data
 */
export async function getMultiplePresences(userIds) {
  try {
    if (!userIds || userIds.length === 0) {
      return {};
    }
    
    // Firestore 'in' queries are limited to 10 items
    // Split into chunks if needed
    const chunkSize = 10;
    const chunks = [];
    
    for (let i = 0; i < userIds.length; i += chunkSize) {
      chunks.push(userIds.slice(i, i + chunkSize));
    }
    
    const presenceMap = {};
    
    for (const chunk of chunks) {
      const presenceQuery = query(
        collection(db, 'presence'),
        where('userId', 'in', chunk)
      );
      
      const snapshot = await getDocs(presenceQuery);
      
      snapshot.forEach(doc => {
        presenceMap[doc.id] = {
          ...doc.data(),
          id: doc.id,
        };
      });
    }
    
    // Fill in missing users with offline status
    userIds.forEach(userId => {
      if (!presenceMap[userId]) {
        presenceMap[userId] = {
          userId,
          isOnline: false,
          lastSeen: null,
        };
      }
    });
    
    return presenceMap;
  } catch (error) {
    console.error('Error getting multiple presences:', error);
    return {};
  }
}

/**
 * Update user's last activity timestamp
 * Used for tracking "last seen" even when user is still online
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function updateLastActivity(userId) {
  try {
    const presenceRef = doc(db, 'presence', userId);
    await setDoc(presenceRef, {
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating last activity:', error);
    // Non-critical error, don't throw
  }
}

