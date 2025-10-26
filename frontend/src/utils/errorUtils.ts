export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  code?: string | number;
  timestamp: string;
  context?: Record<string, any>;
  userMessage?: string;
  actionable?: boolean;
  retry?: boolean;
  reportable?: boolean;
  stack?: string;
}

export interface ErrorAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface ErrorDisplayOptions {
  toast?: boolean;
  modal?: boolean;
  inline?: boolean;
  console?: boolean;
  report?: boolean;
  actions?: ErrorAction[];
  dismissible?: boolean;
  autoHide?: boolean;
  duration?: number;
}

class ErrorUtils {
  private static errorCounter = 0;

  // Create standardized error objects
  static createError(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options?: Partial<AppError>
  ): AppError {
    this.errorCounter++;
    
    return {
      id: `error_${Date.now()}_${this.errorCounter}`,
      type,
      severity,
      message,
      timestamp: new Date().toISOString(),
      actionable: true,
      retry: type === ErrorType.NETWORK,
      reportable: severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL,
      ...options
    };
  }

  // Convert various error types to AppError
  static normalizeError(error: any, context?: Record<string, any>): AppError {
    // Already normalized
    if (error.id && error.type && error.severity) {
      return error;
    }

    let type = ErrorType.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let message = 'An unknown error occurred';
    let code: string | number | undefined;
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
      
      // Network errors
      if (error.name === 'NetworkError' || message.includes('network') || message.includes('fetch')) {
        type = ErrorType.NETWORK;
        severity = ErrorSeverity.LOW;
      }
      
      // Type errors usually indicate code issues
      if (error.name === 'TypeError') {
        type = ErrorType.CLIENT;
        severity = ErrorSeverity.HIGH;
      }
    }

    // HTTP errors
    if (error.response) {
      const status = error.response.status;
      code = status;
      
      if (status === 400) {
        type = ErrorType.VALIDATION;
        severity = ErrorSeverity.LOW;
      } else if (status === 401) {
        type = ErrorType.AUTHENTICATION;
        severity = ErrorSeverity.MEDIUM;
      } else if (status === 403) {
        type = ErrorType.AUTHORIZATION;
        severity = ErrorSeverity.MEDIUM;
      } else if (status === 404) {
        type = ErrorType.NOT_FOUND;
        severity = ErrorSeverity.LOW;
      } else if (status >= 500) {
        type = ErrorType.SERVER;
        severity = ErrorSeverity.HIGH;
      }
      
      message = error.response.data?.message || error.response.statusText || message;
    }

