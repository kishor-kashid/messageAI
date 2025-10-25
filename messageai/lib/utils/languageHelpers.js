/**
 * Language Helper Utilities
 * 
 * Centralized utilities for language codes, names, and flags
 */

// Language mappings
export const LANGUAGE_FLAGS = {
  'en': '🇺🇸',
  'es': '🇪🇸',
  'fr': '🇫🇷',
  'de': '🇩🇪',
  'it': '🇮🇹',
  'pt': '🇵🇹',
  'ru': '🇷🇺',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
  'zh': '🇨🇳',
  'ar': '🇸🇦',
  'hi': '🇮🇳',
  'tr': '🇹🇷',
  'nl': '🇳🇱',
  'pl': '🇵🇱',
  'sv': '🇸🇪',
};

export const LANGUAGE_NAMES = {
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
  'tr': 'Turkish',
  'nl': 'Dutch',
  'pl': 'Polish',
  'sv': 'Swedish',
};

/**
 * Get flag emoji for a language code
 * @param {string} langCode - ISO 639-1 language code
 * @returns {string} Flag emoji or globe icon
 */
export const getLanguageFlag = (langCode) => {
  return LANGUAGE_FLAGS[langCode] || '🌐';
};

/**
 * Get display name for a language code
 * @param {string} langCode - ISO 639-1 language code
 * @returns {string} Language name
 */
export const getLanguageName = (langCode) => {
  return LANGUAGE_NAMES[langCode] || langCode.toUpperCase();
};

/**
 * Get both flag and name for a language
 * @param {string} langCode - ISO 639-1 language code
 * @returns {{flag: string, name: string}}
 */
export const getLanguageInfo = (langCode) => {
  return {
    flag: getLanguageFlag(langCode),
    name: getLanguageName(langCode),
  };
};

