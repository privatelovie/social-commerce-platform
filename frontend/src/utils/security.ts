/**
 * Security utilities for input validation, sanitization, and protection
 */

// Input validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  phone: /^\+?[\d\s-()]{10,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/
};

// Content sanitization
export const sanitizeInput = (input: string, options: {
  removeHtml?: boolean;
  removeScripts?: boolean;
  maxLength?: number;
  allowedTags?: string[];
} = {}): string => {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.trim();

  // Remove HTML if requested
  if (options.removeHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Remove scripts and dangerous content
  if (options.removeScripts !== false) {
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:/gi, '');
  }

  // Truncate if max length specified
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength).trim();
  }

  return sanitized;
};

// XSS protection
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) return false;
  return token === storedToken;
};

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove expired requests
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(identifier: string): number {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + this.windowMs;
  }
}

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, feedback: ['Password is required'], isStrong: false };
  }

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one lowercase letter');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one uppercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one number');
  }

  // Special character check
  if (/[@$!%*?&]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one special character (@$!%*?&)');
  }

  // Bonus points for length
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Check for common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /(.)\1{2,}/ // Repeated characters
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score -= 1;
      feedback.push('Avoid common patterns and repeated characters');
      break;
    }
  }

  return {
    score: Math.max(0, score),
    feedback,
    isStrong: score >= 4 && feedback.length === 0
  };
};

// Input validation functions
export const validateInput = {
  email: (email: string): boolean => ValidationPatterns.email.test(email),
  
  password: (password: string): boolean => {
    const strength = checkPasswordStrength(password);
    return strength.isStrong;
  },
  
  username: (username: string): boolean => ValidationPatterns.username.test(username),
  
  phone: (phone: string): boolean => ValidationPatterns.phone.test(phone),
  
  url: (url: string): boolean => ValidationPatterns.url.test(url),
  
  required: (value: string): boolean => Boolean(value && value.trim().length > 0),
  
  minLength: (value: string, min: number): boolean => value.length >= min,
  
  maxLength: (value: string, max: number): boolean => value.length <= max,
  
  custom: (value: string, pattern: RegExp): boolean => pattern.test(value)
};

// Secure storage helpers
export const secureStorage = {
  set: (key: string, value: any, encrypt: boolean = true): void => {
    try {
      const serialized = JSON.stringify(value);
      const toStore = encrypt ? btoa(serialized) : serialized;
      sessionStorage.setItem(key, toStore);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },

  get: (key: string, decrypt: boolean = true): any => {
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return null;
      
      const toDeserialize = decrypt ? atob(stored) : stored;
      return JSON.parse(toDeserialize);
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },

  remove: (key: string): void => {
    sessionStorage.removeItem(key);
  },

  clear: (): void => {
    sessionStorage.clear();
  }
};

// Content Security Policy helpers
export const CSPDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https://api.example.com"],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  upgradeInsecureRequests: true
};

export default {
  ValidationPatterns,
  sanitizeInput,
  escapeHtml,
  generateCSRFToken,
  validateCSRFToken,
  RateLimiter,
  checkPasswordStrength,
  validateInput,
  secureStorage,
  CSPDirectives
};