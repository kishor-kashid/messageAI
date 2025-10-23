const {withAIMiddleware, validators} = require("./utils/functionWrapper");
const {callOpenAI} = require("./utils/aiClient");

/**
 * Detect the language of a message
 * Cloud Function: detectLanguage
 */
exports.detectLanguage = withAIMiddleware(
    async (data, userId) => {
      const {text} = data;
      
      // Use simple prompt for speed
      const prompt = `Detect the language of this text and return ONLY the ` +
        `ISO 639-1 code (e.g., "en", "es", "fr"):
"${text}"

If uncertain, return "unknown".`;

      const languageCode = await callOpenAI(prompt, {
        model: "gpt-4o-mini",
        maxTokens: 10,
        temperature: 0.1,
      });
      
      return {
        languageCode: languageCode.trim().toLowerCase(),
        originalText: text,
        _aiMetadata: {prompt, response: languageCode}, // For usage logging
      };
    },
    {
      functionName: "detect_language",
      authMessage: "Must be logged in to use language detection.",
      validate: validators.requireString("text"),
    },
);
