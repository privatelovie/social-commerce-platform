import React, { useState, useEffect, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Button,
  Box,
  Avatar,
  Typography,
  IconButton,
  Slide,
  Stack,
  Portal,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  NotificationImportant as NotificationIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import notificationService, { ToastNotification } from '../services/notificationService';

interface ToastItem extends ToastNotification {
  id: string;
  onClose?: () => void;
  onAction?: (actionType: string) => void;
}

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  spacing?: number;
}

const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  position = 'top-right',
  spacing = 12,
}) => {
  const theme = useTheme();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Listen for toast events from notification service
  useEffect(() => {
    const handleToast = (toast: ToastItem) => {
      setToasts(prevToasts => {
        const newToasts = [toast, ...prevToasts];
        // Limit number of toasts
        return newToasts.slice(0, maxToasts);
      });

      // Auto-remove toast after duration
      if (toast.autoHide !== false) {
        const duration = toast.duration || 4000;
        setTimeout(() => {
          removeToast(toast.id);
        }, duration);
      }
    };

    notificationService.on('toast', handleToast);

    return () => {
      notificationService.off('toast', handleToast);
    };
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => {
      const toast = prevToasts.find(t => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prevToasts.filter(t => t.id !== id);
    });
  }, []);

  const handleToastAction = useCallback((toast: ToastItem, actionType: string) => {
    if (toast.onAction) {
      toast.onAction(actionType);
    }
    removeToast(toast.id);
  }, [removeToast]);

  // Get position styles
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: theme.zIndex.snackbar + 1,
      pointerEvents: 'none' as const,
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: 24, right: 24 };
      case 'top-left':
        return { ...baseStyles, top: 24, left: 24 };
      case 'bottom-right':
        return { ...baseStyles, bottom: 24, right: 24 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 24, left: 24 };
      case 'top-center':
        return { ...baseStyles, top: 24, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...baseStyles, bottom: 24, left: '50%', transform: 'translateX(-50%)' };
      default:
        return { ...baseStyles, top: 24, right: 24 };
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity?: ToastNotification['severity']) => {
    switch (severity) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <NotificationIcon />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity?: ToastNotification['severity']) => {
    switch (severity) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Render individual toast
  const renderToast = (toast: ToastItem) => {
    const severityColor = getSeverityColor(toast.severity);
    const severityIcon = getSeverityIcon(toast.severity);

    return (
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.9 }}
        transition={{ 
          type: 'spring', 
          damping: 25, 
          stiffness: 300,
          duration: 0.3 
        }}
        style={{
          pointerEvents: 'auto',
          marginBottom: spacing,
          width: 400,
          maxWidth: '90vw',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 2,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.95)
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(severityColor, 0.2)}`,
            borderLeft: `4px solid ${severityColor}`,
            boxShadow: theme.shadows[8],
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            {/* Avatar or Icon */}
            {toast.avatar ? (
              <Avatar
                src={toast.avatar}
                sx={{ width: 32, height: 32, mt: 0.5 }}
              />
            ) : (
              <Box
                sx={{
                  color: severityColor,
                  display: 'flex',
                  alignItems: 'center',
                  mt: 0.5,
                }}
              >
                {severityIcon}
              </Box>
            )}

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ 
                  color: theme.palette.text.primary,
                  lineHeight: 1.2,
                  mb: toast.message ? 0.5 : 0
                }}
              >
                {toast.title}
              </Typography>
              
              {toast.message && (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  {toast.message}
                </Typography>
              )}

              {/* Actions */}
              {toast.actions && toast.actions.length > 0 && (
                <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {toast.actions.map((action, index) => (
                    <Button
                      key={index}
                      size="small"
                      variant={action.variant || 'text'}
                      color={action.color || 'primary'}
                      onClick={() => handleToastAction(toast, action.action)}
                      sx={{ 
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>

            {/* Close button */}
            <IconButton
              size="small"
              onClick={() => removeToast(toast.id)}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.text.primary,
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Progress bar for auto-hide toasts */}
          {toast.autoHide !== false && toast.duration && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 2,
                bgcolor: alpha(severityColor, 0.2),
                borderRadius: '0 0 8px 8px',
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                style={{
                  height: '100%',
                  background: severityColor,
                }}
              />
            </Box>
          )}
        </Paper>
      </motion.div>
    );
  };

  return (
    <>
      {children}
      
      {/* Toast container */}
      <Portal>
        <Box sx={getPositionStyles()}>
          <AnimatePresence>
            <Stack spacing={0} direction="column">
              {toasts.map(renderToast)}
            </Stack>
          </AnimatePresence>
        </Box>
      </Portal>
    </>
  );
};

export default ToastProvider;