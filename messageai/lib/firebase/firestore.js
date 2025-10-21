/**
 * Firestore Database Operations for MessageAI MVP
 * 
 * All Firestore operations are centralized here
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Create a new user profile in Firestore
 * @param {string} userId - User ID from Firebase Auth
 * @param {Object} profileData - User profile data
 * @returns {Promise<void>}
 */
export async function createUserProfile(userId, profileData) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      isOnline: true,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
}

/**
 * Get a user profile from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User profile or null
 */
export async function getUserProfile(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
}

/**
 * Update a user profile in Firestore
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateUserProfile(userId, updates) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      lastSeen: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

// ============================================
// CONTACT MANAGEMENT FUNCTIONS
// ============================================

/**
 * Search for a user by email
 * @param {string} email - Email to search for
 * @returns {Promise<Object|null>} User profile or null if not found
 */
export async function searchUserByEmail(email) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('Error searching user by email:', error);
    throw new Error('Failed to search user');
  }
}

/**
 * Add a contact to the current user's contact list
 * @param {string} currentUserId - Current user's ID
 * @param {string} contactUserId - Contact user's ID to add
 * @returns {Promise<void>}
 */
export async function addContact(currentUserId, contactUserId) {
  try {
    if (currentUserId === contactUserId) {
      throw new Error('Cannot add yourself as a contact');
    }

    // Add to current user's contacts
    const currentUserRef = doc(db, 'users', currentUserId);
    await updateDoc(currentUserRef, {
      contacts: arrayUnion(contactUserId),
      lastSeen: serverTimestamp(),
    });

    // Add current user to contact's contacts (mutual)
    const contactRef = doc(db, 'users', contactUserId);
    await updateDoc(contactRef, {
      contacts: arrayUnion(currentUserId),
    });

    console.log(`✅ Contact added: ${contactUserId}`);
  } catch (error) {
    console.error('Error adding contact:', error);
    // Preserve original error message if it's one we threw
    if (error.message === 'Cannot add yourself as a contact') {
      throw error;
    }
    throw new Error('Failed to add contact');
  }
}

/**
 * Remove a contact from the current user's contact list
 * @param {string} currentUserId - Current user's ID
 * @param {string} contactUserId - Contact user's ID to remove
 * @returns {Promise<void>}
 */
export async function removeContact(currentUserId, contactUserId) {
  try {
    // Remove from current user's contacts
    const currentUserRef = doc(db, 'users', currentUserId);
    await updateDoc(currentUserRef, {
      contacts: arrayRemove(contactUserId),
      lastSeen: serverTimestamp(),
    });

    // Remove current user from contact's contacts
    const contactRef = doc(db, 'users', contactUserId);
    await updateDoc(contactRef, {
      contacts: arrayRemove(currentUserId),
    });

    console.log(`✅ Contact removed: ${contactUserId}`);
  } catch (error) {
    console.error('Error removing contact:', error);
    throw new Error('Failed to remove contact');
  }
}

/**
 * Get all contacts for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of contact user profiles
 */
export async function getContacts(userId) {
  try {
    // Get user's profile to find contact IDs
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile || !userProfile.contacts || userProfile.contacts.length === 0) {
      return [];
    }

    // Fetch all contact profiles
    const contactPromises = userProfile.contacts.map(contactId => 
      getUserProfile(contactId)
    );
    
    const contacts = await Promise.all(contactPromises);
    
    // Filter out null values (in case a contact was deleted)
    return contacts.filter(contact => contact !== null);
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw new Error('Failed to get contacts');
  }
}

/**
 * Listen to real-time updates for user's contacts
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle contact updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToContacts(userId, callback) {
  try {
    const userRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const contactIds = userData.contacts || [];
        
        if (contactIds.length === 0) {
          callback([]);
          return;
        }

        // Fetch all contact profiles
        const contactPromises = contactIds.map(contactId => 
          getUserProfile(contactId)
        );
        
        const contacts = await Promise.all(contactPromises);
        const validContacts = contacts.filter(contact => contact !== null);
        
        callback(validContacts);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error subscribing to contacts:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up contacts subscription:', error);
    throw new Error('Failed to subscribe to contacts');
  }
}

/**
 * Check if a user is in current user's contact list
 * @param {string} currentUserId - Current user's ID
 * @param {string} contactUserId - Contact user's ID to check
 * @returns {Promise<boolean>} True if contact exists
 */
export async function isContact(currentUserId, contactUserId) {
  try {
    const userProfile = await getUserProfile(currentUserId);
    
    if (!userProfile || !userProfile.contacts) {
      return false;
    }

    return userProfile.contacts.includes(contactUserId);
  } catch (error) {
    console.error('Error checking contact status:', error);
    return false;
  }
}

