/**
 * LanguageBadge Component
 * 
 * Displays a small language indicator badge on message bubbles.
 * Shows the country flag emoji and language code.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getLanguageInfo } from '../../lib/api/aiService';

/**
 * LanguageBadge Component
 * @param {Object} props
 * @param {string} props.languageCode - ISO 639-1 language code (e.g., 'en', 'es', 'fr')
 * @param {boolean} props.isOwnMessage - Whether this is the current user's message
 */
const LanguageBadge = ({ languageCode, isOwnMessage = false }) => {
  // Don't show badge if no language or if it's English (default)
  if (!languageCode || languageCode === 'en') {
    return null;
  }

  const languageInfo = getLanguageInfo(languageCode);
  
  // If language not found in our list, show code only
  const flag = languageInfo?.flag || '🌐';
  const code = languageInfo?.code?.toUpperCase() || languageCode.toUpperCase();

  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={styles.flag}>{flag}</Text>
      <Text style={[
        styles.code,
        isOwnMessage ? styles.codeOwn : styles.codeOther
      ]}>
        {code}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  ownMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  otherMessage: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  flag: {
    fontSize: 12,
    marginRight: 3,
  },
  code: {
    fontSize: 10,
    fontWeight: '600',
  },
  codeOwn: {
    color: '#fff',
  },
  codeOther: {
    color: '#666',
  },
});

export default LanguageBadge;

