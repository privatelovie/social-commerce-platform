import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordResetProps {
  open: boolean;
  onClose: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ open, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const steps = ['Enter Email', 'Verify Code', 'New Password'];

  const handleEmailSubmit = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call to send reset email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would call: await authService.requestPasswordReset(email);
      setSuccess(`Reset code sent to ${email}`);
      setCurrentStep(1);
    } catch (err: any) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerification = async () => {
    if (!resetCode || resetCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call to verify reset code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would call: await authService.verifyResetCode(email, resetCode);
      setCurrentStep(2);
    } catch (err: any) {
      setError('Invalid or expired reset code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would call: await authService.resetPassword(email, resetCode, newPassword);
      setSuccess('Password reset successfully!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err: any) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Reset Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {steps[currentStep]}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Box sx={{ minHeight: 200 }}>
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <EmailIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Enter your email address
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    We'll send you a verification code to reset your password
                  </Typography>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    disabled={loading}
                    sx={{ mb: 2 }}
                  />
                </Paper>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <EmailIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Check your email
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Enter the 6-digit verification code sent to {email}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Verification Code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    variant="outlined"
                    disabled={loading}
                    sx={{ 
                      mb: 2,
                      '& input': { 
                        textAlign: 'center', 
                        fontSize: '1.5rem', 
                        letterSpacing: '0.5rem',
                        fontWeight: 'bold'
                      }
                    }}
                    inputProps={{ maxLength: 6 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Didn't receive the code?{' '}
                    <Button 
                      variant="text" 
                      size="small" 
                      onClick={() => setCurrentStep(0)}
                      disabled={loading}
                    >
                      Try again
                    </Button>
                  </Typography>
                </Paper>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <LockIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Create new password
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Choose a strong password that you haven't used before
                  </Typography>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    variant="outlined"
                    disabled={loading}
                    sx={{ mb: 2 }}
                    helperText="Must be at least 8 characters"
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="outlined"
                    disabled={loading}
                    sx={{ mb: 2 }}
                  />
                </Paper>
              </motion.div>
            )}

            {success && currentStep === 2 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main">
                    Password Reset Successful!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You can now log in with your new password
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        
        {currentStep === 0 && (
          <Button
            onClick={handleEmailSubmit}
            variant="contained"
            disabled={loading || !email}
            startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
          >
            {loading ? 'Sending...' : 'Send Code'}
          </Button>
        )}

        {currentStep === 1 && (
          <Button
            onClick={handleCodeVerification}
            variant="contained"
            disabled={loading || resetCode.length !== 6}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </Button>
        )}

        {currentStep === 2 && !success && (
          <Button
            onClick={handlePasswordReset}
            variant="contained"
            disabled={loading || !newPassword || !confirmPassword}
            startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PasswordReset;