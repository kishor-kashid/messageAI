/**
 * Chat Screen
 * 
 * One-on-one chat interface with real-time messaging
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '../../lib/hooks/useAuth';
import { useMessages } from '../../lib/hooks/useMessages';
import { useNotifications } from '../../lib/context/NotificationContext';
import {
  getConversationById,
  resetUnreadCount,
  setTypingStatus,
  subscribeToTyping,
  getUserProfile,
  getGroupParticipants,
} from '../../lib/firebase/firestore';
import { listenToPresence, getUserPresence } from '../../lib/firebase/presence';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';
import { ConversationHeader } from '../../components/conversations/ConversationHeader';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { GroupParticipantsModal } from '../../components/chat/GroupParticipantsModal';
import { ReadReceiptsModal } from '../../components/chat/ReadReceiptsModal';

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setCurrentScreen } = useNotifications();
  
  const [conversation, setConversation] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(true);
  const [typingUserIds, setTypingUserIds] = useState([]);
  const [senderProfiles, setSenderProfiles] = useState({});
  const [showGroupParticipants, setShowGroupParticipants] = useState(false);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState(null);
  const [selectedMessageForInfo, setSelectedMessageForInfo] = useState(null);
  
  const {
    messages,
    loading: loadingMessages,
    error,
    sending,
    sendMessage,
    markAsRead,
  } = useMessages(conversationId);

  // Typing timeout ref
  const typingTimeoutRef = useRef(null);

  // Track current screen for notification silencing
  useEffect(() => {
    if (conversationId) {
      console.log('📍 User viewing chat:', conversationId);
      setCurrentScreen(`chat_${conversationId}`);
      // Reset firstUnreadMessageId when switching chats
      setFirstUnreadMessageId(null);
    }
    return () => {
      console.log('📍 User left chat:', conversationId);
      setCurrentScreen(null);
    };
  }, [conversationId, setCurrentScreen]);

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
            
            // Also fetch initial presence status
            const presenceData = await getUserPresence(otherUserId);
            const participantWithPresence = {
              ...profile,
              isOnline: presenceData?.isOnline || false,
              lastSeen: presenceData?.lastSeen?.toMillis?.() || presenceData?.lastSeen || profile.lastSeen,
            };
            
            setOtherParticipant(participantWithPresence);
            // Store in sender profiles for consistency
            setSenderProfiles({ [otherUserId]: participantWithPresence });
          }
        } else if (conv.type === 'group') {
          // For group chats, get all participant profiles
          const participants = await getGroupParticipants(conversationId);
          const profilesMap = {};
          participants.forEach(p => {
            profilesMap[p.id] = p;
          });
          setSenderProfiles(profilesMap);
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

  // Subscribe to other participant's presence (direct chat)
  useEffect(() => {
    if (!conversation || conversation.type !== 'direct' || !user) return;
    
    const otherUserId = conversation.participantIds.find(id => id !== user.uid);
    if (!otherUserId) return;

    const unsubscribe = listenToPresence(otherUserId, (presenceData) => {
      console.log('📡 Presence update received:', {
        userId: otherUserId,
        isOnline: presenceData.isOnline,
        lastSeen: presenceData.lastSeen,
      });
      
      setOtherParticipant((prev) => ({
        ...prev,
        isOnline: presenceData.isOnline || false,
        lastSeen: presenceData.lastSeen?.toMillis?.() || presenceData.lastSeen,
      }));
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversation, user]);

  // Presence is now fetched on-demand when modal opens (see GroupParticipantsModal)

  // Subscribe to typing indicators
  useEffect(() => {
    if (!conversationId || !user) return;

    const unsubscribe = subscribeToTyping(conversationId, user.uid, (typingUsers) => {
      setTypingUserIds(typingUsers);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId, user]);

  // Identify first unread message for scroll positioning (capture before marking as read)
  useEffect(() => {
    if (!messages || messages.length === 0 || !user) return;
    
    // Only set this once when messages first load
    if (firstUnreadMessageId === null) {
      const firstUnread = messages.find(
        msg => msg.senderId !== user.uid && msg.status !== 'read'
      );
      
      if (firstUnread) {
        console.log('📍 First unread message identified:', firstUnread.id);
        setFirstUnreadMessageId(firstUnread.id);
      }
    }
  }, [messages, user, firstUnreadMessageId]);

  // Mark messages as read and reset unread count whenever in the chat
  useEffect(() => {
    if (!conversationId || !user || !conversation) return;

    const markMessagesAsReadAndResetCount = async () => {
      // Mark unread messages as read
      if (messages && messages.length > 0) {
        const unreadMessages = messages.filter(
          msg => msg.senderId !== user.uid && msg.status !== 'read'
        );

        if (unreadMessages.length > 0) {
          markAsRead(unreadMessages.map(msg => msg.id), conversation);
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
  }, [messages, conversationId, user, conversation, markAsRead]);

  // Handle text input change (typing indicator)
  const handleTextChange = useCallback((text) => {
    if (!conversationId || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing status to true if user is typing
    if (text.length > 0) {
      setTypingStatus(conversationId, user.uid, true);

      // Clear typing status after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(conversationId, user.uid, false);
      }, 3000);
    } else {
      // Clear typing status immediately if input is empty
      setTypingStatus(conversationId, user.uid, false);
    }
  }, [conversationId, user]);

  const handleSendMessage = async (text, imageUrl = null) => {
    try {
      // Clear typing status when sending
      if (user && conversationId) {
        setTypingStatus(conversationId, user.uid, false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }

      await sendMessage(text, imageUrl);
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleShowGroupParticipants = () => {
    setShowGroupParticipants(true);
  };

  const handleCloseGroupParticipants = () => {
    setShowGroupParticipants(false);
  };

  const handleShowMessageInfo = (message) => {
    console.log('📊 Showing message info for:', message.id);
    setSelectedMessageForInfo(message);
  };

  const handleCloseMessageInfo = () => {
    setSelectedMessageForInfo(null);
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear typing status on unmount
      if (user && conversationId) {
        setTypingStatus(conversationId, user.uid, false);
      }
    };
  }, [user, conversationId]);

  if (loadingConversation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <ConversationHeader
              participant={otherParticipant}
              conversation={conversation}
              onGroupInfoPress={handleShowGroupParticipants}
            />
          ),
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: true,
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior='padding'
        keyboardVerticalOffset={90}
      >
        <View style={styles.messagesContainer}>
          <MessageList
            messages={messages}
            currentUserId={user?.uid}
            loading={loadingMessages}
            isGroupChat={conversation?.type === 'group'}
            senderProfiles={senderProfiles}
            conversation={conversation}
            firstUnreadMessageId={firstUnreadMessageId}
            onShowMessageInfo={handleShowMessageInfo}
          />
          
          {/* Typing Indicator */}
          <TypingIndicator
            typingUserIds={typingUserIds}
            participants={{
              [otherParticipant?.id]: otherParticipant,
            }}
          />
        </View>
        
        <MessageInput
          conversationId={conversationId}
          onSend={handleSendMessage}
          onTextChange={handleTextChange}
          disabled={sending}
          placeholder="Type a message..."
        />
      </KeyboardAvoidingView>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Error loading messages</Text>
        </View>
      )}

      {/* Group Participants Modal */}
      {conversation?.type === 'group' && (
        <GroupParticipantsModal
          visible={showGroupParticipants}
          onClose={handleCloseGroupParticipants}
          participants={Object.values(senderProfiles)}
          groupName={conversation.groupName}
          currentUserId={user?.uid}
        />
      )}

      {/* Read Receipts Modal (WhatsApp-style Message Info) */}
      <ReadReceiptsModal
        visible={!!selectedMessageForInfo}
        onClose={handleCloseMessageInfo}
        message={selectedMessageForInfo}
        participants={conversation?.type === 'group' 
          ? senderProfiles 
          : (otherParticipant ? { [otherParticipant.id]: otherParticipant } : {})
        }
        currentUserId={user?.uid}
      />
    </SafeAreaView>
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
  messagesContainer: {
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
