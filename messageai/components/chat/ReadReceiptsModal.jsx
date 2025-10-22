/**
 * Read Receipts Modal Component
 * 
 * Shows detailed message info including who read and who received the message (WhatsApp-style)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Avatar } from '../ui/Avatar';

/**
 * Format timestamp to time string
 * @param {number|Object} timestamp - Unix timestamp or Firestore Timestamp
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
function formatTime(timestamp) {
  if (!timestamp) return '';
  
  // Handle Firestore Timestamp objects
  let dateValue = timestamp;
  if (timestamp?.toMillis) {
    dateValue = timestamp.toMillis();
  } else if (timestamp?.seconds) {
    dateValue = timestamp.seconds * 1000;
  }
  
  const date = new Date(dateValue);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid timestamp:', timestamp);
    return '';
  }
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * @param {Object} props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {Function} props.onClose - Callback to close modal
 * @param {Object} props.message - Message object with readBy array
 * @param {Object} props.participants - Map of participant profiles
 * @param {string} props.currentUserId - Current user's ID
 */
export function ReadReceiptsModal({
  visible,
  onClose,
  message,
  participants = {},
  currentUserId,
}) {
  if (!message) return null;
  
  const readBy = message.readBy || [];
  const senderId = message.senderId;
  
  // Get all participants except the sender
  const participantsList = Object.values(participants).filter(
    p => p.id !== senderId
  );
  
  // Split into read and delivered (not read yet)
  const readUsers = participantsList.filter(p => readBy.includes(p.id));
  const deliveredUsers = participantsList.filter(p => !readBy.includes(p.id));
  
  const renderUser = ({ user, timestamp, isRead }) => (
    <View key={user.id} style={styles.userItem}>
      <Avatar
        uri={user.photoURL}
        displayName={user.displayName}
        size={48}
        showOnlineBadge={false}
      />
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.displayName}</Text>
        {timestamp && (
          <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
        )}
      </View>
      
      {isRead ? (
        <Text style={styles.readIcon}>✓✓</Text>
      ) : (
        <Text style={styles.deliveredIcon}>✓</Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Message Info</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Message Preview */}
          <View style={styles.messagePreview}>
            <View style={styles.messageBubble}>
              {message.imageUrl && (
                <Text style={styles.messageContent}>📷 Image</Text>
              )}
              {message.content && (
                <Text style={styles.messageContent}>{message.content}</Text>
              )}
              <Text style={styles.messageTime}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>

          {/* Read By Section */}
          {readUsers.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>✓✓</Text>
                <Text style={styles.sectionTitle}>
                  Read by {readUsers.length}
                </Text>
              </View>
              {readUsers.map(user => renderUser({ 
                user, 
                timestamp: message.readAt || message.timestamp, 
                isRead: true 
              }))}
            </View>
          )}

          {/* Delivered To Section */}
          {deliveredUsers.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>✓✓</Text>
                <Text style={styles.sectionTitle}>
                  Sent to {deliveredUsers.length}
                </Text>
              </View>
              {deliveredUsers.map(user => renderUser({ 
                user, 
                timestamp: message.timestamp, 
                isRead: false 
              }))}
            </View>
          )}

          {/* No Recipients Yet */}
          {readUsers.length === 0 && deliveredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No read receipts yet</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    fontWeight: '300',
    color: '#007AFF',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  messagePreview: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  messageBubble: {
    backgroundColor: '#007AFF',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  messageContent: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'right',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionIcon: {
    fontSize: 16,
    color: '#34C759',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 14,
    color: '#666666',
  },
  readIcon: {
    fontSize: 18,
    color: '#34C759',
  },
  deliveredIcon: {
    fontSize: 18,
    color: '#999999',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
});

