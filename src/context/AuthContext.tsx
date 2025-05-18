import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { api } from '../services/api';
import { AuthState, User, AuthResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the auth context
const AuthContext = createContext<{
  state: AuthState;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}>({
  state: { user: null, session: null, loading: true },
  signUp: async () => ({ error: null, data: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  // Effect to check for existing token on mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        console.log('Checking for existing token...');
        const token = await AsyncStorage.getItem('auth_token');
        
        if (token) {
          console.log('Token found, getting user data...');
          api.setToken(token);
          
          try {
            const user = await api.getCurrentUser();
            setState({
              user,
              session: { token }, // Simple session object with token
              loading: false,
            });
          } catch (error) {
            console.error('Error getting current user:', error);
            // Token might be invalid or expired
            await AsyncStorage.removeItem('auth_token');
            setState({ user: null, session: null, loading: false });
          }
        } else {
          console.log('No token found');
          setState({ user: null, session: null, loading: false });
        }
      } catch (err) {
        console.error('Unexpected error in checkToken:', err);
        setState({ user: null, session: null, loading: false });
      }
    };

    checkToken();
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string) => {
    console.log('Attempting to sign up with email:', email);
    try {
      const response = await api.signup({ email, password });
      
      console.log('Sign up response:', response);
      
      if (response.user) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem('auth_token', response.token);
        
        // Update state
        setState({
          user: response.user,
          session: { token: response.token },
          loading: false,
        });
        
        return { error: null, data: response };
      } else {
        return {
          error: { message: 'Failed to create user account' },
          data: null
        };
      }
    } catch (err: any) {
      console.error('Error during sign up:', err);
      return {
        error: { message: err.message || 'An unexpected error occurred during sign up' },
        data: null
      };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with email:', email);
    try {
      const response = await api.login({ email, password });
      
      if (response.user) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem('auth_token', response.token);
        
        // Update state
        setState({
          user: response.user,
          session: { token: response.token },
          loading: false,
        });
        
        return { error: null };
      } else {
        return { error: { message: 'Login failed' } };
      }
    } catch (err: any) {
      console.error('Error during sign in:', err);
      return { error: { message: err.message || 'An unexpected error occurred during sign in' } };
    }
  };

  // Sign out function
  const signOut = async () => {
    console.log('Attempting to sign out');
    try {
      await api.logout();
      
      // Clear token from AsyncStorage
      await AsyncStorage.removeItem('auth_token');
      
      // Update state
      setState({ user: null, session: null, loading: false });
      
      console.log('Sign out successful');
    } catch (err: any) {
      console.error('Error during sign out:', err);
      Alert.alert('Error', err.message || 'An unexpected error occurred during sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ state, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};