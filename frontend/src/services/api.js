import axios from 'axios';
import io from 'socket.io-client';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Socket.IO connection
let socket = null;

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Socket.IO management
export const initializeSocket = (userId) => {
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(SOCKET_URL, {
    auth: {
      token: getToken()
    }
  });
  
  socket.on('connect', () => {
    console.log('🔌 Connected to server');
    socket.emit('join', userId);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from server');
  });
  
  return socket;
};

export const getSocket = () => socket;

// Authentication API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      removeToken();
      if (socket) {
        socket.disconnect();
      }
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },

  getFollowers: async (userId, page = 1) => {
    const response = await api.get(`/users/${userId}/followers?page=${page}`);
    return response.data;
  },

  getFollowing: async (userId, page = 1) => {
    const response = await api.get(`/users/${userId}/following?page=${page}`);
    return response.data;
  },

  searchUsers: async (query, filters = {}) => {
    const response = await api.get('/users/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  getTrendingCreators: async (limit = 10) => {
    const response = await api.get(`/users/trending?limit=${limit}`);
    return response.data;
  }
};

// Messages API
export const messagesAPI = {
  getConversations: async (page = 1) => {
    const response = await api.get(`/messages/conversations?page=${page}`);
    return response.data;
  },

  getMessages: async (conversationId, page = 1) => {
    const response = await api.get(`/messages/conversations/${conversationId}?page=${page}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await api.post('/messages/send', messageData);
    return response.data;
  },

  shareCart: async (recipientId, cartId = null, message = null) => {
    const response = await api.post('/messages/share-cart', {
      recipientId,
      cartId,
      message
    });
    return response.data;
  },

  shareProduct: async (recipientId, productId, message = null) => {
    const response = await api.post('/messages/share-product', {
      recipientId,
      productId,
      message
    });
    return response.data;
  },

  addReaction: async (messageId, emoji) => {
    const response = await api.post(`/messages/${messageId}/reactions`, { emoji });
    return response.data;
  },

  editMessage: async (messageId, content) => {
    const response = await api.put(`/messages/${messageId}`, { content });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  searchMessages: async (query, conversationId = null) => {
    const response = await api.get('/messages/search', {
      params: { q: query, conversationId }
    });
    return response.data;
  }
};

// Cart API
export const cartAPI = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addItem: async (productId, quantity = 1, options = {}) => {
    const response = await api.post('/cart/items', {
      productId,
      quantity,
      ...options
    });
    return response.data;
  },

  updateItem: async (productId, quantity, selectedVariant = {}) => {
    const response = await api.put(`/cart/items/${productId}`, {
      quantity,
      selectedVariant
    });
    return response.data;
  },

  removeItem: async (productId, selectedVariant = {}) => {
    const response = await api.delete(`/cart/items/${productId}`, {
      data: { selectedVariant }
    });
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },

  applyDiscount: async (code) => {
    const response = await api.post('/cart/discounts', { code });
    return response.data;
  },

  removeDiscount: async (code) => {
    const response = await api.delete(`/cart/discounts/${code}`);
    return response.data;
  },

  saveForLater: async (productId, selectedVariant = {}) => {
    const response = await api.post('/cart/save-for-later', {
      productId,
      selectedVariant
    });
    return response.data;
  },

  moveToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart/move-to-cart', {
      productId,
      quantity
    });
    return response.data;
  },

  startCheckout: async (checkoutData) => {
    const response = await api.post('/cart/checkout', checkoutData);
    return response.data;
  },

  shareCart: async (userId, permissions = {}) => {
    const response = await api.post('/cart/share', { userId, permissions });
    return response.data;
  },

  getSharedCarts: async () => {
    const response = await api.get('/cart/shared');
    return response.data;
  },

  getCartAnalytics: async () => {
    const response = await api.get('/cart/analytics');
    return response.data;
  }
};

// Posts API
export const postsAPI = {
  getFeed: async (page = 1, algorithm = 'chronological') => {
    const response = await api.get(`/posts/feed?page=${page}&algorithm=${algorithm}`);
    return response.data;
  },

  getTrending: async (category = null, timeFrame = 24) => {
    const response = await api.get('/posts/trending', {
      params: { category, timeFrame }
    });
    return response.data;
  },

  getPost: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  unlikePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  },

  savePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/save`);
    return response.data;
  },

  unsavePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}/save`);
    return response.data;
  },

  searchPosts: async (query, filters = {}) => {
    const response = await api.get('/posts/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  }
};

// Products API
export const productsAPI = {
  getProduct: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  searchProducts: async (query, filters = {}) => {
    const response = await api.get('/products/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  getTrending: async (category = null, limit = 20) => {
    const response = await api.get('/products/trending', {
      params: { category, limit }
    });
    return response.data;
  },

  getRecommendations: async (userId = null, productId = null) => {
    const response = await api.get('/products/recommendations', {
      params: { userId, productId }
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  }
};

// Utility functions
export const uploadFile = async (file, type = 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Export the configured axios instance
export default api;

// Export utility functions
export { getToken, setToken, removeToken };