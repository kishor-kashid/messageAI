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
import { addToQueue, getQueuedMessagesForConversation } from '../sync/offlineQueue';
import { checkIsOnline } from './useNetworkStatus';
import { detectLanguage } from '../api/aiService';

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
   * @param {string} content - Message text content (optional if imageUrl provided)
   * @param {string} imageUrl - Image URL (optional)
   * @returns {Promise<Object>} Sent message object
   */
  const sendMessage = useCallback(async (content, imageUrl = null) => {
    if (!user || !conversationId) {
      throw new Error('User or conversation not available');
    }

    // At least one of content or imageUrl must be provided
    if ((!content || content.trim() === '') && !imageUrl) {
      throw new Error('Message cannot be empty');
    }

    setSending(true);

    // Detect language if content is provided (don't block sending on detection failure)
    let detectedLanguage = 'en'; // Default to English
    if (content && content.trim().length > 0) {
      try {
        const languageResult = await detectLanguage(content.trim());
        detectedLanguage = languageResult.languageCode || 'en';
        console.log(`🌍 Detected language: ${detectedLanguage}`);
      } catch (err) {
        console.warn('Language detection failed, defaulting to English:', err);
        // Continue with default language rather than failing the send
      }
    }

    // Create optimistic message
    const optimisticId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage = {
      id: optimisticId,
      conversationId,
      senderId: user.uid,
      content: content ? content.trim() : '', // Always use empty string, never null
      imageUrl: imageUrl || null,
      type: imageUrl ? 'image' : 'text',
      detected_language: detectedLanguage,
      timestamp: Date.now(),
      status: 'sending',
      metadata: null,
      tempId: optimisticId,
    };

    try {
      // 1. Add optimistic message and update UI
      optimisticMessages.current.set(optimisticId, optimisticMessage);
      updateMessages(); // Triggers immediate UI update

      // 2. Save to local database
      await saveMessage(optimisticMessage);

      // 3. Check network status
      const isOnline = await checkIsOnline();

      if (!isOnline) {
        // If offline, add to queue and update status
        console.log('📴 Offline - queueing message');
        await addToQueue(optimisticMessage);
        
        // Update message status to queued
        const queuedMessage = { ...optimisticMessage, status: 'queued' };
        optimisticMessages.current.set(optimisticId, queuedMessage);
        await updateLocalMessageStatus(optimisticId, 'queued');
        updateMessages();
        
        setSending(false);
        return queuedMessage;
      }

      // 4. If online, send to Firestore
      const sentMessage = await sendFirestoreMessage({
        conversationId,
        senderId: user.uid,
        content: content ? content.trim() : '', // Use empty string, never null
        imageUrl: imageUrl || null,
        type: imageUrl ? 'image' : 'text',
        detected_language: detectedLanguage,
      });

      // 5. Remove optimistic message (Firestore subscription will add real one)
      optimisticMessages.current.delete(optimisticId);

      // 6. Update local database with real message
      await saveMessage(sentMessage);

      setSending(false);
      return sentMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Check if it's a network error
      const isNetworkError = err.message?.includes('network') || 
                             err.code === 'unavailable' ||
                             err.code === 'failed-precondition';
      
      if (isNetworkError) {
        // Queue the message for later
        console.log('📴 Network error - queueing message');
        await addToQueue(optimisticMessage);
        
        const queuedMessage = { ...optimisticMessage, status: 'queued' };
        optimisticMessages.current.set(optimisticId, queuedMessage);
        await updateLocalMessageStatus(optimisticId, 'queued');
        updateMessages();
        
        setSending(false);
        return queuedMessage;
      }
      
      // Mark optimistic message as failed for other errors
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
   * @param {Object} conversation - Conversation object (needed for group read tracking)
   * @returns {Promise<void>}
   */
  const markAsRead = useCallback(async (messageIds, conversation) => {
    if (!user || !conversationId || messageIds.length === 0) return;

    try {
      await markMessagesAsRead(conversationId, messageIds, user.uid, conversation);
      
      // Update local database
      for (const messageId of messageIds) {
        await updateLocalMessageStatus(messageId, 'read');
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [user, conversationId]);

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

