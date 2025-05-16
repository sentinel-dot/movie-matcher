-- Create tables for the Movie Matcher app

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Movies/Series table
CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  poster_url TEXT NOT NULL,
  genre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public users table for additional user data
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  partner_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Function to create a user in the public users table after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger to create a user in the public users table after signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically set updated_at on users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Swipes table to record user swipes
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  liked BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, media_id)
);

-- Matches table to record matches between users
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(media_id, user1_id, user2_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_partner_id_idx ON users(partner_id);
CREATE INDEX IF NOT EXISTS swipes_user_id_idx ON swipes(user_id);
CREATE INDEX IF NOT EXISTS swipes_media_id_idx ON swipes(media_id);
CREATE INDEX IF NOT EXISTS matches_user1_id_idx ON matches(user1_id);
CREATE INDEX IF NOT EXISTS matches_user2_id_idx ON matches(user2_id);
CREATE INDEX IF NOT EXISTS matches_media_id_idx ON matches(media_id);

-- Insert dummy movie/series data
INSERT INTO movies (title, poster_url, genre) VALUES
  ('The Shawshank Redemption', 'https://picsum.photos/id/1/400/600', 'Drama'),
  ('The Godfather', 'https://picsum.photos/id/2/400/600', 'Crime'),
  ('The Dark Knight', 'https://picsum.photos/id/3/400/600', 'Action'),
  ('Pulp Fiction', 'https://picsum.photos/id/4/400/600', 'Crime'),
  ('Fight Club', 'https://picsum.photos/id/5/400/600', 'Drama'),
  ('Forrest Gump', 'https://picsum.photos/id/6/400/600', 'Drama'),
  ('Inception', 'https://picsum.photos/id/7/400/600', 'Sci-Fi'),
  ('The Matrix', 'https://picsum.photos/id/8/400/600', 'Sci-Fi'),
  ('Goodfellas', 'https://picsum.photos/id/9/400/600', 'Crime'),
  ('The Silence of the Lambs', 'https://picsum.photos/id/10/400/600', 'Thriller'),
  ('Stranger Things', 'https://picsum.photos/id/11/400/600', 'Sci-Fi'),
  ('Breaking Bad', 'https://picsum.photos/id/12/400/600', 'Drama'),
  ('Game of Thrones', 'https://picsum.photos/id/13/400/600', 'Fantasy'),
  ('The Office', 'https://picsum.photos/id/14/400/600', 'Comedy'),
  ('Friends', 'https://picsum.photos/id/15/400/600', 'Comedy')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own swipes"
  ON swipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swipes"
  ON swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() IN (user1_id, user2_id));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;