import { QueryClient, QueryCache, MutationCache, DefaultOptions } from '@tanstack/react-query';
import { handleError } from '../services/errorService';
import ErrorUtils, { ErrorType, ErrorSeverity } from '../utils/errorUtils';

// Default query options
const defaultOptions: DefaultOptions = {
  queries: {
    // Cache time (how long data stays in memory when unused)
    gcTime: 1000 * 60 * 5, // 5 minutes
    
    // Stale time (how long data is considered fresh)
    staleTime: 1000 * 60 * 2, // 2 minutes
    
    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on certain error types
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      
      // Don't retry validation errors
      if (error?.response?.status === 400) {
        return false;
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus for critical data
    refetchOnWindowFocus: true,
    
    // Refetch on mount if data is stale
    refetchOnMount: true,
    
    // Don't refetch on reconnect by default (can be overridden)
    refetchOnReconnect: true,
    
    // Network mode
    networkMode: 'online',
  },
  
  mutations: {
    // Retry mutations once
    retry: 1,
    
    // Network mode for mutations
    networkMode: 'online',
  }
};

// Query cache for handling query errors
const queryCache = new QueryCache({
  onError: (error: any, query) => {
    const appError = ErrorUtils.normalizeError(error, {
      queryKey: query.queryKey,
      queryHash: query.queryHash,
      type: 'query'
    });
    
    // Only show user-facing errors for certain severities
    if (appError.severity === ErrorSeverity.HIGH || appError.severity === ErrorSeverity.CRITICAL) {
      handleError(appError, {
        toast: true,
        console: true,
        report: true
      });
    } else {
      // Log other errors without showing toast
      handleError(appError, {
        toast: false,
        console: true,
        report: false
      });
    }
  }
});

// Mutation cache for handling mutation errors
const mutationCache = new MutationCache({
  onError: (error: any, variables, context, mutation) => {
    const appError = ErrorUtils.normalizeError(error, {
      mutationKey: mutation.options.mutationKey,
      variables,
      type: 'mutation'
    });
    
    // Show all mutation errors to users since they're usually action-related
    handleError(appError, {
      toast: true,
      console: true,
      report: appError.severity === ErrorSeverity.HIGH || appError.severity === ErrorSeverity.CRITICAL
    });
  },
  
  onSuccess: (data, variables, context, mutation) => {
    // Log successful mutations in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Mutation succeeded:', mutation.options.mutationKey, data);
    }
  }
});

// Create the query client
const queryClient = new QueryClient({
  defaultOptions,
  queryCache,
  mutationCache
});

// Query key factory for consistent key generation
export const queryKeys = {
  // User-related queries
  user: {
    all: ['users'] as const,
    profile: (userId?: string) => [...queryKeys.user.all, 'profile', userId] as const,
    me: () => [...queryKeys.user.all, 'me'] as const,
    search: (query: string) => [...queryKeys.user.all, 'search', query] as const,
  },
  
  // Product-related queries
  product: {
    all: ['products'] as const,
    detail: (productId: string) => [...queryKeys.product.all, 'detail', productId] as const,
    search: (filters: any) => [...queryKeys.product.all, 'search', filters] as const,
    featured: (limit?: number) => [...queryKeys.product.all, 'featured', limit] as const,
    recommended: (userId?: string, productId?: string) => 
      [...queryKeys.product.all, 'recommended', userId, productId] as const,
    related: (productId: string) => [...queryKeys.product.all, 'related', productId] as const,
    categories: (parentId?: string) => [...queryKeys.product.all, 'categories', parentId] as const,
    reviews: (productId: string, page?: number) => 
      [...queryKeys.product.all, 'reviews', productId, page] as const,
  },
  
  // Cart-related queries
  cart: {
    all: ['cart'] as const,
    current: () => [...queryKeys.cart.all, 'current'] as const,
    shipping: (address?: any) => [...queryKeys.cart.all, 'shipping', address] as const,
  },
  
  // Wishlist queries
  wishlist: {
    all: ['wishlist'] as const,
    items: (page?: number) => [...queryKeys.wishlist.all, 'items', page] as const,
    check: (productId: string) => [...queryKeys.wishlist.all, 'check', productId] as const,
  },
  
  // Order queries
  order: {
    all: ['orders'] as const,
    list: (page?: number) => [...queryKeys.order.all, 'list', page] as const,
    detail: (orderId: string) => [...queryKeys.order.all, 'detail', orderId] as const,
    tracking: (orderId: string) => [...queryKeys.order.all, 'tracking', orderId] as const,
  },
  
  // Messaging queries
  messaging: {
    all: ['messaging'] as const,
    conversations: () => [...queryKeys.messaging.all, 'conversations'] as const,
    conversation: (conversationId: string) => 
      [...queryKeys.messaging.all, 'conversation', conversationId] as const,
    messages: (conversationId: string) => 
      [...queryKeys.messaging.all, 'messages', conversationId] as const,
    search: (query: string) => [...queryKeys.messaging.all, 'search', query] as const,
  },
  
  // Social queries
  social: {
    all: ['social'] as const,
    feed: (page?: number) => [...queryKeys.social.all, 'feed', page] as const,
    post: (postId: string) => [...queryKeys.social.all, 'post', postId] as const,
    comments: (postId: string) => [...queryKeys.social.all, 'comments', postId] as const,
    followers: (userId: string) => [...queryKeys.social.all, 'followers', userId] as const,
    following: (userId: string) => [...queryKeys.social.all, 'following', userId] as const,
  }
};

