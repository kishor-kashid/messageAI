/**
 * Contact List Item Component
 * 
 * Displays a single contact with avatar, name, and email
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
 * @param {string} [props.contact.photoURL] - Profile picture URL
 * @param {Function} props.onPress - Callback when contact is tapped
 * @param {Function} [props.onLongPress] - Callback for long press (e.g., delete)
 */
export function ContactListItem({ contact, onPress, onLongPress }) {
  const {
    displayName,
    email,
    photoURL,
  } = contact;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          uri={photoURL}
          displayName={displayName}
          size={50}
          showOnlineBadge={false}
          isOnline={false}
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
  arrowContainer: {
    marginLeft: 8,
  },
  arrow: {
    fontSize: 24,
    color: '#CCCCCC',
    fontWeight: '300',
  },
});


