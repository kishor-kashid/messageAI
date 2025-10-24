const OpenAI = require("openai");
const functions = require("firebase-functions");

// Initialize OpenAI client
let openaiClient = null;

/**
 * Get or initialize OpenAI client
 * @return {OpenAI} OpenAI client instance
 */
function getOpenAIClient() {
  if (!openaiClient) {
    const config = functions.config();
    const apiKey = (config.openai && config.openai.key) || 
                   process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }
    
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  
  return openaiClient;
}

/**
 * Call OpenAI API with error handling
 * @param {string} prompt - The prompt to send to OpenAI
 * @param {Object} options - Additional options
 * @param {string} options.model - Model to use (default: gpt-4o-mini)
 * @param {number} options.temperature - Temperature (default: 0.7)
 * @param {number} options.maxTokens - Max tokens (default: 500)
 * @param {Array} options.messages - Custom messages array (overrides prompt)
 * @return {Promise<string>} Response from OpenAI
 */
async function callOpenAI(prompt, options = {}) {
  try {
    const client = getOpenAIClient();
    
    const messages = options.messages || [
      {role: "user", content: prompt},
    ];
    
    const completion = await client.chat.completions.create({
      model: options.model || "gpt-4o-mini",
      messages: messages,
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      max_tokens: options.maxTokens || 1000,
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    
    // Handle specific error types
    if (error.status === 429) {
      throw new functions.https.HttpsError(
          "resource-exhausted",
          "API rate limit exceeded. Please try again later.",
      );
    } else if (error.status === 401) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "Invalid API key configuration.",
      );
    } else if (error.status === 500 || error.status === 503) {
      throw new functions.https.HttpsError(
          "unavailable",
          "AI service temporarily unavailable. Please try again.",
      );
    }
    
    throw new functions.https.HttpsError(
        "internal",
        "AI service error occurred.",
    );
  }
}

/**
 * Estimate token count for a text string
 * Rough approximation: 1 token ≈ 4 characters
 * @param {string} text - Text to estimate tokens for
 * @return {number} Estimated token count
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

module.exports = {
  callOpenAI,
  estimateTokens,
  getOpenAIClient,
};


