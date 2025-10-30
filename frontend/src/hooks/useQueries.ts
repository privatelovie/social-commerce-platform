import { 
  useQuery, 
  useMutation, 
  useInfiniteQuery, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions
} from '@tanstack/react-query';

// Import services
import authService from '../services/authService';
import productService, { Product, ProductSearchFilters } from '../services/productService';
import cartService from '../services/cartService';
import messagingService from '../services/messagingService';

// Import query keys and utilities
import { queryKeys, mutationKeys, invalidateQueries } from '../config/queryClient';

// Type definitions for better TypeScript support
type QueryOptions<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;
type MutationOptions<T, V> = Omit<UseMutationOptions<T, Error, V>, 'mutationFn'>;
type InfiniteQueryOptions<T> = Omit<UseInfiniteQueryOptions<T>, 'queryKey' | 'queryFn'>;

// =============================================================================
// USER QUERIES
// =============================================================================

export const useUserProfile = (userId?: string, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.user.profile(userId),
    queryFn: () => authService.getProfile(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  });
};

export const useCurrentUser = (options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => authService.getProfile(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options
  });
};

export const useUserSearch = (query: string, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.user.search(query),
    queryFn: () => messagingService.searchUsers(query),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 30, // 30 seconds
    ...options
  });
};

// =============================================================================
// USER MUTATIONS
// =============================================================================

export const useLogin = (options?: MutationOptions<any, { email: string; password: string }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: [mutationKeys.user.login],
    mutationFn: ({ email, password }) => authService.login({ email, password }),
    onSuccess: () => {
      // Invalidate user queries after successful login
      invalidateQueries.user();
    },
    ...options
  });
};

export const useLogout = (options?: MutationOptions<any, void>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: [mutationKeys.user.logout],
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cache on logout
      queryClient.clear();
    },
    ...options
  });
};

export const useUpdateProfile = (options?: MutationOptions<any, any>) => {
  return useMutation({
    mutationKey: [mutationKeys.user.updateProfile],
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: () => {
      // Invalidate user profile queries
      invalidateQueries.user();
    },
    ...options
  });
};

// =============================================================================
// PRODUCT QUERIES
// =============================================================================

export const useProduct = (productId: string, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.product.detail(productId),
    queryFn: () => productService.getProduct(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options
  });
};

export const useProductSearch = (filters: ProductSearchFilters, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.product.search(filters),
    queryFn: () => productService.searchProducts(filters),
    staleTime: 1000 * 60, // 1 minute
    ...options
  });
};

export const useFeaturedProducts = (limit?: number, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.product.featured(limit),
    queryFn: () => productService.getFeaturedProducts(limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options
  });
};

export const useRecommendedProducts = (
  userId?: string, 
  productId?: string, 
  options?: QueryOptions<any>
) => {
  return useQuery({
    queryKey: queryKeys.product.recommended(userId, productId),
    queryFn: () => productService.getRecommendedProducts(userId, productId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  });
};

export const useRelatedProducts = (productId: string, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.product.related(productId),
    queryFn: () => productService.getRelatedProducts(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options
  });
};

export const useProductCategories = (parentId?: string, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.product.categories(parentId),
    queryFn: () => productService.getCategories(parentId),
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options
  });
};

export const useProductReviews = (
  productId: string, 
  page: number = 1, 
  options?: QueryOptions<any>
) => {
  return useQuery({
    queryKey: queryKeys.product.reviews(productId, page),
    queryFn: () => productService.getProductReviews(productId, page),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  });
};

// =============================================================================
// PRODUCT MUTATIONS
// =============================================================================

export const useAddToWishlist = (options?: MutationOptions<any, string>) => {
  return useMutation({
    mutationKey: [mutationKeys.product.addToWishlist],
    mutationFn: (productId) => productService.addToWishlist(productId),
    onSuccess: () => {
      invalidateQueries.wishlist();
    },
    ...options
  });
};

export const useRemoveFromWishlist = (options?: MutationOptions<any, string>) => {
  return useMutation({
    mutationKey: [mutationKeys.product.removeFromWishlist],
    mutationFn: (productId) => productService.removeFromWishlist(productId),
    onSuccess: () => {
      invalidateQueries.wishlist();
    },
    ...options
  });
};

export const useAddProductReview = (options?: MutationOptions<any, { productId: string; review: any }>) => {
  return useMutation({
    mutationKey: [mutationKeys.product.addReview],
    mutationFn: ({ productId, review }) => productService.addProductReview(productId, review),
    onSuccess: (_, { productId }) => {
      // Invalidate product details and reviews
      invalidateQueries.productDetail(productId);
      invalidateQueries.product();
    },
    ...options
  });
};

// =============================================================================
// CART QUERIES
// =============================================================================

export const useCart = (options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.cart.current(),
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    ...options
  });
};

export const useShippingOptions = (address?: any, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.cart.shipping(address),
    queryFn: () => cartService.getShippingOptions(address!),
    enabled: !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  });
};

// =============================================================================
// CART MUTATIONS
// =============================================================================

export const useAddToCart = (options?: MutationOptions<any, { productId: string; quantity?: number; variantId?: string }>) => {
  return useMutation({
    mutationKey: [mutationKeys.cart.addItem],
    mutationFn: ({ productId, quantity = 1, variantId }) => 
      cartService.addItem(productId, quantity, variantId),
    onSuccess: () => {
      invalidateQueries.cart();
    },
    ...options
  });
};

