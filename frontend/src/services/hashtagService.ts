// Hashtag management service
export interface Hashtag {
  id: string;
  name: string;
  count: number;
  trending: boolean;
  category?: string;
  description?: string;
  relatedProducts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HashtagPost {
  id: string;
  hashtags: string[];
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export class HashtagService {
  private hashtags: Map<string, Hashtag> = new Map();
  private hashtagPosts: Map<string, HashtagPost[]> = new Map();
  private trendingCache: { data: Hashtag[]; timestamp: number } | null = null;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoHashtags: Hashtag[] = [
      {
        id: '1',
        name: '#TechReview',
        count: 1547,
        trending: true,
        category: 'Technology',
        description: 'Latest technology reviews and insights',
        relatedProducts: ['tech_1', 'fakestore_1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: '#SustainableFashion',
        count: 892,
        trending: true,
        category: 'Fashion',
        description: 'Eco-friendly and sustainable fashion choices',
        relatedProducts: ['fashion_1', 'fashion_2'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: '#HomeDecor',
        count: 674,
        trending: false,
        category: 'Home & Garden',
        description: 'Beautiful home decoration ideas and products',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        name: '#Fitness',
        count: 1203,
        trending: true,
        category: 'Health & Fitness',
        description: 'Fitness equipment and workout inspiration',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        name: '#Cooking',
        count: 567,
        trending: false,
        category: 'Food & Kitchen',
        description: 'Cooking tips and kitchen gadgets',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '6',
        name: '#Gaming',
        count: 2341,
        trending: true,
        category: 'Gaming',
        description: 'Gaming reviews and equipment',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '7',
        name: '#Photography',
        count: 445,
        trending: false,
        category: 'Photography',
        description: 'Photography gear and techniques',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '8',
        name: '#BookReview',
        count: 234,
        trending: false,
        category: 'Books',
        description: 'Book reviews and recommendations',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Store hashtags
    demoHashtags.forEach(hashtag => {
      this.hashtags.set(hashtag.name.toLowerCase(), hashtag);
    });

    // Generate demo posts for hashtags
    this.generateDemoPosts();
  }

  private generateDemoPosts() {
    const demoUsers = [
      { id: '1', name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50' },
      { id: '2', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50' },
      { id: '3', name: 'Mike Davis', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50' },
      { id: '4', name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50' },
      { id: '5', name: 'Ryan Martinez', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50' }
    ];

    const postTemplates = [
      {
        hashtags: ['#TechReview', '#Gaming'],
        content: 'Just got the new gaming headset and it\'s absolutely incredible! The sound quality is mind-blowing 🎧✨'
      },
      {
        hashtags: ['#SustainableFashion'],
        content: 'Love these eco-friendly jeans! Sustainable fashion doesn\'t have to compromise on style 🌱👖'
      },
      {
        hashtags: ['#Fitness', '#HomeDecor'],
        content: 'Created the perfect home gym corner. Sometimes the best workout is right at home! 💪🏠'
      },
      {
        hashtags: ['#Cooking'],
        content: 'New air fryer is a game changer! Healthy cooking has never been this easy and delicious 🍳'
      },
      {
        hashtags: ['#Photography', '#TechReview'],
        content: 'This camera lens is perfect for portrait photography. The bokeh effect is stunning! 📸'
      }
    ];

    postTemplates.forEach((template, index) => {
      const post: HashtagPost = {
        id: `post_${index + 1}`,
        hashtags: template.hashtags,
        content: template.content,
        author: demoUsers[index % demoUsers.length],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        engagement: {
          likes: Math.floor(Math.random() * 500) + 50,
          comments: Math.floor(Math.random() * 50) + 5,
          shares: Math.floor(Math.random() * 20) + 1
        }
      };

      // Add post to each hashtag
      template.hashtags.forEach(hashtag => {
        const normalizedHashtag = hashtag.toLowerCase();
        if (!this.hashtagPosts.has(normalizedHashtag)) {
          this.hashtagPosts.set(normalizedHashtag, []);
        }
        this.hashtagPosts.get(normalizedHashtag)!.push(post);
      });
    });
  }

  // Extract hashtags from text
  extractHashtags(text: string): string[] {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? Array.from(new Set(matches.map(tag => tag.toLowerCase()))) : [];
  }

  // Search hashtags
  async searchHashtags(query: string, limit: number = 20): Promise<Hashtag[]> {
    const normalizedQuery = query.toLowerCase().replace('#', '');
    
    const results: Hashtag[] = [];
    Array.from(this.hashtags.entries()).forEach(([name, hashtag]) => {
      if (name.includes(normalizedQuery) || 
          hashtag.description?.toLowerCase().includes(normalizedQuery) ||
          hashtag.category?.toLowerCase().includes(normalizedQuery)) {
        results.push(hashtag);
      }
    });

    // Sort by relevance (exact matches first, then by count)
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === `#${normalizedQuery}`;
      const bExact = b.name.toLowerCase() === `#${normalizedQuery}`;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return b.count - a.count;
    });

    return results.slice(0, limit);
  }

  // Get trending hashtags
  async getTrendingHashtags(limit: number = 10): Promise<Hashtag[]> {
    // Check cache
    if (this.trendingCache && Date.now() - this.trendingCache.timestamp < this.cacheTimeout) {
      return this.trendingCache.data.slice(0, limit);
    }

    const trending: Hashtag[] = Array.from(this.hashtags.values())
      .filter(hashtag => hashtag.trending)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    // Cache the result
    this.trendingCache = {
      data: trending,
      timestamp: Date.now()
    };

    return trending;
  }

  // Get hashtag details
  async getHashtagDetails(name: string): Promise<Hashtag | null> {
    const normalizedName = name.toLowerCase();
    return this.hashtags.get(normalizedName) || null;
  }

  // Get posts for a hashtag
  async getHashtagPosts(name: string, offset: number = 0, limit: number = 20): Promise<HashtagPost[]> {
    const normalizedName = name.toLowerCase();
    const posts = this.hashtagPosts.get(normalizedName) || [];
    
    // Sort by engagement and recency
    const sortedPosts = [...posts].sort((a, b) => {
      const aScore = a.engagement.likes + a.engagement.comments * 2 + a.engagement.shares * 3;
      const bScore = b.engagement.likes + b.engagement.comments * 2 + b.engagement.shares * 3;
      
      // If scores are close, sort by recency
      if (Math.abs(aScore - bScore) < 10) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      return bScore - aScore;
    });

    return sortedPosts.slice(offset, offset + limit);
  }

  // Add or update hashtag
  async addHashtag(name: string, post?: HashtagPost): Promise<Hashtag> {
    const normalizedName = name.toLowerCase();
    
    if (this.hashtags.has(normalizedName)) {
      // Update existing hashtag
      const hashtag = this.hashtags.get(normalizedName)!;
      hashtag.count += 1;
      hashtag.updatedAt = new Date().toISOString();
      
      // Check if it should be trending (simple heuristic)
      if (hashtag.count > 500 && !hashtag.trending) {
        hashtag.trending = true;
      }
      
      if (post) {
        if (!this.hashtagPosts.has(normalizedName)) {
          this.hashtagPosts.set(normalizedName, []);
        }
        this.hashtagPosts.get(normalizedName)!.unshift(post);
      }
      
      return hashtag;
    } else {
      // Create new hashtag
      const hashtag: Hashtag = {
        id: Date.now().toString(),
        name: name,
        count: 1,
        trending: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.hashtags.set(normalizedName, hashtag);
      
      if (post) {
        this.hashtagPosts.set(normalizedName, [post]);
      }
      
      return hashtag;
    }
  }

  // Get hashtags by category
  async getHashtagsByCategory(category: string, limit: number = 10): Promise<Hashtag[]> {
    const results: Hashtag[] = Array.from(this.hashtags.values())
      .filter(hashtag => hashtag.category?.toLowerCase() === category.toLowerCase())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return results;
  }

  // Get related hashtags
  async getRelatedHashtags(name: string, limit: number = 5): Promise<Hashtag[]> {
    const hashtag = await this.getHashtagDetails(name);
    if (!hashtag) return [];

    // Find hashtags in the same category
    const relatedByCategory = hashtag.category 
      ? await this.getHashtagsByCategory(hashtag.category, limit * 2)
      : [];

    // Filter out the current hashtag and limit results
    return relatedByCategory
      .filter(h => h.name.toLowerCase() !== name.toLowerCase())
      .slice(0, limit);
  }

  // Clear cache
  clearCache() {
    this.trendingCache = null;
  }
}

export default new HashtagService();