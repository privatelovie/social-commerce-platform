import { EventEmitter } from 'events';
import apiClient from './apiClient';
import { ApiResponse } from './apiClient';
import { Product } from './productService';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  personalizedPrice?: number;
  addedAt: string;
  updatedAt: string;
  giftWrap?: GiftWrapOptions;
  customization?: CustomizationOptions;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
}

export interface GiftWrapOptions {
  enabled: boolean;
  type: 'standard' | 'premium' | 'custom';
  message?: string;
  cost: number;
}

export interface CustomizationOptions {
  text?: string;
  color?: string;
  size?: string;
  engraving?: string;
  additionalCost: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  currency: string;
  appliedCoupons: AppliedCoupon[];
  shippingDetails: ShippingDetails;
  estimatedDelivery?: string;
  saveForLater: CartItem[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface AppliedCoupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  discount: number;
  description: string;
  appliedAt: string;
}

export interface ShippingDetails {
  method: string;
  cost: number;
  estimatedDays: number;
  trackingAvailable: boolean;
  isFree: boolean;
  options: ShippingOption[];
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
  trackingAvailable: boolean;
  isDefault: boolean;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  instructions?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  nickname?: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageCount: number;
  maxUsage?: number;
  expiresAt?: string;
  isActive: boolean;
  categories?: string[];
  products?: string[];
}

export interface CheckoutData {
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  shippingOption: ShippingOption;
  giftMessage?: string;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingDetails: ShippingDetails;
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  refunds?: Refund[];
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  quantity: number;
  price: number;
  total: number;
  status: OrderItemStatus;
  tracking?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

export interface Refund {
  id: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  processedAt?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export type OrderItemStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export type RefundStatus = 
  | 'pending' 
  | 'approved' 
  | 'processed' 
  | 'rejected';

// Response types
interface CartResponse extends ApiResponse {
  cart?: Cart;
}

interface CouponResponse extends ApiResponse {
  coupon?: Coupon;
  discount?: number;
}

interface ShippingResponse extends ApiResponse {
  options?: ShippingOption[];
}

interface CheckoutResponse extends ApiResponse {
  order?: Order;
  paymentIntent?: string;
  clientSecret?: string;
}

interface OrderResponse extends ApiResponse {
  order?: Order;
}

interface OrderListResponse extends ApiResponse {
  orders?: Order[];
  totalCount?: number;
  hasMore?: boolean;
}

class CartService extends EventEmitter {
  private cart: Cart | null = null;
  private syncTimeout: NodeJS.Timeout | null = null;
  private readonly SYNC_DELAY = 1000; // 1 second debounce

  constructor() {
    super();
    this.loadCartFromStorage();
  }

  // Cart management
  async getCart(): Promise<CartResponse> {
    try {
      const response = await apiClient.get<CartResponse>('/cart');
      
      if (response.data.success && response.data.cart) {
        this.cart = response.data.cart;
        this.saveCartToStorage();
        this.emit('cartUpdated', this.cart);
      }
      
      return response.data;
    } catch (error: any) {
      // If API fails, return cached cart
      if (this.cart) {
        return { success: true, cart: this.cart };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch cart'
      };
    }
  }

  async addItem(productId: string, quantity: number = 1, variantId?: string, customization?: CustomizationOptions): Promise<CartResponse> {
    try {
      // Optimistic update
      if (this.cart) {
        const existingItem = this.cart.items.find(item => 
          item.productId === productId && item.variantId === variantId
        );
        
        if (existingItem) {
          existingItem.quantity += quantity;
          existingItem.updatedAt = new Date().toISOString();
        }
        
        this.updateCartTotals();
        this.emit('cartUpdated', this.cart);
      }

      const response = await apiClient.post<CartResponse>('/cart/items', {
        productId,
        quantity,
        variantId,
        customization
      });
      
      if (response.data.success && response.data.cart) {
        this.cart = response.data.cart;
        this.saveCartToStorage();
        this.emit('itemAdded', { productId, quantity, variantId });
        this.emit('cartUpdated', this.cart);
      }
      
      return response.data;
    } catch (error: any) {
      // Revert optimistic update on error
      await this.getCart();
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to add item to cart'
      };
    }
  }

