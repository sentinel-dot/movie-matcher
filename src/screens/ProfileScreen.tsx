import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, TextInput, Avatar, Card, Divider, List, Badge, IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, PartnerRequest } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { AlertService } from '../services/alertService';
import { LinearGradient } from 'expo-linear-gradient';

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
      AlertService.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Handle sending partner request
  const handleSendPartnerRequest = async () => {
    if (!partnerEmail.trim()) {
      AlertService.alert('Error', 'Please enter a partner email');
      return;
    }

    setLoading(true);

    try {
      // First, search for the user by email
      const user = await api.searchUserByEmail(partnerEmail);
      
      if (!user) {
        AlertService.alert('Error', `No user found with email ${partnerEmail}`);
        setLoading(false);
        return;
      }
      
      // Confirm with the user
      AlertService.confirm(
        'Send Partner Request',
        `Are you sure you want to send a partner request to ${partnerEmail}?`,
        async () => {
          try {
            // Create a partner request
            await api.createPartnerRequest(partnerEmail);
            
            // Refresh the data
            await fetchData();
            
            AlertService.alert('Success', `Partner request sent to ${partnerEmail}!`);
            setPartnerEmail('');
          } catch (error: any) {
            AlertService.alert('Error', error.message || 'Failed to send partner request');
          } finally {
            setLoading(false);
          }
        },
        () => setLoading(false)
      );
    } catch (error: any) {
      AlertService.alert('Error', error.message || 'Failed to search for user');
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
      
      AlertService.alert(
        'Success',
        `Partner request ${status === 'accepted' ? 'accepted' : 'rejected'}`
      );
    } catch (error: any) {
      AlertService.alert('Error', error.message || `Failed to ${status} partner request`);
    } finally {
      setLoading(false);
    }
  };

  // Extract initials from email for avatar
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#6a11cb', '#2575fc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Avatar.Text 
            size={90} 
            label={state.user ? getInitials(state.user.email) : 'U'} 
            style={styles.avatar}
            labelStyle={styles.avatarText}
          />
          <Text style={styles.userName}>{state.user?.email}</Text>
          <View style={styles.headerButtons}>
            <IconButton 
              icon="refresh" 
              size={24} 
              onPress={fetchData} 
              iconColor="#fff" 
              style={styles.refreshButton}
              disabled={refreshing}
            />
            <IconButton 
              icon="logout" 
              size={24} 
              onPress={handleLogout} 
              iconColor="#fff"
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <IconButton icon="account" size={24} iconColor="#6a11cb" />
              <Text style={styles.cardTitle}>Account Information</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{state.user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID:</Text>
              <Text style={styles.infoValue}>{state.user?.id}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <IconButton icon="account-multiple" size={24} iconColor="#6a11cb" />
              <Text style={styles.cardTitle}>Partner Settings</Text>
            </View>
            <Divider style={styles.divider} />
            
            {partner ? (
              <>
                <View style={styles.partnerInfo}>
                  <Avatar.Text 
                    size={50} 
                    label={getInitials(partner.email)} 
                    style={styles.partnerAvatar}
                    labelStyle={styles.partnerAvatarText}
                  />
                  <View style={styles.partnerDetails}>
                    <Text style={styles.partnerTitle}>Current Partner</Text>
                    <Text style={styles.partnerEmail}>{partner.email}</Text>
                  </View>
                </View>
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    AlertService.confirm(
                      'Remove Partner',
                      'Are you sure you want to remove your partner?',
                      async () => {
                        // This would require a removePartner API endpoint
                        AlertService.alert('Feature not implemented', 'Partner removal is not yet implemented');
                      }
                    );
                  }}
                  style={styles.removeButton}
                  textColor="#f44336"
                  icon="account-remove"
                >
                  Remove Partner
                </Button>
              </>
            ) : (
              <>
                <Text style={styles.partnerTitle}>Connect with a Partner</Text>
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
                  outlineColor="#6a11cb"
                  activeOutlineColor="#2575fc"
                  right={<TextInput.Icon icon="email" color="#6a11cb" />}
                />
                <Button
                  mode="contained"
                  onPress={handleSendPartnerRequest}
                  loading={loading}
                  disabled={loading}
                  style={styles.sendButton}
                  icon="send"
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
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="account-clock" size={24} iconColor="#6a11cb" />
                <Text style={styles.cardTitle}>Partner Requests</Text>
                <Badge style={styles.badge}>{pendingRequests.length}</Badge>
              </View>
              <Divider style={styles.divider} />
              
              {pendingRequests.map((request) => (
                <View key={request.id} style={styles.requestItem}>
                  <View style={styles.requestInfo}>
                    <Avatar.Text 
                      size={40} 
                      label={request.requester_email ? getInitials(request.requester_email) : '??'} 
                      style={styles.requestAvatar}
                    />
                    <View style={styles.requestDetails}>
                      <Text style={styles.requestName}>{request.requester_email ?? 'Unknown user'}</Text>
                      <Text style={styles.requestDescription}>Wants to be your partner</Text>
                    </View>
                  </View>
                  <View style={styles.actionButtons}>
                    <Button
                      mode="contained"
                      onPress={() => handleRespondToRequest(request.id, 'accepted')}
                      style={[styles.actionButton, styles.acceptButton]}
                      disabled={loading}
                      compact
                    >
                      Accept
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => handleRespondToRequest(request.id, 'rejected')}
                      style={styles.actionButton}
                      textColor="#f44336"
                      disabled={loading}
                      compact
                    >
                      Decline
                    </Button>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Sent Requests Section */}
        {sentRequests.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="send-clock" size={24} iconColor="#6a11cb" />
                <Text style={styles.cardTitle}>Sent Requests</Text>
                <Badge style={styles.badge}>{sentRequests.length}</Badge>
              </View>
              <Divider style={styles.divider} />
              
              {sentRequests.map((request) => (
                <View key={request.id} style={styles.requestItem}>
                  <View style={styles.requestInfo}>
                    <Avatar.Text 
                      size={40} 
                      label={request.recipient_email ? getInitials(request.recipient_email) : '??'} 
                      style={styles.sentRequestAvatar}
                    />
                    <View style={styles.requestDetails}>
                      <Text style={styles.requestName}>{request.recipient_email ?? 'Unknown user'}</Text>
                      <Text style={styles.requestDescription}>Waiting for response</Text>
                    </View>
                  </View>
                  <Badge style={styles.pendingBadge}>Pending</Badge>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6a11cb" />
            <Text style={styles.loadingText}>Refreshing...</Text>
          </View>
        )}

        <Button 
          mode="text" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          textColor="#6a11cb"
          icon="arrow-left"
        >
          Back to Movies
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  refreshButton: {
    marginRight: 8,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    color: '#6a11cb',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginVertical: 8,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  divider: {
    marginVertical: 12,
    height: 1,
    backgroundColor: 'rgba(106, 17, 203, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 70,
    color: '#555',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  partnerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  partnerDescription: {
    marginBottom: 16,
    color: '#666',
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#6a11cb',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  removeButton: {
    borderColor: '#f44336',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatar: {
    backgroundColor: 'rgba(106, 17, 203, 0.2)',
  },
  partnerAvatarText: {
    color: '#6a11cb',
  },
  partnerDetails: {
    marginLeft: 16,
    flex: 1,
  },
  partnerEmail: {
    color: '#666',
  },
  badge: {
    backgroundColor: '#6a11cb',
    color: '#fff',
    marginLeft: 8,
  },
  pendingBadge: {
    backgroundColor: '#ff9800',
    color: '#fff',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestAvatar: {
    backgroundColor: 'rgba(106, 17, 203, 0.2)',
  },
  sentRequestAvatar: {
    backgroundColor: 'rgba(37, 117, 252, 0.2)',
  },
  requestDetails: {
    marginLeft: 12,
    flex: 1,
  },
  requestName: {
    fontWeight: 'bold',
    color: '#333',
  },
  requestDescription: {
    color: '#666',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 8,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#2575fc',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#6a11cb',
  },
});

export default ProfileScreen;