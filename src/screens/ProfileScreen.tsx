import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, TextInput, Avatar, Card, Divider, List, Badge } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, PartnerRequest } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { state, signOut } = useAuth();
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partner, setPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PartnerRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PartnerRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch all necessary data
  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch partner data
      const partnerData = await api.getPartner();
      setPartner(partnerData);

      // Fetch partner requests
      const requests = await api.getPartnerRequests();
      
      // Filter pending requests received by the user
      const pending = requests.filter(
        req => req.recipient_id === state.user?.id && req.status === 'pending'
      );
      setPendingRequests(pending);
      
      // Filter requests sent by the user
      const sent = requests.filter(
        req => req.requester_id === state.user?.id && req.status === 'pending'
      );
      setSentRequests(sent);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  };

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

  // Handle sending partner request
  const handleSendPartnerRequest = async () => {
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
        'Send Partner Request',
        `Are you sure you want to send a partner request to ${partnerEmail}?`,
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
                // Create a partner request
                await api.createPartnerRequest(partnerEmail);
                
                // Refresh the data
                await fetchData();
                
                Alert.alert('Success', `Partner request sent to ${partnerEmail}!`);
                setPartnerEmail('');
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to send partner request');
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

  // Handle responding to a partner request
  const handleRespondToRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      setLoading(true);
      await api.respondToPartnerRequest(requestId, status);
      
      // Refresh data
      await fetchData();
      
      Alert.alert(
        'Success',
        `Partner request ${status === 'accepted' ? 'accepted' : 'rejected'}`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to ${status} partner request`);
    } finally {
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
                onPress={handleSendPartnerRequest}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Send Partner Request
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Partner Requests Section */}
      {pendingRequests.length > 0 && (
        <Card style={styles.card}>
          <Card.Title
            title="Partner Requests"
            right={() => <Badge size={24}>{pendingRequests.length}</Badge>}
          />
          <Card.Content>
            <Text style={styles.partnerTitle}>Pending Requests</Text>
            {pendingRequests.map((request) => (
              <List.Item
                key={request.id}
                title={request.requester_email}
                description="Wants to be your partner"
                right={() => (
                  <View style={styles.actionButtons}>
                    <Button
                      mode="contained"
                      onPress={() => handleRespondToRequest(request.id, 'accepted')}
                      style={[styles.actionButton, styles.acceptButton]}
                      disabled={loading}
                    >
                      Accept
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => handleRespondToRequest(request.id, 'rejected')}
                      style={styles.actionButton}
                      disabled={loading}
                    >
                      Decline
                    </Button>
                  </View>
                )}
              />
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Sent Requests Section */}
      {sentRequests.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Sent Requests" />
          <Card.Content>
            {sentRequests.map((request) => (
              <List.Item
                key={request.id}
                title={request.recipient_email}
                description="Pending response"
                right={() => (
                  <Badge>Pending</Badge>
                )}
              />
            ))}
          </Card.Content>
        </Card>
      )}

      {refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ecdc4" />
          <Text>Refreshing...</Text>
        </View>
      )}

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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
    marginTop: 0,
  },
  acceptButton: {
    backgroundColor: '#4ecdc4',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileScreen;