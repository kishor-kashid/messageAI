const admin = require("firebase-admin");
const functions = require("firebase-functions");

// Rate limit configuration
const RATE_LIMIT = {
  maxCalls: 100, // Maximum calls per window
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
};

/**
 * Check if user has exceeded rate limit
 * @param {string} userId - User ID to check
 * @return {Promise<Object>} Rate limit status
 */
async function checkRateLimit(userId) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  
  try {
    // Count recent AI calls from this user
    const recentCallsSnapshot = await admin.firestore()
        .collection("ai_usage_log")
        .where("user_id", "==", userId)
        .where("timestamp", ">", windowStart)
        .get();
    
    const callCount = recentCallsSnapshot.size;
    
    if (callCount >= RATE_LIMIT.maxCalls) {
      throw new functions.https.HttpsError(
          "resource-exhausted",
          `Rate limit exceeded. Maximum ${RATE_LIMIT.maxCalls} calls per hour. ` +
          `Please try again later.`,
      );
    }
    
    return {
      allowed: true,
      remaining: RATE_LIMIT.maxCalls - callCount,
      resetAt: windowStart + RATE_LIMIT.windowMs,
      current: callCount,
    };
  } catch (error) {
    // If it's already a rate limit error, re-throw
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // For other errors, log and allow (fail open)
    console.error("Rate limit check failed:", error);
    return {
      allowed: true,
      remaining: RATE_LIMIT.maxCalls,
      resetAt: now + RATE_LIMIT.windowMs,
      current: 0,
    };
  }
}

/**
 * Log AI usage for rate limiting and cost tracking
 * @param {string} userId - User ID
 * @param {string} functionName - Name of the AI function called
 * @param {number} tokensUsed - Estimated tokens used
 * @param {number} estimatedCost - Estimated cost in USD
 * @return {Promise<void>}
 */
async function logAIUsage(userId, functionName, tokensUsed, estimatedCost = 0) {
  try {
    await admin.firestore()
        .collection("ai_usage_log")
        .add({
          user_id: userId,
          function_name: functionName,
          tokens_used: tokensUsed,
          estimated_cost: estimatedCost,
          timestamp: Date.now(),
        });
  } catch (error) {
    // Log error but don't fail the request
    console.error("Failed to log AI usage:", error);
  }
}

module.exports = {
  checkRateLimit,
  logAIUsage,
  RATE_LIMIT,
};


