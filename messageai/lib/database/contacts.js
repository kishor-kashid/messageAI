/**
 * Contact Database Operations for MessageAI MVP
 * 
 * CRUD operations for contacts in SQLite
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
 * Save a contact to local database
 * @param {Object} contact - Contact object
 * @param {string} contact.id - Unique contact ID (user ID)
 * @param {string} contact.email - Contact email
 * @param {string} contact.displayName - Contact display name
 * @param {string} [contact.photoURL] - Profile picture URL
 * @param {number} [contact.lastSeen] - Last seen timestamp
 * @param {string} [contact.status] - User status message
 * @returns {Promise<void>}
 */
export async function saveContact(contact) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');
  
  const {
    id,
    email,
    displayName,
    photoURL = null,
    lastSeen = null,
    status = null,
  } = contact;

  const now = Date.now();

  try {
    db.runSync(
      `INSERT OR REPLACE INTO contacts 
       (id, email, displayName, photoURL, lastSeen, status, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [id, email, displayName, photoURL, lastSeen, status, now]
    );
    console.log(`✅ Contact saved: ${displayName} (${email})`);
  } catch (error) {
    console.error('❌ Error saving contact:', error);
    throw error;
  }
}

/**
 * Get all contacts
 * @param {number} [limit=100] - Number of contacts to fetch
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Array>} Array of contacts
 */
export async function getContacts(limit = 100, offset = 0) {
  if (!isSQLiteAvailable) return Promise.resolve([]);
  
  const db = getDatabase();
  if (!db) return [];

  try {
    const contacts = db.getAllSync(
      `SELECT * FROM contacts 
       ORDER BY displayName ASC 
       LIMIT ? OFFSET ?;`,
      [limit, offset]
    );
    console.log(`✅ Fetched ${contacts.length} contacts`);
    return contacts;
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    throw error;
  }
}

/**
 * Get a single contact by ID
 * @param {string} contactId - Contact ID (user ID)
 * @returns {Promise<Object|null>} Contact object or null
 */
export async function getContactById(contactId) {
  if (!isSQLiteAvailable) return Promise.resolve(null);
  
  const db = getDatabase();
  if (!db) return null;

  try {
    const contact = db.getFirstSync(
      'SELECT * FROM contacts WHERE id = ?;',
      [contactId]
    );
    return contact || null;
  } catch (error) {
    console.error('❌ Error fetching contact:', error);
    throw error;
  }
}

/**
 * Get a contact by email
 * @param {string} email - Contact email
 * @returns {Promise<Object|null>} Contact object or null
 */
export async function getContactByEmail(email) {
  if (!isSQLiteAvailable) return Promise.resolve(null);
  
  const db = getDatabase();
  if (!db) return null;

  try {
    const contact = db.getFirstSync(
      'SELECT * FROM contacts WHERE email = ?;',
      [email]
    );
    return contact || null;
  } catch (error) {
    console.error('❌ Error fetching contact by email:', error);
    throw error;
  }
}

/**
 * Search contacts by name or email
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching contacts
 */
export async function searchContacts(query) {
  if (!isSQLiteAvailable) return Promise.resolve([]);
  
  const db = getDatabase();
  if (!db) return [];
  
  const searchPattern = `%${query}%`;

  try {
    const contacts = db.getAllSync(
      `SELECT * FROM contacts 
       WHERE displayName LIKE ? OR email LIKE ? 
       ORDER BY displayName ASC 
       LIMIT 50;`,
      [searchPattern, searchPattern]
    );
    console.log(`✅ Found ${contacts.length} contacts matching: ${query}`);
    return contacts;
  } catch (error) {
    console.error('❌ Error searching contacts:', error);
    throw error;
  }
}

/**
 * Update contact information
 * @param {string} contactId - Contact ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateContact(contactId, updates) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');
  
  const now = Date.now();

  // Build dynamic update query
  const fields = [];
  const values = [];

  if (updates.displayName !== undefined) {
    fields.push('displayName = ?');
    values.push(updates.displayName);
  }
  if (updates.photoURL !== undefined) {
    fields.push('photoURL = ?');
    values.push(updates.photoURL);
  }
  if (updates.lastSeen !== undefined) {
    fields.push('lastSeen = ?');
    values.push(updates.lastSeen);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  if (fields.length === 0) {
    return Promise.resolve(); // Nothing to update
  }

  fields.push('updatedAt = ?');
  values.push(now);
  values.push(contactId);

  const query = `UPDATE contacts SET ${fields.join(', ')} WHERE id = ?;`;

  try {
    const result = db.runSync(query, values);
    
    if (result.changes > 0) {
      console.log(`✅ Contact updated: ${contactId}`);
    } else {
      throw new Error('Contact not found');
    }
  } catch (error) {
    console.error('❌ Error updating contact:', error);
    throw error;
  }
}

/**
 * Delete a contact
 * @param {string} contactId - Contact ID
 * @returns {Promise<void>}
 */
export async function deleteContact(contactId) {
  if (!isSQLiteAvailable) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');

  try {
    const result = db.runSync(
      'DELETE FROM contacts WHERE id = ?;',
      [contactId]
    );
    
    if (result.changes > 0) {
      console.log(`✅ Contact deleted: ${contactId}`);
    } else {
      throw new Error('Contact not found');
    }
  } catch (error) {
    console.error('❌ Error deleting contact:', error);
    throw error;
  }
}

/**
 * Update contact's last seen timestamp
 * @param {string} contactId - Contact ID
 * @param {number} lastSeen - Last seen timestamp
 * @returns {Promise<void>}
 */
export async function updateContactLastSeen(contactId, lastSeen) {
  return updateContact(contactId, { lastSeen });
}

/**
 * Bulk save contacts (for initial sync)
 * @param {Array<Object>} contacts - Array of contact objects
 * @returns {Promise<void>}
 */
export async function bulkSaveContacts(contacts) {
  if (!isSQLiteAvailable) return Promise.resolve();
  if (contacts.length === 0) return Promise.resolve();
  
  const db = getDatabase();
  if (!db) throw new Error('Database not available');
  
  const now = Date.now();

  try {
    for (const contact of contacts) {
      const {
        id,
        email,
        displayName,
        photoURL = null,
        lastSeen = null,
        status = null,
      } = contact;

      db.runSync(
        `INSERT OR REPLACE INTO contacts 
         (id, email, displayName, photoURL, lastSeen, status, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [id, email, displayName, photoURL, lastSeen, status, now]
      );
    }
    
    console.log(`✅ Bulk saved ${contacts.length} contacts`);
  } catch (error) {
    console.error('❌ Error bulk saving contacts:', error);
    throw error;
  }
}

/**
 * Get contact count
 * @returns {Promise<number>} Total number of contacts
 */
export async function getContactCount() {
  if (!isSQLiteAvailable) return Promise.resolve(0);
  
  const db = getDatabase();
  if (!db) return 0;

  try {
    const result = db.getFirstSync('SELECT COUNT(*) as count FROM contacts;');
    return result ? result.count : 0;
  } catch (error) {
    console.error('❌ Error getting contact count:', error);
    throw error;
  }
}
