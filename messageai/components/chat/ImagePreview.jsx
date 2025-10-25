/**
 * Image Preview Component
 * 
 * Full-screen modal for viewing images with close functionality
 * and OCR translation support
 */

import React from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Text,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { ImageTranslationModal } from './ImageTranslationModal';

/**
 * @param {Object} props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {string} props.imageUrl - URL of image to display
 * @param {Function} props.onClose - Callback when close button pressed
 * @param {string} props.userLanguage - User's preferred language for translation
 */
export function ImagePreview({ visible, imageUrl, onClose, userLanguage = 'en' }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [showTranslationModal, setShowTranslationModal] = React.useState(false);

  // Reset loading state when image URL changes
  React.useEffect(() => {
    if (visible && imageUrl) {
      setLoading(true);
      setError(false);
    }
  }, [visible, imageUrl]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  const handleLongPress = () => {
    if (Platform.OS === 'ios') {
      // iOS Action Sheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Translate text in image'],
          cancelButtonIndex: 0,
          title: 'Image Options',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setShowTranslationModal(true);
          }
        }
      );
    } else {
      // Android Alert
      Alert.alert(
        'Image Options',
        'Choose an action',
        [
          { text: 'Translate text in image', onPress: () => setShowTranslationModal(true) },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const handleCloseTranslationModal = () => {
    setShowTranslationModal(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.container}>
        {/* Background overlay - tap to close */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Close button */}
        <SafeAreaView style={styles.closeButtonContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Image */}
        {imageUrl && (
          <TouchableOpacity
            style={styles.imageContainer}
            activeOpacity={0.95}
            onLongPress={handleLongPress}
            delayLongPress={500}
          >
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading image...</Text>
              </View>
            )}
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>Failed to load image</Text>
              </View>
            )}
            
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </TouchableOpacity>
        )}

        {/* Translation Help Text */}
        {!loading && !error && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>💡 Long press image to translate text</Text>
          </View>
        )}
      </View>

      {/* Image Translation Modal */}
      <ImageTranslationModal
        visible={showTranslationModal}
        imageUrl={imageUrl}
        onClose={handleCloseTranslationModal}
        userLanguage={userLanguage}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  closeButton: {
    margin: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  errorContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
});

