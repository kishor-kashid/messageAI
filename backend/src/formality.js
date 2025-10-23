const {withAIMiddleware, validators} = require("./utils/functionWrapper");
const {callOpenAI} = require("./utils/aiClient");

/**
 * Formality level descriptions
 */
const formalityLevels = {
  casual: "Very casual and friendly, like texting a friend. " +
          "Use contractions, emojis welcome.",
  neutral: "Balanced tone, neither too casual nor too formal. " +
           "Polite and clear.",
  formal: "Professional and respectful. Avoid slang and contractions.",
  professional: "Business formal. Like writing to a CEO or important client.",
};

/**
 * Adjust the formality level of a message
 * Cloud Function: adjustFormality
 */
exports.adjustFormality = withAIMiddleware(
    async (data, userId) => {
      const {text, targetFormality, language} = data;
      
      const prompt = `Rewrite this message with a ${targetFormality} tone:

Original: "${text}"
Language: ${language || "auto-detect"}

Style guide: ${formalityLevels[targetFormality]}

Rules:
- Keep the same meaning
- Preserve important details
- Match the target formality level
- Return ONLY the rewritten text, no explanations

Rewritten message:`;

      const rewritten = await callOpenAI(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 200,
      });
      
      return {
        originalText: text,
        rewrittenText: rewritten.trim(),
        formality: targetFormality,
        _aiMetadata: {prompt, response: rewritten}, // For usage logging
      };
    },
    {
      functionName: "adjust_formality",
      authMessage: "Must be logged in to adjust formality.",
      validate: validators.combine(
          validators.requireString("text"),
          validators.requireEnum(
              "targetFormality",
              ["casual", "neutral", "formal", "professional"],
          ),
          validators.optionalString("language"),
      ),
    },
);
