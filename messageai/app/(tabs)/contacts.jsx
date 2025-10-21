/**
 * Contacts Screen
 * 
 * Displays user's contact list with search and add functionality
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
import { useContacts } from '../../lib/hooks/useContacts';
import { useConversations } from '../../lib/hooks/useConversations';
import { ContactListItem } from '../../components/contacts/ContactListItem';
import { AddContactModal } from '../../components/contacts/AddContactModal';
import { Input } from '../../components/ui/Input';

export default function ContactsScreen() {
  const router = useRouter();
  const {
    contacts,
    loading,
    error,
    addContact,
    removeContact,
    searchContacts: searchContactsHook,
  } = useContacts();
  
  const { createOrFindConversation } = useConversations();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredContacts([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchContactsHook(query);
      setFilteredContacts(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle add contact
  const handleAddContact = async (email) => {
    try {
      await addContact(email);
      setShowAddModal(false);
    } catch (err) {
      throw err; // Re-throw to be handled by modal
    }
  };

  // Handle contact tap - create conversation and navigate to chat
  const handleContactPress = async (contact) => {
    try {
      // Show loading alert
      Alert.alert('Please wait', 'Creating conversation...', [], { cancelable: false });
      
      // Create or find existing conversation
      const conversation = await createOrFindConversation(contact.id);
      
      // Dismiss loading alert
      Alert.alert('', '', [], { cancelable: true });
      
      // TODO: Navigate to chat screen (PR #6)
      // router.push(`/chat/${conversation.id}`);
      Alert.alert(
        'Conversation Ready',
        `Chat with ${contact.displayName} is ready!\n\nChat screen coming in PR #6`,
        [
          { text: 'OK' },
          {
            text: 'View Conversations',
            onPress: () => router.push('/(tabs)/conversations'),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create conversation');
    }
  };

  // Handle long press - option to remove contact
  const handleContactLongPress = (contact) => {
    Alert.alert(
      'Remove Contact',
      `Remove ${contact.displayName} from your contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeContact(contact.id);
              Alert.alert('Success', 'Contact removed');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to remove contact');
            }
          },
        },
      ]
    );
  };

  // Render contact item
  const renderContact = ({ item }) => (
    <ContactListItem
      contact={item}
      onPress={() => handleContactPress(item)}
      onLongPress={() => handleContactLongPress(item)}
    />
  );

  // Render empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>⚠️ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (searchQuery && filteredContacts.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>🔍 No Results</Text>
          <Text style={styles.emptyText}>
            No contacts found matching "{searchQuery}"
          </Text>
        </View>
      );
    }

    if (contacts.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>📇 No Contacts Yet</Text>
          <Text style={styles.emptyText}>
            Add contacts to start messaging
          </Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addFirstButtonText}>Add Your First Contact</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  // Render list header with search
  const renderListHeader = () => {
    if (contacts.length === 0 && !loading) return null;

    return (
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isSearching && (
          <ActivityIndicator
            size="small"
            color="#007AFF"
            style={styles.searchLoader}
          />
        )}
      </View>
    );
  };

  const displayContacts = searchQuery ? filteredContacts : contacts;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Contact List */}
      <FlatList
        data={displayContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          displayContacts.length === 0 ? styles.emptyListContent : null
        }
        refreshing={loading}
        onRefresh={() => {
          // Refresh will be handled by useContacts hook
        }}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddContact={handleAddContact}
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
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    position: 'relative',
  },
  searchInput: {
    marginBottom: 0,
  },
  searchLoader: {
    position: 'absolute',
    right: 32,
    top: 28,
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
  },
  addFirstButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 24,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#C62828',
    textAlign: 'center',
    lineHeight: 24,
  },
});
