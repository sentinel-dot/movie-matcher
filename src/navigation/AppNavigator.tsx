import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import MainScreen from '../screens/MainScreen';
import MatchesScreen from '../screens/MatchesScreen';

// Types
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { state } = useAuth();
  const { user, loading } = state;

  if (loading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated routes
          <>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Matches" component={MatchesScreen} />
          </>
        ) : (
          // Unauthenticated routes
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;