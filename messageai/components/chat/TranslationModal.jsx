/**
 * TranslationModal Component
 * 
 * Modal for translating messages to different languages.
 * Displays original text and translated text with language selector.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getCachedTranslation, SUPPORTED_LANGUAGES } from '../../lib/api/aiService';

/**
 * TranslationModal Component
 * @param {Object} props
 * @param {boolean} props.visible - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.originalText - Original message text
 * @param {string} props.sourceLanguage - Source language code (optional)
 */
const TranslationModal = ({ visible, onClose, originalText, sourceLanguage }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('es'); // Default to Spanish
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-translate when language selected
  useEffect(() => {
    if (visible && selectedLanguage && originalText) {
      handleTranslate();
    }
  }, [selectedLanguage, visible]);

  const handleTranslate = async () => {
    if (!originalText || !selectedLanguage) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getCachedTranslation(
        originalText,
        selectedLanguage,
        sourceLanguage
      );
      setTranslatedText(result.translatedText);
    } catch (err) {
      console.error('Translation error:', err);
      setError(err.message || 'Failed to translate message. Please try again.');
      Alert.alert('Translation Error', err.message || 'Failed to translate message.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTranslatedText('');
    setError(null);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Translate Message</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Original Text */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Original</Text>
            <View style={styles.textContainer}>
              <Text style={styles.text}>{originalText}</Text>
            </View>
          </View>

          {/* Language Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Translate to:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.languageGrid}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageButton,
                    selectedLanguage === lang.code && styles.languageButtonActive,
                  ]}
                  onPress={() => setSelectedLanguage(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.languageName,
                      selectedLanguage === lang.code && styles.languageNameActive,
                    ]}
                  >
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Translated Text */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Translation</Text>
            <View style={styles.textContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingText}>Translating...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>❌ {error}</Text>
                  <TouchableOpacity
                    onPress={handleTranslate}
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : translatedText ? (
                <Text style={styles.text}>{translatedText}</Text>
              ) : (
                <Text style={styles.placeholderText}>
                  Select a language to translate
                </Text>
              )}
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  textContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
  },
  text: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  languageGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  languageButtonActive: {
    backgroundColor: '#007AFF',
  },
  languageFlag: {
    fontSize: 18,
  },
  languageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  languageNameActive: {
    color: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default TranslationModal;

