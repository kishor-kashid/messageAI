/**
 * Message Sync System for MessageAI
 * 
 * Handles synchronization of offline messages to Firestore
 */

import { sendMessage as sendFirestoreMessage } from '../firebase/firestore';
import { saveMessage, deleteMessage } from '../database/messages';
import {
  getQueuedMessages,
  removeFromQueue,
  incrementRetryCount,
  getQueueStats,
} from './offlineQueue';

// Maximum retry attempts before giving up
const MAX_RETRY_ATTEMPTS = 3;

// Retry delay in milliseconds (exponential backoff)
const getRetryDelay = (retryCount) => {
  return Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
};

/**
 * Sync all queued messages to Firestore
 * @returns {Promise<Object>} Sync results
 */
export async function syncQueuedMessages() {
  try {
    const queuedMessages = await getQueuedMessages();
    
    if (queuedMessages.length === 0) {
      console.log('📭 No messages to sync');
      return { success: 0, failed: 0, skipped: 0 };
    }

    console.log(`📤 Syncing ${queuedMessages.length} queued messages...`);

    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    // Process messages sequentially to maintain order
    for (const queuedMsg of queuedMessages) {
      try {
        // Check if retry limit exceeded
        if (queuedMsg.retryCount >= MAX_RETRY_ATTEMPTS) {
          console.warn(`⚠️ Message ${queuedMsg.id} exceeded retry limit, skipping`);
          skippedCount++;
          continue;
        }

        // Send message to Firestore
        const result = await sendFirestoreMessage({
          conversationId: queuedMsg.conversationId,
          senderId: queuedMsg.senderId,
          content: queuedMsg.content,
          type: 'text',
        });

        if (result) {
          // Delete old temp message from local database
          await deleteMessage(queuedMsg.id);
          
          // Save new message with Firestore ID
          await saveMessage({
            ...result,
            status: 'sent',
          });

          // Remove from queue
          await removeFromQueue(queuedMsg.id);
          
          successCount++;
          console.log(`✅ Synced message: ${queuedMsg.id}`);
        }
      } catch (error) {
        console.error(`❌ Failed to sync message ${queuedMsg.id}:`, error);
        
        // Increment retry count
        await incrementRetryCount(queuedMsg.id, error.message);
        
        failedCount++;
      }
    }

    const stats = await getQueueStats();
    
    console.log(`📊 Sync complete: ${successCount} success, ${failedCount} failed, ${skippedCount} skipped`);
    console.log(`📊 Queue stats: ${stats.total} remaining, ${stats.failedRetries} with failed retries`);

    return {
      success: successCount,
      failed: failedCount,
      skipped: skippedCount,
      remaining: stats.total,
    };
  } catch (error) {
    console.error('Error syncing queued messages:', error);
    throw error;
  }
}

/**
 * Sync a single message by ID
 * @param {string} messageId - Message ID to sync
 * @returns {Promise<boolean>} Success status
 */
export async function syncMessage(messageId) {
  try {
    const queuedMessages = await getQueuedMessages();
    const message = queuedMessages.find(msg => msg.id === messageId);

    if (!message) {
      console.warn(`Message ${messageId} not found in queue`);
      return false;
    }

    // Check retry limit
    if (message.retryCount >= MAX_RETRY_ATTEMPTS) {
      console.warn(`Message ${messageId} exceeded retry limit`);
      return false;
    }

    // Send to Firestore
    const result = await sendFirestoreMessage({
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      type: 'text',
    });

    if (result) {
      // Delete old temp message from local database
      await deleteMessage(message.id);
      
      // Save new message with Firestore ID
      await saveMessage({
        ...result,
        status: 'sent',
      });

      // Remove from queue
      await removeFromQueue(message.id);
      
      console.log(`✅ Synced message: ${message.id}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Failed to sync message ${messageId}:`, error);
    await incrementRetryCount(messageId, error.message);
    return false;
  }
}

/**
 * Retry failed messages with exponential backoff
 * @returns {Promise<Object>} Retry results
 */
export async function retryFailedMessages() {
  try {
    const queuedMessages = await getQueuedMessages();
    const failedMessages = queuedMessages.filter(
      msg => msg.retryCount > 0 && msg.retryCount < MAX_RETRY_ATTEMPTS
    );

    if (failedMessages.length === 0) {
      console.log('No failed messages to retry');
      return { success: 0, failed: 0 };
    }

    console.log(`🔄 Retrying ${failedMessages.length} failed messages...`);

    let successCount = 0;
    let failedCount = 0;

    for (const message of failedMessages) {
      // Check if enough time has passed for retry
      const now = Date.now();
      const retryDelay = getRetryDelay(message.retryCount);
      const timeSinceLastRetry = now - (message.lastRetryAt || message.createdAt);

      if (timeSinceLastRetry < retryDelay) {
        console.log(`⏳ Skipping message ${message.id}, retry delay not met`);
        continue;
      }

      const success = await syncMessage(message.id);
      if (success) {
        successCount++;
      } else {
        failedCount++;
      }
    }

    console.log(`🔄 Retry complete: ${successCount} success, ${failedCount} failed`);

    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('Error retrying failed messages:', error);
    throw error;
  }
}

/**
 * Check if sync is needed
 * @returns {Promise<boolean>}
 */
export async function isSyncNeeded() {
  try {
    const stats = await getQueueStats();
    return stats.total > 0;
  } catch (error) {
    console.error('Error checking if sync is needed:', error);
    return false;
  }
}

