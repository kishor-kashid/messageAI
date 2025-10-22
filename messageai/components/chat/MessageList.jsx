/**
 * Message List Component
 * 
 * Renders a scrollable list of messages with auto-scroll to bottom
 */

import React, { useRef, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { ImagePreview } from './ImagePreview';
import { formatTimestamp } from '../../lib/utils/formatters';

/**
 * @param {Object} props
 * @param {Array} props.messages - Array of message objects
 * @param {string} props.currentUserId - Current user's ID
 * @param {boolean} [props.loading=false] - Loading state
 * @param {Function} [props.onLoadMore] - Callback for loading more messages
 * @param {boolean} [props.isGroupChat=false] - Whether this is a group chat
 * @param {Object} [props.senderProfiles={}] - Map of senderId -> user profile
 * @param {Object} [props.conversation=null] - Conversation object (for group read tracking)
 */
export function MessageList({ 
  messages, 
  currentUserId, 
  loading = false, 
  onLoadMore,
  isGroupChat = false,
  senderProfiles = {},
  conversation = null,
}) {
  const flatListRef = useRef(null);
  const previousMessageCount = useRef(messages.length);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const handleImagePress = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setImagePreviewVisible(true);
  };

  const handleClosePreview = () => {
    setImagePreviewVisible(false);
    setSelectedImageUrl(null);
  };

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > previousMessageCount.current && flatListRef.current) {
      // Small delay to ensure render is complete
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    previousMessageCount.current = messages.length;
  }, [messages.length]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 300);
    }
  }, []);

  /**
   * Check if two messages are on different days
   */
  const isDifferentDay = (timestamp1, timestamp2) => {
    if (!timestamp1 || !timestamp2) return false;
    
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    
    return date1.getDate() !== date2.getDate() ||
           date1.getMonth() !== date2.getMonth() ||
           date1.getFullYear() !== date2.getFullYear();
  };

  /**
   * Get date label for separator
   */
  const getDateLabel = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to midnight for accurate comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      // Use formatTimestamp to get consistent date formatting
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  };

  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.senderId === currentUserId;
    const senderProfile = senderProfiles[item.senderId];
    const senderName = senderProfile?.displayName || 'Unknown';
    
    // Check if we need to show date separator
    const showDateSeparator = index === 0 || 
      (index > 0 && isDifferentDay(messages[index - 1].timestamp, item.timestamp));
    
    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateSeparatorLine} />
            <Text style={styles.dateSeparatorText}>
              {getDateLabel(item.timestamp)}
            </Text>
            <View style={styles.dateSeparatorLine} />
          </View>
        )}
        <MessageBubble
          message={item}
          isOwnMessage={isOwnMessage}
          showTimestamp={true}
          isGroupChat={isGroupChat}
          senderName={senderName}
          conversation={conversation}
          currentUserId={currentUserId}
          onImagePress={handleImagePress}
        />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading messages...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
      </View>
    );
  };

  return (
    <>
      <FlatList
        ref={flatListRef}
        style={styles.container}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          messages.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={renderEmpty}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
      
      {/* Image Preview Modal */}
      <ImagePreview
        visible={imagePreviewVisible}
        imageUrl={selectedImageUrl}
        onClose={handleClosePreview}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  dateSeparatorLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
});

