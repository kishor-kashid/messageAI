/**
 * useImagePicker Hook for MessageAI MVP
 * 
 * Provides image picking functionality (camera or gallery)
 */

import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

/**
 * Custom hook for image picking
 * @returns {Object} Image picker methods
 */
export function useImagePicker() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Request camera permissions
   * @returns {Promise<boolean>} Permission granted
   */
  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      setError('Failed to request camera permission');
      return false;
    }
  };

  /**
   * Request media library permissions
   * @returns {Promise<boolean>} Permission granted
   */
  const requestMediaLibraryPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.error('Error requesting media library permission:', err);
      setError('Failed to request media library permission');
      return false;
    }
  };

  /**
   * Pick image from gallery
   * @returns {Promise<string|null>} Image URI or null
   */
  const pickImage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request permission
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        setError('Media library permission denied');
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }

      return null;
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Take photo with camera
   * @returns {Promise<string|null>} Image URI or null
   */
  const takePhoto = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request permission
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setError('Camera permission denied');
        return null;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }

      return null;
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Failed to take photo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    pickImage,
    takePhoto,
  };
}

