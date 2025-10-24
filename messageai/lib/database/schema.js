/**
 * SQLite Database Schema for MessageAI MVP
 * 
 * Defines tables for offline message storage
 * 
 * NOTE: SQLite only works on native platforms (iOS/Android).
 * On web, database operations are no-ops.
 */

import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

// Database name
const DB_NAME = 'messageai.db';

// Check if SQLite is available (native platforms only)
const isSQLiteAvailable = Platform.OS !== 'web';

// Global database instance
let dbInstance = null;

/**
 * Get database instance (uses new expo-sqlite v16 API)
 * @returns {Object|null} Database instance or null on web
 */
export function getDatabase() {
  if (!isSQLiteAvailable) {
    return null;
  }
  
  // Return cached instance if available
  if (dbInstance) {
    return dbInstance;
  }
  
  // Create new instance using sync API
  try {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
    return dbInstance;
  } catch (error) {
    console.error('Failed to open database:', error);
    return null;
  }
}

/**
 * Initialize database tables
 * @returns {Promise<void>}
 */
export async function initializeDatabase() {
  // Skip on web - SQLite only works on native
  if (!isSQLiteAvailable) {
    console.log('ℹ️ Database skipped: SQLite not available on web platform');
    return Promise.resolve();
  }

  const db = getDatabase();
  if (!db) {
    throw new Error('Failed to get database instance');
  }

  try {
    // Messages table
    db.execSync(
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        senderId TEXT NOT NULL,
        content TEXT,
        imageUrl TEXT,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        detected_language TEXT DEFAULT 'en',
        metadata TEXT,
        createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
      );`
    );

    // Migration: Add imageUrl column if it doesn't exist (for existing databases)
    try {
      db.execSync(`ALTER TABLE messages ADD COLUMN imageUrl TEXT;`);
      console.log('✅ Added imageUrl column to messages table');
    } catch (err) {
      // Column already exists or other error - safe to ignore
      if (!err.message.includes('duplicate column')) {
        console.warn('⚠️ Could not add imageUrl column:', err.message);
      }
    }

    // Migration: Add detected_language column if it doesn't exist (for existing databases)
    try {
      db.execSync(`ALTER TABLE messages ADD COLUMN detected_language TEXT DEFAULT 'en';`);
      console.log('✅ Added detected_language column to messages table');
    } catch (err) {
      // Column already exists or other error - safe to ignore
      if (!err.message.includes('duplicate column')) {
        console.warn('⚠️ Could not add detected_language column:', err.message);
      }
    }

    // Migration: Make content nullable (for existing databases with image-only messages)
    // Note: SQLite doesn't support ALTER COLUMN, so this is handled by the new table definition above

    // Migration: Rename profilePicture to photoURL in contacts table (for consistency with Firebase)
    try {
      const tableInfo = db.getAllSync("PRAGMA table_info(contacts);");
      const hasOldColumn = tableInfo.some(col => col.name === 'profilePicture');
      const hasNewColumn = tableInfo.some(col => col.name === 'photoURL');
      
      if (hasOldColumn && !hasNewColumn) {
        db.execSync(`ALTER TABLE contacts RENAME COLUMN profilePicture TO photoURL;`);
        console.log('✅ Migrated profilePicture to photoURL in contacts table');
      }
    } catch (err) {
      // Safe to ignore if column doesn't exist or already renamed
      if (!err.message.includes('no such column')) {
        console.warn('⚠️ Could not migrate profilePicture column:', err.message);
      }
    }

    // Index for faster queries
    db.execSync(
      `CREATE INDEX IF NOT EXISTS idx_messages_conversation 
       ON messages(conversationId, timestamp DESC);`
    );

    db.execSync(
      `CREATE INDEX IF NOT EXISTS idx_messages_status 
       ON messages(status);`
    );

    // Conversations table
    db.execSync(
      `CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        participantIds TEXT NOT NULL,
        lastMessage TEXT,
        lastMessageTimestamp INTEGER,
        unreadCount INTEGER DEFAULT 0,
        createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );`
    );

    // Index for conversations
    db.execSync(
      `CREATE INDEX IF NOT EXISTS idx_conversations_updated 
       ON conversations(updatedAt DESC);`
    );

    // Contacts table
    db.execSync(
      `CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        displayName TEXT NOT NULL,
        photoURL TEXT,
        lastSeen INTEGER,
        status TEXT,
        createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );`
    );

    // Index for contacts
    db.execSync(
      `CREATE INDEX IF NOT EXISTS idx_contacts_email 
       ON contacts(email);`
    );

    // Offline queue table
    db.execSync(
      `CREATE TABLE IF NOT EXISTS offline_queue (
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
      );`
    );

    // Index for offline queue
    db.execSync(
      `CREATE INDEX IF NOT EXISTS idx_offline_queue_timestamp 
       ON offline_queue(timestamp);`
    );

    db.execSync(
      `CREATE INDEX IF NOT EXISTS idx_offline_queue_conversation 
       ON offline_queue(conversationId);`
    );

    // AI Usage Log table (for rate limiting and cost tracking)
    db.execSync(
      `CREATE TABLE IF NOT EXISTS ai_usage_log (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        function_name TEXT NOT NULL,
        tokens_used INTEGER,
        estimated_cost REAL,
        timestamp INTEGER NOT NULL,
        createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );`
    );

    // Index for AI usage log
    db.execSync(
      `CREATE INDEX IF NOT EXISTS idx_ai_usage_user 
       ON ai_usage_log(user_id, timestamp DESC);`
    );

    db.execSync(
      `CREATE INDEX IF NOT EXISTS idx_ai_usage_function 
       ON ai_usage_log(function_name);`
    );

    // Translation Cache table (to reduce API costs)
    db.execSync(
      `CREATE TABLE IF NOT EXISTS translation_cache (
        id TEXT PRIMARY KEY,
        original_text TEXT NOT NULL,
        source_language TEXT,
        target_language TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );`
    );

    // Index for translation cache
    db.execSync(
      `CREATE INDEX IF NOT EXISTS idx_translation_cache_lookup 
       ON translation_cache(original_text, target_language);`
    );

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

/**
 * Drop all tables (for testing/reset)
 * @returns {Promise<void>}
 */
export async function dropAllTables() {
  if (!isSQLiteAvailable) {
    return Promise.resolve();
  }
  
  const db = getDatabase();
  if (!db) {
    throw new Error('Failed to get database instance');
  }

  try {
    db.execSync('DROP TABLE IF EXISTS messages;');
    db.execSync('DROP TABLE IF EXISTS conversations;');
    db.execSync('DROP TABLE IF EXISTS contacts;');
    db.execSync('DROP TABLE IF EXISTS offline_queue;');
    db.execSync('DROP TABLE IF EXISTS ai_usage_log;');
    db.execSync('DROP TABLE IF EXISTS translation_cache;');
    console.log('✅ All tables dropped');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  }
}

/**
 * Clear all data from tables (keeps structure)
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  if (!isSQLiteAvailable) {
    return Promise.resolve();
  }
  
  const db = getDatabase();
  if (!db) {
    throw new Error('Failed to get database instance');
  }

  try {
    db.execSync('DELETE FROM messages;');
    db.execSync('DELETE FROM conversations;');
    db.execSync('DELETE FROM contacts;');
    db.execSync('DELETE FROM offline_queue;');
    db.execSync('DELETE FROM ai_usage_log;');
    db.execSync('DELETE FROM translation_cache;');
    console.log('✅ All data cleared');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

