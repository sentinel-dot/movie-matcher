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