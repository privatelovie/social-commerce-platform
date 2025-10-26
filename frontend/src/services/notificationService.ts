import { EventEmitter } from 'events';
import socketService from './socketService';

export interface Notification {
  id: string;
  type: 'message' | 'mention' | 'follow' | 'like' | 'comment' | 'cart' | 'product' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  userId?: string;
  avatar?: string;
  data?: any;
  actions?: NotificationAction[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  persistent?: boolean;
  autoHide?: boolean;
  duration?: number;
}

export interface NotificationAction {
  label: string;
  action: string;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface ToastNotification extends Omit<Notification, 'id'> {
  severity?: 'success' | 'error' | 'warning' | 'info';
  variant?: 'filled' | 'outlined' | 'standard';
}

export interface NotificationSettings {
  soundEnabled: boolean;
  desktopEnabled: boolean;
  messageNotifications: boolean;
  mentionNotifications: boolean;
  followNotifications: boolean;
  likeNotifications: boolean;
  commentNotifications: boolean;
  productNotifications: boolean;
  cartNotifications: boolean;
  systemNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

class NotificationService extends EventEmitter {
  private notifications: Map<string, Notification> = new Map();
  private settings: NotificationSettings;
  private soundsEnabled: boolean = true;
  private desktopPermission: NotificationPermission = 'default';
  private toastQueue: ToastNotification[] = [];
  private activeToasts: Set<string> = new Set();

  constructor() {
    super();
    this.settings = this.loadSettings();
    this.setupSocketListeners();
    // Don't request permission on initialization - only on user interaction
  }

  // Initialize desktop notifications - only check permission, don't request
  private initializeDesktopNotifications() {
    if ('Notification' in window) {
      this.desktopPermission = Notification.permission;
    }
  }

  // Setup socket listeners for real-time notifications
  private setupSocketListeners() {
    socketService.on('notification', (notification: Notification) => {
      this.handleIncomingNotification(notification);
    });

    socketService.on('notificationRead', ({ notificationId }: { notificationId: string }) => {
      this.markAsRead(notificationId, false); // false = don't emit to server
    });

    socketService.on('notificationDeleted', ({ notificationId }: { notificationId: string }) => {
      this.removeNotification(notificationId, false); // false = don't emit to server
    });

    socketService.on('messageReceived', (data: any) => {
      if (this.settings.messageNotifications) {
        this.showToast({
          type: 'message',
          title: 'New Message',
          message: `${data.senderName}: ${data.content}`,
          timestamp: new Date().toISOString(),
          isRead: false,
          severity: 'info',
          userId: data.senderId,
          avatar: data.senderAvatar,
          data: data,
          autoHide: true,
          duration: 5000
        });
      }
    });

    socketService.on('mention', (data: any) => {
      if (this.settings.mentionNotifications) {
        this.showToast({
          type: 'mention',
          title: 'You were mentioned',
          message: `${data.userName} mentioned you in a ${data.type}`,
          timestamp: new Date().toISOString(),
          isRead: false,
          severity: 'warning',
          userId: data.userId,
          avatar: data.userAvatar,
          data: data,
          autoHide: true,
          duration: 6000,
          actions: [
            { label: 'View', action: 'view-mention', variant: 'contained', color: 'primary' }
          ]
        });
      }
    });
  }

  // Handle incoming notifications
  private handleIncomingNotification(notification: Notification) {
    // Store notification
    this.notifications.set(notification.id, notification);

    // Check if notification type is enabled
    const isEnabled = this.isNotificationTypeEnabled(notification.type);
    if (!isEnabled) return;

    // Check quiet hours
    if (this.isQuietHours()) return;

    // Show toast notification
    this.showToast(notification);

    // Show desktop notification if enabled
    if (this.settings.desktopEnabled && this.desktopPermission === 'granted') {
      this.showDesktopNotification(notification);
    }

    // Play notification sound if enabled
    if (this.settings.soundEnabled && this.soundsEnabled) {
      this.playNotificationSound(notification.type);
    }

    // Emit to UI components
    this.emit('notification', notification);
  }

  // Show toast notification
  public showToast(notification: ToastNotification) {
    const toastId = Math.random().toString(36).substr(2, 9);
    
    // Add to active toasts
    this.activeToasts.add(toastId);
    
    // Emit to toast provider
    this.emit('toast', {
      id: toastId,
      ...notification,
      onClose: () => this.activeToasts.delete(toastId),
      onAction: (actionType: string) => this.handleNotificationAction(notification, actionType)
    });

    // Auto-remove from active set after duration
    if (notification.autoHide !== false) {
      const duration = notification.duration || 4000;
      setTimeout(() => {
        this.activeToasts.delete(toastId);
      }, duration);
    }
  }

  // Show desktop notification
  private showDesktopNotification(notification: Notification) {
    try {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.avatar || '/favicon.ico',
        tag: notification.id,
        silent: !this.settings.soundEnabled,
        requireInteraction: notification.persistent || notification.priority === 'urgent'
      });

      desktopNotification.onclick = () => {
        window.focus();
        this.handleNotificationAction(notification, 'view');
        desktopNotification.close();
      };

      // Auto-close after duration
      if (!notification.persistent && notification.priority !== 'urgent') {
        setTimeout(() => {
          desktopNotification.close();
        }, notification.duration || 5000);
      }
    } catch (error) {
      console.warn('Failed to show desktop notification:', error);
    }
  }

