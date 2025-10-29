# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Social Commerce AI Platform.

## Overview

The platform uses Google OAuth 2.0 for user authentication, allowing users to sign in with their Google accounts. This provides a secure and convenient authentication method.

## Prerequisites

- A Google Cloud Platform (GCP) account
- Access to the Google Cloud Console
- Node.js and npm installed

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Social Commerce AI Platform")
5. Click "Create"

## Step 2: Enable Google OAuth API

1. In your project, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google OAuth2 API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: Social Commerce AI Platform
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
8. Click "Save and Continue"
9. Add test users if needed (for development)
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Configure the OAuth client:
   - **Name**: Social Commerce Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `http://localhost:5173` (if using Vite dev server)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000` (for development)
     - `http://localhost:5173` (if using Vite dev server)
     - `https://yourdomain.com` (for production)
5. Click "Create"
6. Copy the **Client ID** (you'll need this for both frontend and backend)

## Step 5: Configure Environment Variables

### Frontend Configuration

1. Navigate to the `frontend` directory
2. Create a `.env.local` file (or copy from `.env.example`)
3. Add your Google Client ID:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

### Backend Configuration

1. Navigate to the `backend` directory
2. Create a `.env` file (or copy from `.env.example`)
3. Add your Google Client ID:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

**Note**: Use the same Client ID for both frontend and backend.

## Step 6: Install Dependencies

Both frontend and backend packages are already installed. If needed:

```bash
# Frontend dependencies (already installed)
cd frontend
npm install @react-oauth/google

# Backend dependencies (already installed)
cd backend
npm install google-auth-library
```

## Step 7: Test the Integration

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Navigate to `http://localhost:5173` (or your configured port)
4. Click on "Sign In"
5. You should see a "Continue with Google" button
6. Click it and sign in with your Google account

## How It Works

### Frontend Flow

1. User clicks "Continue with Google" button
2. Google's OAuth popup appears
3. User authenticates with Google
4. Google returns an ID token
5. Frontend sends the token to the backend at `/api/auth/google`

### Backend Flow

1. Backend receives the Google ID token
2. Verifies the token using `google-auth-library`
3. Extracts user information (email, name, avatar)
4. Creates a new user or logs in existing user
5. Generates a JWT token
6. Returns the JWT token and user data to frontend

### Database

The User model has been updated to include a `googleId` field to link users with their Google accounts.

## Security Best Practices

1. **Never commit your Google Client ID to version control** if it contains sensitive data
2. Keep your `.env` files local and add them to `.gitignore`
3. Use different OAuth clients for development and production
4. Regularly rotate your credentials
5. Monitor the OAuth usage in Google Cloud Console

## Troubleshooting

### "redirect_uri_mismatch" Error

- Ensure the redirect URI in your Google Cloud Console matches exactly
- Check for trailing slashes
- Verify the protocol (http vs https)

### "Invalid token" Error

- Verify that the same Client ID is used in both frontend and backend
- Check that the token hasn't expired
- Ensure the backend has the correct `GOOGLE_CLIENT_ID` in `.env`

### Google Button Not Appearing

- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env.local`
- Ensure the GoogleAuthProviderWrapper is wrapping your app

### User Creation Fails

- Check MongoDB connection
- Verify the User model has the `googleId` field
- Check backend logs for detailed error messages

## Production Deployment

When deploying to production:

1. Create a new OAuth client in Google Cloud Console for production
2. Add your production domain to authorized origins and redirect URIs
3. Update environment variables with production Client ID
4. Ensure HTTPS is enabled on your domain
5. Test the OAuth flow thoroughly

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Library](https://www.npmjs.com/package/@react-oauth/google)
- [Google Auth Library for Node.js](https://www.npmjs.com/package/google-auth-library)

## Support

If you encounter issues:

1. Check the browser console for frontend errors
2. Check backend server logs
3. Verify all environment variables are set correctly
4. Ensure MongoDB is running
5. Review this documentation

For additional help, consult the Google OAuth documentation or create an issue in the project repository.
