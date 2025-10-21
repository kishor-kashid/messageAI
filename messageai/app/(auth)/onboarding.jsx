/**
 * Onboarding Screen for MessageAI MVP
 * 
 * Completes user profile setup (display name and profile picture)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../lib/hooks/useAuth';
import { useImagePicker } from '../../lib/hooks/useImagePicker';
import { validateDisplayName } from '../../lib/utils/validation';

export default function OnboardingScreen() {
  const [displayName, setDisplayName] = useState('');
  const [profilePictureUri, setProfilePictureUri] = useState(null);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, completeProfile, refreshProfile } = useAuth();
  const { pickImage, takePhoto, loading: imageLoading } = useImagePicker();
  const router = useRouter();

  const validate = () => {
    const newErrors = {};

    const nameValidation = validateDisplayName(displayName);
    if (!nameValidation.valid) {
      newErrors.displayName = nameValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChoosePhoto = () => {
    Alert.alert(
      'Choose Profile Picture',
      'Select an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const uri = await takePhoto();
            if (uri) setProfilePictureUri(uri);
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const uri = await pickImage();
            if (uri) setProfilePictureUri(uri);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleComplete = async () => {
    if (!validate()) return;

    if (!user) {
      setGeneralError('No user found. Please sign in again.');
      return;
    }

    try {
      setLoading(true);
      setGeneralError('');
      await completeProfile(user.uid, {
        displayName: displayName.trim(),
        profilePictureUri,
      });
      
      // Refresh the profile to trigger navigation
      await refreshProfile();
      
      // Navigation will be handled automatically by AuthContext
    } catch (error) {
      setGeneralError(error.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Tell us about yourself</Text>
        </View>

        <View style={styles.form}>
          {/* Profile Picture Section */}
          <View style={styles.avatarSection}>
            {profilePictureUri ? (
              <Image source={{ uri: profilePictureUri }} style={styles.avatarPreview} />
            ) : (
              <Avatar displayName={displayName || 'User'} size={100} />
            )}
            <TouchableOpacity 
              style={styles.photoButton}
              onPress={handleChoosePhoto}
              disabled={imageLoading}
            >
              <Text style={styles.photoButtonText}>
                {profilePictureUri ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Display Name Input */}
          <Input
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            autoCapitalize="words"
            error={errors.displayName}
          />

          {generalError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {generalError}</Text>
            </View>
          ) : null}

          <Button
            title="Complete Setup"
            onPress={handleComplete}
            loading={loading}
            style={styles.completeButton}
          />

          <Text style={styles.skipText}>
            You can update this later in your profile
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  form: {
    width: '100%',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
  },
  photoButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  photoButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  completeButton: {
    marginTop: 24,
  },
  skipText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    color: '#999999',
  },
});

