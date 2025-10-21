/**
 * Conversation Header Component
 * 
 * Header for chat screen showing participant info and online status
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '../ui/Avatar';

/**
 * @param {Object} props
 * @param {Object} props.conversation - Conversation object
 * @param {string} props.conversation.type - 'direct' or 'group'
 * @param {string} [props.conversation.groupName] - Group name (for group chats)
 * @param {Object} [props.conversation.otherParticipant] - Other participant (for direct chats)
 * @param {Function} [props.onPress] - Callback when header is tapped (e.g., view profile)
 * @param {Function} [props.onBackPress] - Callback for back button
 */
export function ConversationHeader({ conversation, onPress, onBackPress }) {
  const {
    type,
    groupName,
    otherParticipant,
    participantIds = [],
  } = conversation;

  // Get display name and status
  const displayName = type === 'group' 
    ? groupName || 'Group Chat'
    : otherParticipant?.displayName || 'Unknown';
    
  const avatarUri = type === 'group'
    ? null
    : otherParticipant?.profilePicture;
    
  const isOnline = type === 'direct' && otherParticipant?.isOnline;
  
  // Format status text
  const getStatusText = () => {
    if (type === 'group') {
      return `${participantIds.length} participants`;
    }
    
    if (isOnline) {
      return 'Online';
    }
    
    if (otherParticipant?.lastSeen) {
      const now = Date.now();
      const diff = now - otherParticipant.lastSeen;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'Active now';
      if (minutes < 60) return `Active ${minutes}m ago`;
      if (hours < 24) return `Active ${hours}h ago`;
      if (days === 1) return 'Active yesterday';
      return `Active ${days}d ago`;
    }
    
    return 'Offline';
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      {onBackPress && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
      )}

      {/* Avatar and Info */}
      <TouchableOpacity
        style={styles.infoContainer}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
      >
        <Avatar
          uri={avatarUri}
          name={displayName}
          size={36}
          showOnlineBadge={type === 'direct'}
          isOnline={isOnline}
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={[
            styles.status,
            isOnline && styles.statusOnline
          ]}>
            {getStatusText()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* More Options (placeholder for future) */}
      <View style={styles.actionsContainer}>
        {/* Could add video call, voice call, etc. */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  backIcon: {
    fontSize: 32,
    fontWeight: '300',
    color: '#007AFF',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  status: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statusOnline: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
});

