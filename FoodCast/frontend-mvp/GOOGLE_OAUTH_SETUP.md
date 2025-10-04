# Google OAuth Setup Guide

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)

## 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required fields:
   - App name: `FoodCast`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`

## 3. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)

## 4. Environment Variables

Create a `.env.local` file in your frontend-mvp directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

## 5. Generate NextAuth Secret

You can generate a random secret using:

```bash
openssl rand -base64 32
```

Or use any random string generator.

## 6. Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/signup`
3. Complete the role selection
4. Click "Continue with Google" on the OAuth step
5. Complete the signup process

## Troubleshooting

- Make sure your redirect URI matches exactly
- Check that the Google Cloud project has the correct APIs enabled
- Verify your environment variables are set correctly
- Check the browser console for any errors
