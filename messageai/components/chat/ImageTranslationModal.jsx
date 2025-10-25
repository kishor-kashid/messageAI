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
import { extractImageText } from '../../lib/api/aiService';
import { translateMessage } from '../../lib/api/aiService';

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
      console.log('🔍 Extracting text from image...');
      console.log('👤 User preferred language:', userLanguage);
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
        console.log(`🌍 Translating from ${ocr.detectedLanguage} to ${userLanguage}...`);
        console.log('📝 Translation request:', { text: ocr.text.substring(0, 50), targetLanguage: userLanguage, sourceLanguage: ocr.detectedLanguage });
        
        const translated = await translateMessage(
          ocr.text,
          userLanguage,
          ocr.detectedLanguage
        );
        
        console.log('✅ Translation received:', translated.translatedText.substring(0, 50));
        setTranslation(translated.translatedText);
        setTranslating(false);
      } else {
        console.log('ℹ️ No translation needed - text is already in user language');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      
      if (err.message === 'NO_TEXT_DETECTED') {
        setError('NO_TEXT_DETECTED');
      } else if (err.message?.includes('quality')) {
        setError('LOW_QUALITY');
      } else {
        setError('PROCESSING_ERROR');
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
    switch (error) {
      case 'NO_TEXT_DETECTED':
        return {
          icon: '🔍',
          title: 'No Text Found',
          message: 'No readable text was detected in this image.',
        };
      case 'LOW_QUALITY':
        return {
          icon: '📷',
          title: 'Image Too Blurry',
          message: 'The image quality is too low. Try a clearer photo.',
        };
      default:
        return {
          icon: '⚠️',
          title: 'Processing Failed',
          message: 'Failed to process image. Please try again.',
        };
    }
  };

  const getLanguageFlag = (langCode) => {
    const flags = {
      'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪',
      'it': '🇮🇹', 'pt': '🇵🇹', 'ru': '🇷🇺', 'ja': '🇯🇵',
      'ko': '🇰🇷', 'zh': '🇨🇳', 'ar': '🇸🇦', 'hi': '🇮🇳',
      'tr': '🇹🇷', 'nl': '🇳🇱', 'pl': '🇵🇱', 'sv': '🇸🇪',
    };
    return flags[langCode] || '🌐';
  };

  const getLanguageName = (langCode) => {
    const names = {
      'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
      'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese',
      'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi',
      'tr': 'Turkish', 'nl': 'Dutch', 'pl': 'Polish', 'sv': 'Swedish',
    };
    return names[langCode] || langCode.toUpperCase();
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
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Extracting text from image...</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>{getErrorMessage().icon}</Text>
              <Text style={styles.errorTitle}>{getErrorMessage().title}</Text>
              <Text style={styles.errorMessage}>{getErrorMessage().message}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>🔄 Retry</Text>
              </TouchableOpacity>
            </View>
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
            <View style={styles.translatingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.translatingText}>Translating to {getLanguageName(userLanguage)}...</Text>
            </View>
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  translatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  translatingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
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

