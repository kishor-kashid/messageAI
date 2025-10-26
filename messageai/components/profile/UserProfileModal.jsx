/**
 * UserProfileModal Component
 * 
 * Displays user profile information with quick actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Avatar } from '../ui/Avatar';
import { useRouter } from 'expo-router';
import { getUserProfile, createConversation } from '../../lib/firebase/firestore';
import { getUserPresence } from '../../lib/firebase/presence';
import { useAuth } from '../../lib/hooks/useAuth';

/**
 * @param {Object} props
 * @param {boolean} props.visible - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.userId - User ID to display profile for
 */
const UserProfileModal = ({ visible, onClose, userId }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [presenceData, setPresenceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setUserProfile(null);
      setPresenceData(null);
      setError(null);
      setLoading(false);
      setRetryCount(0);
    }
  }, [visible]);

  // Fetch user profile when modal opens
  useEffect(() => {
    if (!visible || !userId) {
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch profile and presence in parallel
        const [profile, presence] = await Promise.all([
          getUserProfile(userId),
          getUserPresence(userId),
        ]);
        
        setUserProfile(profile);
        setPresenceData(presence);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [visible, userId, retryCount]);

  // Handle send message action
  const handleSendMessage = async () => {
    try {
      // Create conversation (will return existing one if it exists)
      const conversation = await createConversation(
        [currentUser.uid, userId],
        'direct'
      );
      
      // Close modal and navigate to chat
      onClose();
      router.push(`/chat/${conversation.id}`);
    } catch (err) {
      console.error('Failed to create conversation:', err);
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  // Format last seen
  const getStatusText = () => {
    if (!presenceData) return 'Offline';
    
    if (presenceData.isOnline) {
      return 'Online';
    }
    
    if (presenceData.lastSeen) {
      // Convert Firestore Timestamp to milliseconds if needed
      let lastSeenTime = presenceData.lastSeen;
      if (typeof lastSeenTime === 'object' && lastSeenTime.toMillis) {
        lastSeenTime = lastSeenTime.toMillis();
      } else if (typeof lastSeenTime === 'object' && lastSeenTime.seconds) {
        lastSeenTime = lastSeenTime.seconds * 1000;
      }
      
      const now = Date.now();
      const diff = now - lastSeenTime;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'Last seen just now';
      if (minutes < 60) return `Last seen ${minutes}m ago`;
      if (hours < 24) return `Last seen ${hours}h ago`;
      if (days === 1) return 'Last seen yesterday';
      return `Last seen ${days}d ago`;
    }
    
    return 'Offline';
  };

  // Language code to name mapping
  const getLanguageName = (code) => {
    const languages = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
      ar: 'Arabic',
      hi: 'Hindi',
    };
    return languages[code] || code.toUpperCase();
  };

  // Language code to flag emoji
  const getLanguageFlag = (code) => {
    const flags = {
      en: '🇬🇧',
      es: '🇪🇸',
      fr: '🇫🇷',
      de: '🇩🇪',
      it: '🇮🇹',
      pt: '🇵🇹',
      ru: '🇷🇺',
      zh: '🇨🇳',
      ja: '🇯🇵',
      ko: '🇰🇷',
      ar: '🇸🇦',
      hi: '🇮🇳',
    };
    return flags[code] || '🌐';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => setRetryCount(prev => prev + 1)}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : !userProfile ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorIcon}>👤</Text>
              <Text style={styles.errorText}>User profile not found</Text>
              <TouchableOpacity style={styles.retryButton} onPress={onClose}>
                <Text style={styles.retryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                <Avatar
                  uri={userProfile?.photoURL}
                  displayName={userProfile?.displayName}
                  size={100}
                  showOnlineBadge={true}
                  isOnline={presenceData?.isOnline}
                />
                <Text style={styles.displayName}>{userProfile?.displayName || 'Unknown'}</Text>
                <Text style={[
                  styles.statusText,
                  presenceData?.isOnline && styles.statusOnline
                ]}>
                  {getStatusText()}
                </Text>
              </View>

              {/* Info Card */}
              <View style={styles.card}>
                {/* Email */}
                {userProfile?.email && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Text style={styles.infoIcon}>📧</Text>
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Email</Text>
                      <Text style={styles.infoValue}>{userProfile.email}</Text>
                    </View>
                  </View>
                )}

                {/* Preferred Language */}
                {userProfile?.preferredLanguage && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Text style={styles.infoIcon}>
                        {getLanguageFlag(userProfile.preferredLanguage)}
                      </Text>
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Preferred Language</Text>
                      <Text style={styles.infoValue}>
                        {getLanguageName(userProfile.preferredLanguage)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleSendMessage}
                >
                  <Text style={styles.primaryButtonIcon}>💬</Text>
                  <Text style={styles.primaryButtonText}>Send Message</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
    minHeight: 300,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#666666',
  },
  scrollContainer: {
    flex: 1,
  },
  centerContent: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  statusOnline: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonIcon: {
    fontSize: 18,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default UserProfileModal;

