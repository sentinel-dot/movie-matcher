import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Alert, StatusBar } from 'react-native';
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
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  // Render empty state
  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <IconButton
          icon="arrow-left"
          size={26}
          onPress={() => navigation.navigate('Main')}
          style={styles.backButtonEmpty}
          iconColor="#FF6B6B"
        />
        <View style={styles.emptyContent}>
          <IconButton
            icon="movie-off"
            size={60}
            iconColor="#DDD"
          />
          <Text style={styles.emptyText}>No matches yet!</Text>
          <Text style={styles.emptySubtext}>
            When you and your partner both like the same movie or show, it will appear here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.navigate('Main')}
          iconColor="#FF6B6B"
        />
        <Text style={styles.headerTitle}>Your Matches</Text>
        <View style={{ width: 48 }} />
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MatchCard match={item} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButtonEmpty: {
    margin: 10,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#777',
    marginBottom: 30,
    lineHeight: 22,
  },
});

export default MatchesScreen;