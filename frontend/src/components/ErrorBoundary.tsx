import React, { Component, ReactNode, ErrorInfo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
  Lightbulb as SuggestionIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ErrorUtils, { AppError, ErrorType, ErrorSeverity } from '../utils/errorUtils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'section' | 'component';
  onError?: (error: AppError) => void;
  showDetails?: boolean;
  allowReset?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  showDetails: boolean;
  eventId: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      showDetails: false,
      eventId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Convert the error to our standardized format
    const appError = ErrorUtils.normalizeError(error, {
      boundary: 'React Error Boundary',
      componentStack: 'Available in error info'
    });

    // Set severity based on error type
    if (error.name === 'ChunkLoadError') {
      appError.severity = ErrorSeverity.MEDIUM;
      appError.type = ErrorType.NETWORK;
      appError.userMessage = 'Failed to load application resources. Please refresh the page.';
    }

    return {
      hasError: true,
      error: appError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    if (this.state.error) {
      // Add component stack information
      const enrichedError = {
        ...this.state.error,
        context: {
          ...this.state.error.context,
          componentStack: errorInfo.componentStack,
          errorBoundary: this.props.level || 'unknown'
        }
      };

      // Report the error
      ErrorUtils.reportError(enrichedError);

      // Call the error callback if provided
      if (onError) {
        onError(enrichedError);
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error Boundary caught an error:', error);
        console.error('Component Stack:', errorInfo.componentStack);
      }
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      showDetails: false,
      eventId: null
    });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails
    }));
  };

  private renderErrorActions() {
    const { allowReset = true, level = 'component' } = this.props;
    
    return (
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {allowReset && (
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={this.handleReset}
            color="primary"
          >
            Try Again
          </Button>
        )}
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={this.handleRefresh}
          color="primary"
        >
          Refresh Page
        </Button>
        
        {level === 'page' && (
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={this.handleGoHome}
            color="secondary"
          >
            Go Home
          </Button>
        )}
      </Box>
    );
  }

  private renderErrorDetails() {
    const { error, showDetails } = this.state;
    const { showDetails: allowShowDetails = true } = this.props;
    
    if (!error || !allowShowDetails) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Button
          onClick={this.toggleDetails}
          startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          size="small"
          color="inherit"
        >
          {showDetails ? 'Hide' : 'Show'} Technical Details
        </Button>
        
        <Collapse in={showDetails}>
          <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300' }}>
            <Typography variant="subtitle2" gutterBottom>
              Error Information
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Error ID: {error.id}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Type: {error.type} | Severity: {error.severity}
              </Typography>
            </Box>
            
            {error.code && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Code: {error.code}
                </Typography>
              </Box>
            )}
            
            {error.details && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {error.details}
                </Typography>
              </Box>
            )}
            
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {error.message}
            </Typography>
            
            {error.stack && process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                <Typography variant="caption" color="text.secondary">
                  Stack Trace:
                </Typography>
                <Typography 
                  variant="caption" 
                  component="pre" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.7rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}
                >
                  {error.stack}
                </Typography>
              </Box>
            )}
          </Paper>
        </Collapse>
      </Box>
    );
  }

  private renderSuggestions() {
    const { error } = this.state;
    
    if (!error) return null;

    const suggestions = ErrorUtils.getRecoverySuggestions(error);
    
    if (suggestions.length === 0) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="info" sx={{ textAlign: 'left' }}>
          <Typography variant="subtitle2" gutterBottom>
            <SuggestionIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.2rem' }} />
            Suggested Solutions
          </Typography>
          
          <List dense sx={{ py: 0 }}>
            {suggestions.map((suggestion, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={suggestion}
                  primaryTypographyProps={{
                    variant: 'body2'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      </Box>
    );
  }

  private renderMinimalError() {
    const { error } = this.state;
    
    if (!error) return null;

    const displayInfo = ErrorUtils.formatForDisplay(error);

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          p: 3,
          textAlign: 'center'
        }}
      >
        <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          {displayInfo.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {displayInfo.message}
        </Typography>
        
        {this.renderErrorActions()}
      </Box>
    );
  }

  private renderFullError() {
    const { error } = this.state;
    const { level = 'component' } = this.props;
    
    if (!error) return null;

    const displayInfo = ErrorUtils.formatForDisplay(error);
    const isPageLevel = level === 'page';

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            {/* Error Icon */}
            <Box sx={{ mb: 3 }}>
              <ErrorIcon sx={{ fontSize: isPageLevel ? 80 : 60, color: 'error.main' }} />
            </Box>

            {/* Error Title */}
            <Typography 
              variant={isPageLevel ? 'h3' : 'h4'} 
              gutterBottom 
              fontWeight="bold"
            >
              {displayInfo.title}
            </Typography>

            {/* Error Message */}
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
            >
              {displayInfo.message}
            </Typography>

            {/* Error Actions */}
            {this.renderErrorActions()}

            {/* Suggestions */}
            {this.renderSuggestions()}

            {/* Technical Details */}
            {this.renderErrorDetails()}

            <Divider sx={{ my: 3 }} />

            {/* Report Issue */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                If this problem persists, please report it to our support team.
              </Typography>
              <Button
                size="small"
                startIcon={<BugReportIcon />}
                onClick={() => {
                  // In a real app, this would open a support form or email
                  console.log('Report issue clicked', error);
                }}
                color="inherit"
              >
                Report Issue
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError) {
      // If custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Render different UI based on the boundary level
      switch (level) {
        case 'page':
          return this.renderFullError();
        case 'section':
          return this.renderFullError();
        case 'component':
        default:
          return this.renderMinimalError();
      }
    }

    return children;
  }
}

export default ErrorBoundary;