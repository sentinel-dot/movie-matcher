# Movie Matcher

A "Tinder-like" app for movies and TV shows built with React Native, Expo, and Supabase. Users can swipe through a list of movies/series, and matches are generated for content both users like.

## Features

- User authentication (email/password login/signup) via Supabase Auth
- Swipeable card interface for movies/series
- Like/dislike functionality
- Match generation when both users like the same content
- Matches screen to view all matched content

## Tech Stack

- React Native with Expo
- TypeScript
- Supabase for backend (authentication and database)
- React Navigation for navigation
- React Native Gesture Handler and Reanimated for swipe animations
- React Native Paper for UI components

## Prerequisites

- Node.js (latest LTS version)
- npm or yarn
- Expo CLI
- Supabase account

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd movie-matcher
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL commands from the `supabase-schema.sql` file to set up the database schema and insert dummy data
4. Get your Supabase URL and anon key from the API settings

### 4. Configure environment variables

1. Open `src/services/supabase.ts`
2. Replace the placeholder values with your actual Supabase URL and anon key:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 5. Run the app

```bash
npx expo start
```

This will start the Expo development server. You can run the app on:
- iOS simulator (requires macOS and Xcode)
- Android emulator (requires Android Studio)
- Physical device using the Expo Go app (scan the QR code)
- Web browser (limited functionality)

## Project Structure

```
movie-matcher/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   ├── services/         # API and service configurations
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── assets/               # Static assets
├── App.tsx               # Main app component
└── supabase-schema.sql   # Database schema and dummy data
```

## Testing the App

1. Create two user accounts using the signup screen
2. Log in with one account and swipe through movies
3. Log out and log in with the second account
4. Swipe on the same movies to generate matches
5. View matches in the Matches screen

## Notes

- This is an MVP with minimal features and dummy data
- In a real-world scenario, you would need to implement more robust user management and matching logic
- The app currently assumes there are only two users for simplicity