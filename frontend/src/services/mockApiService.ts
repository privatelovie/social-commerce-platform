// Mock API service for when backend is not available
export class MockApiService {
  private static instance: MockApiService;
  private mockUsers = [
    {
      id: '1',
      username: 'demo_user',
      email: 'demo@example.com',
      displayName: 'Demo User',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff&size=100',
      bio: 'Welcome to the social commerce platform demo!',
      isVerified: true,
      followers: 1250,
      following: 340,
      posts: 89
    }
  ];

  private mockProducts = [
    {
      id: '1',
      name: 'Smart AI Assistant Device',
      description: 'Revolutionary AI-powered smart device that learns your preferences',
      price: 299.99,
      originalPrice: 399.99,
      currency: 'USD',
      images: ['https://picsum.photos/600/400?random=1'],
      category: 'Electronics',
      brand: 'TechCorp',
      inStock: true,
      rating: 4.8,
      reviewCount: 2847,
      tags: ['AI', 'Smart Home', 'Popular'],
      isFeatured: true,
      isOnSale: true
    },
    {
      id: '2',
      name: 'Sustainable Fashion Hoodie',
      description: 'Eco-friendly organic cotton hoodie with modern design',
      price: 89.99,
      originalPrice: 119.99,
      currency: 'USD',
      images: ['https://picsum.photos/600/400?random=2'],
      category: 'Fashion',
      brand: 'EcoWear',
      inStock: true,
      rating: 4.6,
      reviewCount: 1293,
      tags: ['Sustainable', 'Fashion', 'Organic'],
      isFeatured: true,
      isOnSale: true
    }
  ];

  static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    await this.delay(500); // Simulate network delay
    
