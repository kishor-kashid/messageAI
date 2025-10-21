/**
 * Message Bubble Component
 * 
 * Displays a single message with different styles for sent vs received messages
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Format timestamp to time string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Get status icon
 * @param {string} status - Message status
 * @returns {string} Status icon
 */
function getStatusIcon(status) {
  switch (status) {
    case 'sending':
      return '○'; // Empty circle
    case 'sent':
      return '✓'; // Single check
    case 'delivered':
      return '✓✓'; // Double check
    case 'read':
      return '✓✓'; // Double check (blue)
    case 'failed':
      return '⚠'; // Warning
    default:
      return '';
  }
}

/**
 * @param {Object} props
 * @param {Object} props.message - Message object
 * @param {string} props.message.id - Message ID
 * @param {string} props.message.content - Message text
 * @param {number} props.message.timestamp - Message timestamp
 * @param {string} props.message.status - Message status
 * @param {string} props.message.senderId - Sender user ID
 * @param {boolean} props.isOwnMessage - Whether message is from current user
 * @param {boolean} [props.showTimestamp=true] - Whether to show timestamp
 * @param {boolean} [props.isGroupChat=false] - Whether this is a group chat
 * @param {string} [props.senderName] - Name of the sender (for group chats)
 */
export function MessageBubble({ 
  message, 
  isOwnMessage, 
  showTimestamp = true,
  isGroupChat = false,
  senderName = null,
}) {
  const { content, timestamp, status = 'sent' } = message;

  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      <View style={styles.messageWrapper}>
        {/* Show sender name for group chats (only for received messages) */}
        {isGroupChat && !isOwnMessage && senderName && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}
        
        <View style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
          status === 'failed' && styles.failedBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {content}
          </Text>
          
          {showTimestamp && timestamp && (
            <View style={styles.footer}>
              <Text style={[
                styles.timestamp,
                isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
              ]}>
                {formatTime(timestamp)}
              </Text>
              
              {isOwnMessage && status && (
                <Text style={[
                  styles.statusIcon,
                  status === 'read' && styles.statusIconRead,
                  status === 'failed' && styles.statusIconFailed
                ]}>
                  {getStatusIcon(status)}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 2,
    marginHorizontal: 12,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageWrapper: {
    maxWidth: '75%',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 2,
    marginLeft: 12,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E8E8E8',
    borderBottomLeftRadius: 4,
  },
  failedBubble: {
    backgroundColor: '#FF3B30',
    opacity: 0.7,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  ownTimestamp: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  otherTimestamp: {
    color: '#8E8E93',
    opacity: 0.9,
  },
  statusIcon: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statusIconRead: {
    color: '#34C759',
    opacity: 1,
  },
  statusIconFailed: {
    color: '#FF3B30',
    opacity: 1,
  },
});

