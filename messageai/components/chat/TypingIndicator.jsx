/**
 * Typing Indicator Component
 * 
 * Shows "User is typing..." with animated dots
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

/**
 * @param {Object} props
 * @param {Array<string>} props.typingUserIds - Array of user IDs who are typing
 * @param {Object} props.participants - Map of user IDs to user profiles
 */
export function TypingIndicator({ typingUserIds = [], participants = {} }) {
  const [dots, setDots] = useState('');

  // Animated dots effect
  useEffect(() => {
    if (typingUserIds.length === 0) {
      setDots('');
      return;
    }

    let dotCount = 0;
    const interval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setDots('.'.repeat(dotCount));
    }, 500);

    return () => clearInterval(interval);
  }, [typingUserIds]);

  if (typingUserIds.length === 0) {
    return null;
  }

  // Get names of typing users
  const typingNames = typingUserIds.map(userId => {
    const participant = participants[userId];
    return participant?.displayName || 'Someone';
  });

  // Format text based on number of typing users
  let typingText = '';
  if (typingNames.length === 1) {
    typingText = `${typingNames[0]} is typing`;
  } else if (typingNames.length === 2) {
    typingText = `${typingNames[0]} and ${typingNames[1]} are typing`;
  } else if (typingNames.length > 2) {
    typingText = 'Multiple people are typing';
  }

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>
          {typingText}{dots}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: 'flex-start',
  },
  bubble: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});

