/**
 * Contact List Item Component
 * 
 * Displays a single contact with avatar, name, email, and online status
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Avatar } from '../ui/Avatar';

/**
 * @param {Object} props
 * @param {Object} props.contact - Contact object
 * @param {string} props.contact.id - Contact user ID
 * @param {string} props.contact.displayName - Contact display name
 * @param {string} props.contact.email - Contact email
 * @param {string} [props.contact.profilePicture] - Profile picture URL
 * @param {boolean} [props.contact.isOnline] - Online status
 * @param {number} [props.contact.lastSeen] - Last seen timestamp
 * @param {Function} props.onPress - Callback when contact is tapped
 * @param {Function} [props.onLongPress] - Callback for long press (e.g., delete)
 */
export function ContactListItem({ contact, onPress, onLongPress }) {
  const {
    displayName,
    email,
    profilePicture,
    isOnline = false,
    lastSeen,
  } = contact;

  // Format last seen time
  const getLastSeenText = () => {
    if (isOnline) return 'Online';
    if (!lastSeen) return 'Offline';
    
    const now = Date.now();
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return 'Long time ago';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          uri={profilePicture}
          name={displayName}
          size={50}
          showOnlineBadge={true}
          isOnline={isOnline}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        
        <View style={styles.bottomRow}>
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        </View>
        
        <Text style={[
          styles.status,
          isOnline && styles.statusOnline
        ]}>
          {getLastSeenText()}
        </Text>
      </View>

      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  bottomRow: {
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#666666',
  },
  status: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  statusOnline: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  arrow: {
    fontSize: 24,
    color: '#CCCCCC',
    fontWeight: '300',
  },
});


