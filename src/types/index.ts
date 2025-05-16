// User type
export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  partner_id?: string;
  created_at: string;
  updated_at: string;
}

// Movie/Series type
export interface Media {
  id: string;
  title: string;
  poster_url: string;
  genre: string;
  created_at: string;
}

// Swipe type
export interface Swipe {
  id: string;
  user_id: string;
  media_id: string;
  liked: boolean;
  created_at: string;
}

// Match type
export interface Match {
  id: string;
  media_id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  media?: Media;
}

// Auth state type
export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

// Response types
export interface AuthResponse {
  error: any;
  data?: any;
}

export interface DatabaseResponse<T> {
  error: any;
  data: T | null;
}