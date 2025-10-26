/**
 * Conversations Screen
 * 
 * Displays user's conversation list with real-time updates
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useConversations } from '../../lib/hooks/useConversations';
import { ConversationListItem } from '../../components/conversations/ConversationListItem';
import { useAuth } from '../../lib/hooks/useAuth';
import UserProfileModal from '../../components/profile/UserProfileModal';

export default function ConversationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    conversations,
    loading,
    error,
    deleteConversation,
  } = useConversations();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'groups', 'individual'

  // User Profile Modal state
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    let result = [...conversations];

    // Apply filter
    if (activeFilter === 'unread') {
      result = result.filter(conv => conv.unreadCount > 0);
    } else if (activeFilter === 'groups') {
      result = result.filter(conv => conv.type === 'group');
    } else if (activeFilter === 'individual') {
      result = result.filter(conv => conv.type === 'direct');
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(conv => {
        if (conv.type === 'group') {
          return conv.groupName?.toLowerCase().includes(query);
        } else {
          return conv.otherParticipant?.displayName?.toLowerCase().includes(query);
        }
      });
    }

    return result;
  }, [conversations, activeFilter, searchQuery]);

  // Handle conversation tap - navigate to chat
  const handleConversationPress = (conversation) => {
    // Navigate to chat screen
    router.push(`/chat/${conversation.id}`);
  };

  // Handle long press - show options menu
  const handleConversationLongPress = (conversation) => {
    const displayName = conversation.type === 'group' 
      ? conversation.groupName 
      : conversation.otherParticipant?.displayName;

    const buttons = [];

    // Add "View Profile" option only for direct chats
    if (conversation.type === 'direct' && conversation.otherParticipant) {
      buttons.push({
        text: 'View Profile',
        onPress: () => {
          setSelectedUserId(conversation.otherParticipant.id);
          setShowUserProfile(true);
        },
      });
    }

    // Add "Delete" option
    buttons.push({
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
    });

    // Add "Cancel" option
    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      displayName,
      'Choose an action',
      buttons
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

  // Render filter button
  const renderFilterButton = (filter, label, icon) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        activeFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        activeFilter === filter && styles.filterButtonTextActive,
      ]}>
        {icon} {label}
      </Text>
    </TouchableOpacity>
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

    if (filteredConversations.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>🔍</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No conversations found' : 'No conversations in this category'}
          </Text>
          {activeFilter !== 'all' && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.clearFilterButtonText}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999999"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}
            >
              <Text style={styles.clearSearchIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContentContainer}
      >
        {renderFilterButton('all', 'All', '💬')}
        {renderFilterButton('unread', 'Unread', '🔴')}
        {renderFilterButton('groups', 'Groups', '👥')}
        {renderFilterButton('individual', '1-on-1', '👤')}
      </ScrollView>

      {/* Conversation List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          filteredConversations.length === 0 ? styles.emptyListContent : null
        }
        refreshing={loading}
        onRefresh={() => {
          // Refresh handled by useConversations hook
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        visible={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        userId={selectedUserId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 0,
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSearchIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    maxHeight: 60,
  },
  filterContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    marginRight: 8,
    minWidth: 80,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  clearFilterButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 24,
  },
  clearFilterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