  async updateItem(itemId: string, quantity: number): Promise<CartResponse> {
    try {
      // Optimistic update
      if (this.cart) {
        const item = this.cart.items.find(item => item.id === itemId);
        if (item) {
          item.quantity = quantity;
          item.updatedAt = new Date().toISOString();
          this.updateCartTotals();
          this.emit('cartUpdated', this.cart);
        }
      }

      const response = await apiClient.put<CartResponse>(`/cart/items/${itemId}`, { quantity });
      
      if (response.data.success && response.data.cart) {
        this.cart = response.data.cart;
        this.saveCartToStorage();
        this.emit('itemUpdated', { itemId, quantity });
        this.emit('cartUpdated', this.cart);
      }
      
      return response.data;
    } catch (error: any) {
      // Revert optimistic update on error
      await this.getCart();
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update cart item'
      };
    }
  }

  async removeItem(itemId: string): Promise<CartResponse> {
    try {
      // Optimistic update
      if (this.cart) {
        this.cart.items = this.cart.items.filter(item => item.id !== itemId);
        this.updateCartTotals();
        this.emit('cartUpdated', this.cart);
      }

      const response = await apiClient.delete<CartResponse>(`/cart/items/${itemId}`);
      
      if (response.data.success && response.data.cart) {
        this.cart = response.data.cart;
        this.saveCartToStorage();
        this.emit('itemRemoved', { itemId });
        this.emit('cartUpdated', this.cart);
      }
      
      return response.data;
    } catch (error: any) {
      // Revert optimistic update on error
      await this.getCart();
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to remove item from cart'
      };
    }
  }

  async clearCart(): Promise<CartResponse> {
    try {
      const response = await apiClient.delete<CartResponse>('/cart');
      
      if (response.data.success) {
        this.cart = null;
        this.clearCartStorage();
        this.emit('cartCleared');
        this.emit('cartUpdated', null);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to clear cart'
      };
    }
  }

  // Save for later
  async saveForLater(itemId: string): Promise<CartResponse> {
    try {
      const response = await apiClient.post<CartResponse>(`/cart/items/${itemId}/save-for-later`);
      
      if (response.data.success && response.data.cart) {
        this.cart = response.data.cart;
        this.saveCartToStorage();
        this.emit('itemSavedForLater', { itemId });
        this.emit('cartUpdated', this.cart);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to save item for later'
      };
    }
  }

  async moveToCart(itemId: string): Promise<CartResponse> {
    try {
      const response = await apiClient.post<CartResponse>(`/cart/saved-items/${itemId}/move-to-cart`);
      
      if (response.data.success && response.data.cart) {
        this.cart = response.data.cart;
        this.saveCartToStorage();
        this.emit('itemMovedToCart', { itemId });
        this.emit('cartUpdated', this.cart);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to move item to cart'
      };
    }
  }

  // Coupon management
  async applyCoupon(code: string): Promise<CouponResponse> {
    try {
      const response = await apiClient.post<CouponResponse>('/cart/coupons', { code });
      
      if (response.data.success) {
        await this.getCart(); // Refresh cart with new totals
        this.emit('couponApplied', { code, discount: response.data.discount });
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to apply coupon'
      };
    }
  }

  async removeCoupon(couponId: string): Promise<CartResponse> {
    try {
      const response = await apiClient.delete<CartResponse>(`/cart/coupons/${couponId}`);
      
      if (response.data.success && response.data.cart) {
        this.cart = response.data.cart;
        this.saveCartToStorage();
        this.emit('couponRemoved', { couponId });
        this.emit('cartUpdated', this.cart);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to remove coupon'
      };
    }
  }

