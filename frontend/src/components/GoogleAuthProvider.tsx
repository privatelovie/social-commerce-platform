import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleAuthProviderWrapperProps {
  children: React.ReactNode;
}

const GoogleAuthProviderWrapper: React.FC<GoogleAuthProviderWrapperProps> = ({ children }) => {
  // Get Google Client ID from environment variable
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    console.error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthProviderWrapper;
