/**
 * Message Input Component
 * 
 * Text input with send button for composing messages
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

/**
 * @param {Object} props
 * @param {Function} props.onSend - Callback when send button is pressed
 * @param {Function} [props.onTextChange] - Callback when text changes (for typing indicators)
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {string} [props.placeholder='Type a message...'] - Input placeholder
 */
export function MessageInput({ onSend, onTextChange, disabled = false, placeholder = 'Type a message...' }) {
  const [text, setText] = useState('');

  const handleTextChange = (newText) => {
    setText(newText);
    if (onTextChange) {
      onTextChange(newText);
    }
  };

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText && !disabled) {
      onSend(trimmedText);
      setText('');
      // Notify that text is now empty (stops typing indicator)
      if (onTextChange) {
        onTextChange('');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          multiline
          maxLength={1000}
          editable={!disabled}
          returnKeyType="default"
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!text.trim() || disabled) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
        >
          <Text style={[
            styles.sendButtonText,
            (!text.trim() || disabled) && styles.sendButtonTextDisabled
          ]}>
            ↑
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 40,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    maxHeight: 100,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.5,
  },
});