export const useUpdateCartItem = (options?: MutationOptions<any, { itemId: string; quantity: number }>) => {
  return useMutation({
    mutationKey: [mutationKeys.cart.updateItem],
    mutationFn: ({ itemId, quantity }) => cartService.updateItem(itemId, quantity),
    onSuccess: () => {
      invalidateQueries.cart();
    },
    ...options
  });
};

export const useRemoveFromCart = (options?: MutationOptions<any, string>) => {
  return useMutation({
    mutationKey: [mutationKeys.cart.removeItem],
    mutationFn: (itemId) => cartService.removeItem(itemId),
    onSuccess: () => {
      invalidateQueries.cart();
    },
    ...options
  });
};

export const useClearCart = (options?: MutationOptions<any, void>) => {
  return useMutation({
    mutationKey: [mutationKeys.cart.clear],
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      invalidateQueries.cart();
    },
    ...options
  });
};

export const useApplyCoupon = (options?: MutationOptions<any, string>) => {
  return useMutation({
    mutationKey: [mutationKeys.cart.applyCoupon],
    mutationFn: (code) => cartService.applyCoupon(code),
    onSuccess: () => {
      invalidateQueries.cart();
    },
    ...options
  });
};

export const useCheckout = (options?: MutationOptions<any, any>) => {
  return useMutation({
    mutationKey: [mutationKeys.cart.checkout],
    mutationFn: (checkoutData) => cartService.checkout(checkoutData),
    onSuccess: () => {
      // Invalidate cart and orders
      invalidateQueries.cart();
      invalidateQueries.orders();
    },
    ...options
  });
};

// =============================================================================
// WISHLIST QUERIES
// =============================================================================

export const useWishlist = (page: number = 1, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.wishlist.items(page),
    queryFn: () => productService.getWishlist(page),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options
  });
};

export const useIsInWishlist = (productId: string, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.wishlist.check(productId),
    queryFn: () => productService.isInWishlist(productId),
    enabled: !!productId,
    staleTime: 1000 * 60, // 1 minute
    ...options
  });
};

// =============================================================================
// ORDER QUERIES
// =============================================================================

export const useOrders = (page: number = 1, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.order.list(page),
    queryFn: () => cartService.getOrders(page),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  });
};

export const useOrder = (orderId: string, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.order.detail(orderId),
    queryFn: () => cartService.getOrder(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options
  });
};

export const useOrderTracking = (orderId: string, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.order.tracking(orderId),
    queryFn: () => cartService.trackOrder(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
    ...options
  });
};

// =============================================================================
// ORDER MUTATIONS
// =============================================================================

export const useCancelOrder = (options?: MutationOptions<any, { orderId: string; reason?: string }>) => {
  return useMutation({
    mutationKey: [mutationKeys.order.cancel],
    mutationFn: ({ orderId, reason }) => cartService.cancelOrder(orderId, reason),
    onSuccess: () => {
      invalidateQueries.orders();
    },
    ...options
  });
};

// =============================================================================
// MESSAGING QUERIES
// =============================================================================

export const useConversations = (options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.messaging.conversations(),
    queryFn: () => messagingService.getConversations(),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    ...options
  });
};

export const useConversation = (conversationId: string, options?: QueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.messaging.conversation(conversationId),
    queryFn: () => messagingService.getConversation(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
    ...options
  });
};

// =============================================================================
// MESSAGING MUTATIONS
// =============================================================================

export const useSendMessage = (options?: MutationOptions<any, { conversationId: string; data: any }>) => {
  return useMutation({
    mutationKey: [mutationKeys.messaging.sendMessage],
    mutationFn: ({ conversationId, data }) => messagingService.sendMessage(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      // Invalidate conversation and messages
      invalidateQueries.conversation(conversationId);
      invalidateQueries.messaging();
    },
    ...options
  });
};

export const useCreateConversation = (options?: MutationOptions<any, any>) => {
  return useMutation({
    mutationKey: [mutationKeys.messaging.createConversation],
    mutationFn: (data) => messagingService.createConversation(data),
    onSuccess: () => {
      invalidateQueries.messaging();
    },
    ...options
  });
};

// =============================================================================
// INFINITE QUERIES FOR PAGINATION
// =============================================================================

export const useInfiniteProducts = (
  filters: ProductSearchFilters,
  options?: InfiniteQueryOptions<any>
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.product.search(filters),
    queryFn: ({ pageParam = 1 }) => 
      productService.searchProducts({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.result?.hasMore) {
        return pages.length + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60, // 1 minute
    ...options
  });
};

export const useInfiniteOrders = (options?: InfiniteQueryOptions<any>) => {
  return useInfiniteQuery({
    queryKey: queryKeys.order.list(),
    queryFn: ({ pageParam = 1 }) => cartService.getOrders(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.hasMore) {
        return pages.length + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  });
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

export const useQueryClientUtils = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateQueries,
    queryClient,
    prefetchProduct: (productId: string) => {
      return queryClient.prefetchQuery({
        queryKey: queryKeys.product.detail(productId),
        queryFn: () => productService.getProduct(productId),
        staleTime: 1000 * 60 * 10
      });
    },
    getProductFromCache: (productId: string) => {
      return queryClient.getQueryData(queryKeys.product.detail(productId));
    },
    setProductInCache: (productId: string, data: any) => {
      queryClient.setQueryData(queryKeys.product.detail(productId), data);
    }
  };
};