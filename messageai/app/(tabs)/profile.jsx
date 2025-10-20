/**
 * Profile Screen for MessageAI MVP (Placeholder)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../lib/hooks/useAuth';

export default function ProfileScreen() {
  const { userProfile } = useAuth();

  return (
    <View style={styles.container}>
      {userProfile && (
        <>
          <Avatar 
            uri={userProfile.profilePicture}
            displayName={userProfile.displayName}
            size={100}
          />
          <Text style={styles.name}>{userProfile.displayName}</Text>
          <Text style={styles.email}>{userProfile.email}</Text>
        </>
      )}
      <Text style={styles.subtext}>Full profile management coming in PR #13</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
  },
  email: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  subtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 24,
    textAlign: 'center',
  },
});

