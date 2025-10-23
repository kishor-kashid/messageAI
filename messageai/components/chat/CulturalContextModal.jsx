/**
 * CulturalContextModal Component
 * 
 * Displays cultural context and explanation for any message
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
} from 'react-native';
import { getCachedCulturalContext } from '../../lib/api/aiService';

/**
 * CulturalContextModal Component
 * @param {Object} props
 * @param {boolean} props.visible - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.message - Message object containing the text
 */
const CulturalContextModal = ({ visible, onClose, message }) => {
  const [culturalContext, setCulturalContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cultural context when modal opens
  useEffect(() => {
    if (!visible || !message) {
      return;
    }

    const fetchContext = async () => {
      setLoading(true);
      setError(null);
      setCulturalContext('');
      
      try {
        const result = await getCachedCulturalContext(
          message.content,
          message.detected_language
        );
        
        if (result.culturalContext) {
          setCulturalContext(result.culturalContext);
        } else {
          setError('No cultural context received from server.');
        }
      } catch (err) {
        console.error('Failed to get cultural context:', err);
        setError(err.message || 'Failed to get cultural context. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, [visible, message]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setCulturalContext('');
      setError(null);
      setLoading(false);
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  const handleRetry = () => {
    if (message) {
      const fetchContext = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const result = await getCachedCulturalContext(
            message.content,
            message.detected_language
          );
          setCulturalContext(result.culturalContext);
        } catch (err) {
          setError(err.message || 'Failed to get cultural context. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchContext();
    }
  };

  if (!visible || !message) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Cultural Context</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Message Preview */}
          <View style={styles.messagePreview}>
            <Text style={styles.messageLabel}>Message:</Text>
            <Text style={styles.messageText} numberOfLines={3}>
              {message.content}
            </Text>
          </View>

          {/* Cultural Context Content */}
          <ScrollView 
            style={styles.scrollContainer} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Getting cultural context...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorState}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : culturalContext ? (
              <View style={styles.contextContainer}>
                <View style={styles.contextHeader}>
                  <Text style={styles.contextIcon}>💬</Text>
                  <Text style={styles.contextTitle}>Cultural Context</Text>
                </View>
                <Text style={styles.contextText}>{culturalContext}</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No context available.</Text>
              </View>
            )}
          </ScrollView>

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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '85%',
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
    maxHeight: 400,
    marginBottom: 16,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  contextContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  contextIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    flex: 1,
  },
  contextText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CulturalContextModal;

