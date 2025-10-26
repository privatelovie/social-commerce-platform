import { RealProduct } from './productApi';

export interface PriceAlert {
  id: string;
  productId: string;
  userId: string;
  targetPrice: number;
  currentPrice: number;
  alertType: 'price_drop' | 'target_price' | 'back_in_stock';
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
  product?: RealProduct;
}

export interface PriceHistory {
  productId: string;
  price: number;
  originalPrice?: number;
  timestamp: string;
  source: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
}

export interface PriceNotification {
  id: string;
  type: 'price_drop' | 'deal_alert' | 'back_in_stock' | 'price_increase';
  title: string;
  message: string;
  product: RealProduct;
  priceChange?: {
    from: number;
    to: number;
    percentage: number;
  };
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export class PriceTrackingService {
  private priceHistory: Map<string, PriceHistory[]> = new Map();
  private priceAlerts: Map<string, PriceAlert[]> = new Map();
  private notifications: PriceNotification[] = [];
  private subscribers: Map<string, (notifications: PriceNotification[]) => void> = new Map();

  // Local storage keys
  private readonly PRICE_HISTORY_KEY = 'social_commerce_price_history';
  private readonly PRICE_ALERTS_KEY = 'social_commerce_price_alerts';
  private readonly NOTIFICATIONS_KEY = 'social_commerce_notifications';

  constructor() {
    this.loadFromStorage();
    this.startPriceMonitoring();
  }

  // Price History Management
  async trackPrice(product: RealProduct): Promise<void> {
    const productId = product.id;
    const now = new Date().toISOString();

    const priceEntry: PriceHistory = {
      productId,
      price: product.price,
      originalPrice: product.originalPrice,
      timestamp: now,
      source: product.source || 'unknown',
      availability: product.availability
    };

    const history = this.priceHistory.get(productId) || [];
    history.push(priceEntry);

    // Keep only last 30 days of data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filteredHistory = history.filter(entry => 
      new Date(entry.timestamp) > thirtyDaysAgo
    );

    this.priceHistory.set(productId, filteredHistory);
    this.saveToStorage();

    // Check for price changes and trigger alerts
    await this.checkPriceAlerts(product, history);
  }

  getPriceHistory(productId: string, days: number = 30): PriceHistory[] {
    const history = this.priceHistory.get(productId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return history.filter(entry => new Date(entry.timestamp) > cutoffDate);
  }

  getLowestPrice(productId: string, days: number = 30): PriceHistory | null {
    const history = this.getPriceHistory(productId, days);
    if (history.length === 0) return null;

    return history.reduce((lowest, current) => 
      current.price < lowest.price ? current : lowest
    );
  }

  getHighestPrice(productId: string, days: number = 30): PriceHistory | null {
    const history = this.getPriceHistory(productId, days);
    if (history.length === 0) return null;

    return history.reduce((highest, current) => 
      current.price > highest.price ? current : highest
    );
  }

  getPriceChange(productId: string, days: number = 7): { 
    change: number; 
    percentage: number; 
    trend: 'up' | 'down' | 'stable' 
  } | null {
    const history = this.getPriceHistory(productId, days);
    if (history.length < 2) return null;

    const oldestPrice = history[0].price;
    const latestPrice = history[history.length - 1].price;
    const change = latestPrice - oldestPrice;
    const percentage = (change / oldestPrice) * 100;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentage) > 1) { // More than 1% change
      trend = percentage > 0 ? 'up' : 'down';
    }

