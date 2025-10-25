/**
 * SmartReplyChips Component
 * 
 * Displays context-aware smart reply suggestions as horizontal chips
 * Automatically generates replies based on the last received message
 * Integrates with conversation context (RAG) and user style analysis
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { generateSmartReplies } from '../../lib/api/aiService';

/**
 * SmartReplyChips Component
 * @param {Object} props
 * @param {Object} props.lastMessage - Last received message object
 * @param {string} props.conversationId - Conversation ID for context
 * @param {string} props.targetLanguage - Optional target language
 * @param {Function} props.onReplySelect - Callback when a reply is selected
 * @param {boolean} props.visible - Whether to show the chips
 */
const SmartReplyChips = ({ 
  lastMessage, 
  conversationId,
  targetLanguage,
  onReplySelect,
  visible = true,
}) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Generate smart replies when a new message is received
  useEffect(() => {
    if (!visible || !lastMessage || !lastMessage.content) {
      setReplies([]);
      return;
    }

    // Only generate for text messages
    if (!lastMessage.content || lastMessage.content.trim().length === 0) {
      setReplies([]);
      return;
    }

    fetchSmartReplies();
  }, [lastMessage, visible, conversationId, targetLanguage]);

  const fetchSmartReplies = async () => {
    if (!lastMessage?.content) return;

    setLoading(true);
    setError(false);
    setReplies([]);

    try {
      const result = await generateSmartReplies(
        lastMessage.content,
        conversationId,
        targetLanguage,
        null // replyStyle - let it be determined by user's style
      );

      if (result.replies && Array.isArray(result.replies)) {
        setReplies(result.replies);
      }
    } catch (err) {
      console.error('Failed to generate smart replies:', err);
      setError(true);
      // Fallback to generic replies
      setReplies(['Thanks!', 'Sounds good!', 'Got it!']);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyPress = (reply) => {
    if (onReplySelect) {
      onReplySelect(reply);
    }
    // Clear replies after selection
    setReplies([]);
  };

  // Don't render if not visible or no replies
  if (!visible || (replies.length === 0 && !loading && !error)) {
    return null;
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Generating replies...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Quick replies available</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {replies.map((reply, index) => (
            <TouchableOpacity
              key={index}
              style={styles.chip}
              onPress={() => handleReplyPress(reply)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText} numberOfLines={1}>
                {reply}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingRight: 12,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chipText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    maxWidth: 250,
  },
});

export default SmartReplyChips;

