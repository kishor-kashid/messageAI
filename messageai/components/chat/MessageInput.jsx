/**
 * Message Input Component
 * 
 * Text input with send button and image picker for composing messages
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  ActionSheetIOS,
} from 'react-native';
import { useImagePicker } from '../../lib/hooks/useImagePicker';
import { uploadChatImage } from '../../lib/firebase/storage';

/**
 * @param {Object} props
 * @param {string} props.conversationId - ID of the conversation
 * @param {Function} props.onSend - Callback when send button is pressed (text, imageUrl)
 * @param {Function} [props.onTextChange] - Callback when text changes (for typing indicators)
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {string} [props.placeholder='Type a message...'] - Input placeholder
 */
export function MessageInput({ conversationId, onSend, onTextChange, disabled = false, placeholder = 'Type a message...' }) {
  const [text, setText] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const { pickImage, takePhoto, loading: imagePickerLoading } = useImagePicker();

  const handleTextChange = (newText) => {
    setText(newText);
    if (onTextChange) {
      onTextChange(newText);
    }
  };

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText && !disabled) {
      onSend(trimmedText, null);
      setText('');
      // Notify that text is now empty (stops typing indicator)
      if (onTextChange) {
        onTextChange('');
      }
    }
  };

  const handleImagePickerPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleTakePhoto();
          } else if (buttonIndex === 2) {
            await handlePickImage();
          }
        }
      );
    } else {
      // Android - show Alert dialog
      Alert.alert(
        'Add Image',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Choose from Library', onPress: handlePickImage },
        ]
      );
    }
  };

  const handlePickImage = async () => {
    try {
      const imageUri = await pickImage();
      if (imageUri) {
        await uploadAndSendImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const imageUri = await takePhoto();
      if (imageUri) {
        await uploadAndSendImage(imageUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadAndSendImage = async (imageUri) => {
    try {
      setUploadingImage(true);
      
      // Upload image to Firebase Storage
      const downloadUrl = await uploadChatImage(conversationId, imageUri);
      
      // Send message with image
      const caption = text.trim();
      onSend(caption || null, downloadUrl);
      setText('');
      
      // Notify that text is now empty
      if (onTextChange) {
        onTextChange('');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const isLoading = uploadingImage || imagePickerLoading;

  return (
    <View style={styles.container}>
      {/* Show uploading indicator */}
      {uploadingImage && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.uploadingText}>Uploading image...</Text>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        {/* Image picker button */}
        <TouchableOpacity
          style={styles.imageButton}
          onPress={handleImagePickerPress}
          disabled={disabled || isLoading}
        >
          <Text style={[
            styles.imageButtonIcon,
            (disabled || isLoading) && styles.imageButtonIconDisabled
          ]}>
            📷
          </Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          multiline
          maxLength={1000}
          editable={!disabled && !isLoading}
          returnKeyType="default"
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!text.trim() || disabled || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!text.trim() || disabled || isLoading}
        >
          <Text style={[
            styles.sendButtonText,
            (!text.trim() || disabled || isLoading) && styles.sendButtonTextDisabled
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
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
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
  imageButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  imageButtonIcon: {
    fontSize: 24,
  },
  imageButtonIconDisabled: {
    opacity: 0.3,
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

