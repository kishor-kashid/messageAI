/**
 * FormalityAdjuster Component
 * 
 * Allows users to adjust the formality/tone of their message before sending.
 * Supports 4 formality levels: casual, neutral, formal, professional.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adjustFormality } from '../../lib/api/aiService';

const FORMALITY_LEVELS = [
  {
    id: 'casual',
    name: 'Casual',
    emoji: '😊',
    description: 'Friendly and relaxed',
    color: '#FF6B6B',
  },
  {
    id: 'neutral',
    name: 'Neutral',
    emoji: '💬',
    description: 'Balanced and polite',
    color: '#4ECDC4',
  },
  {
    id: 'formal',
    name: 'Formal',
    emoji: '🎩',
    description: 'Professional tone',
    color: '#45B7D1',
  },
  {
    id: 'professional',
    name: 'Professional',
    emoji: '💼',
    description: 'Business formal',
    color: '#5F27CD',
  },
];

const FormalityAdjuster = ({ 
  visible, 
  onClose, 
  originalText, 
  onApply,
  language = 'en',
}) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [adjustedText, setAdjustedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAdjust = async (formalityLevel) => {
    setSelectedLevel(formalityLevel);
    setLoading(true);
    setError(null);
    setAdjustedText('');

    try {
      const result = await adjustFormality(originalText, formalityLevel, language);
      setAdjustedText(result.rewrittenText);
    } catch (err) {
      console.error('Failed to adjust formality:', err);
      setError(err.message || 'Failed to adjust tone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (adjustedText) {
      onApply(adjustedText);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedLevel(null);
    setAdjustedText('');
    setLoading(false);
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
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>✨ Adjust Tone</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Original Message Preview */}
          <View style={styles.messagePreview}>
            <Text style={styles.messageLabel}>Original Message:</Text>
            <Text style={styles.messageText} numberOfLines={3}>
              {originalText}
            </Text>
          </View>

          {/* Formality Level Options */}
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>Choose Tone:</Text>
            <View style={styles.levelsContainer}>
              {FORMALITY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelButton,
                    selectedLevel === level.id && styles.levelButtonActive,
                  ]}
                  onPress={() => handleAdjust(level.id)}
                  disabled={loading}
                >
                  <Text style={styles.levelEmoji}>{level.emoji}</Text>
                  <Text style={[
                    styles.levelName,
                    selectedLevel === level.id && styles.levelNameActive,
                  ]}>
                    {level.name}
                  </Text>
                  <Text style={[
                    styles.levelDescription,
                    selectedLevel === level.id && styles.levelDescriptionActive,
                  ]}>
                    {level.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Loading State */}
            {loading && (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Adjusting tone...</Text>
              </View>
            )}

            {/* Error State */}
            {error && !loading && (
              <View style={styles.errorState}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  onPress={() => selectedLevel && handleAdjust(selectedLevel)} 
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Adjusted Text Preview */}
            {adjustedText && !loading && !error && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Adjusted Message:</Text>
                <View style={styles.resultBox}>
                  <Text style={styles.resultText}>{adjustedText}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {adjustedText && !loading && (
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.cancelButton, adjustedText && styles.cancelButtonSecondary]} 
              onPress={handleClose}
            >
              <Text style={[
                styles.cancelButtonText,
                adjustedText && styles.cancelButtonTextSecondary
              ]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  messagePreview: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  scrollContainer: {
    maxHeight: 500,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  levelButton: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  levelEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  levelNameActive: {
    color: '#007AFF',
  },
  levelDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  levelDescriptionActive: {
    color: '#0056b3',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
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
  resultContainer: {
    marginTop: 10,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultBox: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  resultText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  actionButtons: {
    marginTop: 16,
    gap: 10,
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonSecondary: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  cancelButtonTextSecondary: {
    color: '#999',
  },
});

export default FormalityAdjuster;

