import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

// SecureStore adapter for Supabase
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      return;
    }
  },
  removeItem: async (key: string) => {
    try {
      return await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
      return;
    }
  },
};

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://ptatkmdqumjzwwnhvkya.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0YXRrbWRxdW1qend3bmh2a3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTYzODcsImV4cCI6MjA2MjU3MjM4N30.oqCNdKu-3_PGK64xoylRQy7Kkck4b1Ogv-cSFLYAOCk';

// Alternative storage implementation using localStorage for web
const createSupabaseClient = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: {
          getItem: (key) => {
            const value = localStorage.getItem(key);
            return Promise.resolve(value);
          },
          setItem: (key, value) => {
            localStorage.setItem(key, value);
            return Promise.resolve();
          },
          removeItem: (key) => {
            localStorage.removeItem(key);
            return Promise.resolve();
          },
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  // For React Native environment
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

export const supabase = createSupabaseClient();