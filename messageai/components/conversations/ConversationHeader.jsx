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
 * @param {Object} [props.participant] - Other participant (for direct chats), passed separately
 * @param {Function} [props.onPress] - Callback when header is tapped (e.g., view profile)
 * @param {Function} [props.onBackPress] - Callback for back button
 * @param {Function} [props.onGroupInfoPress] - Callback when group info icon is tapped
 */
export function ConversationHeader({ conversation, participant, onPress, onBackPress, onGroupInfoPress }) {
  if (!conversation) {
    return null;
  }

  const {
    type,
    groupName,
    participantIds = [],
  } = conversation;

  // Use participant prop or fall back to conversation.otherParticipant
  const otherParticipant = participant || conversation.otherParticipant;

  // Get display name and status
  const displayName = type === 'group' 
    ? groupName || 'Group Chat'
    : otherParticipant?.displayName || 'Unknown';
    
  const avatarUri = type === 'group'
    ? conversation.groupPhoto || null
    : otherParticipant?.photoURL;
    
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
      
      if (minutes < 1) return 'Last seen just now';
      if (minutes < 60) return `Last seen ${minutes}m ago`;
      if (hours < 24) return `Last seen ${hours}h ago`;
      if (days === 1) return 'Last seen yesterday';
      return `Last seen ${days}d ago`;
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
          displayName={displayName}
          size={40}
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

      {/* More Options */}
      <View style={styles.actionsContainer}>
        {/* Group Info Button - Show only for group chats */}
        {type === 'group' && onGroupInfoPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onGroupInfoPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.actionIcon}>👥</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    minHeight: 60,
    width: '100%',
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
    paddingVertical: 4,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
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
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  actionIcon: {
    fontSize: 24,
  },
});

