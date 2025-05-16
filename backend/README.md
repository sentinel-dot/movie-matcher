# Movie Matcher Backend

Express + PostgreSQL backend for the Movie Matcher application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a PostgreSQL database:
```bash
createdb movie_matcher
```

3. Configure environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your database credentials and other configuration.

4. Run database migrations:
```bash
npm run migrate
```

5. Start the development server:
```bash
npm run dev
```

The server will be running at http://localhost:5000

## API Endpoints

### Health Check
- GET `/health` - Check if the server is running

More endpoints coming soon:
- Authentication (signup, login)
- Movies
- Swipes
- Matches

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations