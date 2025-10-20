/**
 * Root Layout for MessageAI MVP
 * 
 * Handles navigation and authentication state
 */

import { useEffect, useContext } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, AuthContext } from '../lib/context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

function NavigationGuard() {
  const { user, userProfile, loading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

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

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationGuard />
    </AuthProvider>
  );
}

