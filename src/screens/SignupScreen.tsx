import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    console.log('Sign up button pressed');
    
    if (!email || !password || !confirmPassword) {
      console.log('Validation failed: Empty fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    console.log('Starting signup process...');
    
    try {
      const { error, data } = await signUp(email, password);
      console.log('Signup response received:', { error, data });
      
      if (error) {
        console.error('Signup error:', error);
        Alert.alert('Error', error.message || 'Failed to create account');
        return;
      }

      console.log('Signup successful, data:', data);

      // Check if the user was created successfully
      if (!data?.user) {
        Alert.alert('Error', 'Failed to create account: No user data received');
        return;
      }

      // Check if email confirmation is required
      if (!data.session) {
        Alert.alert(
          'Email Verification Required',
          'Please check your email and click the verification link to complete your registration.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Navigating to Login after email verification notice');
                navigation.navigate('Login');
              }
            }
          ]
        );
      } else {
        // If no email confirmation is required, user can proceed directly
        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Account created successfully, proceeding to main screen');
                // The AuthContext will handle the navigation to the main screen
                // since we have a valid session
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Unexpected error during signup:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred during signup. Please try again.'
      );
    } finally {
      setLoading(false);
      console.log('Signup process completed');
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Create Account</Title>
      <Text style={styles.subtitle}>Join Movie Matcher today</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => {
          console.log('Email input changed:', text);
          setEmail(text.trim());
        }}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="email-input"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={(text) => {
          console.log('Password input changed');
          setPassword(text);
        }}
        secureTextEntry
        style={styles.input}
        testID="password-input"
      />
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => {
          console.log('Confirm password input changed');
          setConfirmPassword(text);
        }}
        secureTextEntry
        style={styles.input}
        testID="confirm-password-input"
      />

      <Button
        mode="contained"
        onPress={handleSignup}
        loading={loading}
        disabled={loading}
        style={styles.button}
        testID="signup-button"
      >
        Sign Up
      </Button>

      <Button
        mode="text"
        onPress={() => {
          console.log('Navigate to Login screen');
          navigation.navigate('Login');
        }}
        style={styles.linkButton}
        testID="login-link"
      >
        Already have an account? Log in
      </Button>
      
      {/* Debug info in development */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Debug Info:</Text>
          <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
          <Text style={styles.debugText}>Email: {email}</Text>
          <Text style={styles.debugText}>Password length: {password.length}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 20,
  },
  debugContainer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
});

export default SignupScreen;