// ============================================
// CONVERSATION MANAGEMENT FUNCTIONS
// ============================================

/**
 * Create a new conversation
 * @param {Array<string>} participantIds - Array of participant user IDs
 * @param {string} [type='direct'] - Conversation type ('direct' or 'group')
 * @param {string} [groupName] - Group name (for group chats)
 * @returns {Promise<Object>} Created conversation object
 */
export async function createConversation(participantIds, type = 'direct', groupName = null) {
  try {
    // Validate participants
    if (!participantIds || participantIds.length < 2) {
      throw new Error('At least 2 participants required');
    }

    // For direct chats, check if conversation already exists
    if (type === 'direct' && participantIds.length === 2) {
      const existing = await findConversationByParticipants(participantIds);
      if (existing) {
        console.log(`✅ Conversation already exists: ${existing.id}`);
        return existing;
      }
    }

    // Create new conversation document
    const conversationsRef = collection(db, 'conversations');
    const newConversationRef = doc(conversationsRef);
    
    // Initialize unread count object for each participant
    const unreadCount = {};
    participantIds.forEach(id => {
      unreadCount[id] = 0;
    });
    
    const conversationData = {
      id: newConversationRef.id,
      participantIds,
      type,
      groupName: groupName || null,
      lastMessage: null,
      lastMessageTimestamp: null,
      unreadCount, // Track unread count per user
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newConversationRef, conversationData);
    
    console.log(`✅ Conversation created: ${newConversationRef.id}`);
    return { ...conversationData, id: newConversationRef.id };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }
}

/**
 * Find conversation by participants (for direct chats)
 * @param {Array<string>} participantIds - Array of participant IDs
 * @returns {Promise<Object|null>} Conversation object or null
 */
export async function findConversationByParticipants(participantIds) {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('type', '==', 'direct'),
      where('participantIds', 'array-contains', participantIds[0])
    );
    
    const querySnapshot = await getDocs(q);
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      // Check if all participants match and conversation is not deleted
      if (
        !data.deletedAt &&
        data.participantIds.length === participantIds.length &&
        participantIds.every(id => data.participantIds.includes(id))
      ) {
        return { id: docSnap.id, ...data };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding conversation:', error);
    return null;
  }
}

/**
 * Get all conversations for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of conversation objects
 */
export async function getConversations(userId) {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participantIds', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const conversations = [];
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      // Filter out deleted conversations
      if (!data.deletedAt) {
        conversations.push({ id: docSnap.id, ...data });
      }
    }
    
    // Sort by last message timestamp (most recent first)
    conversations.sort((a, b) => {
      const timeA = a.lastMessageTimestamp || 0;
      const timeB = b.lastMessageTimestamp || 0;
      return timeB - timeA;
    });
    
    console.log(`✅ Fetched ${conversations.length} conversations`);
    return conversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw new Error('Failed to get conversations');
  }
}

/**
 * Subscribe to real-time conversation updates for a user
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToConversations(userId, callback) {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participantIds', 'array-contains', userId)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const conversations = [];
      
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Filter out deleted conversations
        if (!data.deletedAt) {
          conversations.push({ id: docSnap.id, ...data });
        }
      });
      
      // Sort by last message timestamp
      conversations.sort((a, b) => {
        const timeA = a.lastMessageTimestamp || 0;
        const timeB = b.lastMessageTimestamp || 0;
        return timeB - timeA;
      });
      
      callback(conversations);
    }, (error) => {
      console.error('Error subscribing to conversations:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up conversation subscription:', error);
    throw new Error('Failed to subscribe to conversations');
  }
}

/**
 * Update conversation's last message
 * @param {string} conversationId - Conversation ID
 * @param {string} lastMessage - Last message text
 * @param {number} timestamp - Message timestamp
 * @returns {Promise<void>}
 */
export async function updateConversationLastMessage(conversationId, lastMessage, timestamp) {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage,
      lastMessageTimestamp: timestamp,
      updatedAt: serverTimestamp(),
    });
    
    console.log(`✅ Conversation updated: ${conversationId}`);
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw new Error('Failed to update conversation');
  }
}

/**
 * Get conversation by ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} Conversation object or null
 */
export async function getConversationById(conversationId) {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const data = conversationSnap.data();
      // Return null if conversation is deleted
      if (data.deletedAt) {
        return null;
      }
      return { id: conversationSnap.id, ...data };
    }
    return null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw new Error('Failed to get conversation');
  }
}

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<void>}
 */
export async function deleteConversation(conversationId) {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      deletedAt: serverTimestamp(),
    });
    
    console.log(`✅ Conversation deleted: ${conversationId}`);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw new Error('Failed to delete conversation');
  }
}