    return { change, percentage, trend };
  }

  // Price Alerts Management
  async createPriceAlert(
    userId: string, 
    productId: string, 
    targetPrice: number, 
    alertType: PriceAlert['alertType'] = 'target_price',
    product?: RealProduct
  ): Promise<string> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: PriceAlert = {
      id: alertId,
      productId,
      userId,
      targetPrice,
      currentPrice: product?.price || 0,
      alertType,
      isActive: true,
      createdAt: new Date().toISOString(),
      product
    };

    const userAlerts = this.priceAlerts.get(userId) || [];
    userAlerts.push(alert);
    this.priceAlerts.set(userId, userAlerts);
    
    this.saveToStorage();
    return alertId;
  }

  getUserAlerts(userId: string): PriceAlert[] {
    return this.priceAlerts.get(userId) || [];
  }

  getActiveAlerts(userId: string): PriceAlert[] {
    return this.getUserAlerts(userId).filter(alert => alert.isActive);
  }

  async deactivateAlert(userId: string, alertId: string): Promise<boolean> {
    const userAlerts = this.priceAlerts.get(userId) || [];
    const alert = userAlerts.find(a => a.id === alertId);
    
    if (alert) {
      alert.isActive = false;
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  async deleteAlert(userId: string, alertId: string): Promise<boolean> {
    const userAlerts = this.priceAlerts.get(userId) || [];
    const updatedAlerts = userAlerts.filter(a => a.id !== alertId);
    
    if (updatedAlerts.length !== userAlerts.length) {
      this.priceAlerts.set(userId, updatedAlerts);
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  // Price Alert Checking
  private async checkPriceAlerts(product: RealProduct, history: PriceHistory[]): Promise<void> {
    if (history.length < 2) return;

    const previousPrice = history[history.length - 2].price;
    const currentPrice = product.price;
    const priceDropPercentage = ((previousPrice - currentPrice) / previousPrice) * 100;

    // Check all user alerts for this product
    for (const [userId, userAlerts] of Array.from(this.priceAlerts.entries())) {
      const productAlerts = userAlerts.filter(
        alert => alert.productId === product.id && alert.isActive
      );

      for (const alert of productAlerts) {
        let shouldTrigger = false;
        let notificationType: PriceNotification['type'] = 'price_drop';
        let message = '';

        switch (alert.alertType) {
          case 'target_price':
            shouldTrigger = currentPrice <= alert.targetPrice;
            message = `${product.name} is now $${currentPrice}, meeting your target price of $${alert.targetPrice}!`;
            break;

          case 'price_drop':
            shouldTrigger = priceDropPercentage >= 5; // 5% drop threshold
            notificationType = 'price_drop';
            message = `${product.name} price dropped ${priceDropPercentage.toFixed(1)}% from $${previousPrice} to $${currentPrice}!`;
            break;

          case 'back_in_stock':
            shouldTrigger = product.availability === 'in_stock' && 
              history[history.length - 2].availability !== 'in_stock';
            notificationType = 'back_in_stock';
            message = `${product.name} is back in stock at $${currentPrice}!`;
            break;
        }

        if (shouldTrigger) {
          await this.triggerAlert(alert, product, message, notificationType);
        }
      }
    }
  }

  private async triggerAlert(
    alert: PriceAlert, 
    product: RealProduct, 
    message: string,
    notificationType: PriceNotification['type']
  ): Promise<void> {
    // Mark alert as triggered
    alert.triggeredAt = new Date().toISOString();
    
    if (alert.alertType === 'target_price' || alert.alertType === 'back_in_stock') {
      alert.isActive = false; // One-time alerts
    }

    // Create notification
    const notification: PriceNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: notificationType,
      title: `Price Alert: ${product.name}`,
      message,
      product,
      timestamp: new Date().toISOString(),
      isRead: false,
      actionUrl: product.url
    };

    this.notifications.unshift(notification);
    
    // Keep only last 50 notifications
    this.notifications = this.notifications.slice(0, 50);
    
    this.saveToStorage();
    this.notifySubscribers();

    // Send browser notification if supported
    this.sendBrowserNotification(notification);
  }

  // Deal Detection
  async checkForDeals(products: RealProduct[]): Promise<RealProduct[]> {
    const deals: RealProduct[] = [];

    for (const product of products) {
      const history = this.getPriceHistory(product.id, 7);
      if (history.length < 3) continue;

      const avgPrice = history.reduce((sum, h) => sum + h.price, 0) / history.length;
      const currentPrice = product.price;
      const discountFromAvg = ((avgPrice - currentPrice) / avgPrice) * 100;

      // Consider it a deal if current price is 10% or more below recent average
      if (discountFromAvg >= 10) {
        deals.push(product);
      }
    }

    return deals;
  }

  // Notifications Management
  getNotifications(userId?: string): PriceNotification[] {
    // For now, return all notifications. In a real app, filter by userId
    return [...this.notifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getUnreadNotifications(userId?: string): PriceNotification[] {
    return this.getNotifications(userId).filter(n => !n.isRead);
  }

  markNotificationAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(userId?: string): void {
    let hasChanges = false;
    this.notifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveToStorage();
      this.notifySubscribers();
    }
  }

  deleteNotification(notificationId: string): boolean {
    const initialLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    
    if (this.notifications.length !== initialLength) {
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  // Subscription for real-time updates
  subscribe(key: string, callback: (notifications: PriceNotification[]) => void): void {
    this.subscribers.set(key, callback);
  }

  unsubscribe(key: string): void {
    this.subscribers.delete(key);
  }

  private notifySubscribers(): void {
    const notifications = this.getNotifications();
    this.subscribers.forEach(callback => callback(notifications));
  }

  // Browser Notifications
  private async sendBrowserNotification(notification: PriceNotification): Promise<void> {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.product.image,
        badge: '/favicon.ico',
        tag: notification.id
      });
    } else if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.sendBrowserNotification(notification);
      }
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return await Notification.requestPermission();
  }

  // Price Monitoring (simulated)
  private startPriceMonitoring(): void {
    // In a real app, this would connect to a backend service
    // For demo purposes, we'll simulate price changes occasionally
    setInterval(() => {
      this.simulatePriceChanges();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private simulatePriceChanges(): void {
    // Randomly simulate price changes for demo purposes
    if (Math.random() < 0.1) { // 10% chance every 5 minutes
      // This would normally be triggered by real price data updates
      console.log('Simulating price change check...');
    }
  }

  // Storage Management
  private saveToStorage(): void {
    try {
      localStorage.setItem(
        this.PRICE_HISTORY_KEY, 
        JSON.stringify(Array.from(this.priceHistory.entries()))
      );
      localStorage.setItem(
        this.PRICE_ALERTS_KEY, 
        JSON.stringify(Array.from(this.priceAlerts.entries()))
      );
      localStorage.setItem(
        this.NOTIFICATIONS_KEY, 
        JSON.stringify(this.notifications)
      );
    } catch (error) {
      console.error('Error saving price tracking data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const historyData = localStorage.getItem(this.PRICE_HISTORY_KEY);
      if (historyData) {
        this.priceHistory = new Map(JSON.parse(historyData));
      }

      const alertsData = localStorage.getItem(this.PRICE_ALERTS_KEY);
      if (alertsData) {
        this.priceAlerts = new Map(JSON.parse(alertsData));
      }

      const notificationsData = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (notificationsData) {
        this.notifications = JSON.parse(notificationsData);
      }
    } catch (error) {
      console.error('Error loading price tracking data:', error);
    }
  }

  // Analytics
  getTrackingStats(userId: string): {
    totalAlerts: number;
    activeAlerts: number;
    triggeredAlerts: number;
    totalSavings: number;
    trackedProducts: number;
  } {
    const userAlerts = this.getUserAlerts(userId);
    const triggeredAlerts = userAlerts.filter(a => a.triggeredAt);
    
    const totalSavings = triggeredAlerts.reduce((total, alert) => {
      if (alert.product && alert.alertType === 'target_price') {
        return total + Math.max(0, alert.currentPrice - alert.product.price);
      }
      return total;
    }, 0);

    return {
      totalAlerts: userAlerts.length,
      activeAlerts: userAlerts.filter(a => a.isActive).length,
      triggeredAlerts: triggeredAlerts.length,
      totalSavings,
      trackedProducts: new Set(userAlerts.map(a => a.productId)).size
    };
  }
}

// Singleton instance
export const priceTrackingService = new PriceTrackingService();
export default priceTrackingService;