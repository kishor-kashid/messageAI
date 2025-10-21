/**
 * useConversations Hook
 * 
 * Manages conversation state with real-time Firestore sync and local database persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getConversations as getFirestoreConversations,
  createConversation as createFirestoreConversation,
  subscribeToConversations,
  findConversationByParticipants,
  updateConversationLastMessage,
  deleteConversation as deleteFirestoreConversation,
  getConversationById as getFirestoreConversationById,
  getUserProfile,
} from '../firebase/firestore';
import {
  saveConversation,
  getConversations as getLocalConversations,
  getConversationById as getLocalConversationById,
  updateLastMessage as updateLocalLastMessage,
  deleteConversation as deleteLocalConversation,
  bulkSaveConversations,
} from '../database/conversations';
import { getUserPresence } from '../firebase/presence';

/**
 * Custom hook for conversation management
 * @returns {Object} Conversation state and functions
 */
export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial conversations from local database, then sync with Firestore
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    let unsubscribe = null;

    async function initializeConversations() {
      try {
        setLoading(true);
        setError(null);

        // 1. Load from local database first (instant)
        const localConversations = await getLocalConversations();
        if (localConversations.length > 0) {
          setConversations(localConversations);
        }

        // 2. Subscribe to real-time updates from Firestore
        unsubscribe = subscribeToConversations(user.uid, async (firestoreConversations) => {
          // Enrich conversations with participant details
          const enrichedConversations = await Promise.all(
            firestoreConversations.map(async (conv) => {
              // Extract user-specific unread count
              const userUnreadCount = conv.unreadCount?.[user.uid] || 0;
              
              // Get other participant details for direct chats
              if (conv.type === 'direct') {
                const otherParticipantId = conv.participantIds.find(id => id !== user.uid);
                if (otherParticipantId) {
                  try {
                    const participantProfile = await getUserProfile(otherParticipantId);
                    const presenceData = await getUserPresence(otherParticipantId);
                    
                    return {
                      ...conv,
                      otherParticipant: {
                        ...participantProfile,
                        isOnline: presenceData?.isOnline || false,
                        lastSeen: presenceData?.lastSeen?.toMillis?.() || presenceData?.lastSeen,
                      },
                      unreadCount: userUnreadCount, // User-specific count
                    };
                  } catch (err) {
                    console.error('Error fetching participant:', err);
                  }
                }
              }
              return {
                ...conv,
                unreadCount: userUnreadCount, // User-specific count
              };
            })
          );

          // Update state with Firestore data
          setConversations(enrichedConversations);

          // Sync to local database
          if (enrichedConversations.length > 0) {
            try {
              await bulkSaveConversations(enrichedConversations);
            } catch (err) {
              console.error('Failed to sync conversations to local DB:', err);
            }
          }
        });

        setLoading(false);
      } catch (err) {
        console.error('Error initializing conversations:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    initializeConversations();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  /**
   * Create or find existing conversation with a user
   * @param {string} otherUserId - Other user's ID
   * @returns {Promise<Object>} Conversation object
   */
  const createOrFindConversation = useCallback(async (otherUserId) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const participantIds = [user.uid, otherUserId].sort();
      
      // Check if conversation already exists
      let conversation = await findConversationByParticipants(participantIds);
      
      if (!conversation) {
        // Create new conversation
        conversation = await createFirestoreConversation(participantIds, 'direct');
        
        // Get other user's profile
        const otherUserProfile = await getUserProfile(otherUserId);
        conversation.otherParticipant = otherUserProfile;
        
        // Save to local database
        await saveConversation(conversation);
      }
      
      return conversation;
    } catch (err) {
      console.error('Error creating/finding conversation:', err);
      throw err;
    }
  }, [user]);

  /**
   * Create a group conversation
   * @param {Array<string>} participantIds - Array of participant user IDs
   * @param {string} groupName - Group name
   * @returns {Promise<Object>} Conversation object
   */
  const createGroupConversation = useCallback(async (participantIds, groupName) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Include current user in participants
      const allParticipants = [...new Set([user.uid, ...participantIds])];
      
      if (allParticipants.length < 3) {
        throw new Error('Group conversations need at least 3 participants');
      }

      // Create group conversation
      const conversation = await createFirestoreConversation(allParticipants, 'group', groupName);
      
      // Save to local database
      await saveConversation(conversation);
      
      return conversation;
    } catch (err) {
      console.error('Error creating group conversation:', err);
      throw err;
    }
  }, [user]);

  /**
   * Get conversation by ID
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object|null>} Conversation object or null
   */
  const getConversation = useCallback(async (conversationId) => {
    try {
      // Try local database first
      let conversation = await getLocalConversationById(conversationId);
      
      if (!conversation) {
        // Fetch from Firestore
        conversation = await getFirestoreConversationById(conversationId);
        
        if (conversation) {
          // Save to local database
          await saveConversation(conversation);
        }
      }
      
      return conversation;
    } catch (err) {
      console.error('Error getting conversation:', err);
      return null;
    }
  }, []);

  /**
   * Delete a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<void>}
   */
  const deleteConversation = useCallback(async (conversationId) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Delete from Firestore (soft delete)
      await deleteFirestoreConversation(conversationId);
      
      // Delete from local database
      await deleteLocalConversation(conversationId);
    } catch (err) {
      console.error('Error deleting conversation:', err);
      throw err;
    }
  }, [user]);

  /**
   * Update conversation's last message
   * @param {string} conversationId - Conversation ID
   * @param {string} lastMessage - Last message text
   * @param {number} timestamp - Message timestamp
   * @returns {Promise<void>}
   */
  const updateLastMessage = useCallback(async (conversationId, lastMessage, timestamp) => {
    try {
      // Update in Firestore
      await updateConversationLastMessage(conversationId, lastMessage, timestamp);
      
      // Update in local database
      await updateLocalLastMessage(conversationId, lastMessage, timestamp);
    } catch (err) {
      console.error('Error updating last message:', err);
      throw err;
    }
  }, []);

  /**
   * Refresh conversations from Firestore
   * @returns {Promise<void>}
   */
  const refreshConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const firestoreConversations = await getFirestoreConversations(user.uid);
      
      // Enrich with participant details
      const enrichedConversations = await Promise.all(
        firestoreConversations.map(async (conv) => {
          if (conv.type === 'direct') {
            const otherParticipantId = conv.participantIds.find(id => id !== user.uid);
            if (otherParticipantId) {
              try {
                const participantProfile = await getUserProfile(otherParticipantId);
                const presenceData = await getUserPresence(otherParticipantId);
                
                return {
                  ...conv,
                  otherParticipant: {
                    ...participantProfile,
                    isOnline: presenceData?.isOnline || false,
                    lastSeen: presenceData?.lastSeen?.toMillis?.() || presenceData?.lastSeen,
                  },
                };
              } catch (err) {
                console.error('Error fetching participant:', err);
              }
            }
          }
          return conv;
        })
      );
      
      setConversations(enrichedConversations);
      
      // Sync to local database
      if (enrichedConversations.length > 0) {
        await bulkSaveConversations(enrichedConversations);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing conversations:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [user]);

  return {
    conversations,
    loading,
    error,
    createOrFindConversation,
    createGroupConversation,
    getConversation,
    deleteConversation,
    updateLastMessage,
    refreshConversations,
  };
}

