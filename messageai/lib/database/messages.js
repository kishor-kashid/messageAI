/**
 * Message Database Operations for MessageAI MVP
 * 
 * CRUD operations for messages in SQLite
 * 
 * NOTE: These operations are no-ops on web platform.
 * SQLite only works on native (iOS/Android).
 * 
 * Updated for expo-sqlite v16 API
 */

import { Platform } from 'react-native';
import { getDatabase } from './schema';

const isSQLiteAvailable = Platform.OS !== 'web';

/**
 * Save a message to local database
 * @param {Object} message - Message object
 * @param {string} message.id - Unique message ID
 * @param {string} message.conversationId - Conversation ID
 * @param {string} message.senderId - Sender user ID
 * @param {string} [message.content] - Message content (optional if imageUrl provided)
 * @param {string} [message.imageUrl] - Image URL (optional)
 * @param {number} message.timestamp - Message timestamp
 * @param {string} message.status - Message status (sent, delivered, read, pending, failed)
 * @param {string} [message.type='text'] - Message type (text, image, etc.)
 * @param {string} [message.detected_language='en'] - Detected language code
 * @param {Object} [message.metadata] - Additional metadata
 * @returns {Promise<void>}
 */
export async function saveMessage(message) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');
  
  const {
    id,
    conversationId,
    senderId,
    content = null,
    imageUrl = null,
    timestamp,
    status,
    type = 'text',
    detected_language = 'en',
    metadata = null,
  } = message;

  const metadataJson = metadata ? JSON.stringify(metadata) : null;
  const now = Date.now();
  // Use empty string instead of null for content to avoid NOT NULL constraint
  const contentValue = content || '';

  try {
    db.runSync(
      `INSERT OR REPLACE INTO messages 
       (id, conversationId, senderId, content, imageUrl, timestamp, status, type, detected_language, metadata, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [id, conversationId, senderId, contentValue, imageUrl, timestamp, status, type, detected_language, metadataJson, now]
    );
    console.log(`✅ Message saved: ${id}`);
  } catch (error) {
    console.error('❌ Error saving message:', error);
    throw error;
  }
}

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} [limit=50] - Number of messages to fetch
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Array>} Array of messages
 */
export async function getMessages(conversationId, limit = 50, offset = 0) {
  if (!isSQLiteAvailable) return Promise.resolve([]);
  
  const db = getDatabase();
  if (!db) return [];

  try {
    const rows = db.getAllSync(
      `SELECT * FROM messages 
       WHERE conversationId = ? 
       ORDER BY timestamp DESC 
       LIMIT ? OFFSET ?;`,
      [conversationId, limit, offset]
    );
    
    const messages = rows.map(row => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    }));
    
    console.log(`✅ Fetched ${messages.length} messages for conversation: ${conversationId}`);
    return messages;
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    throw error;
  }
}

/**
 * Get a single message by ID
 * @param {string} messageId - Message ID
 * @returns {Promise<Object|null>} Message object or null
 */
export async function getMessageById(messageId) {
  if (!isSQLiteAvailable) return Promise.resolve(null);
  
  const db = getDatabase();
  if (!db) return null;

  try {
    const row = db.getFirstSync(
      'SELECT * FROM messages WHERE id = ?;',
      [messageId]
    );
    
    if (row) {
      return {
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching message:', error);
    throw error;
  }
}

/**
 * Update message status
 * @param {string} messageId - Message ID
 * @param {string} status - New status (sent, delivered, read, failed)
 * @returns {Promise<void>}
 */
export async function updateMessageStatus(messageId, status) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');
  
  const now = Date.now();

  try {
    const result = db.runSync(
      'UPDATE messages SET status = ?, updatedAt = ? WHERE id = ?;',
      [status, now, messageId]
    );
    
    if (result.changes > 0) {
      console.log(`✅ Message status updated: ${messageId} -> ${status}`);
    } else {
      throw new Error('Message not found');
    }
  } catch (error) {
    console.error('❌ Error updating message status:', error);
    throw error;
  }
}

/**
 * Delete a message
 * @param {string} messageId - Message ID
 * @returns {Promise<void>}
 */
export async function deleteMessage(messageId) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');

  try {
    const result = db.runSync(
      'DELETE FROM messages WHERE id = ?;',
      [messageId]
    );
    
    if (result.changes > 0) {
      console.log(`✅ Message deleted: ${messageId}`);
    } else {
      throw new Error('Message not found');
    }
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    throw error;
  }
}

/**
 * Delete all messages in a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<void>}
 */
export async function deleteConversationMessages(conversationId) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');

  try {
    const result = db.runSync(
      'DELETE FROM messages WHERE conversationId = ?;',
      [conversationId]
    );
    console.log(`✅ Deleted ${result.changes} messages from conversation: ${conversationId}`);
  } catch (error) {
    console.error('❌ Error deleting conversation messages:', error);
    throw error;
  }
}

/**
 * Get pending messages (not yet synced to Firebase)
 * @returns {Promise<Array>} Array of pending messages
 */
export async function getPendingMessages() {
  if (!isSQLiteAvailable) return Promise.resolve([]);
  
  const db = getDatabase();
  if (!db) return [];

  try {
    const rows = db.getAllSync(
      `SELECT * FROM messages 
       WHERE status = 'pending' OR status = 'failed' 
       ORDER BY timestamp ASC;`
    );
    
    const messages = rows.map(row => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    }));
    
    console.log(`✅ Fetched ${messages.length} pending messages`);
    return messages;
  } catch (error) {
    console.error('❌ Error fetching pending messages:', error);
    throw error;
  }
}

/**
 * Bulk save messages (for initial sync)
 * @param {Array<Object>} messages - Array of message objects
 * @returns {Promise<void>}
 */
export async function bulkSaveMessages(messages) {
  if (!isSQLiteAvailable) return Promise.resolve();
  if (messages.length === 0) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');
  
  const now = Date.now();

  try {
    // Use execAsync with multiple statements for better performance
    const statements = messages.map((message) => {
      const {
        id,
        conversationId,
        senderId,
        content,
        imageUrl,
        timestamp,
        status,
        type = 'text',
        detected_language = 'en',
        metadata = null,
      } = message;

      const metadataJson = metadata ? JSON.stringify(metadata) : null;
      // Use empty string instead of null for content to avoid NOT NULL constraint
      const contentValue = content || '';

      return {
        sql: `INSERT OR REPLACE INTO messages 
              (id, conversationId, senderId, content, imageUrl, timestamp, status, type, detected_language, metadata, updatedAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [id, conversationId, senderId, contentValue, imageUrl, timestamp, status, type, detected_language, metadataJson, now]
      };
    });

    // Execute all statements
    for (const stmt of statements) {
      db.runSync(stmt.sql, stmt.args);
    }

    console.log(`✅ Bulk saved ${messages.length} messages`);
  } catch (error) {
    console.error('❌ Error bulk saving messages:', error);
    throw error;
  }
}
