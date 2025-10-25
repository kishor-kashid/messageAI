/**
 * AI Service - Firebase Cloud Functions Client
 * 
 * Wrapper for calling AI-powered Firebase Cloud Functions.
 * Handles authentication, error handling, and caching.
 * 
 * Available Functions:
 * - translateMessage: Translate text to target language
 * - detectLanguage: Auto-detect language of text
 * - explainPhrase: Explain cultural references and idioms
 * - detectCulturalReferences: Find idioms/slang in text
 * - getCulturalContext: Get cultural context for any message
 * - adjustFormality: Change message tone/formality
 * - generateSmartReplies: Generate contextual quick replies
 * - extractImageText: Extract text from images using OCR
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { Platform } from 'react-native';

// Platform-aware storage
let storage;
if (Platform.OS === 'web') {
  // Use localStorage for web
  storage = {
    getItem: async (key) => {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    setItem: async (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('localStorage error:', e);
      }
    },
    removeItem: async (key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('localStorage error:', e);
      }
    },
    getAllKeys: async () => {
      try {
        return Object.keys(localStorage);
      } catch (e) {
        return [];
      }
    },
    multiRemove: async (keys) => {
      try {
        keys.forEach(key => localStorage.removeItem(key));
      } catch (e) {
        console.error('localStorage error:', e);
      }
    },
  };
} else {
  // Use AsyncStorage for native platforms
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = AsyncStorage;
}

// Initialize Firebase Functions
let functions = null;

/**
 * Initialize Firebase Functions instance
 */
const initFunctions = () => {
  if (!functions) {
    functions = getFunctions();
  }
  return functions;
};

/**
 * Generic wrapper for calling Firebase Cloud Functions
 * @param {string} functionName - Name of the cloud function
 * @param {object} data - Data to pass to the function
 * @returns {Promise<any>} - Function result
 */
const callFunction = async (functionName, data) => {
  try {
    const funcs = initFunctions();
    const callable = httpsCallable(funcs, functionName);
    const result = await callable(data);
    return result.data;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    
    // Parse Firebase Functions errors and map to error types
    if (error.code === 'functions/unauthenticated') {
      const err = new Error('You must be logged in to use AI features.');
      err.type = 'AUTH';
      throw err;
    } else if (error.code === 'functions/resource-exhausted') {
      const err = new Error('Rate limit exceeded. Please try again in a few minutes.');
      err.type = 'RATE_LIMIT';
      throw err;
    } else if (error.code === 'functions/invalid-argument') {
      throw new Error(error.message || 'Invalid input provided.');
    } else if (error.code === 'functions/unavailable') {
      const err = new Error('AI service is temporarily unavailable. Please try again.');
      err.type = 'NETWORK';
      throw err;
    }
    
    throw new Error(error.message || 'An error occurred with the AI service.');
  }
};

/**
 * Translate message to target language
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (e.g., 'es', 'fr', 'de')
 * @param {string} sourceLanguage - Optional source language code
 * @returns {Promise<{originalText: string, translatedText: string, sourceLanguage: string, targetLanguage: string}>}
 */
export const translateMessage = async (text, targetLanguage, sourceLanguage = null) => {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for translation.');
  }
  
  if (!targetLanguage) {
    throw new Error('Target language is required.');
  }
  
  const data = { text, targetLanguage };
  if (sourceLanguage) {
    data.sourceLanguage = sourceLanguage;
  }
  
  return await callFunction('translateMessage', data);
};

/**
 * Detect language of text
 * @param {string} text - Text to analyze
 * @returns {Promise<{languageCode: string, languageName: string}>}
 */
export const detectLanguage = async (text) => {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for language detection.');
  }
  
  return await callFunction('detectLanguage', { text });
};

/**
 * Explain a cultural phrase or idiom
 * @param {string} phrase - Phrase to explain
 * @param {string} fullMessage - Optional full message for context
 * @param {string} language - Optional language code
 * @returns {Promise<{phrase: string, explanation: string}>}
 */
export const explainPhrase = async (phrase, fullMessage = null, language = null) => {
  if (!phrase || phrase.trim().length === 0) {
    throw new Error('Phrase is required.');
  }
  
  const data = { phrase };
  if (fullMessage) {
    data.fullMessage = fullMessage;
  }
  if (language) {
    data.language = language;
  }
  
  return await callFunction('explainPhrase', data);
};

/**
 * Detect cultural references in text
 * @param {string} text - Text to analyze
 * @param {string} language - Optional language code
 * @returns {Promise<{references: Array<{phrase: string, startIndex: number, endIndex: number}>}>}
 */
export const detectCulturalReferences = async (text, language = null) => {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required.');
  }
  
  const data = { text };
  if (language) {
    data.language = language;
  }
  
  return await callFunction('detectCulturalReferences', data);
};

/**
 * Get cultural context and explanation for any message
 * @param {string} text - Text to get context for
 * @param {string} language - Optional language code
 * @returns {Promise<{text: string, culturalContext: string, language: string}>}
 */
export const getCulturalContext = async (text, language = null) => {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required.');
  }
  
  const data = { text };
  if (language) {
    data.language = language;
  }
  
  return await callFunction('getCulturalContext', data);
};

/**
 * Adjust formality level of text
 * @param {string} text - Text to adjust
 * @param {string} targetFormality - Target formality ('casual', 'neutral', 'formal', 'professional')
 * @param {string} language - Optional language code
 * @returns {Promise<{originalText: string, rewrittenText: string, targetFormality: string}>}
 */
