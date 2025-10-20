/**
 * Unit Tests for Validation Functions
 * MessageAI MVP
 */

import {
  isValidEmail,
  validatePassword,
  validateDisplayName,
  validateRequired,
} from '../../lib/utils/validation';

describe('Validation Functions', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(isValidEmail('  test@example.com  ')).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should accept passwords with 6 or more characters', () => {
      const result1 = validatePassword('password123');
      expect(result1.valid).toBe(true);
      expect(result1.message).toBe('');

      const result2 = validatePassword('123456');
      expect(result2.valid).toBe(true);
    });

    it('should reject passwords shorter than 6 characters', () => {
      const result = validatePassword('12345');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password must be at least 6 characters');
    });

    it('should reject empty passwords', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password is required');
    });

    it('should reject passwords longer than 128 characters', () => {
      const longPassword = 'a'.repeat(129);
      const result = validatePassword(longPassword);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password is too long');
    });

    it('should handle null and undefined', () => {
      const result1 = validatePassword(null);
      expect(result1.valid).toBe(false);

      const result2 = validatePassword(undefined);
      expect(result2.valid).toBe(false);
    });
  });

  describe('validateDisplayName', () => {
    it('should accept valid display names', () => {
      const result1 = validateDisplayName('John Doe');
      expect(result1.valid).toBe(true);
      expect(result1.message).toBe('');

      const result2 = validateDisplayName('Alice');
      expect(result2.valid).toBe(true);
    });

    it('should reject names shorter than 2 characters', () => {
      const result = validateDisplayName('A');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Display name must be at least 2 characters');
    });

    it('should reject names longer than 50 characters', () => {
      const longName = 'a'.repeat(51);
      const result = validateDisplayName(longName);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Display name is too long');
    });

    it('should reject empty names', () => {
      const result = validateDisplayName('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Display name is required');
    });

    it('should trim whitespace before validation', () => {
      const result = validateDisplayName('  John  ');
      expect(result.valid).toBe(true);
    });

    it('should handle null and undefined', () => {
      const result1 = validateDisplayName(null);
      expect(result1.valid).toBe(false);

      const result2 = validateDisplayName(undefined);
      expect(result2.valid).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should accept non-empty values', () => {
      const result = validateRequired('some value', 'Field');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should reject empty strings', () => {
      const result = validateRequired('', 'Email');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Email is required');
    });

    it('should reject whitespace-only strings', () => {
      const result = validateRequired('   ', 'Name');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Name is required');
    });

    it('should handle null and undefined', () => {
      const result1 = validateRequired(null, 'Field');
      expect(result1.valid).toBe(false);

      const result2 = validateRequired(undefined, 'Field');
      expect(result2.valid).toBe(false);
    });

    it('should use custom field name in error message', () => {
      const result = validateRequired('', 'Password');
      expect(result.message).toBe('Password is required');
    });

    it('should use default field name if not provided', () => {
      const result = validateRequired('');
      expect(result.message).toBe('Field is required');
    });
  });
});