    // For demo purposes, accept any credentials
    return {
      success: true,
      data: {
        user: this.mockUsers[0],
        token: 'mock-jwt-token-' + Date.now()
      },
      message: 'Login successful'
    };
  }

  async register(userData: any) {
    await this.delay(500);
    
    const newUser = {
      ...this.mockUsers[0],
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      displayName: userData.displayName
    };

    return {
      success: true,
      data: {
        user: newUser,
        token: 'mock-jwt-token-' + Date.now()
      },
      message: 'Registration successful'
    };
  }

  async getProfile(userId?: string) {
    await this.delay(300);
    
    return {
      success: true,
      data: {
        user: this.mockUsers[0]
      },
      message: 'Profile retrieved successfully'
    };
  }

  // Product endpoints
  async getProducts(params: any = {}) {
    await this.delay(400);
    
    return {
      success: true,
      data: {
        products: this.mockProducts,
        total: this.mockProducts.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 1
      }
    };
  }

  async getProduct(id: string) {
    await this.delay(300);
    
    const product = this.mockProducts.find(p => p.id === id) || this.mockProducts[0];
    return {
      success: true,
      data: { product }
    };
  }

  // Cart endpoints
  async getCart() {
    await this.delay(300);
    
    return {
      success: true,
      data: {
        cart: {
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0,
          itemsCount: 0,
          currency: 'USD',
          appliedCoupons: [],
          saveForLater: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    };
  }

  async addToCart(item: any) {
    await this.delay(400);
    
    return {
      success: true,
      data: {
        item: {
          id: Date.now().toString(),
          productId: item.productId,
          product: this.mockProducts.find(p => p.id === item.productId) || this.mockProducts[0],
          quantity: item.quantity || 1,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    };
  }

  // Messaging endpoints
  async getConversations(params: any = {}) {
    await this.delay(300);
    
    const conversations = [
      {
        id: '1',
        type: 'direct',
        participants: [
          {
            id: '1',
            username: 'demo_user',
            displayName: 'Demo User',
            avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
            isOnline: true,
            lastSeen: new Date().toISOString(),
            isVerified: true
          },
          {
            id: '2',
            username: 'sarah_style',
            displayName: 'Sarah Johnson',
            avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=E91E63&color=fff',
            isOnline: false,
            lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            isVerified: true
          }
        ],
        lastMessage: {
          id: 'msg1',
          conversationId: '1',
          senderId: '2',
          content: 'Hey! Thanks for sharing that product link 😊',
          type: 'text',
          isRead: true,
          isEdited: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
        },
        unreadCount: 0,
        isArchived: false,
        isMuted: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      },
      {
        id: '2',
        type: 'direct',
        participants: [
          {
            id: '1',
            username: 'demo_user',
            displayName: 'Demo User',
            avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
            isOnline: true,
            lastSeen: new Date().toISOString(),
            isVerified: true
          },
          {
            id: '3',
            username: 'support_team',
            displayName: 'Support Team',
            avatar: 'https://ui-avatars.com/api/?name=Support+Team&background=4CAF50&color=fff',
            isOnline: true,
            lastSeen: new Date().toISOString(),
            isVerified: true
          }
        ],
        lastMessage: {
          id: 'msg2',
          conversationId: '2',
          senderId: '3',
          content: 'Hello! How can we help you today? 👋',
          type: 'text',
          isRead: false,
          isEdited: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        unreadCount: 1,
        isArchived: false,
        isMuted: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    ];
    
    return {
      success: true,
      data: {
        conversations,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: conversations.length,
          totalPages: 1,
          hasMore: false
        }
      },
      message: 'Conversations retrieved successfully'
    };
  }

  async getMessages(conversationId: string) {
    await this.delay(300);
    
    const messages = conversationId === '1' ? [
      {
        id: 'msg1',
        conversationId,
        senderId: '1',
        content: 'Hey Sarah! I saw this amazing product that I think you\'d love 😊',
        type: 'text',
        isRead: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: 'msg2',
        conversationId,
        senderId: '1',
        content: 'Check out this Smart AI Assistant Device!',
        type: 'product',
        metadata: {
          product: {
            id: '1',
            name: 'Smart AI Assistant Device',
            price: 299.99,
            image: 'https://ui-avatars.com/api/?name=AI+Device&background=6366F1&color=fff&size=200',
            brand: 'TechCorp'
          }
        },
        isRead: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      },
      {
        id: 'msg3',
        conversationId,
        senderId: '2',
        content: 'Wow, that looks amazing! 🤩 The AI integration sounds super cool',
        type: 'text',
        isRead: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'msg4',
        conversationId,
        senderId: '2',
        content: 'Hey! Thanks for sharing that product link 😊',
        type: 'text',
        isRead: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      }
    ] : [
      {
        id: 'support1',
        conversationId,
        senderId: '3',
        content: 'Hello! Welcome to our support chat. How can we help you today? 👋',
        type: 'text',
        isRead: false,
        isEdited: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    ];
    
    return {
      success: true,
      data: {
        conversation: {
          id: conversationId,
          type: 'direct'
        },
        messages,
        pagination: {
          hasMore: false
        }
      }
    };
  }

  // Video feed endpoints
  async getVideoFeed(params: any = {}) {
    await this.delay(400);
    
    // Define videos matching VideoReel interface exactly
    const mockVideos = [
      {
        id: '1',
        title: 'Amazing AI Assistant Demo',
        description: 'Check out this incredible AI device in action! 🤖✨ #tech #ai #demo',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://picsum.photos/400/600?random=3',
        duration: 180,
        creator: {
          id: '1',
          username: 'tech_demo',
          displayName: 'Tech Demo',
          avatar: 'https://ui-avatars.com/api/?name=Tech+Demo&background=6366F1&color=fff&size=100',
          isVerified: true,
          followers: 12500
        },
        stats: {
          views: 125000,
          likes: 12500,
          comments: 890,
          shares: 1560
        },
        product: {
          id: 'p1',
          name: 'Smart AI Assistant Device',
          price: 299.99,
          originalPrice: 399.99,
          image: 'https://picsum.photos/300/300?random=4',
          brand: 'TechCorp'
        },
        hashtags: ['#tech', '#ai', '#demo', '#smart'],
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
      },
      {
        id: '2',
        title: 'Fashion Haul - Sustainable Style',
        description: 'My latest sustainable fashion finds! Perfect for summer ☀️👗 #fashion #sustainable',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://picsum.photos/400/600?random=5',
        duration: 240,
        creator: {
          id: '2',
          username: 'eco_fashion',
          displayName: 'Eco Fashion',
          avatar: 'https://ui-avatars.com/api/?name=Eco+Fashion&background=E91E63&color=fff&size=100',
          isVerified: true,
          followers: 89000
        },
        stats: {
          views: 89000,
          likes: 8900,
          comments: 450,
          shares: 670
        },
        product: {
          id: 'p2',
          name: 'Sustainable Fashion Hoodie',
          price: 89.99,
          originalPrice: 119.99,
          image: 'https://picsum.photos/300/300?random=6',
          brand: 'EcoWear'
        },
        hashtags: ['#fashion', '#sustainable', '#style', '#eco'],
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
      },
      {
        id: '3',
        title: 'Home Workout Essentials',
        description: 'Get fit at home with these amazing essentials! 💪🏠 #fitness #workout',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://picsum.photos/400/600?random=7',
        duration: 195,
        creator: {
          id: '3',
          username: 'fit_anna',
          displayName: 'Anna Fitness',
          avatar: 'https://ui-avatars.com/api/?name=Anna+Fitness&background=4CAF50&color=fff&size=100',
          isVerified: false,
          followers: 45000
        },
        stats: {
          views: 65000,
          likes: 4580,
          comments: 120,
          shares: 560
        },
        product: {
          id: 'p3',
          name: 'Yoga Mat Premium',
          price: 49.99,
          originalPrice: 69.99,
          image: 'https://picsum.photos/300/300?random=8',
          brand: 'FitLife'
        },
        hashtags: ['#fitness', '#workout', '#yoga', '#health'],
        isLiked: true,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
      }
    ];

    // Filter based on params if needed
    let filteredVideos = [...mockVideos];
    
    if (params.trending) {
      // Sort by views for trending
      filteredVideos.sort((a, b) => b.stats.views - a.stats.views);
    }

    return {
      success: true,
      data: {
        videos: filteredVideos,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: filteredVideos.length,
          totalPages: Math.ceil(filteredVideos.length / (params.limit || 10)),
          hasMore: false
        }
      },
      message: 'Video feed retrieved successfully'
    };
  }

  // Post feed endpoints
  async getPostFeed(params: any = {}) {
    await this.delay(300);
    
    const mockPosts = [
      {
        id: '1',
        content: 'Found the perfect workspace setup! 💻✨ This ergonomic desk chair has transformed my home office. No more back pain during those long coding sessions! #WorkFromHome #Productivity #TechLife',
        images: ['https://picsum.photos/600/400?random=32'],
        user: {
          id: '1',
          username: 'developer_sam',
          displayName: 'Sam Developer',
          avatar: 'https://ui-avatars.com/api/?name=Sam+Developer&background=6366F1&color=fff&size=100',
          isVerified: false
        },
        product: this.mockProducts[0],
        likes: 892,
        comments: 56,
        shares: 32,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        tags: ['workspace', 'productivity', 'ergonomic']
      },
      {
        id: '2',
        content: 'Meal prep Sunday success! 🥗🌱 This food storage set keeps everything fresh for the entire week. Glass containers are so much better than plastic! #MealPrep #HealthyEating #ZeroWaste',
        images: ['https://picsum.photos/600/400?random=33'],
        user: {
          id: '2',
          username: 'healthy_hannah',
          displayName: 'Hannah Healthy',
          avatar: 'https://ui-avatars.com/api/?name=Hannah+Healthy&background=4CAF50&color=fff&size=100',
          isVerified: true
        },
        product: this.mockProducts[1],
        likes: 634,
        comments: 38,
        shares: 24,
        isLiked: true,
        isBookmarked: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        tags: ['meal-prep', 'healthy-living', 'sustainability']
      },
      {
        id: '3',
        content: 'Game night just got an upgrade! 🎲🎆 This board game collection has brought so much joy to our friend gatherings. Quality time without screens is priceless! #GameNight #BoardGames #QualityTime',
        images: ['https://picsum.photos/600/400?random=34', 'https://picsum.photos/600/400?random=35'],
        user: {
          id: '3',
          username: 'board_game_ben',
          displayName: 'Ben Games',
          avatar: 'https://ui-avatars.com/api/?name=Ben+Games&background=FF5722&color=fff&size=100',
          isVerified: false
        },
        likes: 567,
        comments: 42,
        shares: 18,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        tags: ['board-games', 'friends', 'entertainment']
      },
      {
        id: '4',
        content: 'My reading corner is finally complete! 📚☕️ This cozy reading lamp creates the perfect ambiance for those late-night book sessions. Light therapy for book lovers! #BookLovers #ReadingNook #CozyVibes',
        images: ['https://picsum.photos/600/400?random=36'],
        user: {
          id: '4',
          username: 'bookworm_ella',
          displayName: 'Ella Books',
          avatar: 'https://ui-avatars.com/api/?name=Ella+Books&background=9C27B0&color=fff&size=100',
          isVerified: true
        },
        likes: 743,
        comments: 67,
        shares: 29,
        isLiked: true,
        isBookmarked: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        tags: ['reading', 'home-decor', 'self-care']
      }
    ];

    return {
      success: true,
      data: {
        posts: mockPosts,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: mockPosts.length,
          totalPages: 1,
          hasMore: false
        }
      },
      message: 'Posts retrieved successfully'
    };
  }

  // Notifications endpoints
  async getNotifications(params: any = {}) {
    await this.delay(250);
    
    const mockNotifications = [
      {
        id: '1',
        type: 'like',
        title: 'New Like',
        message: 'Someone liked your post about the Smart AI Assistant Device',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        user: {
          id: '2',
          username: 'tech_lover',
          avatar: 'https://ui-avatars.com/api/?name=Tech+Lover&background=9C27B0&color=fff&size=100'
        }
      },
      {
        id: '2',
        type: 'follow',
        title: 'New Follower',
        message: 'eco_fashionista started following you',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        user: {
          id: '3',
          username: 'eco_fashionista',
          avatar: 'https://ui-avatars.com/api/?name=Eco+Fashionista&background=E91E63&color=fff&size=100'
        }
      }
    ];
    
    return {
      success: true,
      data: {
        notifications: mockNotifications,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: mockNotifications.length,
          unreadCount: mockNotifications.filter(n => !n.read).length,
          hasMore: false
        }
      },
      message: 'Notifications retrieved successfully'
    };
  }

  // Send message
  async sendMessage(messageData: any) {
    await this.delay(400);
    
    const newMessage = {
      id: Date.now().toString(),
      conversationId: messageData.conversationId,
      senderId: '1', // Current user ID
      content: messageData.content,
      type: messageData.type || 'text',
      metadata: messageData.metadata,
      isRead: false,
      isEdited: false,
      replyTo: messageData.replyToId ? {
        id: messageData.replyToId,
        content: 'Original message',
        sender: {
          id: '2',
          displayName: 'Other User'
        }
      } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    };
  }
  
  // Share product
  async shareProduct(data: any) {
    await this.delay(300);
    
    const product = this.mockProducts.find(p => p.id === data.productId) || this.mockProducts[0];
    const newMessage = {
      id: Date.now().toString(),
      conversationId: data.conversationId,
      senderId: '1',
      content: data.content || 'Check out this product!',
      type: 'product',
      metadata: {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(product.name) + '&background=6366F1&color=fff&size=200',
          brand: product.brand
        }
      },
      isRead: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: newMessage,
      message: 'Product shared successfully'
    };
  }
  
  // Share cart
  async shareCart(data: any) {
    await this.delay(300);
    
    const newMessage = {
      id: Date.now().toString(),
      conversationId: data.conversationId,
      senderId: '1',
      content: data.content || 'Check out my cart!',
      type: 'cart',
      metadata: {
        cart: {
          id: 'cart-' + Date.now(),
          items: [
            {
              id: '1',
              name: 'Smart AI Assistant Device',
              price: 299.99,
              quantity: 1,
              image: 'https://ui-avatars.com/api/?name=AI+Device&background=6366F1&color=fff&size=200'
            }
          ],
          total: 299.99
        }
      },
      isRead: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: newMessage,
      message: 'Cart shared successfully'
    };
  }

  // User search methods
  async getRecentContacts() {
    await this.delay(200);
    
    const recentContacts = [
      {
        id: '2',
        username: 'sarah_style',
        displayName: 'Sarah Johnson',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=E91E63&color=fff&size=100',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        isVerified: true
      },
      {
        id: '3',
        username: 'support_team',
        displayName: 'Support Team',
        avatar: 'https://ui-avatars.com/api/?name=Support+Team&background=4CAF50&color=fff&size=100',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        isVerified: true
      }
    ];
    
    return {
      success: true,
      data: {
        users: recentContacts
      },
      message: 'Recent contacts retrieved successfully'
    };
  }
  
  async getSuggestedUsers() {
    await this.delay(300);
    
    const suggestedUsers = [
      {
        id: '4',
        username: 'tech_guru',
        displayName: 'Alex Chen',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Chen&background=FF9800&color=fff&size=100',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        isVerified: true
      },
      {
        id: '5',
        username: 'eco_warrior',
        displayName: 'Emma Green',
        avatar: 'https://ui-avatars.com/api/?name=Emma+Green&background=4CAF50&color=fff&size=100',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        isVerified: false
      },
      {
        id: '6',
        username: 'fitness_pro',
        displayName: 'Mike Strong',
        avatar: 'https://ui-avatars.com/api/?name=Mike+Strong&background=F44336&color=fff&size=100',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isVerified: true
      }
    ];
    
    return {
      success: true,
      data: {
        users: suggestedUsers
      },
      message: 'Suggested users retrieved successfully'
    };
  }
  
  async searchUsers(query: string) {
    await this.delay(400);
    
    const allUsers = [
      {
        id: '2',
        username: 'sarah_style',
        displayName: 'Sarah Johnson',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=E91E63&color=fff&size=100',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        isVerified: true
      },
      {
        id: '3',
        username: 'support_team',
        displayName: 'Support Team',
        avatar: 'https://ui-avatars.com/api/?name=Support+Team&background=4CAF50&color=fff&size=100',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        isVerified: true
      },
      {
        id: '4',
        username: 'tech_guru',
        displayName: 'Alex Chen',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Chen&background=FF9800&color=fff&size=100',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        isVerified: true
      },
      {
        id: '5',
        username: 'eco_warrior',
        displayName: 'Emma Green',
        avatar: 'https://ui-avatars.com/api/?name=Emma+Green&background=4CAF50&color=fff&size=100',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        isVerified: false
      },
      {
        id: '6',
        username: 'fitness_pro',
        displayName: 'Mike Strong',
        avatar: 'https://ui-avatars.com/api/?name=Mike+Strong&background=F44336&color=fff&size=100',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isVerified: true
      },
      {
        id: '7',
        username: 'fashion_lover',
        displayName: 'Diana Style',
        avatar: 'https://ui-avatars.com/api/?name=Diana+Style&background=9C27B0&color=fff&size=100',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        isVerified: false
      }
    ];
    
    // Filter users based on query
    const filteredUsers = query.length > 0 
      ? allUsers.filter(user => 
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.displayName.toLowerCase().includes(query.toLowerCase())
        )
      : [];
    
    return {
      success: true,
      data: {
        users: filteredUsers
      },
      message: 'User search completed successfully'
    };
  }

  // Health check endpoint
  async getHealth() {
    await this.delay(100);
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'mock-api-service',
        version: '1.0.0'
      },
      message: 'Service is healthy'
    };
  }

  // Generic HTTP methods for API client integration
  async get(endpoint: string, params?: any) {
    const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
    return this.makeRequest(url, { method: 'GET' });
  }

  async post(endpoint: string, data?: any) {
    return this.makeRequest(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    });
  }

  async put(endpoint: string, data?: any) {
    return this.makeRequest(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    });
  }

  async patch(endpoint: string, data?: any) {
    return this.makeRequest(endpoint, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    });
  }

  async delete(endpoint: string) {
    return this.makeRequest(endpoint, { method: 'DELETE' });
  }

  // Generic API call handler
  async makeRequest(endpoint: string, options: any = {}) {
    console.log('🔄 Mock API:', options.method || 'GET', endpoint);
    
    // Clean endpoint (remove query parameters for routing)
    const baseEndpoint = endpoint.split('?')[0];
    
    // Route to appropriate mock endpoint
    if (baseEndpoint.includes('/auth/login')) {
      return this.login(JSON.parse(options.body || '{}'));
    }
    
    if (baseEndpoint.includes('/auth/register')) {
      return this.register(JSON.parse(options.body || '{}'));
    }
    
    if (baseEndpoint.includes('/auth/profile')) {
      return this.getProfile();
    }
    
    if (baseEndpoint.includes('/products') && !baseEndpoint.includes('/products/')) {
      return this.getProducts();
    }
    
    if (baseEndpoint.includes('/products/')) {
      const pathParts = baseEndpoint.split('/products/');
      const id = pathParts.length > 1 ? pathParts[1] : '1';
      return this.getProduct(id);
    }
    
    if (baseEndpoint.includes('/cart') && options.method === 'POST') {
      return this.addToCart(JSON.parse(options.body || '{}'));
    }
    
    if (baseEndpoint.includes('/cart')) {
      return this.getCart();
    }
    
    if (baseEndpoint.includes('/messages/conversations')) {
      if (baseEndpoint.includes('/messages') && baseEndpoint.split('/conversations/').length > 1) {
        const pathParts = baseEndpoint.split('/conversations/');
        const conversationId = pathParts.length > 1 ? pathParts[1].split('/messages')[0] : '1';
        return this.getMessages(conversationId);
      }
      return this.getConversations();
    }
    
    if (baseEndpoint.includes('/messages/send') && options.method === 'POST') {
      return this.sendMessage(JSON.parse(options.body || '{}'));
    }
    
    if (baseEndpoint.includes('/messages/share-product') && options.method === 'POST') {
      return this.shareProduct(JSON.parse(options.body || '{}'));
    }
    
    if (baseEndpoint.includes('/messages/share-cart') && options.method === 'POST') {
      return this.shareCart(JSON.parse(options.body || '{}'));
    }
    
    if (baseEndpoint.includes('/users/recent-contacts')) {
      return this.getRecentContacts();
    }
    
    if (baseEndpoint.includes('/users/suggested')) {
      return this.getSuggestedUsers();
    }
    
    if (baseEndpoint.includes('/users/search')) {
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const query = urlParams.get('q') || '';
      return this.searchUsers(query);
    }
    
    if (baseEndpoint.includes('/videos/feed')) {
      // Parse query parameters for video feed
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const params = {
        page: parseInt(urlParams.get('page') || '1'),
        limit: parseInt(urlParams.get('limit') || '10'),
        trending: urlParams.get('trending') === 'true',
        following: urlParams.get('following') === 'true'
      };
      return this.getVideoFeed(params);
    }
    
    if (baseEndpoint.includes('/posts/feed')) {
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const params = {
        page: parseInt(urlParams.get('page') || '1'),
        limit: parseInt(urlParams.get('limit') || '10')
      };
      return this.getPostFeed(params);
    }
    
    if (baseEndpoint.includes('/products/search')) {
      return this.getProducts();
    }
    
    if (baseEndpoint.includes('/products/trending')) {
      return this.getProducts();
    }
    
    if (baseEndpoint.includes('/notifications')) {
      return this.getNotifications();
    }
    
    if (baseEndpoint.includes('/health')) {
      return this.getHealth();
    }
    
    // Default success response
    await this.delay(300);
    return {
      success: true,
      data: {},
      message: 'Mock API response - endpoint not specifically handled'
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockApiService = MockApiService.getInstance();