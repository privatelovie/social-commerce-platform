// API Configuration for SocialCommerce Backend Integration

interface ApiConfig {
  baseURL: string;
  socketURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Environment-specific configurations
const environments = {
  development: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    socketURL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'https://api.socialcommerce.app/api',
    socketURL: process.env.REACT_APP_SOCKET_URL || 'https://api.socialcommerce.app',
    timeout: 15000,
    retryAttempts: 2,
    retryDelay: 2000,
  },
  test: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    socketURL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001',
    timeout: 5000,
    retryAttempts: 1,
    retryDelay: 500,
  }
};

// Get current environment
const getEnvironment = (): keyof typeof environments => {
  const env = process.env.NODE_ENV as keyof typeof environments;
  return env in environments ? env : 'development';
};

// Export current configuration
export const apiConfig: ApiConfig = environments[getEnvironment()];

// API Endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    googleLogin: '/auth/google',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
    updateProfile: '/auth/profile',
  },
  
  // Users & Social
  users: {
    profile: (id: string) => `/users/${id}`,
    follow: (id: string) => `/users/${id}/follow`,
    unfollow: (id: string) => `/users/${id}/unfollow`,
    followers: (id: string) => `/users/${id}/followers`,
    following: (id: string) => `/users/${id}/following`,
    search: '/users/search',
  },
  
  // Posts & Feed
  posts: {
    feed: '/posts/feed',
    create: '/posts',
    like: (id: string) => `/posts/${id}/like`,
    unlike: (id: string) => `/posts/${id}/unlike`,
    comment: (id: string) => `/posts/${id}/comments`,
    share: (id: string) => `/posts/${id}/share`,
    details: (id: string) => `/posts/${id}`,
  },
  
  // Video Reels
  videos: {
    feed: '/videos/feed',
    upload: '/videos/upload',
    like: (id: string) => `/videos/${id}/like`,
    unlike: (id: string) => `/videos/${id}/unlike`,
    comment: (id: string) => `/videos/${id}/comments`,
    share: (id: string) => `/videos/${id}/share`,
    details: (id: string) => `/videos/${id}`,
    trending: '/videos/trending',
  },
  
  // Messaging
  messages: {
    conversations: '/messages/conversations',
    conversation: (id: string) => `/messages/conversations/${id}`,
    send: '/messages/send',
    shareCart: '/messages/share-cart',
    shareProduct: '/messages/share-product',
    markRead: (conversationId: string) => `/messages/conversations/${conversationId}/read`,
  },
  
  // Products & Shopping
  products: {
    search: '/products/search',
    details: (id: string) => `/products/${id}`,
    trending: '/products/trending',
    categories: '/products/categories',
    recommendations: '/products/recommendations',
  },
  
  // Cart & Orders
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    remove: '/cart/remove',
    clear: '/cart/clear',
    share: '/cart/share',
    checkout: '/cart/checkout',
  },
  
  // Favorites/Wishlist
  favorites: {
    get: '/favorites',
    add: '/favorites/add',
    remove: '/favorites/remove',
    toggle: (productId: string) => `/favorites/toggle/${productId}`,
  },
  
  // Analytics & Tracking
  analytics: {
    track: '/analytics/track',
    videoView: '/analytics/video/view',
    productView: '/analytics/product/view',
    engagement: '/analytics/engagement',
  },
  
  // Notifications
  notifications: {
    get: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    settings: '/notifications/settings',
  }
};

// HTTP Headers
export const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Request interceptor for adding auth token
export const addAuthHeader = (config: any) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
};

// Response interceptor for handling auth errors
export const handleAuthError = (error: any) => {
  if (error.response?.status === 401) {
    // Clear invalid token and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

// Utility function to build full URL
export const buildURL = (endpoint: string): string => {
  return `${apiConfig.baseURL}${endpoint}`;
};

// WebSocket configuration
export const socketConfig = {
  url: apiConfig.socketURL,
  options: {
    transports: ['websocket'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  }
};

export default apiConfig;