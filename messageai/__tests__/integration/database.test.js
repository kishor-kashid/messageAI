/**
 * Integration Tests for Database Operations
 * 
 * Tests CRUD operations for messages, conversations, and contacts
 * 
 * NOTE: These tests require a real SQLite database and are designed to run on:
 * - Real device (via Expo Go)
 * - iOS Simulator  
 * - Android Emulator
 * 
 * They will timeout in the Jest/Node environment because expo-sqlite is mocked.
 * For now, database functionality is verified through manual testing.
 * In production, these would run as E2E tests on actual devices.
 */

import {
  initializeDatabase,
  dropAllTables,
  clearAllData,
} from '../../lib/database/schema';

import {
  saveMessage,
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
  deleteConversationMessages,
  getPendingMessages,
  bulkSaveMessages,
} from '../../lib/database/messages';

import {
  saveConversation,
  getConversations,
  getConversationById,
  updateLastMessage,
  updateUnreadCount,
  incrementUnreadCount,
  resetUnreadCount,
  deleteConversation,
  getConversationByParticipant,
  bulkSaveConversations,
} from '../../lib/database/conversations';

import {
  saveContact,
  getContacts,
  getContactById,
  getContactByEmail,
  searchContacts,
  updateContact,
  deleteContact,
  updateContactLastSeen,
  bulkSaveContacts,
  getContactCount,
} from '../../lib/database/contacts';

