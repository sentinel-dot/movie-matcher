import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Card, Text, Surface, IconButton } from 'react-native-paper';
import { Match } from '../types';

interface MatchCardProps {
  match: Match;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2; // 36 = padding (12) * 3

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  // Formatiere das Datum schöner
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Surface style={styles.surface}>
      <View style={styles.matchCard}>
        <Card.Cover
          source={{ uri: match.media?.poster_url }}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {match.media?.title}
          </Text>
          <View style={styles.cardDetails}>
            <Text style={styles.cardGenre} numberOfLines={1}>
              {match.media?.genre}
            </Text>
            <View style={styles.dateContainer}>
              <IconButton 
                icon="calendar-heart" 
                size={12} 
                style={styles.dateIcon} 
                iconColor="#FF6B6B"
              />
              <Text style={styles.matchDate}>
                {formatDate(match.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  surface: {
    width: CARD_WIDTH,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  matchCard: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  cardImage: {
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDetails: {
    marginTop: 4,
  },
  cardGenre: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dateIcon: {
    margin: 0,
    padding: 0,
    marginRight: -4,
  },
  matchDate: {
    fontSize: 11,
    color: '#888',
  },
});

export default MatchCard;