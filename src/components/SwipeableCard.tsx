import React from 'react';
import { StyleSheet, Dimensions, Image, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Media } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeableCardProps {
  media: Media;
  onSwipe: (liked: boolean) => void;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ media, onSwipe }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  // Gesture handler for swipe
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = interpolate(
        translateX.value,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-10, 0, 10],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      if (translateX.value > SWIPE_THRESHOLD) {
        // Swipe right (like)
        translateX.value = withSpring(SCREEN_WIDTH, {}, () => {
          runOnJS(onSwipe)(true);
        });
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Swipe left (dislike)
        translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
          runOnJS(onSwipe)(false);
        });
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  // Animated styles for the card
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image
          source={{ uri: media.poster_url }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{media.title}</Text>
          <Text style={styles.cardGenre}>{media.genre}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '80%',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardGenre: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});

export default SwipeableCard;