describe('Database Integration Tests', () => {
  // Initialize database before all tests
  beforeAll(async () => {
    await dropAllTables();
    await initializeDatabase();
  });

  // Clear data before each test
  beforeEach(async () => {
    await clearAllData();
  });

  // Clean up after all tests
  afterAll(async () => {
    await dropAllTables();
  });

  describe('Message Operations', () => {
    const testMessage = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content: 'Hello World',
      timestamp: Date.now(),
      status: 'sent',
      type: 'text',
      metadata: { edited: false },
    };

    test('should save a message', async () => {
      await saveMessage(testMessage);
      const retrieved = await getMessageById(testMessage.id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved.id).toBe(testMessage.id);
      expect(retrieved.content).toBe(testMessage.content);
      expect(retrieved.senderId).toBe(testMessage.senderId);
      expect(retrieved.status).toBe(testMessage.status);
    });

    test('should get messages for a conversation', async () => {
      await saveMessage(testMessage);
      await saveMessage({ ...testMessage, id: 'msg-2', content: 'Second message' });
      
      const messages = await getMessages('conv-1');
      
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBeDefined();
    });

    test('should update message status', async () => {
      await saveMessage(testMessage);
      await updateMessageStatus(testMessage.id, 'delivered');
      
      const updated = await getMessageById(testMessage.id);
      
      expect(updated.status).toBe('delivered');
    });

    test('should delete a message', async () => {
      await saveMessage(testMessage);
      await deleteMessage(testMessage.id);
      
      const deleted = await getMessageById(testMessage.id);
      
      expect(deleted).toBeNull();
    });

    test('should delete all messages in a conversation', async () => {
      await saveMessage(testMessage);
      await saveMessage({ ...testMessage, id: 'msg-2' });
      await deleteConversationMessages('conv-1');
      
      const messages = await getMessages('conv-1');
      
      expect(messages).toHaveLength(0);
    });

    test('should get pending messages', async () => {
      await saveMessage({ ...testMessage, status: 'pending' });
      await saveMessage({ ...testMessage, id: 'msg-2', status: 'sent' });
      
      const pending = await getPendingMessages();
      
      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe('pending');
    });

    test('should bulk save messages', async () => {
      const messages = [
        { ...testMessage, id: 'msg-1' },
        { ...testMessage, id: 'msg-2' },
        { ...testMessage, id: 'msg-3' },
      ];
      
      await bulkSaveMessages(messages);
      const retrieved = await getMessages('conv-1');
      
      expect(retrieved).toHaveLength(3);
    });

    test('should handle message pagination', async () => {
      // Save 5 messages
      for (let i = 1; i <= 5; i++) {
        await saveMessage({ ...testMessage, id: `msg-${i}`, timestamp: Date.now() + i });
      }
      
      const page1 = await getMessages('conv-1', 2, 0);
      const page2 = await getMessages('conv-1', 2, 2);
      
      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });
  });

  describe('Conversation Operations', () => {
    const testConversation = {
      id: 'conv-1',
      participantIds: ['user-1', 'user-2'],
      lastMessage: 'Hello',
      lastMessageTimestamp: Date.now(),
      unreadCount: 0,
    };

    test('should save a conversation', async () => {
      await saveConversation(testConversation);
      const retrieved = await getConversationById(testConversation.id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved.id).toBe(testConversation.id);
      expect(retrieved.participantIds).toEqual(testConversation.participantIds);
    });

    test('should get all conversations', async () => {
      await saveConversation(testConversation);
      await saveConversation({ ...testConversation, id: 'conv-2' });
      
      const conversations = await getConversations();
      
      expect(conversations).toHaveLength(2);
    });

    test('should update last message', async () => {
      await saveConversation(testConversation);
      const newMessage = 'Updated message';
      const newTimestamp = Date.now() + 1000;
      
      await updateLastMessage('conv-1', newMessage, newTimestamp);
      const updated = await getConversationById('conv-1');
      
      expect(updated.lastMessage).toBe(newMessage);
      expect(updated.lastMessageTimestamp).toBe(newTimestamp);
    });

    test('should update unread count', async () => {
      await saveConversation(testConversation);
      await updateUnreadCount('conv-1', 5);
      
      const updated = await getConversationById('conv-1');
      
      expect(updated.unreadCount).toBe(5);
    });

    test('should increment unread count', async () => {
      await saveConversation(testConversation);
      await incrementUnreadCount('conv-1');
      await incrementUnreadCount('conv-1');
      
      const updated = await getConversationById('conv-1');
      
      expect(updated.unreadCount).toBe(2);
    });

    test('should reset unread count', async () => {
      await saveConversation({ ...testConversation, unreadCount: 5 });
      await resetUnreadCount('conv-1');
      
      const updated = await getConversationById('conv-1');
      
      expect(updated.unreadCount).toBe(0);
    });

    test('should delete a conversation', async () => {
      await saveConversation(testConversation);
      await deleteConversation('conv-1');
      
      const deleted = await getConversationById('conv-1');
      
      expect(deleted).toBeNull();
    });

    test('should get conversation by participants', async () => {
      await saveConversation(testConversation);
      
      const found = await getConversationByParticipant('user-1', 'user-2');
      
      expect(found).not.toBeNull();
      expect(found.id).toBe('conv-1');
    });

    test('should bulk save conversations', async () => {
      const conversations = [
        { ...testConversation, id: 'conv-1' },
        { ...testConversation, id: 'conv-2' },
        { ...testConversation, id: 'conv-3' },
      ];
      
      await bulkSaveConversations(conversations);
      const retrieved = await getConversations();
      
      expect(retrieved).toHaveLength(3);
    });
  });

  describe('Contact Operations', () => {
    const testContact = {
      id: 'user-1',
      email: 'test@example.com',
      displayName: 'Test User',
      profilePicture: 'https://example.com/avatar.jpg',
      lastSeen: Date.now(),
      status: 'Available',
    };

    test('should save a contact', async () => {
      await saveContact(testContact);
      const retrieved = await getContactById(testContact.id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved.id).toBe(testContact.id);
      expect(retrieved.email).toBe(testContact.email);
      expect(retrieved.displayName).toBe(testContact.displayName);
    });

    test('should get all contacts', async () => {
      await saveContact(testContact);
      await saveContact({ ...testContact, id: 'user-2', email: 'test2@example.com' });
      
      const contacts = await getContacts();
      
      expect(contacts).toHaveLength(2);
    });

    test('should get contact by email', async () => {
      await saveContact(testContact);
      
      const found = await getContactByEmail(testContact.email);
      
      expect(found).not.toBeNull();
      expect(found.id).toBe(testContact.id);
    });

    test('should search contacts', async () => {
      await saveContact(testContact);
      await saveContact({ ...testContact, id: 'user-2', email: 'another@example.com', displayName: 'Another User' });
      
      const results = await searchContacts('Test');
      
      expect(results).toHaveLength(1);
      expect(results[0].displayName).toContain('Test');
    });

    test('should update contact', async () => {
      await saveContact(testContact);
      await updateContact('user-1', { displayName: 'Updated Name', status: 'Busy' });
      
      const updated = await getContactById('user-1');
      
      expect(updated.displayName).toBe('Updated Name');
      expect(updated.status).toBe('Busy');
    });

    test('should update contact last seen', async () => {
      await saveContact(testContact);
      const newLastSeen = Date.now() + 1000;
      
      await updateContactLastSeen('user-1', newLastSeen);
      const updated = await getContactById('user-1');
      
      expect(updated.lastSeen).toBe(newLastSeen);
    });

    test('should delete a contact', async () => {
      await saveContact(testContact);
      await deleteContact('user-1');
      
      const deleted = await getContactById('user-1');
      
      expect(deleted).toBeNull();
    });

    test('should bulk save contacts', async () => {
      const contacts = [
        { ...testContact, id: 'user-1', email: 'user1@example.com' },
        { ...testContact, id: 'user-2', email: 'user2@example.com' },
        { ...testContact, id: 'user-3', email: 'user3@example.com' },
      ];
      
      await bulkSaveContacts(contacts);
      const retrieved = await getContacts();
      
      expect(retrieved).toHaveLength(3);
    });

    test('should get contact count', async () => {
      await saveContact(testContact);
      await saveContact({ ...testContact, id: 'user-2', email: 'test2@example.com' });
      
      const count = await getContactCount();
      
      expect(count).toBe(2);
    });
  });

  describe('Database Persistence', () => {
    test('should persist data across operations', async () => {
      // Save data
      await saveMessage({
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Test persistence',
        timestamp: Date.now(),
        status: 'sent',
      });

      await saveConversation({
        id: 'conv-1',
        participantIds: ['user-1', 'user-2'],
      });

      await saveContact({
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
      });

      // Retrieve data
      const message = await getMessageById('msg-1');
      const conversation = await getConversationById('conv-1');
      const contact = await getContactById('user-1');

      // Verify all data persists
      expect(message).not.toBeNull();
      expect(conversation).not.toBeNull();
      expect(contact).not.toBeNull();
    });
  });
});

