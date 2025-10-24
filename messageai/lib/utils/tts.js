/**
 * Text-to-Speech Utilities
 * 
 * Helper functions for pronouncing messages using device TTS
 */

import * as Speech from 'expo-speech';

// Track currently playing speech to prevent overlaps
let currentSpeechId = null;

/**
 * Speak text in specified language
 * @param {string} text - Text to speak
 * @param {string} languageCode - ISO 639-1 language code (e.g., 'en', 'es', 'fr')
 * @param {Function} onStart - Callback when speech starts
 * @param {Function} onDone - Callback when speech finishes
 * @param {Function} onError - Callback on error
 * @returns {string} - Speech ID for tracking
 */
export const speak = async (text, languageCode, { onStart, onDone, onError } = {}) => {
  try {
    // Stop any currently playing speech
    await stopSpeech();

    // Validate inputs
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for speech');
    }

    if (!languageCode) {
      throw new Error('Language code is required');
    }

    // Normalize language code (some variations map to same voice)
    const normalizedLang = normalizeLanguageCode(languageCode);

    // Check if language is available
    const available = await Speech.isSpeakingAsync();
    
    // Generate unique ID for this speech
    const speechId = `${Date.now()}_${Math.random()}`;
    currentSpeechId = speechId;

    // Callback wrapper to check if this speech is still current
    const wrappedOnDone = () => {
      if (currentSpeechId === speechId) {
        currentSpeechId = null;
      }
      if (onDone) onDone();
    };

    const wrappedOnError = (error) => {
      if (currentSpeechId === speechId) {
        currentSpeechId = null;
      }
      console.error('TTS Error:', error);
      if (onError) onError(error);
    };

    // Call onStart immediately
    if (onStart) onStart();

    // Start speaking
    Speech.speak(text, {
      language: normalizedLang,
      pitch: 1.0,
      rate: 0.9, // Slightly slower for clarity
      onDone: wrappedOnDone,
      onError: wrappedOnError,
      onStopped: wrappedOnDone,
    });

    return speechId;
  } catch (error) {
    console.error('Error in speak function:', error);
    if (onError) {
      onError(error);
    }
    throw error;
  }
};

/**
 * Stop currently playing speech
 */
export const stopSpeech = async () => {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
      currentSpeechId = null;
    }
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
};

/**
 * Check if speech is currently playing
 * @returns {Promise<boolean>}
 */
export const isSpeaking = async () => {
  try {
    return await Speech.isSpeakingAsync();
  } catch (error) {
    console.error('Error checking speech status:', error);
    return false;
  }
};

/**
 * Normalize language code to match device TTS voices
 * @param {string} languageCode - ISO 639-1 code
 * @returns {string} - Normalized language code
 */
const normalizeLanguageCode = (languageCode) => {
  if (!languageCode) return 'en';

  const code = languageCode.toLowerCase();
  
  // Map language codes to common TTS voice codes
  const languageMap = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-PT',
    'ru': 'ru-RU',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'zh': 'zh-CN',
    'ar': 'ar-SA',
    'hi': 'hi-IN',
    'nl': 'nl-NL',
    'pl': 'pl-PL',
    'tr': 'tr-TR',
    'sv': 'sv-SE',
  };

  return languageMap[code] || code;
};

/**
 * Get available voices for a language
 * @param {string} languageCode - ISO 639-1 code
 * @returns {Promise<Array>} - Array of available voices
 */
export const getAvailableVoices = async (languageCode) => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const normalizedLang = normalizeLanguageCode(languageCode);
    
    // Filter voices that match the language
    return voices.filter(voice => 
      voice.language.toLowerCase().startsWith(normalizedLang.split('-')[0])
    );
  } catch (error) {
    console.error('Error getting available voices:', error);
    return [];
  }
};

/**
 * Check if a language is supported by device TTS
 * @param {string} languageCode - ISO 639-1 code
 * @returns {Promise<boolean>}
 */
export const isLanguageSupported = async (languageCode) => {
  try {
    const voices = await getAvailableVoices(languageCode);
    return voices.length > 0;
  } catch (error) {
    console.error('Error checking language support:', error);
    return false;
  }
};

/**
 * Get language name from code
 * @param {string} languageCode - ISO 639-1 code
 * @returns {string} - Human-readable language name
 */
export const getLanguageName = (languageCode) => {
  const languageNames = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'sv': 'Swedish',
  };

  return languageNames[languageCode?.toLowerCase()] || languageCode;
};

