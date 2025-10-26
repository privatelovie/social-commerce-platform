import { EventEmitter } from 'events';
import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  currency: string;
  brand: string;
  category: string;
  subcategory?: string;
  sku: string;
  images: ProductImage[];
  thumbnail: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  tags: string[];
  attributes: ProductAttribute[];
  variants?: ProductVariant[];
  specifications: Record<string, any>;
  shipping: ShippingInfo;
  seller: Seller;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  purchaseCount: number;
  wishlistCount: number;
  shareCount: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
  type: 'text' | 'number' | 'color' | 'size' | 'boolean';
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku: string;
  inStock: boolean;
  attributes: ProductAttribute[];
  images: ProductImage[];
}

export interface ShippingInfo {
  isFree: boolean;
  cost: number;
  estimatedDays: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  restrictions?: string[];
}

export interface Seller {
  id: string;
  name: string;
  displayName: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  joinedDate: string;
  totalProducts: number;
  totalSales: number;
  location?: string;
  responseRate: number;
  responseTime: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
  replies?: ProductReviewReply[];
}

export interface ProductReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  isSeller: boolean;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: ProductCategory[];
  productCount: number;
  isActive: boolean;
  order: number;
}

export interface ProductSearchFilters {
  query?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  freeShipping?: boolean;
  tags?: string[];
  attributes?: Record<string, any>;
  sellerId?: string;
  sortBy?: 'relevance' | 'price' | 'rating' | 'newest' | 'popular' | 'discount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: Product[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  limit: number;
  filters: ProductSearchFilters;
  suggestions?: string[];
  facets?: ProductFacet[];
}

export interface ProductFacet {
  name: string;
  values: ProductFacetValue[];
}

export interface ProductFacetValue {
  value: string;
  count: number;
  selected: boolean;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
  notes?: string;
  priceAlert?: number;
}

export interface ComparisonItem {
  product: Product;
  addedAt: string;
}

export interface ProductAnalytics {
  viewCount: number;
  uniqueViews: number;
  conversionRate: number;
  averageRating: number;
  topReferrers: string[];
  popularKeywords: string[];
  demographicData: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
  };
  salesData: {
    totalSales: number;
    revenue: number;
    averageOrderValue: number;
    recentOrders: number;
  };
}

// Response types
interface ProductResponse extends ApiResponse {
  product?: Product;
}

interface ProductListResponse extends ApiResponse {
  products?: Product[];
  totalCount?: number;
  hasMore?: boolean;
}

interface ProductSearchResponse extends ApiResponse {
  result?: ProductSearchResult;
}

interface CategoryResponse extends ApiResponse {
  categories?: ProductCategory[];
}

interface ReviewResponse extends ApiResponse {
  reviews?: ProductReview[];
  totalCount?: number;
  averageRating?: number;
}

interface WishlistResponse extends ApiResponse {
  items?: WishlistItem[];
  totalCount?: number;
}

