/**
 * Conversations Screen for MessageAI MVP (Placeholder)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/hooks/useAuth';

export default function ConversationsScreen() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Conversations List</Text>
      <Text style={styles.subtext}>Coming in PR #5</Text>
      <Button 
        title="Sign Out" 
        onPress={signOut}
        variant="secondary"
        style={styles.button}
      />
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
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
});

