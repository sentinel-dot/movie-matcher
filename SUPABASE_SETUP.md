# Supabase Setup Instructions

This document provides detailed instructions for setting up your Supabase backend for the Movie Matcher app.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in or create an account
2. Click "New Project" and fill in the details:
   - Organization: Choose or create an organization
   - Name: `movie-matcher` (or any name you prefer)
   - Database Password: Create a secure password
   - Region: Choose a region closest to your users
3. Click "Create new project" and wait for it to be created

## 2. Set Up Database Schema

1. In your Supabase dashboard, navigate to the "SQL Editor" section
2. Click "New Query"
3. Copy and paste the entire contents of the `supabase-schema.sql` file
4. Click "Run" to execute the SQL commands
5. This will:
   - Create the necessary tables (users, movies, swipes, matches)
   - Set up appropriate relationships and constraints
   - Create triggers for automatic user creation
   - Set up Row Level Security (RLS) policies
   - Insert dummy movie/series data for testing

## 3. Verify Database Setup

After running the schema, verify that:

1. The following tables are created (check "Table Editor"):
   - `public.users`
   - `public.movies`
   - `public.swipes`
   - `public.matches`

2. The trigger for new user creation is set up:
   - Check "Database" > "Triggers"
   - You should see `on_auth_user_created` trigger

3. RLS policies are enabled:
   - Check each table's "Authentication" tab
   - Verify that RLS is enabled and policies are created

## 4. Configure Authentication

1. In your Supabase dashboard, navigate to "Authentication" > "Providers"
2. Ensure "Email" provider is enabled and configured:
   - Under "Email Auth", make sure it's enabled
   - Configure "Confirm email" settings as needed
   - Set up any custom email templates if desired

## 5. Get API Credentials

1. In your Supabase dashboard, go to "Settings" > "API"
2. Copy these values:
   - Project URL (`supabaseUrl`)
   - Project API keys (`supabaseAnonKey`)
3. Update them in `src/services/supabase.ts`:

```typescript
const supabaseUrl = 'YOUR_PROJECT_URL';
const supabaseAnonKey = 'YOUR_ANON_KEY';
```

## 6. Testing the Setup

1. Create a test user through the app's signup process
2. Check the Supabase dashboard:
   - Verify the user is created in Auth > Users
   - Verify a corresponding record is created in the public.users table
3. Test the login flow
4. Create a second test user to verify matching functionality

## 7. Troubleshooting

If you encounter issues:

### User Creation Issues
- Check the database logs for trigger errors
- Verify the `handle_new_user` function exists and has proper permissions
- Ensure RLS policies are not blocking insertions

### Authentication Issues
- Check the browser console for error messages
- Verify your API credentials are correct
- Ensure email confirmation settings match your needs

### Data Access Issues
- Review RLS policies
- Check user permissions
- Verify table relationships and constraints

## 8. Development Tips

1. Use the Supabase dashboard's SQL Editor to inspect and modify data
2. Monitor the "Database" > "Logs" section for errors
3. Use the "Authentication" > "Users" section to manage test users
4. The "Table Editor" provides a GUI for viewing and editing data

## 9. Next Steps

After basic setup, consider:

1. Adding more sophisticated RLS policies
2. Setting up real-time subscriptions for matches
3. Implementing email templates for notifications
4. Setting up backups and monitoring
5. Configuring additional authentication providers

## 10. Important Notes

- Keep your API keys secure and never commit them to version control
- In production, always use environment variables for sensitive data
- Regularly backup your database
- Monitor your usage and set up alerts if needed