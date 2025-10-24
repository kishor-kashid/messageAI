const functions = require("firebase-functions");
const {checkRateLimit, logAIUsage} = require("./rateLimit");
const {estimateTokens} = require("./aiClient");

/**
 * Wrapper for AI functions with common middleware
 * Handles: Authentication, Rate Limiting, Validation, Error Handling, Usage Logging
 * 
 * @param {Function} handler - The actual function logic (data, userId, context) => result
 * @param {Object} options - Configuration options
 * @param {string} options.functionName - Name for logging (e.g., "translate")
 * @param {Function} options.validate - Validation function that throws on error
 * @param {boolean} options.skipRateLimit - Skip rate limiting (default: false)
 * @param {string} options.authMessage - Custom auth error message
 * @param {string} options.errorMessage - Custom error message
 * @return {Function} Cloud Function handler
 */
function withAIMiddleware(handler, options = {}) {
  return functions.https.onCall(async (data, context) => {
    const startTime = Date.now();
    
    try {
      // 1. Authentication Check
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            options.authMessage || "Must be logged in to use AI features.",
        );
      }
      
      const userId = context.auth.uid;
      
      // 2. Input Validation (if schema provided)
      if (options.validate) {
        options.validate(data);
      }
      
      // 3. Rate Limiting
      if (options.skipRateLimit !== true) {
        await checkRateLimit(userId);
      }
      
      // 4. Call the actual handler
      const result = await handler(data, userId, context);
      
      // 5. Usage Logging
      if (options.functionName && result._aiMetadata) {
        const tokens = estimateTokens(
            result._aiMetadata.prompt + result._aiMetadata.response,
        );
        await logAIUsage(userId, options.functionName, tokens);
      }
      
      // Remove metadata from response
      if (result._aiMetadata) {
        delete result._aiMetadata;
      }
      
      // 6. Log success metrics
      const duration = Date.now() - startTime;
      console.log(`✅ ${options.functionName} success: ${duration}ms (user: ${userId})`);
      
      return result;
    } catch (error) {
      // 7. Centralized Error Handling
      const duration = Date.now() - startTime;
      console.error(`❌ ${options.functionName} error (${duration}ms):`, error);
      
      // Re-throw if already a proper HttpsError
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      // Convert unknown errors to proper HttpsError
      throw new functions.https.HttpsError(
          "internal",
          options.errorMessage || "An error occurred processing your request.",
      );
    }
  });
}

/**
 * Common validation helpers
 * These can be combined using validators.combine()
 */
const validators = {
  /**
   * Validate that a field exists and is a string
   * @param {string} fieldName - Name of the field to validate
   * @param {string} customMessage - Optional custom error message
   * @return {Function} Validation function
   */
  requireString(fieldName, customMessage) {
    return (data) => {
      if (!data[fieldName] || typeof data[fieldName] !== "string") {
        throw new functions.https.HttpsError(
            "invalid-argument",
            customMessage || `${fieldName} is required and must be a string.`,
        );
      }
    };
  },

  /**
   * Validate that a field is one of allowed values
   * @param {string} fieldName - Name of the field to validate
   * @param {Array} allowedValues - Array of allowed values
   * @param {string} customMessage - Optional custom error message
   * @return {Function} Validation function
   */
  requireEnum(fieldName, allowedValues, customMessage) {
    return (data) => {
      if (!allowedValues.includes(data[fieldName])) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            customMessage ||
            `${fieldName} must be one of: ${allowedValues.join(", ")}`,
        );
      }
    };
  },

  /**
   * Optional field validation (only validates if field is present)
   * @param {string} fieldName - Name of the field to validate
   * @return {Function} Validation function
   */
  optionalString(fieldName) {
    return (data) => {
      if (data[fieldName] !== undefined && typeof data[fieldName] !== "string") {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${fieldName} must be a string if provided.`,
        );
      }
    };
  },

  /**
   * Combine multiple validators
   * @param {...Function} validatorFuncs - Validator functions to combine
   * @return {Function} Combined validation function
   */
  combine(...validatorFuncs) {
    return (data) => {
      validatorFuncs.forEach((validator) => validator(data));
    };
  },
};

module.exports = {
  withAIMiddleware,
  validators,
};

