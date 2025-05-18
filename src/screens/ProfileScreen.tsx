import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, TextInput, Avatar, Card, Divider } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { state, signOut } = useAuth();
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partner, setPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch current partner on component mount
  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const partnerData = await api.getPartner();
        setPartner(partnerData);
      } catch (error) {
        console.error('Error fetching partner:', error);
      }
    };

    fetchPartner();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation will be handled by the AuthContext state change
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Handle setting partner
  const handleSetPartner = async () => {
    if (!partnerEmail.trim()) {
      Alert.alert('Error', 'Please enter a partner email');
      return;
    }

    setLoading(true);
    try {
      // First, search for the user by email
      const user = await api.searchUserByEmail(partnerEmail);
      
      if (!user) {
        Alert.alert('Error', `No user found with email ${partnerEmail}`);
        setLoading(false);
        return;
      }
      
      // Confirm with the user
      Alert.alert(
        'Confirm Partner',
        `Are you sure you want to set ${partnerEmail} as your partner?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setLoading(false)
          },
          {
            text: 'Yes',
            onPress: async () => {
              try {
                // Set the partner using the user ID
                await api.setPartner(user.id);
                
                // Refresh the partner data
                const updatedPartner = await api.getPartner();
                setPartner(updatedPartner);
                
                Alert.alert('Success', `${partnerEmail} is now your partner!`);
                setPartnerEmail('');
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to set partner');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to search for user');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="account" style={styles.avatar} />
        <Text style={styles.userName}>{state.user?.email}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Title title="Account Information" />
        <Card.Content>
          <Text>Email: {state.user?.email}</Text>
          <Text>User ID: {state.user?.id}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Partner Settings" />
        <Card.Content>
          {partner ? (
            <>
              <Text style={styles.partnerTitle}>Current Partner</Text>
              <Text>Email: {partner.email}</Text>
              <Button 
                mode="outlined" 
                onPress={() => {
                  Alert.alert(
                    'Remove Partner',
                    'Are you sure you want to remove your partner?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Remove', 
                        style: 'destructive',
                        onPress: async () => {
                          // This would require a removePartner API endpoint
                          Alert.alert('Feature not implemented', 'Partner removal is not yet implemented');
                        } 
                      }
                    ]
                  );
                }}
                style={styles.button}
              >
                Remove Partner
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.partnerTitle}>Set a Partner</Text>
              <Text style={styles.partnerDescription}>
                Enter your partner's email address to connect your accounts.
                You'll be able to see movies that both of you like.
              </Text>
              <TextInput
                label="Partner's Email"
                value={partnerEmail}
                onChangeText={setPartnerEmail}
                mode="outlined"
                style={styles.input}
              />
              <Button 
                mode="contained" 
                onPress={handleSetPartner}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Set Partner
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      <Button 
        mode="outlined" 
        onPress={handleLogout}
        style={[styles.button, styles.logoutButton]}
        icon="logout"
      >
        Log Out
      </Button>

      <Button 
        mode="text" 
        onPress={() => navigation.goBack()}
        style={styles.button}
      >
        Back to Movies
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4ecdc4',
  },
  avatar: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  partnerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  partnerDescription: {
    marginBottom: 15,
    color: '#666',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  logoutButton: {
    marginHorizontal: 10,
    marginTop: 20,
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  divider: {
    marginVertical: 20,
  },
});

export default ProfileScreen;