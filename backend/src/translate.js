const {withAIMiddleware, validators} = require("./utils/functionWrapper");
const {callOpenAI} = require("./utils/aiClient");

/**
 * Translate a message to target language
 * Cloud Function: translateMessage
 */
exports.translateMessage = withAIMiddleware(
    async (data, userId) => {
      const {text, targetLanguage, sourceLanguage} = data;
      
      // TODO: Check translation cache first (will implement in PR #18)
      
      // Translate with OpenAI
      const prompt = `Translate this message to ${targetLanguage}.
Preserve the tone and emotion. If there are emojis, keep them.
Only return the translation, no explanations.

Original text: "${text}"`;

      const translation = await callOpenAI(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.3,
        maxTokens: 1000,
      });
      
      // TODO: Cache the translation (will implement in PR #18)
      
      return {
        originalText: text,
        translatedText: translation.trim(),
        sourceLanguage: sourceLanguage || "auto",
        targetLanguage: targetLanguage,
        _aiMetadata: {prompt, response: translation}, // For usage logging
      };
    },
    {
      functionName: "translate",
      authMessage: "Must be logged in to use translation.",
      validate: validators.combine(
          validators.requireString("text"),
          validators.requireString("targetLanguage"),
          validators.optionalString("sourceLanguage"),
      ),
    },
);
