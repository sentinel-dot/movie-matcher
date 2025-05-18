export interface User {
  id: number;
  email: string;
  display_name?: string;
  avatar_url?: string;
  partner_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
}

export interface Media {
  id: number;
  title: string;
  poster_url: string;
  genre: string;
  created_at: Date;
}

export interface Swipe {
  id: number;
  user_id: number;
  media_id: number;
  liked: boolean;
  created_at: Date;
  match?: boolean; // Optional flag to indicate if this swipe created a match
}

export interface Match {
  id: number;
  media_id: number;
  user1_id: number;
  user2_id: number;
  created_at: Date;
  media?: Media; // Optional joined media data
}

// Add this to Request interface to make req.user available
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}