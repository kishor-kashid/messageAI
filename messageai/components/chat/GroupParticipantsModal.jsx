/**
 * Group Participants Modal Component
 * 
 * Displays all participants in a group chat
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Avatar } from '../ui/Avatar';

/**
 * @param {Object} props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {Function} props.onClose - Callback to close modal
 * @param {Array<Object>} props.participants - Array of participant objects
 * @param {string} [props.groupName] - Name of the group
 * @param {string} [props.currentUserId] - Current user's ID (to highlight)
 */
export function GroupParticipantsModal({
  visible,
  onClose,
  participants = [],
  groupName = 'Group Chat',
  currentUserId = null,
}) {
  const renderParticipant = ({ item }) => {
    const isCurrentUser = item.id === currentUserId;
    
    return (
      <View style={styles.participantItem}>
        <Avatar
          uri={item.photoURL}
          displayName={item.displayName}
          size={48}
          showOnlineBadge={false}
          isOnline={false}
        />
        
        <View style={styles.participantInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.participantName} numberOfLines={1}>
              {item.displayName}
            </Text>
            {isCurrentUser && (
              <Text style={styles.youBadge}>You</Text>
            )}
          </View>
          
          <Text style={styles.participantEmail} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.groupNameText}>{groupName}</Text>
      <Text style={styles.participantCount}>
        {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No participants found</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Group Participants</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Participants List */}
        <FlatList
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    </Modal>
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '#666666',
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  groupNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  participantCount: {
    fontSize: 14,
    color: '#666666',
  },
  listContent: {
    paddingVertical: 8,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  youBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    overflow: 'hidden',
  },
  participantEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginLeft: 76,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
});

