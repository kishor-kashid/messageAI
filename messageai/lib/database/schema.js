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
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        metadata TEXT,
        createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
      );`
    );

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
        profilePicture TEXT,
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
    console.log('✅ All data cleared');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