class ProductService extends EventEmitter {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
  }

  // Cache management
  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_DURATION
    });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Product CRUD operations
  async getProduct(productId: string, useCache: boolean = true): Promise<ProductResponse> {
    const cacheKey = this.getCacheKey('product', { productId });
    
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return { success: true, product: cached };
      }
    }

    try {
      const response = await apiClient.get<ProductResponse>(`/products/${productId}`);
      
      if (response.data.success && response.data.product) {
        this.setCache(cacheKey, response.data.product);
        
        // Track product view
        this.trackProductView(productId);
        
        this.emit('productViewed', response.data.product);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch product'
      };
    }
  }

  async searchProducts(filters: ProductSearchFilters): Promise<ProductSearchResponse> {
    const cacheKey = this.getCacheKey('search', filters);
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return { success: true, result: cached };
    }

    try {
      const response = await apiClient.post<ProductSearchResponse>('/products/search', filters);
      
      if (response.data.success && response.data.result) {
        this.setCache(cacheKey, response.data.result);
        this.emit('productsSearched', { filters, result: response.data.result });
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to search products'
      };
    }
  }

  async getFeaturedProducts(limit: number = 20): Promise<ProductListResponse> {
    const cacheKey = this.getCacheKey('featured', { limit });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return { success: true, products: cached };
    }

    try {
      const response = await apiClient.get<ProductListResponse>(`/products/featured?limit=${limit}`);
      
      if (response.data.success && response.data.products) {
        this.setCache(cacheKey, response.data.products);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch featured products'
      };
    }
  }

  async getRecommendedProducts(userId?: string, productId?: string, limit: number = 10): Promise<ProductListResponse> {
    const cacheKey = this.getCacheKey('recommended', { userId, productId, limit });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return { success: true, products: cached };
    }

    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (productId) params.append('productId', productId);
      params.append('limit', limit.toString());

      const response = await apiClient.get<ProductListResponse>(`/products/recommended?${params}`);
      
      if (response.data.success && response.data.products) {
        this.setCache(cacheKey, response.data.products);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch recommended products'
      };
    }
  }

  async getRelatedProducts(productId: string, limit: number = 10): Promise<ProductListResponse> {
    const cacheKey = this.getCacheKey('related', { productId, limit });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return { success: true, products: cached };
    }

    try {
      const response = await apiClient.get<ProductListResponse>(`/products/${productId}/related?limit=${limit}`);
      
      if (response.data.success && response.data.products) {
        this.setCache(cacheKey, response.data.products);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch related products'
      };
    }
  }

  // Category operations
  async getCategories(parentId?: string): Promise<CategoryResponse> {
    const cacheKey = this.getCacheKey('categories', { parentId });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return { success: true, categories: cached };
    }

    try {
      const params = parentId ? `?parentId=${parentId}` : '';
      const response = await apiClient.get<CategoryResponse>(`/products/categories${params}`);
      
      if (response.data.success && response.data.categories) {
        this.setCache(cacheKey, response.data.categories);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch categories'
      };
    }
  }

  // Review operations
  async getProductReviews(productId: string, page: number = 1, limit: number = 20): Promise<ReviewResponse> {
    try {
      const response = await apiClient.get<ReviewResponse>(
        `/products/${productId}/reviews?page=${page}&limit=${limit}`
      );
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch reviews'
      };
    }
  }

  async addProductReview(productId: string, review: {
    rating: number;
    title: string;
    content: string;
    images?: string[];
  }): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(`/products/${productId}/reviews`, review);
      
      if (response.data.success) {
        this.clearCache('reviews');
        this.emit('reviewAdded', { productId, review });
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to add review'
      };
    }
  }

  // Wishlist operations
  async getWishlist(page: number = 1, limit: number = 20): Promise<WishlistResponse> {
    try {
      const response = await apiClient.get<WishlistResponse>(
        `/user/wishlist?page=${page}&limit=${limit}`
      );
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch wishlist'
      };
    }
  }

  async addToWishlist(productId: string, notes?: string, priceAlert?: number): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/user/wishlist', {
        productId,
        notes,
        priceAlert
      });
      
      if (response.data.success) {
        this.emit('wishlistAdded', { productId, notes, priceAlert });
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to add to wishlist'
      };
    }
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete<ApiResponse>(`/user/wishlist/${productId}`);
      
      if (response.data.success) {
        this.emit('wishlistRemoved', { productId });
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to remove from wishlist'
      };
    }
  }

  async isInWishlist(productId: string): Promise<{ success: boolean; inWishlist: boolean; error?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; inWishlist: boolean }>(`/user/wishlist/${productId}/check`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        inWishlist: false,
        error: error.response?.data?.error || error.message || 'Failed to check wishlist status'
      };
    }
  }

  // Comparison operations
  async getComparison(): Promise<{ success: boolean; items: ComparisonItem[]; error?: string }> {
    try {
      const comparison = localStorage.getItem('productComparison');
      const items: ComparisonItem[] = comparison ? JSON.parse(comparison) : [];
      
      return { success: true, items };
    } catch (error: any) {
      return {
        success: false,
        items: [],
        error: 'Failed to get comparison items'
      };
    }
  }

  async addToComparison(product: Product): Promise<ApiResponse> {
    try {
      const comparison = localStorage.getItem('productComparison');
      const items: ComparisonItem[] = comparison ? JSON.parse(comparison) : [];
      
      // Check if already in comparison
      if (items.find(item => item.product.id === product.id)) {
        return {
          success: false,
          error: 'Product already in comparison'
        };
      }
      
      // Limit to 4 products
      if (items.length >= 4) {
        return {
          success: false,
          error: 'Maximum 4 products can be compared'
        };
      }
      
      items.push({
        product,
        addedAt: new Date().toISOString()
      });
      
      localStorage.setItem('productComparison', JSON.stringify(items));
      this.emit('comparisonAdded', { product });
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to add to comparison'
      };
    }
  }

  async removeFromComparison(productId: string): Promise<ApiResponse> {
    try {
      const comparison = localStorage.getItem('productComparison');
      const items: ComparisonItem[] = comparison ? JSON.parse(comparison) : [];
      
      const filteredItems = items.filter(item => item.product.id !== productId);
      localStorage.setItem('productComparison', JSON.stringify(filteredItems));
      
      this.emit('comparisonRemoved', { productId });
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to remove from comparison'
      };
    }
  }

  async clearComparison(): Promise<ApiResponse> {
    try {
      localStorage.removeItem('productComparison');
      this.emit('comparisonCleared');
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to clear comparison'
      };
    }
  }

  // Analytics and tracking
  private async trackProductView(productId: string): Promise<void> {
    try {
      await apiClient.post('/analytics/product-view', { productId });
    } catch (error) {
      // Silently fail analytics tracking
      console.warn('Failed to track product view:', error);
    }
  }

  async trackProductShare(productId: string, platform: string): Promise<void> {
    try {
      await apiClient.post('/analytics/product-share', { productId, platform });
      this.emit('productShared', { productId, platform });
    } catch (error) {
      console.warn('Failed to track product share:', error);
    }
  }

  async getProductAnalytics(productId: string): Promise<{ success: boolean; analytics?: ProductAnalytics; error?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; analytics: ProductAnalytics }>(
        `/products/${productId}/analytics`
      );
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch analytics'
      };
    }
  }

  // Utility methods
  calculateDiscount(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  generateProductUrl(product: Product): string {
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `/products/${product.id}/${slug}`;
  }

  getAverageRating(reviews: ProductReview[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  // Cleanup
  destroy(): void {
    this.removeAllListeners();
    this.cache.clear();
  }
}

// Create singleton instance
const productService = new ProductService();

export default productService;