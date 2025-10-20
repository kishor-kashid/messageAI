/**
 * Entry Point for MessageAI MVP
 * 
 * Redirects to appropriate screen based on auth state
 */

import { Redirect } from 'expo-router';

export default function Index() {
  // The root _layout will handle navigation
  // This is just a placeholder that gets redirected
  return <Redirect href="/(auth)/login" />;
}

