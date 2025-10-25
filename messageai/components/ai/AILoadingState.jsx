/**
 * AI Loading State Component
 * 
 * Reusable loading indicator for AI features with feature-specific messages
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * @param {Object} props
 * @param {string} props.message - Loading message to display
 * @param {string} props.size - Size of spinner ('small' | 'large')
 * @param {string} props.color - Color of spinner
 */
export function AILoadingState({ 
  message = 'Processing...', 
  size = 'large',
  color = '#007AFF' 
}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

