/**
 * InAppBanner - Toast-style notification banner
 * 
 * Shows at top of screen when new message arrives (foreground only)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '../ui/Avatar';
import { useNotifications } from '../../lib/context/NotificationContext';

const { width } = Dimensions.get('window');

export function InAppBanner() {
  const { bannerQueue, dismissBanner } = useNotifications();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const currentBanner = bannerQueue[0];

  // Animate in/out
  useEffect(() => {
    if (currentBanner) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [currentBanner]);

  if (!currentBanner) return null;

  const handlePress = () => {
    dismissBanner(currentBanner.id);
    router.push(`/chat/${currentBanner.conversationId}`);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Avatar
          uri={currentBanner.senderPhoto}
          displayName={currentBanner.senderName}
          size={40}
        />
        <View style={styles.content}>
          <Text style={styles.senderName} numberOfLines={1}>
            {currentBanner.senderName}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {currentBanner.message}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => dismissBanner(currentBanner.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: Platform.OS === 'ios' ? 50 : 40, // Account for status bar
    paddingHorizontal: 10,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: width - 20,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#666666',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: '#999999',
  },
});

