const {withAIMiddleware, validators} = require("./utils/functionWrapper");
const {callOpenAI} = require("./utils/aiClient");

/**
 * Generate context-aware smart reply suggestions
 * Cloud Function: generateSmartReplies
 * Note: Full implementation in PR #21 with RAG
 */
exports.generateSmartReplies = withAIMiddleware(
    async (data, userId) => {
      const {lastMessage, targetLanguage, replyStyle} = data;
      
      // TODO: Implement RAG for conversation history (PR #21)
      // TODO: Implement user style analysis (PR #21)
      
      // For now, generate basic smart replies
      const prompt = `Generate 3 quick reply options for this message.

Message received: "${lastMessage}"
Reply language: ${targetLanguage || "same as message"}
Style: ${replyStyle || "friendly"}

Generate 3 reply options:
1. Short & friendly (5-10 words)
2. Medium & thoughtful (10-20 words)
3. Detailed & engaged (20-40 words)

Return as JSON array: ["reply1", "reply2", "reply3"]`;

      const result = await callOpenAI(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.8,
        maxTokens: 250,
      });
      
      try {
        const replies = JSON.parse(result);
        return {
          replies: Array.isArray(replies) ? replies : [],
          context: {
            language: targetLanguage,
            style: replyStyle || "friendly",
          },
          _aiMetadata: {prompt, response: result}, // For usage logging
        };
      } catch (error) {
        console.error("Failed to parse smart replies:", error);
        // Fallback to generic replies
        return {
          replies: [
            "Thanks! 👍",
            "Sounds good!",
            "Got it, thank you!",
          ],
          context: {
            language: targetLanguage,
            style: "fallback",
          },
          _aiMetadata: {prompt, response: result},
        };
      }
    },
    {
      functionName: "smart_replies",
      authMessage: "Must be logged in to generate smart replies.",
      validate: validators.combine(
          validators.requireString("lastMessage"),
          validators.optionalString("targetLanguage"),
          validators.optionalString("replyStyle"),
      ),
    },
);
