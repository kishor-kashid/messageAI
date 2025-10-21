/**
 * Integration Tests for Contact Management
 * 
 * Tests contact operations: add, get, search, remove
 * 
 * NOTE: These tests mock both Firestore and SQLite operations
 */

import {
  searchUserByEmail,
  addContact,
  removeContact,
  getContacts,
  isContact,
} from '../../lib/firebase/firestore';

import {
  saveContact,
  getContacts as getLocalContacts,
  getContactByEmail,
  searchContacts,
  deleteContact,
} from '../../lib/database/contacts';

// Mock Firebase
jest.mock('../../lib/firebase/config', () => ({
  db: {},
  auth: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
  arrayUnion: jest.fn((val) => val),
  arrayRemove: jest.fn((val) => val),
  serverTimestamp: jest.fn(() => Date.now()),
}));

// Create a persistent mock database instance
const mockDb = {
  execSync: jest.fn(),
  runSync: jest.fn(() => ({ changes: 1 })),
  getAllSync: jest.fn(() => []),
  getFirstSync: jest.fn(() => null),
};

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDb),
}));

describe('Contact Integration Tests', () => {
  const mockCurrentUser = {
    id: 'user-123',
    email: 'current@example.com',
    displayName: 'Current User',
    contacts: [],
  };

  const mockContactUser = {
    id: 'contact-456',
    email: 'contact@example.com',
    displayName: 'Contact User',
    profilePicture: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset database mock
    mockDb.execSync.mockClear();
    mockDb.runSync.mockClear();
    mockDb.getAllSync.mockClear();
    mockDb.getFirstSync.mockClear();
    mockDb.runSync.mockReturnValue({ changes: 1 });
    mockDb.getAllSync.mockReturnValue([]);
    mockDb.getFirstSync.mockReturnValue(null);
  });

  describe('Firestore Contact Operations', () => {
    test('should search user by email successfully', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: mockContactUser.id,
          data: () => mockContactUser,
        }],
      });

      const result = await searchUserByEmail('contact@example.com');

      expect(result).toEqual({
        id: mockContactUser.id,
        ...mockContactUser,
      });
      expect(getDocs).toHaveBeenCalledTimes(1);
    });

    test('should return null when user not found by email', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const result = await searchUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    test('should add contact successfully', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockResolvedValue();

      await addContact(mockCurrentUser.id, mockContactUser.id);

      // Should update both users' contact lists
      expect(updateDoc).toHaveBeenCalledTimes(2);
    });

    test('should throw error when adding self as contact', async () => {
      await expect(
        addContact(mockCurrentUser.id, mockCurrentUser.id)
      ).rejects.toThrow('Cannot add yourself as a contact');
    });

    test('should remove contact successfully', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockResolvedValue();

      await removeContact(mockCurrentUser.id, mockContactUser.id);

      // Should update both users' contact lists
      expect(updateDoc).toHaveBeenCalledTimes(2);
    });

    test('should get contacts list', async () => {
      const { getDoc } = require('firebase/firestore');
      
      // Mock getting current user's profile with contact IDs
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: mockCurrentUser.id,
        data: () => ({
          ...mockCurrentUser,
          contacts: [mockContactUser.id],
        }),
      });

      // Mock getting contact's profile
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: mockContactUser.id,
        data: () => mockContactUser,
      });

      const contacts = await getContacts(mockCurrentUser.id);

      expect(contacts).toHaveLength(1);
      expect(contacts[0].id).toBe(mockContactUser.id);
      expect(contacts[0].email).toBe(mockContactUser.email);
    });

    test('should return empty array when no contacts', async () => {
      const { getDoc } = require('firebase/firestore');
      
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: mockCurrentUser.id,
        data: () => ({
          ...mockCurrentUser,
          contacts: [],
        }),
      });

      const contacts = await getContacts(mockCurrentUser.id);

      expect(contacts).toEqual([]);
    });

    test('should check if user is contact', async () => {
      const { getDoc } = require('firebase/firestore');
      
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: mockCurrentUser.id,
        data: () => ({
          ...mockCurrentUser,
          contacts: [mockContactUser.id],
        }),
      });

      const result = await isContact(mockCurrentUser.id, mockContactUser.id);

      expect(result).toBe(true);
    });

    test('should return false when user is not contact', async () => {
      const { getDoc } = require('firebase/firestore');
      
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: mockCurrentUser.id,
        data: () => ({
          ...mockCurrentUser,
          contacts: [],
        }),
      });

      const result = await isContact(mockCurrentUser.id, mockContactUser.id);

      expect(result).toBe(false);
    });
  });

  describe('Local Database Contact Operations', () => {
    test('should save contact to local database', async () => {
      await saveContact(mockContactUser);

      expect(mockDb.runSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO contacts'),
        expect.arrayContaining([
          mockContactUser.id,
          mockContactUser.email,
          mockContactUser.displayName,
        ])
      );
    });

    test('should get contacts from local database', async () => {
      mockDb.getAllSync.mockReturnValueOnce([mockContactUser]);

      const contacts = await getLocalContacts();

      expect(contacts).toHaveLength(1);
      expect(contacts[0].id).toBe(mockContactUser.id);
    });

    test('should find contact by email in local database', async () => {
      mockDb.getFirstSync.mockReturnValueOnce(mockContactUser);

      const contact = await getContactByEmail('contact@example.com');

      expect(contact).toEqual(mockContactUser);
      expect(mockDb.getFirstSync).toHaveBeenCalledWith(
        'SELECT * FROM contacts WHERE email = ?;',
        ['contact@example.com']
      );
    });

    test('should search contacts by name', async () => {
      mockDb.getAllSync.mockReturnValueOnce([mockContactUser]);

      const results = await searchContacts('Contact');

      expect(results).toHaveLength(1);
      expect(results[0].displayName).toContain('Contact');
    });

    test('should delete contact from local database', async () => {
      await deleteContact(mockContactUser.id);

      expect(mockDb.runSync).toHaveBeenCalledWith(
        'DELETE FROM contacts WHERE id = ?;',
        [mockContactUser.id]
      );
    });
  });

  describe('Contact Flow Integration', () => {
    test('should complete full add contact flow', async () => {
      const { getDocs, updateDoc } = require('firebase/firestore');

      // Step 1: Search for user by email
      getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: mockContactUser.id,
          data: () => mockContactUser,
        }],
      });

      const foundUser = await searchUserByEmail('contact@example.com');
      expect(foundUser).not.toBeNull();

      // Step 2: Check if already a contact
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: mockCurrentUser.id,
        data: () => ({
          ...mockCurrentUser,
          contacts: [], // Not a contact yet
        }),
      });

      const alreadyContact = await isContact(mockCurrentUser.id, foundUser.id);
      expect(alreadyContact).toBe(false);

      // Step 3: Add to Firestore
      updateDoc.mockResolvedValue();
      await addContact(mockCurrentUser.id, foundUser.id);
      expect(updateDoc).toHaveBeenCalled();

      // Step 4: Save to local database
      await saveContact(foundUser);
      expect(mockDb.runSync).toHaveBeenCalled();
    });

    test('should handle error when adding existing contact', async () => {
      const { getDoc } = require('firebase/firestore');
      
      // Mock user already has contact
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: mockCurrentUser.id,
        data: () => ({
          ...mockCurrentUser,
          contacts: [mockContactUser.id],
        }),
      });

      const alreadyContact = await isContact(mockCurrentUser.id, mockContactUser.id);
      
      expect(alreadyContact).toBe(true);
      // Should not proceed with adding if already a contact
    });

    test('should complete full remove contact flow', async () => {
      const { updateDoc } = require('firebase/firestore');

      // Step 1: Remove from Firestore
      updateDoc.mockResolvedValue();
      await removeContact(mockCurrentUser.id, mockContactUser.id);
      expect(updateDoc).toHaveBeenCalledTimes(2);

      // Step 2: Remove from local database
      await deleteContact(mockContactUser.id);
      expect(mockDb.runSync).toHaveBeenCalledWith(
        'DELETE FROM contacts WHERE id = ?;',
        [mockContactUser.id]
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle Firestore errors gracefully', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        searchUserByEmail('test@example.com')
      ).rejects.toThrow('Failed to search user');
    });

    test('should handle database errors gracefully', async () => {
      mockDb.runSync.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(
        saveContact(mockContactUser)
      ).rejects.toThrow();
    });
  });
});