  // Shipping
  async getShippingOptions(address: Address): Promise<ShippingResponse> {
    try {
      const response = await apiClient.post<ShippingResponse>('/cart/shipping-options', { address });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch shipping options'
      };
    }
  }

  async selectShippingOption(optionId: string): Promise<CartResponse> {
    try {
      const response = await apiClient.post<CartResponse>('/cart/shipping', { optionId });
      
      if (response.data.success && response.data.cart) {
        this.cart = response.data.cart;
        this.saveCartToStorage();
        this.emit('shippingSelected', { optionId });
        this.emit('cartUpdated', this.cart);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to select shipping option'
      };
    }
  }

  // Checkout
  async checkout(checkoutData: CheckoutData): Promise<CheckoutResponse> {
    try {
      const response = await apiClient.post<CheckoutResponse>('/cart/checkout', checkoutData);
      
      if (response.data.success) {
        // Clear cart after successful checkout
        this.cart = null;
        this.clearCartStorage();
        this.emit('checkoutComplete', response.data.order);
        this.emit('cartUpdated', null);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to complete checkout'
      };
    }
  }

  // Order management
  async getOrders(page: number = 1, limit: number = 20): Promise<OrderListResponse> {
    try {
      const response = await apiClient.get<OrderListResponse>(`/orders?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch orders'
      };
    }
  }

  async getOrder(orderId: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch order'
      };
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.post<OrderResponse>(`/orders/${orderId}/cancel`, { reason });
      
      if (response.data.success) {
        this.emit('orderCancelled', { orderId, reason });
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to cancel order'
      };
    }
  }

  async trackOrder(orderId: string): Promise<{ success: boolean; tracking?: any; error?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; tracking: any }>(`/orders/${orderId}/tracking`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to track order'
      };
    }
  }

  // Wishlist integration
  async moveWishlistItemToCart(wishlistItemId: string, quantity: number = 1): Promise<CartResponse> {
    try {
      const response = await apiClient.post<CartResponse>('/cart/from-wishlist', {
        wishlistItemId,
        quantity
      });
      
      if (response.data.success && response.data.cart) {
        this.cart = response.data.cart;
        this.saveCartToStorage();
        this.emit('wishlistItemMoved', { wishlistItemId, quantity });
        this.emit('cartUpdated', this.cart);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to move wishlist item to cart'
      };
    }
  }

  // Sharing
  async shareCart(platform: string, message?: string): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; shareUrl: string }>('/cart/share', {
        platform,
        message
      });
      
      if (response.data.success) {
        this.emit('cartShared', { platform, shareUrl: response.data.shareUrl });
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to share cart'
      };
    }
  }

  // Local storage management
  private loadCartFromStorage(): void {
    try {
      const stored = localStorage.getItem('cart');
      if (stored) {
        this.cart = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load cart from storage:', error);
      this.clearCartStorage();
    }
  }

  private saveCartToStorage(): void {
    try {
      if (this.cart) {
        localStorage.setItem('cart', JSON.stringify(this.cart));
      } else {
        this.clearCartStorage();
      }
    } catch (error) {
      console.warn('Failed to save cart to storage:', error);
    }
  }

  private clearCartStorage(): void {
    try {
      localStorage.removeItem('cart');
    } catch (error) {
      console.warn('Failed to clear cart storage:', error);
    }
  }

  // Utility methods
  private updateCartTotals(): void {
    if (!this.cart) return;

    this.cart.totalItems = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cart.subtotal = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Recalculate total (simplified - would be more complex with taxes, shipping, etc.)
    this.cart.total = this.cart.subtotal - this.cart.discount + this.cart.tax + this.cart.shippingCost;
    
    this.debouncedSync();
  }

  private debouncedSync(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    
    this.syncTimeout = setTimeout(() => {
      this.syncWithServer();
    }, this.SYNC_DELAY);
  }

  private async syncWithServer(): Promise<void> {
    try {
      await this.getCart();
    } catch (error) {
      console.warn('Failed to sync cart with server:', error);
    }
  }

  // Public getters
  getCurrentCart(): Cart | null {
    return this.cart;
  }

  getItemCount(): number {
    return this.cart?.totalItems || 0;
  }

  getSubtotal(): number {
    return this.cart?.subtotal || 0;
  }

  getTotal(): number {
    return this.cart?.total || 0;
  }

  hasItems(): boolean {
    return (this.cart?.items.length || 0) > 0;
  }

  isItemInCart(productId: string, variantId?: string): boolean {
    if (!this.cart) return false;
    
    return this.cart.items.some(item => 
      item.productId === productId && item.variantId === variantId
    );
  }

  getItemQuantity(productId: string, variantId?: string): number {
    if (!this.cart) return 0;
    
    const item = this.cart.items.find(item => 
      item.productId === productId && item.variantId === variantId
    );
    
    return item?.quantity || 0;
  }

  // Cleanup
  destroy(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    
    this.removeAllListeners();
    this.cart = null;
  }
}

// Create singleton instance
const cartService = new CartService();

export default cartService;