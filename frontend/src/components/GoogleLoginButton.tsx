import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Box } from '@mui/material';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // Send the token to your backend for verification
      const success = await loginWithGoogle(credentialResponse.credential);
      
      if (success) {
        onSuccess?.();
      } else {
        onError?.('Failed to authenticate with Google');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      onError?.(error.message || 'Failed to authenticate with Google');
    }
  };

  const handleError = () => {
    console.error('Google login failed');
    onError?.('Google login failed. Please try again.');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
      />
    </Box>
  );
};

export default GoogleLoginButton;
