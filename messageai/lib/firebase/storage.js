/**
 * Firebase Storage Operations for MessageAI MVP
 * 
 * All storage operations (image uploads) are centralized here
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload profile picture to Firebase Storage
 * @param {string} userId - User ID
 * @param {string} imageUri - Local image URI
 * @returns {Promise<string>} Download URL of uploaded image
 */
export async function uploadProfilePicture(userId, imageUri) {
  try {
    // Convert URI to blob for upload
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create storage reference
    const storageRef = ref(storage, `profile_pictures/${userId}`);
    
    // Upload file
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw new Error('Failed to upload profile picture');
  }
}

/**
 * Upload chat image to Firebase Storage
 * @param {string} conversationId - Conversation ID
 * @param {string} imageUri - Local image URI
 * @returns {Promise<string>} Download URL of uploaded image
 */
export async function uploadChatImage(conversationId, imageUri) {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const timestamp = Date.now();
    const storageRef = ref(storage, `chat_images/${conversationId}/${timestamp}`);
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading chat image:', error);
    throw new Error('Failed to upload image');
  }
}

