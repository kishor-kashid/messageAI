/**
 * NotificationContext - Global notification management
 * 
 * Features:
 * - Global conversation listener
 * - App state tracking
 * - Current screen tracking
 * - Notification routing (local vs banner)
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { subscribeToConversations, getUserProfile } from '../firebase/firestore';

const NotificationContext = createContext({
  setCurrentScreen: () => {},
  bannerQueue: [],
  dismissBanner: () => {},
});

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState(null);
  const [bannerQueue, setBannerQueue] = useState([]);
  const appState = useRef(AppState.currentState);
  const lastMessageIds = useRef(new Set()); // Track seen messages

  // Listen to ALL conversations for new messages
  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribe = null;

    async function initializeNotifications() {
      try {
        console.log('📬 Initializing notification listener for user:', user.uid);

        unsubscribe = subscribeToConversations(user.uid, async (conversations) => {
          for (const conv of conversations) {
            // Check if there's a new message we haven't seen
            const lastMessage = conv.lastMessage;
            const lastMessageTimestamp = conv.lastMessageTimestamp;
            const lastMessageSenderId = conv.lastMessageSenderId;
            const lastMessageId = `${conv.id}_${lastMessageTimestamp}`;
            const unreadCount = conv.unreadCount?.[user.uid] || 0;
            
            if (lastMessage && 
                lastMessageSenderId !== user.uid && 
                !lastMessageIds.current.has(lastMessageId) &&
                unreadCount > 0) {
              
              // Mark as seen
              lastMessageIds.current.add(lastMessageId);
              
              // Determine if we should notify
              const isInThatChat = currentScreen === `chat_${conv.id}`;
              const isBackground = appState.current !== 'active';
              
              if (!isInThatChat) {
                let senderName = 'Someone';
                let senderPhoto = null;
                
                // For direct chats, fetch the other participant's profile
                if (conv.type === 'direct') {
                  const otherUserId = conv.participantIds?.find(id => id !== user.uid);
                  if (otherUserId) {
                    try {
                      const participantProfile = await getUserProfile(otherUserId);
                      senderName = participantProfile?.displayName || 'Someone';
                      senderPhoto = participantProfile?.photoURL || null;
                    } catch (err) {
                      console.error('Error fetching participant for notification:', err);
                    }
                  }
                } else if (conv.type === 'group') {
                  senderName = conv.groupName || 'Group Chat';
                  senderPhoto = conv.groupPhoto || null;
                }
                
                if (isBackground) {
                  // TODO: Trigger local notification (Phase 2)
                  console.log('📱 Would trigger local notification:', lastMessage);
                } else {
                  // Show in-app banner (foreground notification)
                  console.log('🔔 Showing in-app banner from:', senderName);
                  
                  setBannerQueue(prev => [...prev, {
                    id: lastMessageId,
                    conversationId: conv.id,
                    senderName,
                    senderPhoto,
                    message: lastMessage,
                    timestamp: Date.now(),
                  }]);
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    }

    initializeNotifications();

    // Monitor app state
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('📱 App state changed:', appState.current, '→', nextAppState);
      appState.current = nextAppState;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      subscription.remove();
    };
  }, [user?.uid, currentScreen]);

  // Auto-dismiss banners after 4 seconds
  useEffect(() => {
    if (bannerQueue.length > 0) {
      const timer = setTimeout(() => {
        console.log('⏱️ Auto-dismissing banner');
        setBannerQueue(prev => prev.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [bannerQueue]);

  const dismissBanner = (id) => {
    console.log('✕ Dismissing banner:', id);
    setBannerQueue(prev => prev.filter(b => b.id !== id));
  };

  const value = {
    setCurrentScreen,
    currentScreen,
    bannerQueue,
    dismissBanner,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);

