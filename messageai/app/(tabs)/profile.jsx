/**
 * Profile Screen
 * 
 * User profile management - view and edit profile information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAuth } from '../../lib/hooks/useAuth';
import { useImagePicker } from '../../lib/hooks/useImagePicker';
import { Avatar } from '../../components/ui/Avatar';
import { updateDisplayName, updateProfilePicture, updateUserProfile } from '../../lib/firebase/firestore';
import { uploadProfilePicture } from '../../lib/firebase/storage';
import { SUPPORTED_LANGUAGES } from '../../lib/api/aiService';

export default function ProfileScreen() {
  const { user, userProfile, logout, refreshProfile } = useAuth();
  const { pickImage, takePhoto, loading: imageLoading } = useImagePicker();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  const handleEditPress = () => {
    setEditedName(userProfile?.displayName || '');
    setIsEditModalVisible(true);
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Change Profile Picture',
      'Select an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const uri = await takePhoto();
            if (uri) {
              await handleUploadPhoto(uri);
            }
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const uri = await pickImage();
            if (uri) {
              await handleUploadPhoto(uri);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleUploadPhoto = async (imageUri) => {
    try {
      setIsUploadingPhoto(true);
      
      // Upload to Firebase Storage
      const photoURL = await uploadProfilePicture(user.uid, imageUri);
      
      // Update Firestore
      await updateProfilePicture(user.uid, photoURL);
      
      // Refresh profile to show new picture
      await refreshProfile();
      
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    if (editedName.trim() === userProfile?.displayName) {
      setIsEditModalVisible(false);
      return;
    }

    try {
      setIsSaving(true);
      await updateDisplayName(user.uid, editedName.trim());
      await refreshProfile();
      
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = async (langCode) => {
    try {
      setIsUpdatingLanguage(true);
      setShowLanguagePicker(false);
      
      await updateUserProfile(user.uid, { preferredLanguage: langCode });
      await refreshProfile();
      
      Alert.alert('Success', 'Preferred language updated successfully');
    } catch (error) {
      console.error('Error updating language:', error);
      Alert.alert('Error', 'Failed to update language. Please try again.');
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const selectedLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === (userProfile?.preferredLanguage || 'en')
  );

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar
            displayName={userProfile.displayName}
            uri={userProfile.photoURL}
            size={120}
          />
          {isUploadingPhoto && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={handleChangePhoto}
            disabled={imageLoading || isUploadingPhoto}
          >
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.displayName}>{userProfile.displayName}</Text>
        <Text style={styles.email}>{userProfile.email}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleEditPress}
        >
          <View style={styles.quickActionIcon}>
            <Text style={styles.quickActionIconText}>✏️</Text>
          </View>
          <Text style={styles.quickActionLabel}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setShowLanguagePicker(true)}
          disabled={isUpdatingLanguage}
        >
          <View style={styles.quickActionIcon}>
            <Text style={styles.quickActionIconText}>🌐</Text>
          </View>
          <Text style={styles.quickActionLabel}>Language</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleChangePhoto}
          disabled={imageLoading || isUploadingPhoto}
        >
          <View style={styles.quickActionIcon}>
            <Text style={styles.quickActionIconText}>🖼️</Text>
          </View>
          <Text style={styles.quickActionLabel}>Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>👤 Account Information</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>📝</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Display Name</Text>
            <Text style={styles.infoValue}>{userProfile.displayName}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>📧</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{userProfile.email}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.infoRow}
          onPress={() => setShowLanguagePicker(true)}
          disabled={isUpdatingLanguage}
        >
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>🌍</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Preferred Language</Text>
            {isUpdatingLanguage ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.infoValue}>
                {selectedLanguage ? `${selectedLanguage.flag} ${selectedLanguage.name}` : 'English'}
              </Text>
            )}
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* App Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>ℹ️ About</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>📱</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>App Name</Text>
            <Text style={styles.infoValue}>MessageAI</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>🔖</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                autoFocus
                maxLength={50}
              />
              <Text style={styles.inputHint}>
                This name will be visible to other users
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModalContainer}>
            <View style={styles.languageModalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    userProfile?.preferredLanguage === item.code && styles.languageOptionSelected
                  ]}
                  onPress={() => handleLanguageChange(item.code)}
                >
                  <Text style={styles.languageFlag}>{item.flag}</Text>
                  <Text style={[
                    styles.languageName,
                    userProfile?.preferredLanguage === item.code && styles.languageNameSelected
                  ]}>
                    {item.name}
                  </Text>
                  {userProfile?.preferredLanguage === item.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraIcon: {
    fontSize: 20,
  },
  displayName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 12,
  },
  email: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 6,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIconText: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F2F2F7',
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  inputHint: {
    fontSize: 12,
    color: '#999999',
    marginTop: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 20,
    color: '#C7C7CC',
    marginLeft: 8,
    fontWeight: '300',
  },
  languageModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#007AFF',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  languageOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  languageNameSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

