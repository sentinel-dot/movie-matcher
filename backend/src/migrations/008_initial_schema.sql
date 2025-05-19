-- Movies/Series table
CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  poster_url TEXT NOT NULL,
  genre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  partner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner requests table
CREATE TABLE IF NOT EXISTS partner_requests (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id)
);

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at for partner_requests
DROP TRIGGER IF EXISTS update_partner_requests_updated_at ON partner_requests;
CREATE TRIGGER update_partner_requests_updated_at
  BEFORE UPDATE ON partner_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  liked BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, media_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  media_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS partner_requests_requester_id_idx ON partner_requests(requester_id);
CREATE INDEX IF NOT EXISTS partner_requests_recipient_id_idx ON partner_requests(recipient_id);
CREATE INDEX IF NOT EXISTS partner_requests_status_idx ON partner_requests(status);

-- Insert top 50 movie data with real movies and TMDb poster URLs (w500 size)
INSERT INTO movies (title, poster_url, genre) VALUES
 ('The Shawshank Redemption', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'Drama'),
 ('The Godfather', 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'Crime'),
 ('The Dark Knight', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'Action'),
 ('Pulp Fiction', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 'Crime'),
 ('Fight Club', 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'Drama'),
 ('Inception', 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', 'Science Fiction'),
 ('The Matrix', 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', 'Science Fiction'),
 ('Spirited Away', 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', 'Animation'),
 ('Interstellar', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'Science Fiction'),
 ('Parasite', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 'Thriller'),
 ('The Lord of the Rings: The Return of the King', 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg', 'Adventure'),
 ('Forrest Gump', 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', 'Drama'),
 ('The Lord of the Rings: The Fellowship of the Ring', 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', 'Adventure'),
 ('The Good, the Bad and the Ugly', 'https://image.tmdb.org/t/p/w500/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg', 'Western'),
 ('Goodfellas', 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg', 'Crime'),
 ('One Flew Over the Cuckoos Nest', 'https://image.tmdb.org/t/p/w500/3jcbDmRFiQ83drXNOvRDeKHxS0C.jpg', 'Drama'),
 ('Seven Samurai', 'https://image.tmdb.org/t/p/w500/8OKmBV5BUFzmozIC85Sx7hYcqp.jpg', 'Action'),
 ('Se7en', 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg', 'Crime'),
 ('Life Is Beautiful', 'https://image.tmdb.org/t/p/w500/74hLDKjD5aGYOotO6esUVaeISa2.jpg', 'Comedy'),
 ('The Silence of the Lambs', 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg', 'Thriller'),
 ('Star Wars: Episode V - The Empire Strikes Back', 'https://image.tmdb.org/t/p/w500/2l05cFWJacyIsTpsqSgH0wQXe4V.jpg', 'Science Fiction'),
 ('Its a Wonderful Life', 'https://image.tmdb.org/t/p/w500/bSqt9rhDZx1Q7UZ86dBPKdNomp2.jpg', 'Drama'),
 ('Saving Private Ryan', 'https://image.tmdb.org/t/p/w500/1wY4psJ5NVEhCuOYROwLH2XExM2.jpg', 'War'),
 ('The Green Mile', 'https://image.tmdb.org/t/p/w500/o0lO84GI7qrG6XFvtsPOSV7CTNa.jpg', 'Drama'),
 ('Léon: The Professional', 'https://image.tmdb.org/t/p/w500/hWp8AKxBVGvMSC6jpSXzdFnUQJ4.jpg', 'Action'),
 ('Back to the Future', 'https://image.tmdb.org/t/p/w500/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg', 'Science Fiction'),
 ('The Pianist', 'https://image.tmdb.org/t/p/w500/2hFvxCCWrTmCYwfy7yum0GfHVrm.jpg', 'Drama'),
 ('The Departed', 'https://image.tmdb.org/t/p/w500/nT97ifVT2J1yXHzl9hbjL5o4Qen.jpg', 'Crime'),
 ('Whiplash', 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', 'Drama'),
 ('Gladiator', 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', 'Action'),
 ('The Prestige', 'https://image.tmdb.org/t/p/w500/bdN3gXuYB8OdiM3HUYbAEQZxwgh.jpg', 'Drama'),
 ('The Lion King', 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg', 'Animation'),
 ('Casablanca', 'https://image.tmdb.org/t/p/w500/5K7cOHoay2mZusSLezBOY0Qxh8a.jpg', 'Romance'),
 ('The Shining', 'https://image.tmdb.org/t/p/w500/nRj5511mZdTl4saWEPoj9QroTIu.jpg', 'Horror'),
 ('Django Unchained', 'https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg', 'Western'),
 ('WALL·E', 'https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg', 'Animation'),
 ('The Intouchables', 'https://image.tmdb.org/t/p/w500/323BP0itpxTsO0skTwdnVmf7YC9.jpg', 'Comedy'),
 ('Modern Times', 'https://image.tmdb.org/t/p/w500/6gzXsJvgRPkG8o8Fvn1ijTHsHnq.jpg', 'Comedy'),
 ('Avengers: Infinity War', 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', 'Action'),
 ('American History X', 'https://image.tmdb.org/t/p/w500/c2gsmSQ2Cqv8zosqKOCwRS0GFBS.jpg', 'Drama'),
 ('The Usual Suspects', 'https://image.tmdb.org/t/p/w500/3R6vDW1yBBzejsQNWm9CJgHPVZ4.jpg', 'Crime'),
 ('Alien', 'https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg', 'Science Fiction'),
 ('Rear Window', 'https://image.tmdb.org/t/p/w500/qitnZcLP7C9DLRuPpmvZ7GiEjJN.jpg', 'Mystery'),
 ('Cinema Paradiso', 'https://image.tmdb.org/t/p/w500/8SRUfRUi6x4O68n0VCbDNRa6iGL.jpg', 'Drama'),
 ('Apocalypse Now', 'https://image.tmdb.org/t/p/w500/jcvJ2xcVWU9Wh0hZupWHbi3EC6T.jpg', 'War'),
 ('Raiders of the Lost Ark', 'https://image.tmdb.org/t/p/w500/ceG9VzoRAVGwivFU403Wc3AHRys.jpg', 'Adventure'),
 ('Memento', 'https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg', 'Mystery'),
 ('The Great Dictator', 'https://image.tmdb.org/t/p/w500/1QpO9wo7JWecZ4NiBuu625FiY1j.jpg', 'Comedy'),
 ('The Hunt', 'https://image.tmdb.org/t/p/w500/ww6jCzSnUczYJ8UFJWcgx8bnzMG.jpg', 'Drama'),
 ('Psycho', 'https://image.tmdb.org/t/p/w500/5j5tdV8wDtZX8Yfr9r9g6nHfireK.jpg', 'Horror')
ON CONFLICT DO NOTHING;