  // Play notification sound
  private playNotificationSound(type: Notification['type']) {
    try {
      const audio = new Audio();
      
      switch (type) {
        case 'message':
          audio.src = '/sounds/message.mp3';
          break;
        case 'mention':
          audio.src = '/sounds/mention.mp3';
          break;
        case 'follow':
          audio.src = '/sounds/follow.mp3';
          break;
        case 'system':
          audio.src = '/sounds/system.mp3';
          break;
        default:
          audio.src = '/sounds/default.mp3';
      }
      
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Silently fail if audio can't be played
      });
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  // Handle notification actions
  private handleNotificationAction(notification: Notification, actionType: string) {
    this.emit('notificationAction', { notification, actionType });
    
    switch (actionType) {
      case 'view':
        this.emit('navigate', this.getNavigationPath(notification));
        break;
      case 'dismiss':
        if (notification.id) {
          this.markAsRead(notification.id);
        }
        break;
      case 'view-mention':
        this.emit('navigate', `/posts/${notification.data?.postId}`);
        break;
    }
  }

  // Get navigation path for notification
  private getNavigationPath(notification: Notification): string {
    switch (notification.type) {
      case 'message':
        return `/messages/${notification.data?.conversationId || ''}`;
      case 'mention':
        return `/posts/${notification.data?.postId || ''}`;
      case 'follow':
        return `/profile/${notification.userId || ''}`;
      case 'like':
      case 'comment':
        return `/posts/${notification.data?.postId || ''}`;
      case 'product':
        return `/products/${notification.data?.productId || ''}`;
      case 'cart':
        return '/cart';
      default:
        return '/notifications';
    }
  }

  // Check if notification type is enabled
  private isNotificationTypeEnabled(type: Notification['type']): boolean {
    switch (type) {
      case 'message':
        return this.settings.messageNotifications;
      case 'mention':
        return this.settings.mentionNotifications;
      case 'follow':
        return this.settings.followNotifications;
      case 'like':
        return this.settings.likeNotifications;
      case 'comment':
        return this.settings.commentNotifications;
      case 'product':
        return this.settings.productNotifications;
      case 'cart':
        return this.settings.cartNotifications;
      case 'system':
        return this.settings.systemNotifications;
      default:
        return true;
    }
  }

  // Check if currently in quiet hours
  private isQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.settings.quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = this.settings.quietHours.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours (e.g., 22:00 to 07:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Public API methods
  public getNotifications(): Notification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getUnreadCount(): number {
    return Array.from(this.notifications.values()).filter(n => !n.isRead).length;
  }

  public markAsRead(notificationId: string, emitToServer: boolean = true) {
    const notification = this.notifications.get(notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.notifications.set(notificationId, notification);
      
      if (emitToServer) {
        socketService.emit('markNotificationRead', { notificationId });
      }
      
      this.emit('notificationUpdated', notification);
    }
  }

  public markAllAsRead() {
    const unreadIds: string[] = [];
    
    this.notifications.forEach((notification) => {
      if (!notification.isRead) {
        notification.isRead = true;
        unreadIds.push(notification.id);
      }
    });
    
    if (unreadIds.length > 0) {
      socketService.emit('markAllNotificationsRead');
      this.emit('allNotificationsRead');
    }
  }

  public removeNotification(notificationId: string, emitToServer: boolean = true) {
    if (this.notifications.has(notificationId)) {
      this.notifications.delete(notificationId);
      
      if (emitToServer) {
        socketService.emit('deleteNotification', { notificationId });
      }
      
      this.emit('notificationRemoved', notificationId);
    }
  }

  public clearAllNotifications() {
    this.notifications.clear();
    socketService.emit('clearAllNotifications');
    this.emit('allNotificationsCleared');
  }

  public updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.emit('settingsUpdated', this.settings);
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public enableSounds() {
    this.soundsEnabled = true;
  }

  public disableSounds() {
    this.soundsEnabled = false;
  }

  public requestDesktopPermission(): Promise<NotificationPermission> {
    return new Promise((resolve) => {
      if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
          this.desktopPermission = permission;
          resolve(permission);
        });
      } else {
        resolve('denied');
      }
    });
  }

  // Utility methods for quick notifications
  public showSuccess(message: string, title?: string) {
    this.showToast({
      type: 'system',
      title: title || 'Success',
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      severity: 'success',
      autoHide: true,
      duration: 3000
    });
  }

  public showError(message: string, title?: string) {
    this.showToast({
      type: 'system',
      title: title || 'Error',
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      severity: 'error',
      autoHide: false,
      persistent: true
    });
  }

  public showWarning(message: string, title?: string) {
    this.showToast({
      type: 'system',
      title: title || 'Warning',
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      severity: 'warning',
      autoHide: true,
      duration: 5000
    });
  }

  public showInfo(message: string, title?: string) {
    this.showToast({
      type: 'system',
      title: title || 'Info',
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      severity: 'info',
      autoHide: true,
      duration: 4000
    });
  }

  // Private helper methods
  private loadSettings(): NotificationSettings {
    const savedSettings = localStorage.getItem('notificationSettings');
    const defaultSettings: NotificationSettings = {
      soundEnabled: true,
      desktopEnabled: false,
      messageNotifications: true,
      mentionNotifications: true,
      followNotifications: true,
      likeNotifications: true,
      commentNotifications: true,
      productNotifications: true,
      cartNotifications: true,
      systemNotifications: true,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '07:00'
      }
    };

    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  }

  private saveSettings() {
    localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
  }

  // Cleanup
  public destroy() {
    this.removeAllListeners();
    this.notifications.clear();
    this.activeToasts.clear();
    this.toastQueue.length = 0;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;