/**
 * useMessages Hook
 * 
 * Manages messages in a conversation with real-time sync, optimistic updates, and local persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import {
  sendMessage as sendFirestoreMessage,
  getMessages as getFirestoreMessages,
  subscribeToMessages,
  updateMessageStatus,
  markMessagesAsRead,
} from '../firebase/firestore';
import {
  saveMessage,
  getMessages as getLocalMessages,
  updateMessageStatus as updateLocalMessageStatus,
  bulkSaveMessages,
} from '../database/messages';

/**
 * Custom hook for message management in a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Object} Message state and functions
 */
export function useMessages(conversationId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  
  // Keep track of optimistic messages
  const optimisticMessages = useRef(new Map());

  // Track which messages have been marked as delivered to prevent duplicate updates
  const deliveredMessages = useRef(new Set());
  
  // Keep reference to latest Firestore messages
  const firestoreMessagesRef = useRef([]);

  // Helper function to merge Firestore and optimistic messages
  const updateMessages = useCallback(() => {
    const firestoreMessages = firestoreMessagesRef.current;
    const optimisticArray = Array.from(optimisticMessages.current.values());
    
    // Clear all optimistic messages that have been confirmed in Firestore
    // Match by content and senderId since IDs are different
    optimisticArray.forEach(optMsg => {
      const matchingFirestoreMsg = firestoreMessages.find(
        fm => fm.senderId === optMsg.senderId && 
              fm.content === optMsg.content && 
              Math.abs(fm.timestamp - optMsg.timestamp) < 5000 // Within 5 seconds
      );
      if (matchingFirestoreMsg) {
        optimisticMessages.current.delete(optMsg.id);
      }
    });
    
    // Start with Firestore messages
    const allMessages = [...firestoreMessages];
    
    // Add remaining optimistic messages (ones not yet in Firestore)
    const remainingOptimistic = Array.from(optimisticMessages.current.values());
    remainingOptimistic.forEach(optMsg => {
      allMessages.push(optMsg);
    });
    
    // Deduplicate by ID (in case of race conditions)
    const seen = new Set();
    const uniqueMessages = allMessages.filter(msg => {
      if (seen.has(msg.id)) {
        return false;
      }
      seen.add(msg.id);
      return true;
    });
    
    // Sort by timestamp
    uniqueMessages.sort((a, b) => a.timestamp - b.timestamp);
    
    // Update state
    setMessages(uniqueMessages);
  }, []);

  // Load initial messages from local database, then sync with Firestore
  useEffect(() => {
    if (!conversationId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let unsubscribe = null;
    const currentUserId = user.uid; // Capture user ID to avoid stale closure

    async function initializeMessages() {
      try {
        setLoading(true);
        setError(null);

        // 1. Load from local database first (instant)
        const localMessages = await getLocalMessages(conversationId);
        if (localMessages.length > 0) {
          setMessages(localMessages);
        }

        // 2. Subscribe to real-time updates from Firestore
        unsubscribe = subscribeToMessages(conversationId, async (firestoreMessages) => {
          // Store latest Firestore messages
          firestoreMessagesRef.current = firestoreMessages;
          
          // Merge and update state
          updateMessages();

          // Sync to local database (fire and forget)
          if (firestoreMessages.length > 0) {
            bulkSaveMessages(firestoreMessages).catch(err => {
              console.error('Failed to sync messages to local DB:', err);
            });
          }
          
          // Mark received messages as delivered (only once per message)
          const undeliveredMessages = firestoreMessages.filter(
            msg => msg.senderId !== currentUserId && 
                   msg.status === 'sent' && 
                   !deliveredMessages.current.has(msg.id)
          );
          
          if (undeliveredMessages.length > 0) {
            // Mark as processing to prevent duplicate updates
            undeliveredMessages.forEach(msg => deliveredMessages.current.add(msg.id));
            
            // Update status in background (fire and forget)
            undeliveredMessages.forEach(msg => {
              updateMessageStatus(conversationId, msg.id, 'delivered').catch(err => {
                console.error('Failed to update message status:', err);
                // Remove from set on error so it can be retried
                deliveredMessages.current.delete(msg.id);
              });
            });
          }
        });

        setLoading(false);
      } catch (err) {
        console.error('Error initializing messages:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    initializeMessages();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [conversationId, user, updateMessages]);

  /**
   * Send a message with optimistic UI update
   * @param {string} content - Message text content
   * @returns {Promise<Object>} Sent message object
   */
  const sendMessage = useCallback(async (content) => {
    if (!user || !conversationId) {
      throw new Error('User or conversation not available');
    }

    if (!content || content.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    setSending(true);

    // Create optimistic message
    const optimisticId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage = {
      id: optimisticId,
      conversationId,
      senderId: user.uid,
      content: content.trim(),
      type: 'text',
      timestamp: Date.now(),
      status: 'sending',
      metadata: null,
    };

    try {
      // 1. Add optimistic message and update UI
      optimisticMessages.current.set(optimisticId, optimisticMessage);
      updateMessages(); // Triggers immediate UI update

      // 2. Save to local database
      await saveMessage(optimisticMessage);

      // 3. Send to Firestore
      const sentMessage = await sendFirestoreMessage({
        conversationId,
        senderId: user.uid,
        content: content.trim(),
        type: 'text',
      });

      // 4. Remove optimistic message (Firestore subscription will add real one)
      optimisticMessages.current.delete(optimisticId);

      // 5. Update local database with real message
      await saveMessage(sentMessage);

      setSending(false);
      return sentMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Mark optimistic message as failed
      const failedMessage = { ...optimisticMessage, status: 'failed' };
      optimisticMessages.current.set(optimisticId, failedMessage);
      updateMessages(); // Update UI with failed status
      
      await updateLocalMessageStatus(optimisticId, 'failed');
      
      setSending(false);
      throw err;
    }
  }, [user, conversationId, updateMessages]);

  /**
   * Mark messages as read
   * @param {Array<string>} messageIds - Array of message IDs
   * @returns {Promise<void>}
   */
  const markAsRead = useCallback(async (messageIds) => {
    if (!conversationId || messageIds.length === 0) return;

    try {
      await markMessagesAsRead(conversationId, messageIds);
      
      // Update local database
      for (const messageId of messageIds) {
        await updateLocalMessageStatus(messageId, 'read');
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [conversationId]);

  /**
   * Retry sending a failed message
   * @param {string} messageId - Failed message ID
   * @returns {Promise<void>}
   */
  const retryMessage = useCallback(async (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || message.status !== 'failed') return;

    try {
      // Update status to sending in optimistic ref
      optimisticMessages.current.set(messageId, { ...message, status: 'sending' });
      updateMessages();

      // Try sending again
      const sentMessage = await sendFirestoreMessage({
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        type: message.type || 'text',
      });

      // Remove from optimistic (Firestore subscription will add real one)
      optimisticMessages.current.delete(messageId);

      await saveMessage(sentMessage);
    } catch (err) {
      console.error('Error retrying message:', err);
      
      // Mark as failed again
      optimisticMessages.current.set(messageId, { ...message, status: 'failed' });
      updateMessages();
      
      throw err;
    }
  }, [messages, conversationId, updateMessages]);

  /**
   * Load more messages (pagination)
   * @returns {Promise<void>}
   */
  const loadMore = useCallback(async () => {
    // TODO: Implement pagination
    // For MVP, we load all messages at once (limited to 50)
  }, []);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    markAsRead,
    retryMessage,
    loadMore,
  };
}

