/**
 * Message Bubble Component
 * 
 * Displays a single message with different styles for sent vs received messages
 * Supports text, images, or both
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

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
    case 'queued':
      return '⏳'; // Hourglass
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
 * Get status text for queued messages
 * @param {string} status - Message status
 * @returns {string|null} Status text
 */
function getStatusText(status) {
  switch (status) {
    case 'queued':
      return 'Waiting to send...';
    case 'failed':
      return 'Failed to send';
    default:
      return null;
  }
}

/**
 * @param {Object} props
 * @param {Object} props.message - Message object
 * @param {string} props.message.id - Message ID
 * @param {string} [props.message.content] - Message text
 * @param {string} [props.message.imageUrl] - Image URL
 * @param {number} props.message.timestamp - Message timestamp
 * @param {string} props.message.status - Message status
 * @param {string} props.message.senderId - Sender user ID
 * @param {boolean} props.isOwnMessage - Whether message is from current user
 * @param {boolean} [props.showTimestamp=true] - Whether to show timestamp
 * @param {boolean} [props.isGroupChat=false] - Whether this is a group chat
 * @param {string} [props.senderName] - Name of the sender (for group chats)
 * @param {Function} [props.onImagePress] - Callback when image is pressed
 */
export function MessageBubble({ 
  message, 
  isOwnMessage, 
  showTimestamp = true,
  isGroupChat = false,
  senderName = null,
  onImagePress,
}) {
  const { content, imageUrl, timestamp, status = 'sent' } = message;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const hasImage = !!imageUrl;
  const hasText = !!content;

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
          status === 'failed' && styles.failedBubble,
          status === 'queued' && styles.queuedBubble,
          hasImage && styles.imageBubble
        ]}>
          {/* Image */}
          {hasImage && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onImagePress?.(imageUrl)}
              disabled={!onImagePress}
            >
              <View style={styles.imageContainer}>
                {imageLoading && !imageError && (
                  <View style={styles.imageLoadingContainer}>
                    <ActivityIndicator size="small" color={isOwnMessage ? '#FFFFFF' : '#007AFF'} />
                  </View>
                )}
                {imageError && (
                  <View style={styles.imageErrorContainer}>
                    <Text style={styles.imageErrorIcon}>⚠️</Text>
                    <Text style={[
                      styles.imageErrorText,
                      isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                    ]}>
                      Failed to load image
                    </Text>
                  </View>
                )}
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.messageImage}
                  resizeMode="cover"
                  onLoadStart={() => {
                    setImageLoading(true);
                    setImageError(false);
                  }}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
              </View>
            </TouchableOpacity>
          )}
          
          {/* Text content */}
          {hasText && (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              hasImage && styles.messageTextWithImage
            ]}>
              {content}
            </Text>
          )}
          
          {/* Show status text for queued/failed messages */}
          {isOwnMessage && getStatusText(status) && (
            <Text style={[
              styles.statusText,
              isOwnMessage ? styles.ownStatusText : styles.otherStatusText
            ]}>
              {getStatusText(status)}
            </Text>
          )}
          
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
                  status === 'queued' && styles.statusIconQueued,
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
  queuedBubble: {
    backgroundColor: '#FFA500',
    opacity: 0.8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  statusText: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  ownStatusText: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  otherStatusText: {
    color: '#666666',
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
  statusIconQueued: {
    color: '#FFA500',
    opacity: 1,
  },
  statusIconFailed: {
    color: '#FF3B30',
    opacity: 1,
  },
  imageBubble: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1,
  },
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  imageErrorIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  imageErrorText: {
    fontSize: 12,
    textAlign: 'center',
  },
  messageTextWithImage: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
});

