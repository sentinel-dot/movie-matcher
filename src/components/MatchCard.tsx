import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Match } from '../types';

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  return (
    <Card style={styles.matchCard}>
      <Card.Cover
        source={{ uri: match.media?.poster_url }}
        style={styles.cardImage}
      />
      <Card.Content style={styles.cardContent}>
        <Text style={styles.cardTitle}>{match.media?.title}</Text>
        <Text style={styles.cardGenre}>{match.media?.genre}</Text>
        <Text style={styles.matchDate}>
          Matched on {new Date(match.created_at).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  matchCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardGenre: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  matchDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});

export default MatchCard;