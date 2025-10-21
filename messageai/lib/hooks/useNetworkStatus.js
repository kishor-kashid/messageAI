/**
 * useNetworkStatus Hook
 * 
 * Monitors network connectivity status
 */

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook to monitor network status
 * @returns {Object} Network status
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable ?? true);
      setConnectionType(state.type);
      
      console.log('📶 Initial network status:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasConnected = isConnected;
      const nowConnected = state.isConnected ?? true;
      
      setIsConnected(nowConnected);
      setIsInternetReachable(state.isInternetReachable ?? true);
      setConnectionType(state.type);

      // Log status changes
      if (!wasConnected && nowConnected) {
        console.log('✅ Back online:', state.type);
      } else if (wasConnected && !nowConnected) {
        console.log('❌ Went offline');
      }
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [isConnected]);

  return {
    isConnected,
    isInternetReachable,
    connectionType,
    isOnline: isConnected && isInternetReachable,
  };
}

/**
 * Check if device is currently online
 * @returns {Promise<boolean>}
 */
export async function checkIsOnline() {
  try {
    const state = await NetInfo.fetch();
    return (state.isConnected ?? true) && (state.isInternetReachable ?? true);
  } catch (error) {
    console.error('Error checking online status:', error);
    return true; // Assume online if check fails
  }
}

