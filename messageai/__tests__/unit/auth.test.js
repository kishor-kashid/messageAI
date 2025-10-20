/**
 * Unit Tests for Authentication Functions
 * MessageAI MVP
 */

import {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  getCurrentUser,
} from '../../lib/firebase/auth';

// Mock Firebase Auth
jest.mock('firebase/auth');

describe('Authentication Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUpWithEmail', () => {
    it('should create a new user with valid email and password', async () => {
      const mockUser = {
        uid: 'test-uid-123',
        email: 'test@example.com',
      };

      const { createUserWithEmailAndPassword } = require('firebase/auth');
      createUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      const result = await signUpWithEmail('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    it('should throw error when email already in use', async () => {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      createUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/email-already-in-use',
      });

      await expect(
        signUpWithEmail('existing@example.com', 'password123')
      ).rejects.toThrow('Email already registered');
    });

    it('should throw error for weak password', async () => {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      createUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/weak-password',
      });

      await expect(
        signUpWithEmail('test@example.com', '123')
      ).rejects.toThrow('Password should be at least 6 characters');
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in user with correct credentials', async () => {
      const mockUser = {
        uid: 'test-uid-123',
        email: 'test@example.com',
      };

      const { signInWithEmailAndPassword } = require('firebase/auth');
      signInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      const result = await signInWithEmail('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    it('should throw error for incorrect password', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      signInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/wrong-password',
      });

      await expect(
        signInWithEmail('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Incorrect password');
    });

    it('should throw error for non-existent user', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      signInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/user-not-found',
      });

      await expect(
        signInWithEmail('nonexistent@example.com', 'password123')
      ).rejects.toThrow('No account found with this email');
    });
  });

  describe('signOut', () => {
    it('should sign out current user successfully', async () => {
      const { signOut: firebaseSignOut } = require('firebase/auth');
      firebaseSignOut.mockResolvedValue();

      await expect(signOut()).resolves.not.toThrow();
      expect(firebaseSignOut).toHaveBeenCalled();
    });

    it('should throw error if sign out fails', async () => {
      const { signOut: firebaseSignOut } = require('firebase/auth');
      firebaseSignOut.mockRejectedValue(new Error('Sign out failed'));

      await expect(signOut()).rejects.toThrow();
    });
  });
});

