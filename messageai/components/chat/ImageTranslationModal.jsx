/**
 * Image Translation Modal Component
 * 
 * Displays OCR results and translation for images with text
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Clipboard,
} from 'react-native';
import { extractImageText, translateMessage } from '../../lib/api/aiService';
import { getLanguageFlag, getLanguageName } from '../../lib/utils/languageHelpers';
import { AILoadingState } from '../ai/AILoadingState';
import { AIErrorState } from '../ai/AIErrorState';

// Error message configurations
const ERROR_MESSAGES = {
  NO_TEXT_DETECTED: {
    icon: '🔍',
    title: 'No Text Found',
    message: 'No readable text was detected in this image.',
  },
  LOW_QUALITY: {
    icon: '📷',
    title: 'Image Too Blurry',
    message: 'The image quality is too low. Try a clearer photo.',
  },
  default: {
    icon: '⚠️',
    title: 'Processing Failed',
    message: 'Failed to process image. Please try again.',
  },
};

/**
 * @param {Object} props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {string} props.imageUrl - URL of image to process
 * @param {Function} props.onClose - Callback when modal closes
 * @param {string} props.userLanguage - User's preferred language
 */
export function ImageTranslationModal({ visible, imageUrl, onClose, userLanguage = 'en' }) {
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [translation, setTranslation] = useState(null);

  useEffect(() => {
    if (visible && imageUrl) {
      processImage();
    }
  }, [visible, imageUrl]);

  const processImage = async () => {
    try {
      setLoading(true);
      setError(null);
      setOcrResult(null);
      setTranslation(null);

      // Step 1: Extract text from image
      const ocr = await extractImageText(imageUrl);
      
      if (!ocr.text) {
        setError('NO_TEXT_DETECTED');
        setLoading(false);
        return;
      }

      setOcrResult(ocr);
      setLoading(false);

      // Step 2: Translate if needed
      if (ocr.detectedLanguage !== userLanguage) {
        setTranslating(true);
        const translated = await translateMessage(
          ocr.text,
          userLanguage,
          ocr.detectedLanguage
        );
        setTranslation(translated.translatedText);
        setTranslating(false);
      }
    } catch (err) {
      console.error('Error processing image:', err);
      
      // Set error with type information for AIErrorState
      if (err.message === 'NO_TEXT_DETECTED') {
        setError({ type: 'NO_TEXT_DETECTED', message: err.message });
      } else if (err.message?.includes('quality')) {
        setError({ type: 'LOW_QUALITY', message: err.message });
      } else if (err.type === 'RATE_LIMIT') {
        setError({ type: 'RATE_LIMIT', message: err.message });
      } else if (err.type === 'NETWORK') {
        setError({ type: 'NETWORK', message: err.message });
      } else if (err.type === 'AUTH') {
        setError({ type: 'AUTH', message: err.message });
      } else {
        setError({ type: 'PROCESSING_ERROR', message: err.message });
      }
      
      setLoading(false);
      setTranslating(false);
    }
  };

  const handleRetry = () => {
    processImage();
  };

  const handleCopyOriginal = () => {
    if (ocrResult?.text) {
      Clipboard.setString(ocrResult.text);
      Alert.alert('Copied', 'Original text copied to clipboard');
    }
  };

  const handleCopyTranslation = () => {
    if (translation) {
      Clipboard.setString(translation);
      Alert.alert('Copied', 'Translation copied to clipboard');
    }
  };

  const handleClose = () => {
    setOcrResult(null);
    setTranslation(null);
    setError(null);
    onClose();
  };

  const getErrorMessage = () => {
    if (!error) return ERROR_MESSAGES.default;
    const errorType = error.type || error;
    return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.default;
  };


  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📸 Image Translation</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Image Thumbnail */}
          {imageUrl && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.imageThumbnail}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Loading State */}
          {loading && (
            <AILoadingState message="Extracting text from image..." />
          )}

          {/* Error State */}
          {error && (
            <AIErrorState
              type={error.type || 'GENERIC'}
              message={error.message}
              onRetry={handleRetry}
              showRetry={error.type !== 'RATE_LIMIT' && error.type !== 'AUTH'}
            />
          )}

          {/* Original Text */}
          {ocrResult && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  {getLanguageFlag(ocrResult.detectedLanguage)} Original Text
                </Text>
                <Text style={styles.languageLabel}>
                  {getLanguageName(ocrResult.detectedLanguage)}
                </Text>
              </View>
              <View style={styles.textBox}>
                <Text style={styles.textContent}>{ocrResult.text}</Text>
              </View>
              <View style={styles.metaInfo}>
                <Text style={styles.metaText}>
                  {ocrResult.wordCount} words • {(ocrResult.confidence * 100).toFixed(0)}% confidence
                </Text>
                <TouchableOpacity onPress={handleCopyOriginal}>
                  <Text style={styles.copyButton}>📋 Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Translation Loading */}
          {translating && (
            <AILoadingState 
              message={`Translating to ${getLanguageName(userLanguage)}...`}
              size="small"
            />
          )}

          {/* Translation */}
          {translation && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  {getLanguageFlag(userLanguage)} Translation
                </Text>
                <Text style={styles.languageLabel}>
                  {getLanguageName(userLanguage)}
                </Text>
              </View>
              <View style={[styles.textBox, styles.translationBox]}>
                <Text style={styles.textContent}>{translation}</Text>
              </View>
              <View style={styles.metaInfo}>
                <Text style={styles.metaText}>Auto-translated</Text>
                <TouchableOpacity onPress={handleCopyTranslation}>
                  <Text style={styles.copyButton}>📋 Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Same Language Message */}
          {ocrResult && !translating && !translation && ocrResult.detectedLanguage === userLanguage && (
            <View style={styles.sameLanguageContainer}>
              <Text style={styles.sameLanguageText}>
                ✓ Text is already in {getLanguageName(userLanguage)}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Done Button */}
        {(ocrResult || error) && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    backgroundColor: '#000000',
    padding: 16,
    alignItems: 'center',
  },
  imageThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  languageLabel: {
    fontSize: 14,
    color: '#666666',
  },
  textBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
  },
  translationBox: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#999999',
  },
  copyButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  sameLanguageContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    alignItems: 'center',
  },
  sameLanguageText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

