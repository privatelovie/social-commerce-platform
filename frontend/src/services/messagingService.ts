import { apiClient, ApiResponse } from './apiClient';
import { endpoints } from '../config/api';
// Define Socket type inline to avoid import issues
type SocketType = any;

// Message types
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  isVerified?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'product' | 'cart' | 'file';
  metadata?: {
    productId?: string;
    cartId?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    duration?: number;
    product?: {
      id: string;
      name: string;
      price: number;
      image: string;
      brand: string;
    };
    cart?: {
      id: string;
      items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        image: string;
      }>;
      total: number;
    };
  };
  isRead: boolean;
  isEdited: boolean;
  replyTo?: {
    id: string;
    content: string;
    sender: {
      id: string;
      displayName: string;
    };
  };
  reactions?: Array<{
    emoji: string;
    userId: string;
    username: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
  // Group-specific fields
  groupName?: string;
  groupAvatar?: string;
  adminIds?: string[];
}

export interface SendMessageData {
  content: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'product' | 'cart' | 'file';
  replyToId?: string;
  metadata?: Message['metadata'];
}

export interface CreateConversationData {
  participantIds: string[];
  type?: 'direct' | 'group';
  groupName?: string;
  groupAvatar?: string;
}

class MessagingService {
  private socket: SocketType | null = null;
  private listeners: Map<string, Function[]> = new Map();

  // Initialize Socket.IO connection
  initializeSocket(socket: SocketType) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    // Message events
    this.socket.on('message:new', (message: Message) => {
      this.emit('messageReceived', message);
    });

    this.socket.on('message:updated', (message: Message) => {
      this.emit('messageUpdated', message);
    });

    this.socket.on('message:deleted', (data: { messageId: string; conversationId: string }) => {
      this.emit('messageDeleted', data);
    });

    this.socket.on('message:reaction', (data: { messageId: string; reaction: { emoji: string; userId: string; username: string } }) => {
      this.emit('messageReaction', data);
    });

    // Conversation events
    this.socket.on('conversation:updated', (conversation: Conversation) => {
      this.emit('conversationUpdated', conversation);
    });

    this.socket.on('conversation:new', (conversation: Conversation) => {
      this.emit('conversationCreated', conversation);
    });

    // Typing indicators
    this.socket.on('typing:start', (data: { userId: string; conversationId: string; username: string }) => {
      this.emit('typingStart', data);
    });

    this.socket.on('typing:stop', (data: { userId: string; conversationId: string }) => {
      this.emit('typingStop', data);
    });

    // User presence
    this.socket.on('user:online', (data: { userId: string; isOnline: boolean }) => {
      this.emit('userPresence', data);
    });

    // Message read receipts
    this.socket.on('message:read', (data: { messageId: string; userId: string; conversationId: string }) => {
      this.emit('messageRead', data);
    });
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // API Methods
  
  // Get recent contacts
  async getRecentContacts(): Promise<{
    success: boolean;
    users?: User[];
    error?: string;
  }> {
    try {
      const response: ApiResponse<{ users: User[] }> = await apiClient.getWithCache(
        '/api/users/recent-contacts',
        30 * 1000 // 30 seconds cache
      );

      if (response.success && response.data) {
        return {
          success: true,
          users: response.data.users,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch recent contacts',
        };
      }
    } catch (error: any) {
      console.error('Get recent contacts error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch recent contacts',
      };
    }
  }

  // Get suggested users
  async getSuggestedUsers(): Promise<{
    success: boolean;
    users?: User[];
    error?: string;
  }> {
    try {
      const response: ApiResponse<{ users: User[] }> = await apiClient.getWithCache(
        '/api/users/suggested',
        60 * 1000 // 60 seconds cache
      );

      if (response.success && response.data) {
        return {
          success: true,
          users: response.data.users,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch suggested users',
        };
      }
    } catch (error: any) {
      console.error('Get suggested users error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch suggested users',
      };
    }
  }

