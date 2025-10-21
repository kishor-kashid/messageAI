/**
 * Offline Queue System for MessageAI
 * 
 * Manages queuing of messages when offline and syncing when back online
 */

import { openDatabaseSync } from 'expo-sqlite';

let db = null;
let isSQLiteAvailable = false;

// Initialize database connection
try {
  db = openDatabaseSync('messageai.db');
  isSQLiteAvailable = true;
} catch (error) {
  console.error('SQLite initialization error:', error);
  isSQLiteAvailable = false;
}

/**
 * Initialize the offline queue table
 * @returns {Promise<void>}
 */
export async function initializeOfflineQueue() {
  if (!isSQLiteAvailable) return Promise.resolve();

  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS offline_queue (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        senderId TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        tempId TEXT NOT NULL,
        retryCount INTEGER DEFAULT 0,
        lastRetryAt INTEGER,
        error TEXT,
        createdAt INTEGER NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_offline_queue_timestamp ON offline_queue(timestamp);
      CREATE INDEX IF NOT EXISTS idx_offline_queue_conversation ON offline_queue(conversationId);
    `);
    
    console.log('✅ Offline queue initialized');
  } catch (error) {
    console.error('Error initializing offline queue:', error);
    throw error;
  }
}

/**
 * Add a message to the offline queue
 * @param {Object} message - Message object
 * @returns {Promise<void>}
 */
export async function addToQueue(message) {
  if (!isSQLiteAvailable) return Promise.resolve();

  try {
    const now = Date.now();
    
    db.runSync(
      `INSERT INTO offline_queue 
       (id, conversationId, senderId, content, timestamp, tempId, retryCount, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        message.id,
        message.conversationId,
        message.senderId,
        message.content,
        message.timestamp,
        message.tempId || message.id,
        0,
        now,
      ]
    );
    
    console.log(`✅ Message added to offline queue: ${message.id}`);
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
}

/**
 * Get all queued messages
 * @returns {Promise<Array>} Array of queued messages
 */
export async function getQueuedMessages() {
  if (!isSQLiteAvailable) return Promise.resolve([]);

  try {
    const messages = db.getAllSync(
      `SELECT * FROM offline_queue ORDER BY timestamp ASC;`
    );
    
    return messages || [];
  } catch (error) {
    console.error('Error getting queued messages:', error);
    return [];
  }
}

/**
 * Get queued messages for a specific conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} Array of queued messages
 */
export async function getQueuedMessagesForConversation(conversationId) {
  if (!isSQLiteAvailable) return Promise.resolve([]);

  try {
    const messages = db.getAllSync(
      `SELECT * FROM offline_queue WHERE conversationId = ? ORDER BY timestamp ASC;`,
      [conversationId]
    );
    
    return messages || [];
  } catch (error) {
    console.error('Error getting queued messages for conversation:', error);
    return [];
  }
}

/**
 * Remove a message from the queue after successful sync
 * @param {string} messageId - Message ID
 * @returns {Promise<void>}
 */
export async function removeFromQueue(messageId) {
  if (!isSQLiteAvailable) return Promise.resolve();

  try {
    const result = db.runSync(
      `DELETE FROM offline_queue WHERE id = ?;`,
      [messageId]
    );
    
    if (result.changes > 0) {
      console.log(`✅ Message removed from queue: ${messageId}`);
    }
  } catch (error) {
    console.error('Error removing from queue:', error);
    throw error;
  }
}

/**
 * Update retry count for a message
 * @param {string} messageId - Message ID
 * @param {string} [error] - Error message if retry failed
 * @returns {Promise<void>}
 */
export async function incrementRetryCount(messageId, error = null) {
  if (!isSQLiteAvailable) return Promise.resolve();

  try {
    const now = Date.now();
    
    db.runSync(
      `UPDATE offline_queue 
       SET retryCount = retryCount + 1, lastRetryAt = ?, error = ?
       WHERE id = ?;`,
      [now, error, messageId]
    );
    
    console.log(`⚠️ Retry count incremented for message: ${messageId}`);
  } catch (error) {
    console.error('Error incrementing retry count:', error);
  }
}

/**
 * Get queue statistics
 * @returns {Promise<Object>} Queue stats
 */
export async function getQueueStats() {
  if (!isSQLiteAvailable) return Promise.resolve({ total: 0, failedRetries: 0 });

  try {
    const result = db.getFirstSync(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN retryCount > 0 THEN 1 ELSE 0 END) as failedRetries
       FROM offline_queue;`
    );
    
    return result || { total: 0, failedRetries: 0 };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return { total: 0, failedRetries: 0 };
  }
}

/**
 * Clear all messages from the queue (use with caution)
 * @returns {Promise<void>}
 */
export async function clearQueue() {
  if (!isSQLiteAvailable) return Promise.resolve();

  try {
    db.runSync(`DELETE FROM offline_queue;`);
    console.log('✅ Offline queue cleared');
  } catch (error) {
    console.error('Error clearing queue:', error);
    throw error;
  }
}

/**
 * Check if a message is in the queue
 * @param {string} messageId - Message ID
 * @returns {Promise<boolean>}
 */
export async function isMessageQueued(messageId) {
  if (!isSQLiteAvailable) return Promise.resolve(false);

  try {
    const result = db.getFirstSync(
      `SELECT id FROM offline_queue WHERE id = ?;`,
      [messageId]
    );
    
    return !!result;
  } catch (error) {
    console.error('Error checking if message is queued:', error);
    return false;
  }
}