// ============================================
// MESSAGE MANAGEMENT FUNCTIONS
// ============================================

/**
 * Send a message in a conversation
 * @param {Object} messageData - Message data
 * @param {string} messageData.conversationId - Conversation ID
 * @param {string} messageData.senderId - Sender user ID
 * @param {string} messageData.content - Message text content
 * @param {string} [messageData.type='text'] - Message type
 * @returns {Promise<Object>} Created message object
 */
export async function sendMessage(messageData) {
  try {
    const { conversationId, senderId, content, type = 'text' } = messageData;

    if (!content || content.trim() === '') {
      throw new Error('Message content cannot be empty');
    }

    // Create message document
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const newMessageRef = doc(messagesRef);
    
    const timestamp = Date.now();
    const message = {
      id: newMessageRef.id,
      conversationId,
      senderId,
      content: content.trim(),
      type,
      timestamp,
      status: 'sent',
      createdAt: serverTimestamp(),
    };

    await setDoc(newMessageRef, message);
    
    // Update conversation's last message
    await updateConversationLastMessage(conversationId, content.trim(), timestamp);
    
    // Increment unread count for other participants
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);
      
      if (conversationSnap.exists()) {
        const conv = conversationSnap.data();
        const updates = {};
        
        // Increment unread for all participants except sender
        if (conv.participantIds) {
          conv.participantIds.forEach(participantId => {
            if (participantId !== senderId) {
              const currentCount = conv.unreadCount?.[participantId] || 0;
              updates[`unreadCount.${participantId}`] = currentCount + 1;
            }
          });
          
          if (Object.keys(updates).length > 0) {
            await updateDoc(conversationRef, updates);
          }
        }
      }
    } catch (err) {
      console.error('Failed to update unread count:', err);
      // Don't throw - message was sent successfully
    }
    
    console.log(`✅ Message sent: ${newMessageRef.id}`);
    return { ...message, id: newMessageRef.id };
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
}

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} [limit=50] - Number of messages to fetch
 * @returns {Promise<Array>} Array of message objects
 */
export async function getMessages(conversationId, limit = 50) {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const messages = [];
    
    querySnapshot.forEach((docSnap) => {
      messages.push({ id: docSnap.id, ...docSnap.data() });
    });
    
    // Reverse to show oldest first (chronological order)
    messages.reverse();
    
    console.log(`✅ Fetched ${messages.length} messages`);
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw new Error('Failed to get messages');
  }
}

/**
 * Subscribe to real-time message updates for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {Function} callback - Callback function to handle message updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToMessages(conversationId, callback) {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      
      querySnapshot.forEach((docSnap) => {
        messages.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      callback(messages);
    }, (error) => {
      console.error('Error subscribing to messages:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up message subscription:', error);
    throw new Error('Failed to subscribe to messages');
  }
}

/**
 * Update message status
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID
 * @param {string} status - New status ('sent', 'delivered', 'read')
 * @returns {Promise<void>}
 */
export async function updateMessageStatus(conversationId, messageId, status) {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
      status,
      [`${status}At`]: serverTimestamp(),
    });
    
    console.log(`✅ Message status updated: ${messageId} -> ${status}`);
  } catch (error) {
    console.error('Error updating message status:', error);
    throw new Error('Failed to update message status');
  }
}

/**
 * Mark messages as read
 * @param {string} conversationId - Conversation ID
 * @param {Array<string>} messageIds - Array of message IDs to mark as read
 * @returns {Promise<void>}
 */
export async function markMessagesAsRead(conversationId, messageIds) {
  try {
    const batch = [];
    
    for (const messageId of messageIds) {
      const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      batch.push(
        updateDoc(messageRef, {
          status: 'read',
          readAt: serverTimestamp(),
        })
      );
    }
    
    await Promise.all(batch);
    console.log(`✅ Marked ${messageIds.length} messages as read`);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw new Error('Failed to mark messages as read');
  }
}

/**
 * Reset unread count for a user in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function resetUnreadCount(conversationId, userId) {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0,
    });
    
    console.log(`✅ Unread count reset for user ${userId} in conversation ${conversationId}`);
  } catch (error) {
    console.error('Error resetting unread count:', error);
    throw new Error('Failed to reset unread count');
  }
}

/**
 * Delete a message
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID
 * @returns {Promise<void>}
 */
export async function deleteMessage(conversationId, messageId) {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
      deletedAt: serverTimestamp(),
      content: '[Message deleted]',
    });
    
    console.log(`✅ Message deleted: ${messageId}`);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw new Error('Failed to delete message');
  }
}

