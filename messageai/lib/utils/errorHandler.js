/**
 * Error Handler Utility for MessageAI MVP
 * 
 * Centralized error handling with user-friendly messages
 */

/**
 * Get user-friendly error message from error object
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Firebase Auth errors
  if (error.code) {
    return getFirebaseErrorMessage(error.code);
  }

  // Handle Firestore errors
  if (error.message) {
    // Check for common Firestore error patterns
    if (error.message.includes('permission-denied')) {
      return 'You don\'t have permission to perform this action';
    }
    if (error.message.includes('unavailable')) {
      return 'Service temporarily unavailable. Please try again.';
    }
    if (error.message.includes('not-found')) {
      return 'The requested item was not found';
    }
    if (error.message.includes('already-exists')) {
      return 'This item already exists';
    }
    
    // Return the original message if it's user-friendly
    if (error.message.length < 100) {
      return error.message;
    }
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Convert Firebase error codes to user-friendly messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
export function getFirebaseErrorMessage(errorCode) {
  const errorMessages = {
    // Auth errors
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already registered',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/requires-recent-login': 'Please log in again to continue',
    
    // Firestore errors
    'permission-denied': 'You don\'t have permission to perform this action',
    'unavailable': 'Service temporarily unavailable. Please try again.',
    'not-found': 'The requested item was not found',
    'already-exists': 'This item already exists',
    'resource-exhausted': 'Too many requests. Please try again later.',
    'cancelled': 'Operation was cancelled',
    'data-loss': 'Data loss occurred. Please try again.',
    'deadline-exceeded': 'Operation took too long. Please try again.',
    
    // Storage errors
    'storage/unauthorized': 'You don\'t have permission to access this file',
    'storage/object-not-found': 'File not found',
    'storage/quota-exceeded': 'Storage quota exceeded',
    'storage/unauthenticated': 'Please log in to upload files',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
}

/**
 * Handle async operation with error handling
 * @param {Function} asyncFn - Async function to execute
 * @param {string} errorContext - Context for error message (e.g., 'sending message')
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function handleAsync(asyncFn, errorContext = 'operation') {
  try {
    const result = await asyncFn();
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error ${errorContext}:`, error);
    const message = getErrorMessage(error);
    return { success: false, error: message };
  }
}

/**
 * Wrap a function with try-catch and error logging
 * @param {Function} fn - Function to wrap
 * @param {string} fnName - Function name for logging
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, fnName = 'function') {
  return async function (...args) {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`Error in ${fnName}:`, error);
      throw new Error(getErrorMessage(error));
    }
  };
}

/**
 * Log error with context
 * @param {string} context - Where the error occurred
 * @param {Error} error - Error object
 * @param {Object} additionalInfo - Additional context info
 */
export function logError(context, error, additionalInfo = {}) {
  console.error(`[${context}]`, {
    message: error.message || error,
    code: error.code,
    stack: error.stack,
    ...additionalInfo,
  });
}

/**
 * Check if error is network-related
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
  if (!error) return false;
  
  const networkPatterns = [
    'network',
    'offline',
    'connection',
    'timeout',
    'unreachable',
    'failed to fetch',
  ];
  
  const errorString = (error.message || error.code || error.toString()).toLowerCase();
  
  return networkPatterns.some(pattern => errorString.includes(pattern));
}

/**
 * Create error response object
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @returns {Object} Error response
 */
export function createErrorResponse(message, code = 'ERROR') {
  return {
    success: false,
    error: message,
    code,
  };
}

/**
 * Create success response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Success response
 */
export function createSuccessResponse(data, message = 'Success') {
  return {
    success: true,
    data,
    message,
  };
}

