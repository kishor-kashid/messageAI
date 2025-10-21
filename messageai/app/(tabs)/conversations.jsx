/**
 * Conversations Screen
 * 
 * Displays user's conversation list with real-time updates
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useConversations } from '../../lib/hooks/useConversations';
import { ConversationListItem } from '../../components/conversations/ConversationListItem';
import { useAuth } from '../../lib/hooks/useAuth';

export default function ConversationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    conversations,
    loading,
    error,
    deleteConversation,
  } = useConversations();

  // Handle conversation tap - navigate to chat
  const handleConversationPress = (conversation) => {
    // Navigate to chat screen
    router.push(`/chat/${conversation.id}`);
  };

  // Handle long press - option to delete conversation
  const handleConversationLongPress = (conversation) => {
    const displayName = conversation.type === 'group' 
      ? conversation.groupName 
      : conversation.otherParticipant?.displayName;

    Alert.alert(
      'Delete Conversation',
      `Delete conversation with ${displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(conversation.id);
              Alert.alert('Success', 'Conversation deleted');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  // Render conversation item
  const renderConversation = ({ item }) => (
    <ConversationListItem
      conversation={item}
      currentUserId={user?.uid}
      onPress={() => handleConversationPress(item)}
      onLongPress={() => handleConversationLongPress(item)}
    />
  );

  // Render empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>⚠️ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (conversations.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>💬 No Conversations Yet</Text>
          <Text style={styles.emptyText}>
            Start a conversation by adding contacts first
          </Text>
          <TouchableOpacity
            style={styles.addContactsButton}
            onPress={() => router.push('/(tabs)/contacts')}
          >
            <Text style={styles.addContactsButtonText}>Go to Contacts</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {/* Future: Add compose button to start new conversation */}
      </View>

      {/* Conversation List */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          conversations.length === 0 ? styles.emptyListContent : null
        }
        refreshing={loading}
        onRefresh={() => {
          // Refresh handled by useConversations hook
        }}
      />
    </View>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addContactsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 24,
  },
  addContactsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#C62828',
    textAlign: 'center',
    lineHeight: 24,
  },
});
