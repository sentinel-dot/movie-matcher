import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { AuthState, User, DatabaseResponse } from '../types';

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

  // Fetch public user data
  const fetchUserData = async (userId: string): Promise<DatabaseResponse<User>> => {
    try {
      console.log('Fetching public user data for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return { error, data: null };
      }

      console.log('Public user data fetched:', data);
      return { error: null, data };
    } catch (error) {
      console.error('Unexpected error fetching user data:', error);
      return { error, data: null };
    }
  };

  // Effect to check for existing session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setState({ user: null, session: null, loading: false });
          return;
        }
        
        if (sessionData?.session) {
          console.log('Session found, getting user data...');
          const { data: authData } = await supabase.auth.getUser();
          
          if (authData?.user) {
            // Fetch public user data
            const { data: userData, error: userError } = await fetchUserData(authData.user.id);
            
            if (userError) {
              console.error('Error fetching user data:', userError);
              setState({ user: null, session: null, loading: false });
              return;
            }

            setState({
              user: userData as User,
              session: sessionData.session,
              loading: false,
            });
          }
        } else {
          console.log('No session found');
          setState({ user: null, session: null, loading: false });
        }
      } catch (err) {
        console.error('Unexpected error in getSession:', err);
        setState({ user: null, session: null, loading: false });
      }
    };

    getSession();

    // Listen for auth changes
    console.log('Setting up auth state change listener...');
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, fetching user data...');
          const { data: userData, error: userError } = await fetchUserData(session.user.id);
          
          if (userError) {
            console.error('Error fetching user data after sign in:', userError);
            setState({ user: null, session: null, loading: false });
            return;
          }

          setState({
            user: userData as User,
            session,
            loading: false,
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setState({ user: null, session: null, loading: false });
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        console.log('Unsubscribing from auth listener');
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string) => {
    console.log('Attempting to sign up with email:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // For React Native, we don't need emailRedirectTo
          // The user will verify their email through the link sent to their inbox
          data: {
            // You can add additional user metadata here if needed
            email_confirmed: false,
          }
        }
      });
      
      console.log('Sign up response:', { data, error });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error, data: null };
      }

      // Check if user was created
      if (!data?.user) {
        console.error('No user data received after signup');
        return { 
          error: { message: 'Failed to create user account' }, 
          data: null 
        };
      }

      // The database trigger will automatically create the public user record
      console.log('Sign up successful:', data);
      return { error: null, data };
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      return { 
        error: { message: 'An unexpected error occurred during sign up' }, 
        data: null 
      };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with email:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      // Fetch public user data
      if (data.user) {
        const { error: userError } = await fetchUserData(data.user.id);
        if (userError) {
          console.error('Error fetching user data after sign in:', userError);
          return { error: userError };
        }
      }
      
      console.log('Sign in successful');
      return { error: null };
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      return { error: { message: 'An unexpected error occurred during sign in' } };
    }
  };

  // Sign out function
  const signOut = async () => {
    console.log('Attempting to sign out');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        Alert.alert('Error', `Failed to sign out: ${error.message}`);
      } else {
        console.log('Sign out successful');
      }
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      Alert.alert('Error', 'An unexpected error occurred during sign out');
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