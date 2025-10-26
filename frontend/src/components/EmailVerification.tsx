import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  CircularProgress,
  Link,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Email as EmailIcon,
  Verified as VerifiedIcon,
  Timer as TimerIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onClose?: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerified,
  onClose
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Start cooldown timer
  useEffect(() => {
    // Start with 60 second cooldown
    setResendCooldown(60);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification logic
      if (verificationCode === '123456') {
        setSuccess(true);
        setTimeout(() => {
          onVerified();
        }, 1500);
      } else {
        setError('Invalid verification code. Please check and try again.');
      }
    } catch (err) {
      setError('Failed to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset cooldown
      setResendCooldown(60);
      
      // Show success message briefly
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (success && verificationCode === '123456') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            >
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            </motion.div>
            <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
              Email Verified!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your email address has been successfully verified.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 450,
          mx: 'auto',
          mt: 4,
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
          >
            <EmailIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
          </motion.div>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Verify Your Email
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            We've sent a verification code to
          </Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ opacity: 0.9 }}>
            {email}
          </Typography>
        </Box>

        <Box sx={{ backgroundColor: 'rgba(255,255,255,0.1)', p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            Enter the 6-digit verification code:
          </Typography>

          <TextField
            fullWidth
            value={verificationCode}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
            placeholder="123456"
            inputProps={{
              maxLength: 6,
              style: { 
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                letterSpacing: '8px'
              }
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.9)',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'white' }
              },
              '& input': { color: '#333' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VerifiedIcon sx={{ color: '#666' }} />
                </InputAdornment>
              )
            }}
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            fullWidth
            variant="contained"
            onClick={handleVerify}
            disabled={isLoading || verificationCode.length !== 6}
            sx={{
              py: 1.5,
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)'
              },
              '&:disabled': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)'
              }
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                Verifying...
              </Box>
            ) : (
              'Verify Email'
            )}
          </Button>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            Didn't receive the code?
          </Typography>
          
          <Button
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || isResending}
            startIcon={
              isResending ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : resendCooldown > 0 ? (
                <TimerIcon />
              ) : (
                <SendIcon />
              )
            }
            sx={{
              color: 'white',
              textTransform: 'none',
              '&:disabled': {
                color: 'rgba(255,255,255,0.5)'
              }
            }}
          >
            {isResending ? (
              'Sending...'
            ) : resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : (
              'Resend Code'
            )}
          </Button>
        </Box>

        {onClose && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link
              component="button"
              onClick={onClose}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                fontSize: '14px',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              I'll verify later
            </Link>
          </Box>
        )}
      </Paper>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <Paper
          elevation={1}
          sx={{
            maxWidth: 450,
            mx: 'auto',
            mt: 2,
            p: 2,
            backgroundColor: 'rgba(255,255,255,0.95)'
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            💡 <strong>Demo:</strong> Use verification code <strong>123456</strong> to test the verification flow
          </Typography>
        </Paper>
      </motion.div>
    </motion.div>
  );
};

export default EmailVerification;