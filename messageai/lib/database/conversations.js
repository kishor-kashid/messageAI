/**
 * Conversation Database Operations for MessageAI MVP
 * 
 * CRUD operations for conversations in SQLite
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
 * Save a conversation to local database
 * @param {Object} conversation - Conversation object
 * @param {string} conversation.id - Unique conversation ID
 * @param {Array<string>} conversation.participantIds - Array of participant user IDs
 * @param {string} [conversation.lastMessage] - Last message content
 * @param {number} [conversation.lastMessageTimestamp] - Last message timestamp
 * @param {number} [conversation.unreadCount=0] - Unread message count
 * @returns {Promise<void>}
 */
export async function saveConversation(conversation) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');
  
  const {
    id,
    participantIds,
    lastMessage = null,
    lastMessageTimestamp = null,
    unreadCount = 0,
  } = conversation;

  const participantIdsJson = JSON.stringify(participantIds);
  const now = Date.now();

  try {
    db.runSync(
      `INSERT OR REPLACE INTO conversations 
       (id, participantIds, lastMessage, lastMessageTimestamp, unreadCount, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?);`,
      [id, participantIdsJson, lastMessage, lastMessageTimestamp, unreadCount, now]
    );
    console.log(`✅ Conversation saved: ${id}`);
  } catch (error) {
    console.error('❌ Error saving conversation:', error);
    throw error;
  }
}

/**
 * Get all conversations
 * @param {number} [limit=50] - Number of conversations to fetch
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Array>} Array of conversations
 */
export async function getConversations(limit = 50, offset = 0) {
  if (!isSQLiteAvailable) return Promise.resolve([]);
  
  const db = getDatabase();
  if (!db) return [];

  try {
    const rows = db.getAllSync(
      `SELECT * FROM conversations 
       ORDER BY updatedAt DESC 
       LIMIT ? OFFSET ?;`,
      [limit, offset]
    );
    
    const conversations = rows.map(row => ({
      ...row,
      participantIds: JSON.parse(row.participantIds),
    }));
    
    console.log(`✅ Fetched ${conversations.length} conversations`);
    return conversations;
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    throw error;
  }
}

/**
 * Get a single conversation by ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} Conversation object or null
 */
export async function getConversationById(conversationId) {
  if (!isSQLiteAvailable) return Promise.resolve(null);
  
  const db = getDatabase();
  if (!db) return null;

  try {
    const row = db.getFirstSync(
      'SELECT * FROM conversations WHERE id = ?;',
      [conversationId]
    );
    
    if (row) {
      return {
        ...row,
        participantIds: JSON.parse(row.participantIds),
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    throw error;
  }
}

/**
 * Update last message in conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} lastMessage - Last message content
 * @param {number} lastMessageTimestamp - Last message timestamp
 * @returns {Promise<void>}
 */
export async function updateLastMessage(conversationId, lastMessage, lastMessageTimestamp) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');
  
  const now = Date.now();

  try {
    const result = db.runSync(
      `UPDATE conversations 
       SET lastMessage = ?, lastMessageTimestamp = ?, updatedAt = ? 
       WHERE id = ?;`,
      [lastMessage, lastMessageTimestamp, now, conversationId]
    );
    
    if (result.changes > 0) {
      console.log(`✅ Last message updated for conversation: ${conversationId}`);
    } else {
      throw new Error('Conversation not found');
    }
  } catch (error) {
    console.error('❌ Error updating last message:', error);
    throw error;
  }
}

/**
 * Update unread count for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} unreadCount - New unread count
 * @returns {Promise<void>}
 */
export async function updateUnreadCount(conversationId, unreadCount) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');
  
  const now = Date.now();

  try {
    const result = db.runSync(
      'UPDATE conversations SET unreadCount = ?, updatedAt = ? WHERE id = ?;',
      [unreadCount, now, conversationId]
    );
    
    if (result.changes > 0) {
      console.log(`✅ Unread count updated for conversation: ${conversationId} -> ${unreadCount}`);
    } else {
      throw new Error('Conversation not found');
    }
  } catch (error) {
    console.error('❌ Error updating unread count:', error);
    throw error;
  }
}

/**
 * Increment unread count for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<void>}
 */
export async function incrementUnreadCount(conversationId) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');
  
  const now = Date.now();

  try {
    const result = db.runSync(
      'UPDATE conversations SET unreadCount = unreadCount + 1, updatedAt = ? WHERE id = ?;',
      [now, conversationId]
    );
    
    if (result.changes > 0) {
      console.log(`✅ Unread count incremented for conversation: ${conversationId}`);
    } else {
      throw new Error('Conversation not found');
    }
  } catch (error) {
    console.error('❌ Error incrementing unread count:', error);
    throw error;
  }
}

/**
 * Reset unread count to zero (mark as read)
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<void>}
 */
export async function resetUnreadCount(conversationId) {
  return updateUnreadCount(conversationId, 0);
}

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<void>}
 */
export async function deleteConversation(conversationId) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');

  try {
    const result = db.runSync(
      'DELETE FROM conversations WHERE id = ?;',
      [conversationId]
    );
    
    if (result.changes > 0) {
      console.log(`✅ Conversation deleted: ${conversationId}`);
    } else {
      throw new Error('Conversation not found');
    }
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    throw error;
  }
}

/**
 * Get conversation by participant ID (one-to-one chat)
 * @param {string} currentUserId - Current user ID
 * @param {string} otherUserId - Other participant user ID
 * @returns {Promise<Object|null>} Conversation object or null
 */
export async function getConversationByParticipant(currentUserId, otherUserId) {
  if (!isSQLiteAvailable) return Promise.resolve(null);
  
  const db = getDatabase();
  if (!db) return null;

  try {
    const rows = db.getAllSync('SELECT * FROM conversations;');
    
    for (const row of rows) {
      const participantIds = JSON.parse(row.participantIds);
      
      // Check if both users are in the participant list
      if (
        participantIds.includes(currentUserId) &&
        participantIds.includes(otherUserId) &&
        participantIds.length === 2 // Ensure it's a one-to-one conversation
      ) {
        return {
          ...row,
          participantIds,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error finding conversation:', error);
    throw error;
  }
}

/**
 * Bulk save conversations (for initial sync)
 * @param {Array<Object>} conversations - Array of conversation objects
 * @returns {Promise<void>}
 */
export async function bulkSaveConversations(conversations) {
  if (!isSQLiteAvailable) return Promise.resolve();
  if (conversations.length === 0) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');
  
  const now = Date.now();

  try {
    for (const conversation of conversations) {
      const {
        id,
        participantIds,
        lastMessage = null,
        lastMessageTimestamp = null,
        unreadCount = 0,
      } = conversation;

      const participantIdsJson = JSON.stringify(participantIds);

      db.runSync(
        `INSERT OR REPLACE INTO conversations 
         (id, participantIds, lastMessage, lastMessageTimestamp, unreadCount, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?);`,
        [id, participantIdsJson, lastMessage, lastMessageTimestamp, unreadCount, now]
      );
    }
    
    console.log(`✅ Bulk saved ${conversations.length} conversations`);
  } catch (error) {
    console.error('❌ Error bulk saving conversations:', error);
    throw error;
  }
}
