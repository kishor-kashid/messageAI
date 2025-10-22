/**
 * Conversation List Item Component
 * 
 * Displays a single conversation with avatar, name, last message preview, timestamp, and unread count.
 * Note: Online status badge has been removed from the conversation list.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '../ui/Avatar';

/**
 * Format timestamp to relative time
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted time string
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d`;
  
  // Show date for older messages
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * @param {Object} props
 * @param {Object} props.conversation - Conversation object
 * @param {string} props.conversation.id - Conversation ID
 * @param {string} props.conversation.type - 'direct' or 'group'
 * @param {string} [props.conversation.groupName] - Group name (for group chats)
 * @param {Object} [props.conversation.otherParticipant] - Other participant (for direct chats)
 * @param {string} [props.conversation.lastMessage] - Last message text
 * @param {number} [props.conversation.lastMessageTimestamp] - Last message timestamp
 * @param {number} [props.conversation.unreadCount=0] - Unread message count
 * @param {Function} props.onPress - Callback when conversation is tapped
 * @param {Function} [props.onLongPress] - Callback for long press (e.g., delete)
 * @param {string} [props.currentUserId] - Current user ID (to check message ownership)
 */
export function ConversationListItem({ 
  conversation, 
  onPress, 
  onLongPress,
  currentUserId,
}) {
  const {
    type,
    groupName,
    otherParticipant,
    lastMessage,
    lastMessageTimestamp,
    unreadCount = 0,
  } = conversation;

  // Get display name and avatar
  const displayName = type === 'group' 
    ? groupName || 'Group Chat'
    : otherParticipant?.displayName || 'Unknown';
    
  // Support group photos from conversation.groupPhoto
  const avatarUri = type === 'group'
    ? conversation.groupPhoto || null
    : otherParticipant?.photoURL;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          uri={avatarUri}
          displayName={displayName}
          size={56}
          showOnlineBadge={false}
          isOnline={false}
        />
        {/* Group icon indicator */}
        {type === 'group' && (
          <View style={styles.groupBadge}>
            <Text style={styles.groupIcon}>👥</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          {lastMessageTimestamp && (
            <Text style={styles.timestamp}>
              {formatTimestamp(lastMessageTimestamp)}
            </Text>
          )}
        </View>
        
        <View style={styles.bottomRow}>
          <Text 
            style={[
              styles.lastMessage,
              unreadCount > 0 && styles.lastMessageUnread
            ]} 
            numberOfLines={2}
          >
            {lastMessage || 'No messages yet'}
          </Text>
          
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  groupBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  groupIcon: {
    fontSize: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 14,
    color: '#8E8E93',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 15,
    color: '#8E8E93',
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: '#000000',
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

