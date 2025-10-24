const {withAIMiddleware, validators} = require("./utils/functionWrapper");
const {callOpenAI} = require("./utils/aiClient");
const admin = require("firebase-admin");

/**
 * Fetch recent conversation context (RAG)
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Number of recent messages to fetch
 * @return {Promise<Array>} Recent messages
 */
async function fetchConversationContext(conversationId, limit = 5) {
  try {
    const messagesSnapshot = await admin
        .firestore()
        .collection("messages")
        .where("conversationId", "==", conversationId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();

    const messages = [];
    messagesSnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        senderId: data.senderId,
        content: data.content || "",
        timestamp: data.timestamp,
      });
    });

    // Return in chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error("Error fetching conversation context:", error);
    return [];
  }
}

/**
 * Analyze user's communication style
 * @param {string} userId - User ID
 * @return {Promise<Object>} User style analysis
 */
async function analyzeUserStyle(userId) {
  try {
    // Check cache first (7 days)
    const cacheDoc = await admin
        .firestore()
        .collection("user_styles")
        .doc(userId)
        .get();

    if (cacheDoc.exists) {
      const cached = cacheDoc.data();
      const age = Date.now() - cached.analyzedAt;
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

      if (age < SEVEN_DAYS) {
        return cached.style;
      }
    }

    // Fetch user's recent messages (last 50)
    const messagesSnapshot = await admin
        .firestore()
        .collection("messages")
        .where("senderId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();

    if (messagesSnapshot.empty) {
      // New user - return default style
      return {
        tone: "friendly",
        emojiUsage: "moderate",
        averageLength: "medium",
        formality: "casual",
      };
    }

    // Extract message contents
    const userMessages = [];
    messagesSnapshot.forEach((doc) => {
      const content = doc.data().content;
      if (content) {
        userMessages.push(content);
      }
    });

    // Use LLM to analyze style
    const prompt = `Analyze this user's communication style based on their recent messages.

Messages:
${userMessages.slice(0, 20).map((msg, i) => `${i + 1}. ${msg}`).join("\n")}

Analyze:
- Tone (friendly/casual/formal/professional)
- Emoji usage (none/minimal/moderate/frequent)
- Average message length (short/medium/long)
- Formality level (very casual/casual/neutral/formal)

Return as JSON:
{
  "tone": "friendly",
  "emojiUsage": "moderate",
  "averageLength": "medium",
  "formality": "casual"
}`;

    const result = await callOpenAI(prompt, {
      model: "gpt-4o-mini",
      temperature: 0.3,
      maxTokens: 150,
    });

    let style;
    try {
      style = JSON.parse(result);
    } catch (e) {
      // Fallback to default
      style = {
        tone: "friendly",
        emojiUsage: "moderate",
        averageLength: "medium",
        formality: "casual",
      };
    }

    // Cache the analysis
    await admin
        .firestore()
        .collection("user_styles")
        .doc(userId)
        .set({
          style,
          analyzedAt: Date.now(),
          messageCount: userMessages.length,
        });

    return style;
  } catch (error) {
    console.error("Error analyzing user style:", error);
    // Return default style
    return {
      tone: "friendly",
      emojiUsage: "moderate",
      averageLength: "medium",
      formality: "casual",
    };
  }
}

/**
 * Generate context-aware smart reply suggestions
 * Cloud Function: generateSmartReplies
 * With RAG (conversation history) and user style analysis
 */
exports.generateSmartReplies = withAIMiddleware(
    async (data, userId) => {
      const {lastMessage, conversationId, targetLanguage} = data;

      // Fetch conversation context (RAG)
      const conversationHistory = conversationId ?
        await fetchConversationContext(conversationId, 5) :
        [];

      // Analyze user's communication style
      const userStyle = await analyzeUserStyle(userId);

      // Build context from conversation history
      const contextText = conversationHistory.length > 0 ?
        conversationHistory.map((msg, i) =>
          `${i + 1}. ${msg.content}`,
        ).join("\n") :
        "No previous context.";

      // Generate smart replies with full context
      const prompt = `Generate 3 context-aware quick reply options.

Recent Conversation:
${contextText}

Latest Message: "${lastMessage}"

User's Communication Style:
- Tone: ${userStyle.tone}
- Emoji usage: ${userStyle.emojiUsage}
- Typical length: ${userStyle.averageLength}
- Formality: ${userStyle.formality}

Requirements:
- Reply language: ${targetLanguage || "same as the latest message"}
- Match the user's natural communication style
- Be contextually relevant to the conversation
- Generate 3 options with varying lengths:
  1. Short & friendly (5-10 words)
  2. Medium & thoughtful (10-20 words)
  3. Detailed & engaged (20-40 words)

Return ONLY a valid JSON array: ["reply1", "reply2", "reply3"]`;

      const result = await callOpenAI(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.8,
        maxTokens: 300,
      });

      try {
        const replies = JSON.parse(result);
        return {
          replies: Array.isArray(replies) ? replies : [],
          context: {
            language: targetLanguage,
            style: userStyle,
            conversationLength: conversationHistory.length,
          },
          _aiMetadata: {prompt, response: result},
        };
      } catch (error) {
        console.error("Failed to parse smart replies:", error);
        // Fallback to style-appropriate generic replies
        const fallbackReplies = userStyle.emojiUsage === "frequent" ?
          ["Thanks! 😊", "Sounds great! 👍", "Got it, appreciate it! 🙏"] :
          ["Thanks!", "Sounds good!", "Got it, thank you!"];

        return {
          replies: fallbackReplies,
          context: {
            language: targetLanguage,
            style: userStyle,
            fallback: true,
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
          validators.optionalString("conversationId"),
          validators.optionalString("targetLanguage"),
          validators.optionalString("replyStyle"),
      ),
    },
);
