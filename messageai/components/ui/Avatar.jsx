/**
 * Avatar Component for MessageAI MVP
 * 
 * Displays user profile picture or initials
 */

import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export function Avatar({ 
  uri, 
  displayName = '', 
  size = 50,
  style,
  showOnlineBadge = false,
  isOnline = false
}) {
  // Get initials from display name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(displayName);
  const badgeSize = size * 0.3;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {uri ? (
        <Image 
          source={{ uri }} 
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.initials, { fontSize: size / 2.5 }]}>
            {initials}
          </Text>
        </View>
      )}
      
      {/* Online Status Badge */}
      {showOnlineBadge && isOnline && (
        <View style={[
          styles.onlineBadge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            borderWidth: size > 40 ? 2 : 1.5,
          }
        ]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    backgroundColor: '#E0E0E0',
  },
  placeholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderColor: '#FFFFFF',
  },
});

