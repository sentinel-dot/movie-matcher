import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { Text, IconButton, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { Media } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import SwipeableCard from '../components/SwipeableCard';
import { api } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const MainScreen: React.FC<Props> = ({ navigation }) => {
  const [movies, setMovies] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { state } = useAuth();

  // Fetch movies from backend API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await api.getMovies();
        setMovies(data);
      } catch (error: any) {
        console.error('Error fetching movies:', error);
        Alert.alert('Error', error.message || 'Failed to load movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Handle swipe completion
  const handleSwipeComplete = async (liked: boolean) => {
    if (!state.user || currentIndex >= movies.length) return;

    try {
      // Record the swipe via API
      const swipeResponse = await api.createSwipe(movies[currentIndex].id, liked);

      // If the swipe created a match, notify the user
      if (swipeResponse.match) {
        // Notify the user of the match
        Alert.alert(
          'Match Found!',
          `You and your partner both liked "${movies[currentIndex].title}"`,
          [
            { text: 'Keep Swiping', style: 'cancel' },
            { text: 'View Matches', onPress: () => navigation.navigate('Matches') }
          ]
        );
      }

      // Move to the next movie
      setCurrentIndex(prevIndex => prevIndex + 1);
    } catch (error: any) {
      console.error('Error recording swipe:', error);
      Alert.alert('Error', error.message || 'Failed to record your choice');
    }
  };

  // Like button handler
  const handleLike = () => {
    handleSwipeComplete(true);
  };

  // Dislike button handler
  const handleDislike = () => {
    handleSwipeComplete(false);
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading movies...</Text>
      </View>
    );
  }

  // Render empty state when no more movies
  if (currentIndex >= movies.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No more movies to swipe!</Text>
        <IconButton
          icon="refresh"
          size={30}
          onPress={() => setCurrentIndex(0)}
          style={styles.refreshButton}
        />
      </View>
    );
  }

  // Current movie
  const currentMovie = movies[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="account"
          size={30}
          onPress={() => navigation.navigate('Profile')}
        />
        <Text style={styles.headerTitle}>Movie Matcher</Text>
        <IconButton
          icon="heart-multiple"
          size={30}
          onPress={() => navigation.navigate('Matches')}
        />
      </View>

      <View style={styles.cardContainer}>
        <SwipeableCard 
          media={currentMovie} 
          onSwipe={handleSwipeComplete} 
        />
      </View>

      <View style={styles.buttonsContainer}>
        <IconButton
          icon="close"
          size={40}
          mode="contained"
          containerColor="#ff6b6b"
          iconColor="white"
          onPress={handleDislike}
          style={styles.actionButton}
        />
        <IconButton
          icon="heart"
          size={40}
          mode="contained"
          containerColor="#4ecdc4"
          iconColor="white"
          onPress={handleLike}
          style={styles.actionButton}
        />
      </View>
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
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 20,
  },
  actionButton: {
    margin: 0,
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
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#4ecdc4',
  },
});

export default MainScreen;