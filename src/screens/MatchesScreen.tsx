import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Alert } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { Match } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import MatchCard from '../components/MatchCard';
import { api } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Matches'>;

const MatchesScreen: React.FC<Props> = ({ navigation }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { state } = useAuth();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!state.user) return;

      try {
        // Fetch matches from our API
        const data = await api.getMatches();
        setMatches(data);
      } catch (error: any) {
        console.error('Error fetching matches:', error);
        Alert.alert('Error', error.message || 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [state.user]);

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  // Render empty state
  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No matches yet!</Text>
        <Text style={styles.emptySubtext}>
          When you and your partner both like the same movie or show, it will appear here.
        </Text>
        <IconButton
          icon="arrow-left"
          size={30}
          onPress={() => navigation.navigate('Main')}
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={30}
          onPress={() => navigation.navigate('Main')}
        />
        <Text style={styles.headerTitle}>Your Matches</Text>
        <View style={{ width: 48 }} />
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <MatchCard match={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#4ecdc4',
  },
});

export default MatchesScreen;