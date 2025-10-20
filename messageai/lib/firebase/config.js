/**
 * Firebase Configuration for MessageAI MVP
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Firestore, Authentication, Storage, and Cloud Messaging
 * 3. Get your configuration values
 * 4. Create a .env file in the root directory (copy from .env.example)
 * 5. Add your Firebase configuration values to .env
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
// Note: Expo requires EXPO_PUBLIC_ prefix for runtime env vars
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is missing!');
  console.error('Make sure your .env file has all EXPO_PUBLIC_FIREBASE_* variables set.');
  console.error('See ENV_SETUP_INSTRUCTIONS.md for details.');
}

// Initialize Firebase
let app;
let db;
let auth;
let storage;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore with offline persistence (modern API)
  // Skip in test environment
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    db = getFirestore(app);
    // Note: Offline persistence is enabled by default in the web SDK
  } else {
    db = getFirestore(app);
  }
  
  auth = getAuth(app);
  storage = getStorage(app);

  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

/**
 * Test Firebase connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testFirebaseConnection() {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Try to write a test document
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const testDoc = doc(db, '_test_', 'connection');
    await setDoc(testDoc, {
      timestamp: serverTimestamp(),
      message: 'Connection test successful',
    });

    console.log('✅ Firebase connection test passed');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
}

// Export initialized services
export { app, db, auth, storage };

