/**
 * Chat Screen
 * 
 * One-on-one chat interface with real-time messaging
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '../../lib/hooks/useAuth';
import { useMessages } from '../../lib/hooks/useMessages';
import { getConversationById, resetUnreadCount } from '../../lib/firebase/firestore';
import { getUserProfile } from '../../lib/firebase/firestore';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';
import { ConversationHeader } from '../../components/conversations/ConversationHeader';

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [conversation, setConversation] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(true);
  
  const {
    messages,
    loading: loadingMessages,
    error,
    sending,
    sendMessage,
    markAsRead,
  } = useMessages(conversationId);

  // Load conversation details
  useEffect(() => {
    if (!conversationId || !user) return;

    async function loadConversation() {
      try {
        setLoadingConversation(true);
        
        // Get conversation
        const conv = await getConversationById(conversationId);
        if (!conv) {
          Alert.alert('Error', 'Conversation not found');
          router.back();
          return;
        }
        
        setConversation(conv);

        // For direct chats, get other participant's profile
        if (conv.type === 'direct') {
          const otherUserId = conv.participantIds.find(id => id !== user.uid);
          if (otherUserId) {
            const profile = await getUserProfile(otherUserId);
            setOtherParticipant(profile);
          }
        }
        
        setLoadingConversation(false);
      } catch (err) {
        console.error('Error loading conversation:', err);
        Alert.alert('Error', 'Failed to load conversation');
        setLoadingConversation(false);
      }
    }

    loadConversation();
  }, [conversationId, user, router]);

  // Mark messages as read and reset unread count whenever in the chat
  useEffect(() => {
    if (!conversationId || !user) return;

    const markMessagesAsReadAndResetCount = async () => {
      // Mark unread messages as read
      if (messages && messages.length > 0) {
        const unreadMessages = messages.filter(
          msg => msg.senderId !== user.uid && msg.status !== 'read'
        );

        if (unreadMessages.length > 0) {
          markAsRead(unreadMessages.map(msg => msg.id));
        }
      }

      // Always reset unread count when in the chat (even if no new messages)
      try {
        await resetUnreadCount(conversationId, user.uid);
      } catch (err) {
        console.error('Failed to reset unread count:', err);
        // Non-critical error, don't show to user
      }
    };

    markMessagesAsReadAndResetCount();
  }, [messages, conversationId, user, markAsRead]);

  const handleSendMessage = async (text) => {
    try {
      await sendMessage(text);
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  if (loadingConversation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <ConversationHeader
              participant={otherParticipant}
              conversation={conversation}
            />
          ),
          headerBackTitle: 'Back',
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <MessageList
          messages={messages}
          currentUserId={user?.uid}
          loading={loadingMessages}
        />
        
        <MessageInput
          onSend={handleSendMessage}
          disabled={sending}
          placeholder="Type a message..."
        />
      </KeyboardAvoidingView>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Error loading messages</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  errorBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    padding: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

