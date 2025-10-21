/**
 * Message List Component
 * 
 * Renders a scrollable list of messages with auto-scroll to bottom
 */

import React, { useRef, useEffect } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { MessageBubble } from './MessageBubble';

/**
 * @param {Object} props
 * @param {Array} props.messages - Array of message objects
 * @param {string} props.currentUserId - Current user's ID
 * @param {boolean} [props.loading=false] - Loading state
 * @param {Function} [props.onLoadMore] - Callback for loading more messages
 * @param {boolean} [props.isGroupChat=false] - Whether this is a group chat
 * @param {Object} [props.senderProfiles={}] - Map of senderId -> user profile
 */
export function MessageList({ 
  messages, 
  currentUserId, 
  loading = false, 
  onLoadMore,
  isGroupChat = false,
  senderProfiles = {},
}) {
  const flatListRef = useRef(null);
  const previousMessageCount = useRef(messages.length);

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

  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.senderId === currentUserId;
    const senderProfile = senderProfiles[item.senderId];
    const senderName = senderProfile?.displayName || 'Unknown';
    
    // Always show timestamp and status for better UX and status tracking visibility
    return (
      <MessageBubble
        message={item}
        isOwnMessage={isOwnMessage}
        showTimestamp={true}
        isGroupChat={isGroupChat}
        senderName={senderName}
      />
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
});

