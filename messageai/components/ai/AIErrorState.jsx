/**
 * AI Error State Component
 * 
 * Reusable error display for AI features with retry functionality
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Error type configurations
const ERROR_TYPES = {
  RATE_LIMIT: {
    icon: '⏱️',
    title: 'Rate Limit Exceeded',
    message: 'Too many requests. Please try again in a few minutes.',
    showRetry: false,
  },
  NETWORK: {
    icon: '📡',
    title: 'Connection Error',
    message: 'Unable to connect. Check your internet connection.',
    showRetry: true,
  },
  AUTH: {
    icon: '🔒',
    title: 'Authentication Required',
    message: 'Please sign in to use AI features.',
    showRetry: false,
  },
  GENERIC: {
    icon: '⚠️',
    title: 'Something Went Wrong',
    message: 'An error occurred. Please try again.',
    showRetry: true,
  },
};

/**
 * @param {Object} props
 * @param {string} props.type - Error type ('RATE_LIMIT' | 'NETWORK' | 'AUTH' | 'GENERIC')
 * @param {string} props.message - Custom error message (overrides default)
 * @param {Function} props.onRetry - Callback when retry button is pressed
 * @param {boolean} props.showRetry - Override retry button visibility
 */
export function AIErrorState({ 
  type = 'GENERIC',
  message,
  onRetry,
  showRetry,
}) {
  const errorConfig = ERROR_TYPES[type] || ERROR_TYPES.GENERIC;
  const displayMessage = message || errorConfig.message;
  const displayRetry = showRetry !== undefined ? showRetry : errorConfig.showRetry;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{errorConfig.icon}</Text>
      <Text style={styles.title}>{errorConfig.title}</Text>
      <Text style={styles.message}>{displayMessage}</Text>
      
      {displayRetry && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>🔄 Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

