import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'like' | 'follow' | 'comment' | 'mention' | 'sale' | 'order' | 'system';
  title: string;
  message: string;
  avatar?: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: any;
}

export interface HashtagData {
  tag: string;
  count: number;
  trending: boolean;
  category?: string;
}

export interface FollowUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  bio: string;
  followerCount: number;
  isFollowing?: boolean;
  mutualFollowers?: number;
}

interface SocialContextType {
  // Followers & Following
  followers: FollowUser[];
  following: FollowUser[];
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  getFollowers: (userId: string) => Promise<FollowUser[]>;
  getFollowing: (userId: string) => Promise<FollowUser[]>;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;

  // Hashtags
  trendingHashtags: HashtagData[];
  searchHashtags: (query: string) => HashtagData[];
  getPostsByHashtag: (hashtag: string) => Promise<any[]>;
  extractHashtags: (text: string) => string[];

  // Loading states
  loading: {
    followers: boolean;
    notifications: boolean;
    hashtags: boolean;
  };
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<HashtagData[]>([]);
  const [loading, setLoading] = useState({
    followers: false,
    notifications: false,
    hashtags: false
  });

  // Mock data initialization
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    }
  }, [isAuthenticated, user]);

  const loadInitialData = async () => {
    // Load mock followers
    const mockFollowers: FollowUser[] = [
      {
        id: '2',
        username: 'sarah_style',
        displayName: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        isVerified: true,
        bio: 'Fashion enthusiast & lifestyle blogger',
        followerCount: 5600,
        mutualFollowers: 12
      },
      {
        id: '3',
        username: 'tech_mike',
        displayName: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        isVerified: false,
        bio: 'Tech reviewer | Gadget lover',
        followerCount: 3200,
        mutualFollowers: 8
      }
    ];

    const mockFollowing: FollowUser[] = [
      {
        id: '4',
        username: 'creative_anna',
        displayName: 'Anna Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1534008757030-27299c4371b6?w=100&h=100&fit=crop&crop=face',
        isVerified: true,
        bio: 'Digital artist & content creator',
        followerCount: 8900,
        isFollowing: true
      }
    ];

    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'like',
        title: 'New Like',
        message: 'Sarah Johnson liked your post',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        isRead: false
      },
      {
        id: '2',
        type: 'follow',
        title: 'New Follower',
        message: 'Mike Chen started following you',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isRead: false
      },
      {
        id: '3',
        type: 'sale',
        title: 'Product Sold',
        message: 'Your Nike Air Max was purchased!',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
        metadata: { productId: 'p1', amount: 129.99 }
      }
    ];

    const mockHashtags: HashtagData[] = [
      { tag: 'fashion', count: 12500, trending: true, category: 'lifestyle' },
      { tag: 'tech', count: 8900, trending: true, category: 'technology' },
      { tag: 'sneakers', count: 6700, trending: true, category: 'fashion' },
      { tag: 'ai', count: 5400, trending: false, category: 'technology' },
      { tag: 'fitness', count: 4200, trending: false, category: 'health' }
    ];

    setFollowers(mockFollowers);
    setFollowing(mockFollowing);
    setNotifications(mockNotifications);
    setTrendingHashtags(mockHashtags);
  };

  const followUser = async (userId: string): Promise<boolean> => {
    try {
      setLoading(prev => ({ ...prev, followers: true }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update following list
      const userToFollow = followers.find(f => f.id === userId);
      if (userToFollow) {
        setFollowing(prev => [...prev, { ...userToFollow, isFollowing: true }]);
      }

      // Add notification for the followed user (mock)
      addNotification({
        type: 'follow',
        title: 'Following',
        message: `You are now following ${userToFollow?.displayName || 'user'}`
      });

      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(prev => ({ ...prev, followers: false }));
    }
  };

  const unfollowUser = async (userId: string): Promise<boolean> => {
    try {
      setLoading(prev => ({ ...prev, followers: true }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFollowing(prev => prev.filter(f => f.id !== userId));
      
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(prev => ({ ...prev, followers: false }));
    }
  };

  const getFollowers = async (userId: string): Promise<FollowUser[]> => {
    setLoading(prev => ({ ...prev, followers: true }));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLoading(prev => ({ ...prev, followers: false }));
    return followers;
  };

  const getFollowing = async (userId: string): Promise<FollowUser[]> => {
    setLoading(prev => ({ ...prev, followers: true }));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLoading(prev => ({ ...prev, followers: false }));
    return following;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const searchHashtags = (query: string): HashtagData[] => {
    if (!query.trim()) return trendingHashtags;
    
    return trendingHashtags.filter(tag =>
      tag.tag.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getPostsByHashtag = async (hashtag: string): Promise<any[]> => {
    // Mock implementation - would fetch posts with this hashtag
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: SocialContextType = {
    followers,
    following,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    trendingHashtags,
    searchHashtags,
    getPostsByHashtag,
    extractHashtags,
    loading
  };

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
};