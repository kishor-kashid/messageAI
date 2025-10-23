/**
 * Message Bubble Component
 * 
 * Displays a single message with different styles for sent vs received messages
 * Supports text, images, or both
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ActionSheet, Alert, Platform } from 'react-native';
import LanguageBadge from './LanguageBadge';

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
 * Calculate WhatsApp-style status for group chats
 * @param {Object} message - Message object
 * @param {Object} conversation - Conversation object
 * @param {string} currentUserId - Current user's ID
 * @returns {string} Calculated status
 */
function calculateGroupStatus(message, conversation, currentUserId) {
  if (!conversation || conversation.type !== 'group') {
    return message.status || 'sent';
  }
  
  const readBy = message.readBy || [];
  const participantIds = conversation.participantIds || [];
  
  // Get all participants except the sender
  const participantsExceptSender = participantIds.filter(id => id !== message.senderId);
  
  // If no one has read it yet, return base status
  if (readBy.length === 0) {
    return message.status || 'sent';
  }
  
  // Check how many participants have read
  const readCount = participantsExceptSender.filter(id => readBy.includes(id)).length;
  const totalRecipients = participantsExceptSender.length;
  
  if (readCount === totalRecipients) {
    // All participants have read
    return 'read';
  } else if (readCount > 0) {
    // Some participants have read
    return 'delivered';
  }
  
  return message.status || 'sent';
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
 * @param {string} [props.message.detected_language] - Detected language code
 * @param {Array<string>} [props.message.readBy] - Array of user IDs who have read the message
 * @param {boolean} props.isOwnMessage - Whether message is from current user
 * @param {boolean} [props.showTimestamp=true] - Whether to show timestamp
 * @param {boolean} [props.isGroupChat=false] - Whether this is a group chat
 * @param {string} [props.senderName] - Name of the sender (for group chats)
 * @param {Object} [props.conversation] - Conversation object (for group read tracking)
 * @param {string} [props.currentUserId] - Current user's ID (for group read tracking)
 * @param {Function} [props.onImagePress] - Callback when image is pressed
 * @param {Function} [props.onShowInfo] - Callback to show message info (read receipts)
 * @param {Function} [props.onTranslate] - Callback to translate message
 * @param {Function} [props.onShowCulturalContext] - Callback to show cultural context
 */
export function MessageBubble({ 
  message, 
  isOwnMessage, 
  showTimestamp = true,
  isGroupChat = false,
  senderName = null,
  conversation = null,
  currentUserId = null,
  onImagePress,
  onShowInfo,
  onTranslate,
  onShowCulturalContext,
}) {
  const { content, imageUrl, timestamp, status: rawStatus = 'sent', detected_language } = message;
  
  // Calculate actual status (WhatsApp-style for group chats)
  const status = isOwnMessage && isGroupChat 
    ? calculateGroupStatus(message, conversation, currentUserId)
    : rawStatus;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const hasImage = !!imageUrl;
  const hasText = !!content;

  // Handle long press for message actions
  // Shows options: Translate, Cultural Context, Message Info
  const handleLongPress = () => {
    const hasText = !!content;
    
    // Build action options
    const options = [];
    
    // Add translate option if message has text
    if (hasText && onTranslate) {
      options.push('Translate');
    }
    
    // Add cultural context option if message has text
    if (hasText && onShowCulturalContext) {
      options.push('Cultural Context');
    }
    
    // Add message info option for own messages
    if (isOwnMessage && onShowInfo) {
      options.push('Message Info');
    }
    
    options.push('Cancel');
    const cancelButtonIndex = options.length - 1;
    
    // Show action sheet on iOS, Alert on Android
    if (Platform.OS === 'ios' && ActionSheet) {
      ActionSheet.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === cancelButtonIndex) return;
          
          const selectedOption = options[buttonIndex];
          
          if (selectedOption === 'Translate' && onTranslate) {
            onTranslate(message);
          } else if (selectedOption === 'Cultural Context' && onShowCulturalContext) {
            onShowCulturalContext(message);
          } else if (selectedOption === 'Message Info' && onShowInfo) {
            onShowInfo(message);
          }
        }
      );
    } else {
      // Android fallback using Alert
      const buttons = [];
      
      if (hasText && onTranslate) {
        buttons.push({
          text: 'Translate',
          onPress: () => onTranslate(message),
        });
      }
      
      if (hasText && onShowCulturalContext) {
        buttons.push({
          text: 'Cultural Context',
          onPress: () => onShowCulturalContext(message),
        });
      }
      
      if (isOwnMessage && onShowInfo) {
        buttons.push({
          text: 'Message Info',
          onPress: () => onShowInfo(message),
        });
      }
      
      buttons.push({
        text: 'Cancel',
        style: 'cancel',
      });
      
      Alert.alert('Message Actions', null, buttons);
    }
  };

  // Show long press for messages with actions
  const hasActions = (isOwnMessage && onShowInfo) || (!!content && onTranslate) || (!!content && onShowCulturalContext);
  const BubbleWrapper = hasActions ? TouchableOpacity : View;
  const bubbleProps = hasActions 
    ? { activeOpacity: 0.7, onLongPress: handleLongPress }
    : {};

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
        
        <BubbleWrapper 
          style={[
            styles.bubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
            status === 'failed' && styles.failedBubble,
            status === 'queued' && styles.queuedBubble,
            hasImage && styles.imageBubble
          ]}
          {...bubbleProps}
        >
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
            <>
              <Text style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                hasImage && styles.messageTextWithImage
              ]}>
                {content}
              </Text>
              
              {/* Language Badge */}
              {detected_language && (
                <LanguageBadge 
                  languageCode={detected_language} 
                  isOwnMessage={isOwnMessage}
                />
              )}
            </>
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
        </BubbleWrapper>
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

