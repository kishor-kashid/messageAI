const {withAIMiddleware, validators} = require("./utils/functionWrapper");
const {callOpenAI} = require("./utils/aiClient");

/**
 * Explain a cultural phrase or idiom
 * Cloud Function: explainPhrase
 */
exports.explainPhrase = withAIMiddleware(
    async (data, userId) => {
      const {phrase, fullMessage, language} = data;
      
      const prompt = `Explain this phrase or cultural reference in simple terms:

Phrase: "${phrase}"
Context: "${fullMessage || phrase}"
Language: ${language || "English"}

Provide a brief explanation (2-3 sentences) that helps someone unfamiliar understand:
1. What it means literally
2. What it means culturally
3. When/why it's used

Keep it concise and friendly.`;

      const explanation = await callOpenAI(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 150,
      });
      
      return {
        phrase: phrase,
        explanation: explanation.trim(),
        _aiMetadata: {prompt, response: explanation}, // For usage logging
      };
    },
    {
      functionName: "explain_phrase",
      authMessage: "Must be logged in to use cultural explanations.",
      validate: validators.combine(
          validators.requireString("phrase"),
          validators.optionalString("fullMessage"),
          validators.optionalString("language"),
      ),
    },
);

/**
 * Detect cultural references and idioms in a message
 * Cloud Function: detectCulturalReferences
 */
exports.detectCulturalReferences = withAIMiddleware(
    async (data, userId) => {
      const {text, language} = data;
      
      const prompt = `Analyze this message and identify any idioms, slang, or ` +
        `cultural references that might need explanation:

Message: "${text}"
Language: ${language || "auto-detect"}

Return a JSON array of objects with:
- phrase: the idiom/reference
- startIndex: character position where it starts
- endIndex: character position where it ends

If there are no idioms or cultural references, return an empty array: []

Example: [{"phrase": "break the ice", "startIndex": 10, "endIndex": 23}]`;

      const result = await callOpenAI(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.3,
        maxTokens: 200,
      });
      
      try {
        const references = JSON.parse(result);
        return {
          references: Array.isArray(references) ? references : [],
          _aiMetadata: {prompt, response: result}, // For usage logging
        };
      } catch (error) {
        console.error("Failed to parse cultural references:", error);
        return {
          references: [],
          _aiMetadata: {prompt, response: result},
        };
      }
    },
    {
      functionName: "detect_cultural",
      authMessage: "Must be logged in to detect cultural references.",
      validate: validators.combine(
          validators.requireString("text"),
          validators.optionalString("language"),
      ),
    },
);