    // API client errors
    if (error.code) {
      code = error.code;
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        type = ErrorType.NETWORK;
        severity = ErrorSeverity.MEDIUM;
      }
    }

    return this.createError(message, type, severity, {
      code,
      stack,
      context,
      details: error.details || error.description,
      userMessage: this.getUserFriendlyMessage(type, message)
    });
  }

  // Get user-friendly error messages
  static getUserFriendlyMessage(type: ErrorType, originalMessage?: string): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Connection issue. Please check your internet connection and try again.';
      case ErrorType.AUTHENTICATION:
        return 'Please sign in to continue.';
      case ErrorType.AUTHORIZATION:
        return 'You don\'t have permission to access this resource.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.NOT_FOUND:
        return 'The requested item could not be found.';
      case ErrorType.SERVER:
        return 'Server issue. We\'re working to fix this. Please try again later.';
      case ErrorType.CLIENT:
        return 'Something went wrong. Please refresh the page and try again.';
      default:
        return originalMessage || 'Something unexpected happened. Please try again.';
    }
  }

  // Get error display options based on type and severity
  static getDisplayOptions(error: AppError): ErrorDisplayOptions {
    const baseOptions: ErrorDisplayOptions = {
      toast: true,
      console: true,
      dismissible: true,
      autoHide: true,
      duration: 5000
    };

    // Critical errors should be modal
    if (error.severity === ErrorSeverity.CRITICAL) {
      return {
        ...baseOptions,
        modal: true,
        autoHide: false,
        report: true
      };
    }

    // High severity errors
    if (error.severity === ErrorSeverity.HIGH) {
      return {
        ...baseOptions,
        duration: 8000,
        report: true
      };
    }

    // Authentication/Authorization errors
    if (error.type === ErrorType.AUTHENTICATION || error.type === ErrorType.AUTHORIZATION) {
      return {
        ...baseOptions,
        actions: [
          {
            label: 'Sign In',
            action: () => {
              // Navigate to sign in
              window.location.href = '/auth';
            },
            variant: 'contained',
            color: 'primary'
          }
        ]
      };
    }

    // Network errors
    if (error.type === ErrorType.NETWORK && error.retry) {
      return {
        ...baseOptions,
        actions: [
          {
            label: 'Retry',
            action: () => {
              window.location.reload();
            },
            variant: 'outlined',
            color: 'primary'
          }
        ]
      };
    }

    return baseOptions;
  }

  // Get error recovery suggestions
  static getRecoverySuggestions(error: AppError): string[] {
    const suggestions: string[] = [];

    switch (error.type) {
      case ErrorType.NETWORK:
        suggestions.push('Check your internet connection');
        suggestions.push('Try refreshing the page');
        suggestions.push('Disable VPN or proxy if enabled');
        break;
        
      case ErrorType.AUTHENTICATION:
        suggestions.push('Sign out and sign in again');
        suggestions.push('Clear your browser cache');
        suggestions.push('Check if your session has expired');
        break;
        
      case ErrorType.VALIDATION:
        suggestions.push('Review the form fields for errors');
        suggestions.push('Ensure all required fields are filled');
        suggestions.push('Check data format requirements');
        break;
        
      case ErrorType.SERVER:
        suggestions.push('Wait a few minutes and try again');
        suggestions.push('Contact support if the issue persists');
        break;
        
      case ErrorType.CLIENT:
        suggestions.push('Refresh the page');
        suggestions.push('Clear browser cache and cookies');
        suggestions.push('Try using a different browser');
        break;
        
      default:
        suggestions.push('Try refreshing the page');
        suggestions.push('Contact support if the issue continues');
    }

    return suggestions;
  }

  // Check if errors are similar (for deduplication)
  static areErrorsSimilar(error1: AppError, error2: AppError): boolean {
    return (
      error1.type === error2.type &&
      error1.message === error2.message &&
      error1.code === error2.code
    );
  }

  // Format error for logging
  static formatForLogging(error: AppError): string {
    const parts = [
      `[${error.severity}] ${error.type}: ${error.message}`,
      error.code && `Code: ${error.code}`,
      error.context && `Context: ${JSON.stringify(error.context)}`,
      error.stack && `Stack: ${error.stack}`
    ].filter(Boolean);

    return parts.join('\n');
  }

  // Format error for user display
  static formatForDisplay(error: AppError): {
    title: string;
    message: string;
    details?: string;
    suggestions: string[];
  } {
    const suggestions = this.getRecoverySuggestions(error);
    
    return {
      title: this.getErrorTitle(error.type),
      message: error.userMessage || error.message,
      details: error.details,
      suggestions
    };
  }

  private static getErrorTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Connection Error';
      case ErrorType.AUTHENTICATION:
        return 'Authentication Required';
      case ErrorType.AUTHORIZATION:
        return 'Access Denied';
      case ErrorType.VALIDATION:
        return 'Invalid Input';
      case ErrorType.NOT_FOUND:
        return 'Not Found';
      case ErrorType.SERVER:
        return 'Server Error';
      case ErrorType.CLIENT:
        return 'Client Error';
      default:
        return 'Error';
    }
  }

  // Report error to monitoring service
  static async reportError(error: AppError): Promise<void> {
    if (!error.reportable) return;

    try {
      // In a real app, this would send to a service like Sentry, LogRocket, etc.
      console.error('Reporting error:', this.formatForLogging(error));
      
      // Mock reporting to external service
      if (process.env.REACT_APP_ERROR_REPORTING_URL) {
        await fetch(process.env.REACT_APP_ERROR_REPORTING_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: error.timestamp
          })
        });
      }
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }
  }
}

export default ErrorUtils;