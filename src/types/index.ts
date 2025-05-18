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
  match?: boolean; // Optional flag to indicate if this swipe created a match
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

// Partner Request type
export interface PartnerRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester_email?: string;
  recipient_email?: string;
}

// Auth state type
export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

// Response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface DatabaseResponse<T> {
  error: any;
  data: T | null;
}