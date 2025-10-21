/**
 * Root Layout for MessageAI MVP
 * 
 * Handles navigation and authentication state
 */

import { useEffect, useContext, useState, useRef } from 'react';
import { AppState } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, AuthContext } from '../lib/context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { initializeDatabase } from '../lib/database/schema';
import { setOnline, setOffline } from '../lib/firebase/presence';

function NavigationGuard() {
  const { user, userProfile, loading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();
  const appState = useRef(AppState.currentState);

  // Handle navigation based on auth state
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user) {
      // User is not signed in - redirect to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!userProfile) {
      // User signed in but profile not complete - redirect to onboarding
      if (segments[1] !== 'onboarding') {
        router.replace('/(auth)/onboarding');
      }
    } else {
      // User signed in with complete profile - redirect to app
      if (inAuthGroup) {
        router.replace('/(tabs)/conversations');
      }
    }
  }, [user, userProfile, loading, segments]);

  // Handle presence based on app state
  useEffect(() => {
    if (!user?.uid) return;

    // Set user online when app is opened
    const setUserOnline = async () => {
      try {
        await setOnline(user.uid);
      } catch (error) {
        console.error('Failed to set user online:', error);
      }
    };

    // Set user offline when app is closed
    const setUserOffline = async () => {
      try {
        await setOffline(user.uid);
      } catch (error) {
        console.error('Failed to set user offline:', error);
      }
    };

    // Set online on mount
    setUserOnline();

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        console.log('📱 App came to foreground - setting user online');
        setUserOnline();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App went to background
        console.log('📱 App went to background - setting user offline');
        setUserOffline();
      }

      appState.current = nextAppState;
    });

    // Set offline when component unmounts
    return () => {
      subscription.remove();
      setUserOffline();
    };
  }, [user?.uid]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="chat/[id]" 
        options={{ 
          headerShown: true,
          headerBackTitle: 'Back',
          presentation: 'card',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    // Initialize database on app start
    const initDb = async () => {
      try {
        await initializeDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Still allow app to continue even if db init fails
        setDbInitialized(true);
      }
    };

    initDb();
  }, []);

  if (!dbInitialized) {
    return <LoadingSpinner fullScreen message="Initializing..." />;
  }

  return (
    <AuthProvider>
      <NavigationGuard />
    </AuthProvider>
  );
}