// Mutation keys
export const mutationKeys = {
  // User mutations
  user: {
    login: 'user:login',
    register: 'user:register',
    logout: 'user:logout',
    updateProfile: 'user:updateProfile',
    uploadAvatar: 'user:uploadAvatar',
  },
  
  // Product mutations
  product: {
    addReview: 'product:addReview',
    addToWishlist: 'product:addToWishlist',
    removeFromWishlist: 'product:removeFromWishlist',
    addToComparison: 'product:addToComparison',
    removeFromComparison: 'product:removeFromComparison',
  },
  
  // Cart mutations
  cart: {
    addItem: 'cart:addItem',
    updateItem: 'cart:updateItem',
    removeItem: 'cart:removeItem',
    clear: 'cart:clear',
    applyCoupon: 'cart:applyCoupon',
    removeCoupon: 'cart:removeCoupon',
    checkout: 'cart:checkout',
  },
  
  // Order mutations
  order: {
    create: 'order:create',
    cancel: 'order:cancel',
    return: 'order:return',
  },
  
  // Messaging mutations
  messaging: {
    sendMessage: 'messaging:sendMessage',
    createConversation: 'messaging:createConversation',
    markAsRead: 'messaging:markAsRead',
    deleteMessage: 'messaging:deleteMessage',
    updateMessage: 'messaging:updateMessage',
  },
  
  // Social mutations
  social: {
    createPost: 'social:createPost',
    likePost: 'social:likePost',
    sharePost: 'social:sharePost',
    createComment: 'social:createComment',
    follow: 'social:follow',
    unfollow: 'social:unfollow',
  }
};

// Cache invalidation helpers
export const invalidateQueries = {
  // Invalidate all user queries
  user: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.all }),
  
  // Invalidate all product queries
  product: () => queryClient.invalidateQueries({ queryKey: queryKeys.product.all }),
  
  // Invalidate specific product
  productDetail: (productId: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.product.detail(productId) }),
  
  // Invalidate cart
  cart: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),
  
  // Invalidate wishlist
  wishlist: () => queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all }),
  
  // Invalidate orders
  orders: () => queryClient.invalidateQueries({ queryKey: queryKeys.order.all }),
  
  // Invalidate messaging
  messaging: () => queryClient.invalidateQueries({ queryKey: queryKeys.messaging.all }),
  
  // Invalidate conversation
  conversation: (conversationId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversation(conversationId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.messaging.messages(conversationId) });
  },
  
  // Invalidate social content
  social: () => queryClient.invalidateQueries({ queryKey: queryKeys.social.all }),
};

// Prefetch helpers
export const prefetchQueries = {
  // Prefetch user profile
  userProfile: (userId: string) => 
    queryClient.prefetchQuery({
      queryKey: queryKeys.user.profile(userId),
      queryFn: () => {
        // This would be replaced with actual API call
        return Promise.resolve(null);
      },
      staleTime: 1000 * 60 * 5 // 5 minutes
    }),
  
  // Prefetch product details
  productDetail: (productId: string) => 
    queryClient.prefetchQuery({
      queryKey: queryKeys.product.detail(productId),
      queryFn: () => {
        // This would be replaced with actual API call
        return Promise.resolve(null);
      },
      staleTime: 1000 * 60 * 10 // 10 minutes for product details
    }),
};

// Cache management utilities
export const cacheUtils = {
  // Get cache size
  getCacheSize: () => {
    const queries = queryClient.getQueryCache().getAll();
    return queries.length;
  },
  
  // Clear all cache
  clearAll: () => {
    queryClient.clear();
  },
  
  // Clear stale queries
  clearStale: () => {
    queryClient.getQueryCache().clear();
  },
  
  // Get cache statistics
  getStats: () => {
    const queries = queryClient.getQueryCache().getAll();
    const mutations = queryClient.getMutationCache().getAll();
    
    return {
      totalQueries: queries.length,
      totalMutations: mutations.length,
      freshQueries: queries.filter(q => q.isStale() === false).length,
      staleQueries: queries.filter(q => q.isStale() === true).length,
      fetchingQueries: queries.filter(q => q.isFetching()).length,
    };
  },
  
  // Force refresh specific query
  forceRefresh: (queryKey: any[]) => {
    return queryClient.refetchQueries({ queryKey });
  }
};

export default queryClient;