export const adjustFormality = async (text, targetFormality, language = null) => {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required.');
  }
  
  const validFormalities = ['casual', 'neutral', 'formal', 'professional'];
  if (!validFormalities.includes(targetFormality)) {
    throw new Error(`Invalid formality level. Must be one of: ${validFormalities.join(', ')}`);
  }
  
  const data = { text, targetFormality };
  if (language) {
    data.language = language;
  }
  
  return await callFunction('adjustFormality', data);
};

/**
 * Generate smart reply suggestions with conversation context
 * @param {string} lastMessage - Last received message
 * @param {string} conversationId - Optional conversation ID for context (RAG)
 * @param {string} targetLanguage - Optional target language
 * @param {string} replyStyle - Optional reply style preference
 * @returns {Promise<{replies: Array<string>, context: Object}>}
 */
export const generateSmartReplies = async (lastMessage, conversationId = null, targetLanguage = null, replyStyle = null) => {
  if (!lastMessage || lastMessage.trim().length === 0) {
    throw new Error('Last message is required.');
  }
  
  const data = { lastMessage };
  if (conversationId) {
    data.conversationId = conversationId;
  }
  if (targetLanguage) {
    data.targetLanguage = targetLanguage;
  }
  if (replyStyle) {
    data.replyStyle = replyStyle;
  }
  
  return await callFunction('generateSmartReplies', data);
};

/**
 * Translation cache for reducing API calls
 * In-memory cache - could be moved to AsyncStorage or SQLite for persistence
 */
const translationCache = new Map();

/**
 * Cultural context cache for reducing API calls
 */
const culturalContextCache = new Map();

/**
 * Get cached translation or fetch new one
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language
 * @param {string} sourceLanguage - Source language
 * @returns {Promise<object>} - Translation result
 */
export const getCachedTranslation = async (text, targetLanguage, sourceLanguage = null) => {
  const cacheKey = `${text}:${sourceLanguage || 'auto'}:${targetLanguage}`;
  
  // Check cache
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  // Fetch new translation
  const translation = await translateMessage(text, targetLanguage, sourceLanguage);
  
  // Store in cache (limit cache size to 100 entries)
  if (translationCache.size >= 100) {
    const firstKey = translationCache.keys().next().value;
    translationCache.delete(firstKey);
  }
  translationCache.set(cacheKey, translation);
  
  return translation;
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = () => {
  translationCache.clear();
};

/**
 * Get cached cultural context or fetch new one
 * @param {string} text - Text to get context for
 * @param {string} language - Language code
 * @returns {Promise<object>} - Cultural context result
 */
export const getCachedCulturalContext = async (text, language = null) => {
  const cacheKey = `${text}:${language || 'auto'}`;
  
  // Check cache
  if (culturalContextCache.has(cacheKey)) {
    return culturalContextCache.get(cacheKey);
  }
  
  // Fetch new context
  const context = await getCulturalContext(text, language);
  
  // Store in cache (limit cache size to 50 entries)
  if (culturalContextCache.size >= 50) {
    const firstKey = culturalContextCache.keys().next().value;
    culturalContextCache.delete(firstKey);
  }
  culturalContextCache.set(cacheKey, context);
  
  return context;
};

/**
 * Clear cultural context cache
 */
export const clearCulturalContextCache = () => {
  culturalContextCache.clear();
};

/**
 * Language codes and names mapping
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
];

/**
 * Get language info by code
 * @param {string} code - Language code
 * @returns {object|null} - Language info or null
 */
export const getLanguageInfo = (code) => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || null;
};

// =============================================================================
// IMAGE OCR
// =============================================================================

const OCR_CACHE_PREFIX = '@ocr_cache_';
const OCR_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Extract text from an image using Google Cloud Vision OCR
 * @param {string} imageUrl - URL of the image to process
 * @returns {Promise<{text: string, detectedLanguage: string, confidence: number, wordCount: number, cached?: boolean}>}
 */
export const extractImageText = async (imageUrl) => {
  if (!imageUrl || imageUrl.trim().length === 0) {
    throw new Error('Image URL is required for OCR.');
  }

  // Check cache first
  const cacheKey = `${OCR_CACHE_PREFIX}${imageUrl}`;
  try {
    const cachedData = await storage.getItem(cacheKey);
    if (cachedData) {
      const { result, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      
      // Check if cache is still valid (24 hours)
      if (now - timestamp < OCR_CACHE_DURATION) {
        return { ...result, cached: true };
      }
      // Cache expired, remove it
      await storage.removeItem(cacheKey);
    }
  } catch (error) {
    console.error('Error checking OCR cache:', error);
  }

  // Call Cloud Function
  const result = await callFunction('extractImageText', { imageUrl});

  // Cache the result
  try {
    const cacheData = {
      result,
      timestamp: Date.now(),
    };
    await storage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching OCR result:', error);
  }

  return result;
};

/**
 * Clear OCR cache (useful for testing or memory management)
 */
export const clearOCRCache = async () => {
  try {
    const keys = await storage.getAllKeys();
    const ocrKeys = keys.filter(key => key.startsWith(OCR_CACHE_PREFIX));
    await storage.multiRemove(ocrKeys);
  } catch (error) {
    console.error('Error clearing OCR cache:', error);
  }
};

