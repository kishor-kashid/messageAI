/**
 * MessageAI Cloud Functions
 * AI-powered features for International Communicator persona
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import AI function modules
const translate = require("./src/translate");
const detect = require("./src/detect");
const culturalContext = require("./src/culturalContext");
const formality = require("./src/formality");
const smartReplies = require("./src/smartReplies");
const imageOCR = require("./src/imageOCR");

// Export all AI functions
exports.translateMessage = translate.translateMessage;
exports.detectLanguage = detect.detectLanguage;
exports.explainPhrase = culturalContext.explainPhrase;
exports.detectCulturalReferences = culturalContext.detectCulturalReferences;
exports.getCulturalContext = culturalContext.getCulturalContext;
exports.adjustFormality = formality.adjustFormality;
exports.generateSmartReplies = smartReplies.generateSmartReplies;
exports.extractImageText = imageOCR.extractImageText;

// Health check function
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    functions: [
      "translateMessage",
      "detectLanguage",
      "explainPhrase",
      "detectCulturalReferences",
      "getCulturalContext",
      "adjustFormality",
      "generateSmartReplies",
      "extractImageText",
    ],
  });
});


