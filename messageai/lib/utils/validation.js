/**
 * Input Validation Functions for MessageAI MVP
 * 
 * All validation logic is centralized here
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password is too long' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate display name
 * @param {string} displayName - Display name to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateDisplayName(displayName) {
  if (!displayName || typeof displayName !== 'string') {
    return { valid: false, message: 'Display name is required' };
  }
  
  const trimmed = displayName.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, message: 'Display name must be at least 2 characters' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, message: 'Display name is too long' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate that a field is not empty
 * @param {string} value - Value to check
 * @param {string} fieldName - Name of the field (for error message)
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateRequired(value, fieldName = 'Field') {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  return { valid: true, message: '' };
}

