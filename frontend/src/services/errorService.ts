import { EventEmitter } from 'events';
import ErrorUtils, { AppError, ErrorDisplayOptions } from '../utils/errorUtils';
import notificationService from './notificationService';

class ErrorService extends EventEmitter {
  private errors: Map<string, AppError> = new Map();
  private recentErrors: AppError[] = [];
  private readonly MAX_RECENT_ERRORS = 50;
  private duplicateTimeWindow = 5000; // 5 seconds

  constructor() {
    super();
    this.setupGlobalErrorHandlers();
  }

  // Set up global error handling
  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = ErrorUtils.normalizeError(event.reason, {
        type: 'unhandledrejection',
        url: window.location.href,
        userAgent: navigator.userAgent
      });
      
      this.handleError(error);
      
      // Prevent the default browser error reporting
      event.preventDefault();
    });

    // Handle JavaScript runtime errors
    window.addEventListener('error', (event) => {
      const error = ErrorUtils.normalizeError(event.error || new Error(event.message), {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
        userAgent: navigator.userAgent
      });
      
      this.handleError(error);
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        const error = ErrorUtils.createError(
          `Failed to load resource: ${target.tagName}`,
          'NETWORK' as any,
          'MEDIUM' as any,
          {
            context: {
              type: 'resource',
              tagName: target.tagName,
              src: (target as any).src || (target as any).href,
              url: window.location.href
            }
          }
        );
        
        this.handleError(error);
      }
    }, true);

    // Handle console errors (for development)
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      console.error = (...args) => {
        if (args.length > 0 && typeof args[0] === 'string') {
          const error = ErrorUtils.createError(
            args[0],
            'CLIENT' as any,
            'LOW' as any,
            {
              context: {
                type: 'console',
                args: args.slice(1),
                stack: new Error().stack
              }
            }
          );
          
          this.handleError(error, { console: false }); // Don't re-log to console
        }
        
        originalError.apply(console, args);
      };
    }
  }

  // Main error handling method
  public handleError(
    error: any, 
    displayOptions?: Partial<ErrorDisplayOptions>,
    context?: Record<string, any>
  ): void {
    // Normalize the error
    const appError = ErrorUtils.normalizeError(error, context);
    
    // Check for duplicates
    if (this.isDuplicate(appError)) {
      return;
    }

    // Store the error
    this.errors.set(appError.id, appError);
    this.recentErrors.unshift(appError);
    
    // Keep only recent errors
    if (this.recentErrors.length > this.MAX_RECENT_ERRORS) {
      this.recentErrors = this.recentErrors.slice(0, this.MAX_RECENT_ERRORS);
    }

    // Get display options
    const defaultOptions = ErrorUtils.getDisplayOptions(appError);
    const finalOptions = { ...defaultOptions, ...displayOptions };

    // Display the error
    this.displayError(appError, finalOptions);

    // Report the error
    if (finalOptions.report && appError.reportable) {
      ErrorUtils.reportError(appError);
    }

    // Emit the error event
    this.emit('error', appError);

    // Log to console if enabled
    if (finalOptions.console !== false) {
      const logLevel = this.getLogLevel(appError);
      console[logLevel](ErrorUtils.formatForLogging(appError));
    }
  }

  // Display error to user
  private displayError(error: AppError, options: ErrorDisplayOptions): void {
    // Show toast notification
    if (options.toast) {
      const severity = this.getNotificationSeverity(error);
      const displayInfo = ErrorUtils.formatForDisplay(error);
      
      notificationService.showToast({
        type: 'system',
        title: displayInfo.title,
        message: displayInfo.message,
        timestamp: error.timestamp,
        isRead: false,
        severity,
        autoHide: options.autoHide,
        duration: options.duration,
        actions: options.actions?.map(action => ({
          label: action.label,
          action: action.action.name || 'custom',
          variant: action.variant,
          color: action.color
        }))
      });
    }

    // Show modal for critical errors
    if (options.modal) {
      this.showErrorModal(error, options);
    }
  }

  // Show error modal (placeholder - would integrate with modal system)
  private showErrorModal(error: AppError, options: ErrorDisplayOptions): void {
    // This would integrate with a modal system
    console.warn('Error modal not implemented yet:', error);
  }

  // Check if error is duplicate
  private isDuplicate(error: AppError): boolean {
    const cutoffTime = Date.now() - this.duplicateTimeWindow;
    
    return this.recentErrors.some(recentError => {
      const recentTime = new Date(recentError.timestamp).getTime();
      return recentTime > cutoffTime && ErrorUtils.areErrorsSimilar(error, recentError);
    });
  }

  // Get console log level based on error severity
  private getLogLevel(error: AppError): 'error' | 'warn' | 'info' {
    switch (error.severity) {
      case 'CRITICAL':
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warn';
      case 'LOW':
      default:
        return 'info';
    }
  }

  // Get notification severity
  private getNotificationSeverity(error: AppError): 'error' | 'warning' | 'info' | 'success' {
    switch (error.severity) {
      case 'CRITICAL':
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
      default:
        return 'info';
    }
  }

  // Public API methods
  public getErrors(): AppError[] {
    return Array.from(this.errors.values());
  }

  public getRecentErrors(limit?: number): AppError[] {
    return limit ? this.recentErrors.slice(0, limit) : [...this.recentErrors];
  }

  public getErrorById(id: string): AppError | undefined {
    return this.errors.get(id);
  }

  public clearError(id: string): void {
    this.errors.delete(id);
    this.recentErrors = this.recentErrors.filter(error => error.id !== id);
    this.emit('errorCleared', id);
  }

  public clearAllErrors(): void {
    this.errors.clear();
    this.recentErrors = [];
    this.emit('allErrorsCleared');
  }

  // Convenience methods for common error types
  public handleNetworkError(message: string, context?: Record<string, any>): void {
    const error = ErrorUtils.createError(message, 'NETWORK' as any, 'MEDIUM' as any, { context });
    this.handleError(error);
  }

  public handleValidationError(message: string, context?: Record<string, any>): void {
    const error = ErrorUtils.createError(message, 'VALIDATION' as any, 'LOW' as any, { context });
    this.handleError(error);
  }

  public handleAuthError(message: string, context?: Record<string, any>): void {
    const error = ErrorUtils.createError(message, 'AUTHENTICATION' as any, 'MEDIUM' as any, { context });
    this.handleError(error);
  }

  public handleCriticalError(message: string, context?: Record<string, any>): void {
    const error = ErrorUtils.createError(message, 'UNKNOWN' as any, 'CRITICAL' as any, { context });
    this.handleError(error);
  }

  // Error recovery helpers
  public retryLastError(): void {
    const lastError = this.recentErrors[0];
    if (lastError && lastError.retry) {
      this.emit('retryError', lastError);
    }
  }

  public getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: number;
  } {
    const errors = this.getErrors();
    
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    
    errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: errors.length,
      byType,
      bySeverity,
      recent: this.recentErrors.length
    };
  }

  // Cleanup
  public destroy(): void {
    this.removeAllListeners();
    this.errors.clear();
    this.recentErrors = [];
  }
}

// Create singleton instance
const errorService = new ErrorService();

// Export convenience methods for global use
export const handleError = (error: any, options?: Partial<ErrorDisplayOptions>, context?: Record<string, any>) => {
  errorService.handleError(error, options, context);
};

export const handleNetworkError = (message: string, context?: Record<string, any>) => {
  errorService.handleNetworkError(message, context);
};

export const handleValidationError = (message: string, context?: Record<string, any>) => {
  errorService.handleValidationError(message, context);
};

export const handleAuthError = (message: string, context?: Record<string, any>) => {
  errorService.handleAuthError(message, context);
};

export const handleCriticalError = (message: string, context?: Record<string, any>) => {
  errorService.handleCriticalError(message, context);
};

export default errorService;