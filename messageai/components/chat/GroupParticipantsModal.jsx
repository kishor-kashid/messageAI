/**
 * Group Participants Modal Component
 * 
 * Displays all participants in a group chat
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Avatar } from '../ui/Avatar';
import { getMultiplePresences } from '../../lib/firebase/presence';
import { formatRelativeTime } from '../../lib/utils/formatters';

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
  const [participantsWithPresence, setParticipantsWithPresence] = useState([]);
  const [loadingPresence, setLoadingPresence] = useState(false);

  // Fetch presence data when modal opens
  useEffect(() => {
    if (!visible || participants.length === 0) {
      setParticipantsWithPresence([]);
      return;
    }

    async function fetchPresence() {
      setLoadingPresence(true);
      try {
        const participantIds = participants.map(p => p.id);
        const presenceMap = await getMultiplePresences(participantIds);
        
        // Merge presence data with participant profiles
        const updatedParticipants = participants.map(participant => ({
          ...participant,
          isOnline: presenceMap[participant.id]?.isOnline || false,
          lastSeen: presenceMap[participant.id]?.lastSeen?.toMillis?.() || 
                    presenceMap[participant.id]?.lastSeen || 
                    participant.lastSeen,
        }));
        
        setParticipantsWithPresence(updatedParticipants);
      } catch (error) {
        console.error('Error fetching presence:', error);
        setParticipantsWithPresence(participants);
      } finally {
        setLoadingPresence(false);
      }
    }

    fetchPresence();
  }, [visible, participants]);

  const renderParticipant = ({ item }) => {
    const isCurrentUser = item.id === currentUserId;
    const isOnline = item.isOnline || false;
    
    // Format last seen for offline users
    let lastSeenText = '';
    if (!isOnline && item.lastSeen) {
      const lastSeenTimestamp = item.lastSeen?.toMillis?.() || item.lastSeen;
      if (lastSeenTimestamp) {
        lastSeenText = `Last seen ${formatRelativeTime(lastSeenTimestamp)}`;
      }
    }
    
    return (
      <View style={styles.participantItem}>
        <Avatar
          uri={item.photoURL}
          displayName={item.displayName}
          size={48}
          showOnlineBadge={true}
          isOnline={isOnline}
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
          
          {isOnline ? (
            <Text style={styles.onlineStatus}>Online</Text>
          ) : (
            lastSeenText && (
              <Text style={styles.lastSeenStatus}>{lastSeenText}</Text>
            )
          )}
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
        {loadingPresence && participantsWithPresence.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading status...</Text>
          </View>
        ) : (
          <FlatList
            data={participantsWithPresence.length > 0 ? participantsWithPresence : participants}
            renderItem={renderParticipant}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
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
    marginTop: 2,
  },
  lastSeenStatus: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '400',
    marginTop: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
  },
});

