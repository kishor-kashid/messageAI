/**
 * Create Group Screen
 * 
 * Allows users to create a new group chat by selecting multiple contacts
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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/hooks/useAuth';
import { useContacts } from '../../lib/hooks/useContacts';
import { createGroupChat } from '../../lib/firebase/firestore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { contacts, loading: loadingContacts } = useContacts();
  
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [creating, setCreating] = useState(false);

  // Toggle contact selection
  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        // Remove if already selected
        return prev.filter(id => id !== contactId);
      } else {
        // Add if not selected
        return [...prev, contactId];
      }
    });
  };

  // Create group chat
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedContacts.length < 2) {
      Alert.alert('Error', 'Please select at least 2 contacts for a group chat');
      return;
    }

    try {
      setCreating(true);

      // Get participant IDs (selected contacts + current user)
      const participantIds = [user.uid, ...selectedContacts];

      // Create group chat
      const group = await createGroupChat(
        participantIds,
        groupName.trim(),
        null, // No group photo for now
        user.uid
      );

      Alert.alert('Success', 'Group created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to the new group chat
            router.replace(`/chat/${group.id}`);
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', error.message || 'Failed to create group');
      setCreating(false);
    }
  };

  // Render contact item
  const renderContactItem = ({ item }) => {
    const isSelected = selectedContacts.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => toggleContactSelection(item.id)}
        activeOpacity={0.7}
      >
        <Avatar
          uri={item.photoURL}
          displayName={item.displayName}
          size={48}
        />
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.displayName}</Text>
          <Text style={styles.contactEmail}>{item.email}</Text>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  // Render selected contacts summary
  const renderSelectedSummary = () => {
    if (selectedContacts.length === 0) return null;

    const selectedContactsList = contacts.filter(c => 
      selectedContacts.includes(c.id)
    );

    return (
      <View style={styles.selectedSection}>
        <Text style={styles.selectedTitle}>
          Selected ({selectedContacts.length})
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.selectedScroll}
        >
          {selectedContactsList.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.selectedContact}
              onPress={() => toggleContactSelection(contact.id)}
            >
              <Avatar
                uri={contact.photoURL}
                displayName={contact.displayName}
                size={56}
              />
              <Text style={styles.selectedContactName} numberOfLines={1}>
                {contact.displayName}
              </Text>
              <View style={styles.removeButton}>
                <Text style={styles.removeButtonText}>×</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loadingContacts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  if (contacts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>📇 No Contacts</Text>
        <Text style={styles.emptyText}>
          Add some contacts before creating a group chat
        </Text>
        <Button
          title="Go to Contacts"
          onPress={() => router.push('/(tabs)/contacts')}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>New Group</Text>
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateGroup}
          disabled={creating || selectedContacts.length < 2 || !groupName.trim()}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text
              style={[
                styles.createText,
                (selectedContacts.length < 2 || !groupName.trim()) && styles.createTextDisabled
              ]}
            >
              Create
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Group Name Input */}
      <View style={styles.groupNameSection}>
        <Input
          placeholder="Group Name"
          value={groupName}
          onChangeText={setGroupName}
          autoFocus
          maxLength={50}
          style={styles.groupNameInput}
        />
        <Text style={styles.groupNameHint}>
          {groupName.length}/50 characters
        </Text>
      </View>

      {/* Selected Contacts Summary */}
      {renderSelectedSummary()}

      {/* Contacts List */}
      <View style={styles.contactsSection}>
        <Text style={styles.sectionTitle}>
          Select Participants (at least 2)
        </Text>
        
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contactsList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#F5F5F5',
  },
  emptyTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 16,
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
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  createButton: {
    paddingVertical: 8,
  },
  createText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  createTextDisabled: {
    color: '#C7C7CC',
  },
  groupNameSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  groupNameInput: {
    fontSize: 17,
  },
  groupNameHint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  selectedSection: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  selectedScroll: {
    paddingHorizontal: 16,
  },
  selectedContact: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  selectedContactName: {
    fontSize: 12,
    color: '#000000',
    marginTop: 4,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  contactsSection: {
    flex: 1,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
  },
  contactsList: {
    backgroundColor: '#FFFFFF',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

