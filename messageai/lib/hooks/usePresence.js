/**
 * usePresence Hook
 * 
 * Custom hook for managing user presence (online/offline status)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  setOnline,
  setOffline,
  listenToPresence,
  listenToMultiplePresences,
} from '../firebase/presence';

/**
 * Hook to manage current user's presence
 * Automatically sets user online on mount and offline on unmount
 * @param {string} userId - Current user's ID
 * @returns {Object} Presence management functions
 */
export function useUserPresence(userId) {
  const [isOnline, setIsOnline] = useState(false);

  // Set user online
  const goOnline = useCallback(async () => {
    if (!userId) return;
    
    try {
      await setOnline(userId);
      setIsOnline(true);
    } catch (error) {
      console.error('Failed to set user online:', error);
    }
  }, [userId]);

  // Set user offline
  const goOffline = useCallback(async () => {
    if (!userId) return;
    
    try {
      await setOffline(userId);
      setIsOnline(false);
    } catch (error) {
      console.error('Failed to set user offline:', error);
    }
  }, [userId]);

  // Set online on mount, offline on unmount
  useEffect(() => {
    if (!userId) return;

    goOnline();

    // Cleanup: set offline when component unmounts
    return () => {
      goOffline();
    };
  }, [userId, goOnline, goOffline]);

  return {
    isOnline,
    goOnline,
    goOffline,
  };
}

/**
 * Hook to listen to another user's presence status
 * @param {string} userId - User ID to track
 * @returns {Object} Presence data with isOnline and lastSeen
 */
export function usePresence(userId) {
  const [presence, setPresence] = useState({
    isOnline: false,
    lastSeen: null,
  });

  useEffect(() => {
    if (!userId) {
      setPresence({ isOnline: false, lastSeen: null });
      return;
    }

    const unsubscribe = listenToPresence(userId, (presenceData) => {
      setPresence({
        isOnline: presenceData.isOnline || false,
        lastSeen: presenceData.lastSeen?.toMillis?.() || presenceData.lastSeen,
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  return presence;
}

/**
 * Hook to listen to multiple users' presence statuses
 * @param {string[]} userIds - Array of user IDs to track
 * @returns {Object} Map of userId -> presence data
 */
export function useMultiplePresences(userIds = []) {
  const [presences, setPresences] = useState({});

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setPresences({});
      return;
    }

    const unsubscribe = listenToMultiplePresences(userIds, (presenceMap) => {
      // Convert timestamps for easier use
      const processedMap = {};
      Object.keys(presenceMap).forEach(userId => {
        const presence = presenceMap[userId];
        processedMap[userId] = {
          isOnline: presence.isOnline || false,
          lastSeen: presence.lastSeen?.toMillis?.() || presence.lastSeen,
        };
      });
      
      setPresences(processedMap);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [JSON.stringify(userIds)]); // Use JSON.stringify to properly compare array changes

  return presences;
}

/**
 * Format last seen timestamp to human-readable string
 * @param {number|null} lastSeen - Last seen timestamp in milliseconds
 * @returns {string} Formatted string like "Active 5m ago"
 */
export function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Offline';
  
  const now = Date.now();
  const diff = now - lastSeen;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Active now';
  if (minutes < 60) return `Active ${minutes}m ago`;
  if (hours < 24) return `Active ${hours}h ago`;
  if (days === 1) return 'Active yesterday';
  if (days < 7) return `Active ${days}d ago`;
  
  return 'Offline';
}

