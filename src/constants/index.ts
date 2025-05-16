// App-wide constants

// Theme colors
export const COLORS = {
  primary: '#4ecdc4', // Teal
  secondary: '#ff6b6b', // Coral
  background: '#f5f5f5', // Light Gray
  text: '#333333', // Dark Gray
  textLight: '#666666', // Medium Gray
  textLighter: '#999999', // Light Gray
  white: '#ffffff',
  black: '#000000',
  success: '#2ecc71', // Green
  error: '#e74c3c', // Red
  warning: '#f39c12', // Orange
};

// Screen dimensions
export const SCREEN = {
  padding: 16,
  borderRadius: 10,
};

// Animation constants
export const ANIMATION = {
  swipeThreshold: 0.3, // 30% of screen width
  swipeOutDuration: 250, // ms
  swipeBackDuration: 350, // ms
  rotationFactor: 10, // degrees
};

// Placeholder images
export const PLACEHOLDER_IMAGES = {
  poster: 'https://picsum.photos/400/600',
  avatar: 'https://picsum.photos/200',
};

// Local storage keys
export const STORAGE_KEYS = {
  authToken: 'movie_matcher_auth_token',
  userId: 'movie_matcher_user_id',
};

// API endpoints (for reference)
export const API = {
  movies: 'movies',
  swipes: 'swipes',
  matches: 'matches',
};

// App info
export const APP_INFO = {
  name: 'Movie Matcher',
  version: '1.0.0',
  description: 'Find movies you both love',
};