  // Search users
  async searchUsers(query: string): Promise<{
    success: boolean;
    users?: User[];
    error?: string;
  }> {
    try {
      const response: ApiResponse<{ users: User[] }> = await apiClient.get(
        `/api/users/search?q=${encodeURIComponent(query)}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          users: response.data.users,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to search users',
        };
      }
    } catch (error: any) {
      console.error('Search users error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search users',
      };
    }
  }
  
  // Get conversations list
  async getConversations(page: number = 1, limit: number = 20): Promise<{
    success: boolean;
    conversations?: Conversation[];
    error?: string;
    hasMore?: boolean;
  }> {
    try {
      const response: ApiResponse<{
        conversations: Conversation[];
        pagination: {
          hasMore: boolean;
        };
      }> = await apiClient.getWithCache(
        `${endpoints.messages.conversations}?page=${page}&limit=${limit}`,
        30 * 1000 // 30 seconds cache
      );

      if (response.success && response.data) {
        return {
          success: true,
          conversations: response.data.conversations,
          hasMore: response.data.pagination.hasMore,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch conversations',
        };
      }
    } catch (error: any) {
      console.error('Get conversations error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch conversations',
      };
    }
  }

  // Get conversation details with messages
  async getConversation(conversationId: string, page: number = 1, limit: number = 50): Promise<{
    success: boolean;
    conversation?: Conversation;
    messages?: Message[];
    error?: string;
    hasMore?: boolean;
  }> {
    try {
      const response: ApiResponse<{
        conversation: Conversation;
        messages: Message[];
        pagination: {
          hasMore: boolean;
        };
      }> = await apiClient.get(
        `${endpoints.messages.conversation(conversationId)}?page=${page}&limit=${limit}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          conversation: response.data.conversation,
          messages: response.data.messages,
          hasMore: response.data.pagination.hasMore,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch conversation',
        };
      }
    } catch (error: any) {
      console.error('Get conversation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch conversation',
      };
    }
  }

  // Send message
  async sendMessage(conversationId: string, messageData: SendMessageData): Promise<{
    success: boolean;
    message?: Message;
    error?: string;
  }> {
    try {
      const response: ApiResponse<Message> = await apiClient.post(
        endpoints.messages.send,
        {
          conversationId,
          ...messageData,
        }
      );

      if (response.success && response.data) {
        // Clear conversations cache to show updated last message
        apiClient.clearCache('conversations');
        
        return {
          success: true,
          message: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to send message',
        };
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send message',
      };
    }
  }

  // Create new conversation
  async createConversation(data: CreateConversationData): Promise<{
    success: boolean;
    conversation?: Conversation;
    error?: string;
  }> {
    try {
      const response: ApiResponse<Conversation> = await apiClient.post(
        endpoints.messages.conversations,
        data
      );

      if (response.success && response.data) {
        // Clear conversations cache
        apiClient.clearCache('conversations');
        
        return {
          success: true,
          conversation: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to create conversation',
        };
      }
    } catch (error: any) {
      console.error('Create conversation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create conversation',
      };
    }
  }

  // Share product in conversation
  async shareProduct(conversationId: string, productId: string, message?: string): Promise<{
    success: boolean;
    message?: Message;
    error?: string;
  }> {
    try {
      const response: ApiResponse<Message> = await apiClient.post(
        endpoints.messages.shareProduct,
        {
          conversationId,
          productId,
          content: message || 'Check out this product!',
        }
      );

      if (response.success && response.data) {
        return {
          success: true,
          message: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to share product',
        };
      }
    } catch (error: any) {
      console.error('Share product error:', error);
      return {
        success: false,
        error: error.message || 'Failed to share product',
      };
    }
  }

  // Share cart in conversation
  async shareCart(conversationId: string, message?: string): Promise<{
    success: boolean;
    message?: Message;
    error?: string;
  }> {
    try {
      const response: ApiResponse<Message> = await apiClient.post(
        endpoints.messages.shareCart,
        {
          conversationId,
          content: message || 'Check out my cart!',
        }
      );

      if (response.success && response.data) {
        return {
          success: true,
          message: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to share cart',
        };
      }
    } catch (error: any) {
      console.error('Share cart error:', error);
      return {
        success: false,
        error: error.message || 'Failed to share cart',
      };
    }
  }

  // Upload file for message
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<{
    success: boolean;
    fileUrl?: string;
    error?: string;
  }> {
    try {
      const response: ApiResponse<{ fileUrl: string; fileName: string; fileSize: number }> = 
        await apiClient.uploadFile('/messages/upload', file, {}, onProgress);

      if (response.success && response.data) {
        return {
          success: true,
          fileUrl: response.data.fileUrl,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to upload file',
        };
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file',
      };
    }
  }

  // Mark message as read
  async markAsRead(conversationId: string, messageId?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response: ApiResponse<{ message: string }> = await apiClient.post(
        endpoints.messages.markRead(conversationId),
        messageId ? { messageId } : {}
      );

      return {
        success: response.success,
        error: response.success ? undefined : response.error,
      };
    } catch (error: any) {
      console.error('Mark as read error:', error);
      return {
        success: false,
        error: error.message || 'Failed to mark as read',
      };
    }
  }

  // Edit message
  async editMessage(messageId: string, newContent: string): Promise<{
    success: boolean;
    message?: Message;
    error?: string;
  }> {
    try {
      const response: ApiResponse<Message> = await apiClient.put(
        `/messages/${messageId}`,
        { content: newContent }
      );

      if (response.success && response.data) {
        return {
          success: true,
          message: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to edit message',
        };
      }
    } catch (error: any) {
      console.error('Edit message error:', error);
      return {
        success: false,
        error: error.message || 'Failed to edit message',
      };
    }
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response: ApiResponse<{ message: string }> = await apiClient.delete(
        `/messages/${messageId}`
      );

      return {
        success: response.success,
        error: response.success ? undefined : response.error,
      };
    } catch (error: any) {
      console.error('Delete message error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete message',
      };
    }
  }

  // Add reaction to message
  async addReaction(messageId: string, emoji: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response: ApiResponse<{ message: string }> = await apiClient.post(
        `/messages/${messageId}/reactions`,
        { emoji }
      );

      return {
        success: response.success,
        error: response.success ? undefined : response.error,
      };
    } catch (error: any) {
      console.error('Add reaction error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add reaction',
      };
    }
  }

  // Socket.IO real-time methods

  // Start typing indicator
  startTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('typing:start', { conversationId });
    }
  }

  // Stop typing indicator
  stopTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('typing:stop', { conversationId });
    }
  }

  // Join conversation room (for real-time updates)
  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('conversation:join', { conversationId });
    }
  }

  // Leave conversation room
  leaveConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('conversation:leave', { conversationId });
    }
  }

  // Search conversations and messages
  async search(query: string, type: 'conversations' | 'messages' | 'both' = 'both'): Promise<{
    success: boolean;
    conversations?: Conversation[];
    messages?: Message[];
    error?: string;
  }> {
    try {
      const response: ApiResponse<{
        conversations?: Conversation[];
        messages?: Message[];
      }> = await apiClient.get(
        `/messages/search?q=${encodeURIComponent(query)}&type=${type}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          conversations: response.data.conversations,
          messages: response.data.messages,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Search failed',
        };
      }
    } catch (error: any) {
      console.error('Search error:', error);
      return {
        success: false,
        error: error.message || 'Search failed',
      };
    }
  }

  // Archive conversation
  async archiveConversation(conversationId: string, archive: boolean = true): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response: ApiResponse<{ message: string }> = await apiClient.post(
        `/conversations/${conversationId}/archive`,
        { archive }
      );

      if (response.success) {
        // Clear cache to reflect changes
        apiClient.clearCache('conversations');
      }

      return {
        success: response.success,
        error: response.success ? undefined : response.error,
      };
    } catch (error: any) {
      console.error('Archive conversation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to archive conversation',
      };
    }
  }

  // Mute conversation
  async muteConversation(conversationId: string, mute: boolean = true): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response: ApiResponse<{ message: string }> = await apiClient.post(
        `/conversations/${conversationId}/mute`,
        { mute }
      );

      return {
        success: response.success,
        error: response.success ? undefined : response.error,
      };
    } catch (error: any) {
      console.error('Mute conversation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to mute conversation',
      };
    }
  }
}

// Create and export singleton instance
export const messagingService = new MessagingService();

export default messagingService;