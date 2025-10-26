import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import VideoReels from '../components/VideoReels';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { videoService, VideoReel } from '../services/videoService';

interface VideoReelData {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified: boolean;
    followers: number;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
    originalPrice?: number;
  };
  hashtags: string[];
  isLiked: boolean;
  duration: number;
  createdAt: Date;
}

const VideoReelsPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoReelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const { addItem: addToCart } = useCart();
  const { toggleFavorite } = useFavorites();
  const { user, isAuthenticated } = useAuth();

  // Transform backend video to component format
  const transformVideoData = (backendVideo: VideoReel): VideoReelData => {
    return {
      id: backendVideo.id,
      videoUrl: backendVideo.videoUrl,
      thumbnailUrl: backendVideo.thumbnailUrl,
      title: backendVideo.title,
      description: backendVideo.description,
      creator: {
        id: backendVideo.creator?.id || 'unknown',
        username: backendVideo.creator?.username || 'unknown',
        displayName: backendVideo.creator?.displayName || 'Unknown User',
        avatar: backendVideo.creator?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        isVerified: backendVideo.creator?.isVerified || false,
        followers: backendVideo.creator?.followers || 0,
      },
      stats: {
        views: backendVideo.stats?.views || 0,
        likes: backendVideo.stats?.likes || 0,
        comments: backendVideo.stats?.comments || 0,
        shares: backendVideo.stats?.shares || 0,
      },
      product: backendVideo.product,
      hashtags: backendVideo.hashtags || [],
      isLiked: backendVideo.isLiked || false,
      duration: backendVideo.duration || 0,
      createdAt: new Date(backendVideo.createdAt || Date.now()),
    };
  };

  // Mock video data - fallback when backend is not available
  const mockVideos: VideoReelData[] = [
    {
      id: '1',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=700&fit=crop',
      title: 'Summer Fashion Haul 2024',
      description: 'Check out these amazing summer pieces! Perfect for beach days and city strolls ☀️✨ #summervibes #fashionhaul',
      creator: {
        id: '2',
        username: 'sarah_style',
        displayName: 'Sarah Johnson',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=E91E63&color=fff&size=100',
        isVerified: true,
        followers: 125000
      },
      stats: {
        views: 1200000,
        likes: 89500,
        comments: 2340,
        shares: 1200
      },
      product: {
        id: 'p1',
        name: 'Bohemian Summer Dress',
        price: 89.99,
        originalPrice: 120.00,
        image: 'https://picsum.photos/300/300?random=11',
        brand: 'Summer Breeze'
      },
      hashtags: ['#summervibes', '#fashionhaul', '#ootd', '#beachstyle'],
      isLiked: false,
      duration: 45,
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=700&fit=crop',
      title: 'Tech Review: Latest Gadgets',
      description: 'Unboxing and reviewing the hottest tech gadgets of 2024! Links in bio 📱💻 #techreview #unboxing',
      creator: {
        id: '3',
        username: 'tech_mike',
        displayName: 'Mike Chen',
        avatar: 'https://ui-avatars.com/api/?name=Mike+Chen&background=0D8ABC&color=fff&size=100',
        isVerified: true,
        followers: 89000
      },
      stats: {
        views: 890000,
        likes: 67200,
        comments: 1890,
        shares: 890
      },
      product: {
        id: 'p2',
        name: 'Wireless Earbuds Pro',
        price: 199.99,
        image: 'https://picsum.photos/300/300?random=12',
        brand: 'TechSound'
      },
      hashtags: ['#techreview', '#unboxing', '#gadgets', '#wireless'],
      isLiked: false,
      duration: 60,
      createdAt: new Date('2024-01-14')
    },
    {
      id: '3',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1533481405265-e9ce0c044abb?w=400&h=700&fit=crop',
      title: 'Home Workout Essentials',
      description: 'Get fit at home with these amazing workout essentials! No gym membership needed 💪🏠 #homeworkout #fitness',
      creator: {
        id: '4',
        username: 'fit_anna',
        displayName: 'Anna Fitness',
        avatar: 'https://ui-avatars.com/api/?name=Anna+Fitness&background=4CAF50&color=fff&size=100',
        isVerified: false,
        followers: 45000
      },
      stats: {
        views: 650000,
        likes: 45800,
        comments: 1200,
        shares: 560
      },
      product: {
        id: 'p3',
        name: 'Yoga Mat Premium',
        price: 49.99,
        originalPrice: 69.99,
        image: 'https://picsum.photos/300/300?random=13',
        brand: 'FitLife'
      },
      hashtags: ['#homeworkout', '#fitness', '#yoga', '#healthy'],
      isLiked: true,
      duration: 38,
      createdAt: new Date('2024-01-13')
    },
    {
      id: '4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=700&fit=crop',
      title: 'Travel Essentials for Digital Nomads',
      description: 'Everything I pack for remote work adventures! 🌍✈️ Perfect for digital nomads #travel #digitalnomad',
      creator: {
        id: '5',
        username: 'nomad_life',
        displayName: 'Travel Nomad',
        avatar: 'https://ui-avatars.com/api/?name=Travel+Nomad&background=FF9800&color=fff&size=100',
        isVerified: true,
        followers: 78000
      },
      stats: {
        views: 420000,
        likes: 32100,
        comments: 890,
        shares: 340
      },
      product: {
        id: 'p4',
        name: 'Travel Backpack 40L',
        price: 129.99,
        image: 'https://picsum.photos/300/300?random=14',
        brand: 'WanderPack'
      },
      hashtags: ['#travel', '#digitalnomad', '#backpack', '#adventure'],
      isLiked: false,
      duration: 52,
      createdAt: new Date('2024-01-12')
    },
    {
      id: '5',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-4b9412e7e94a?w=400&h=700&fit=crop',
      title: 'Skincare Routine That Changed My Life',
      description: 'My morning and evening skincare routine for glowing skin ✨ All products linked below! #skincare #glowup',
      creator: {
        id: '6',
        username: 'beauty_guru',
        displayName: 'Beauty Guru',
        avatar: 'https://ui-avatars.com/api/?name=Beauty+Guru&background=E91E63&color=fff&size=100',
        isVerified: true,
        followers: 156000
      },
      stats: {
        views: 780000,
        likes: 58900,
        comments: 1560,
        shares: 720
      },
      product: {
        id: 'p5',
        name: 'Vitamin C Serum',
        price: 34.99,
        originalPrice: 45.99,
        image: 'https://picsum.photos/300/300?random=15',
        brand: 'GlowSkin'
      },
      hashtags: ['#skincare', '#glowup', '#beauty', '#routine'],
      isLiked: false,
      duration: 41,
      createdAt: new Date('2024-01-11')
    }
  ];

  const loadVideos = async (pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true);
      setError(null);
    }

    try {
      // Try to fetch from backend first
      const response = await videoService.getVideoFeed({ 
        page: pageNum, 
        limit: 10,
        following: isAuthenticated // Get following videos if authenticated
      });

      if (response.success && response.videos) {
        const transformedVideos = response.videos.map(transformVideoData);
        
        if (append) {
          setVideos(prev => [...prev, ...transformedVideos]);
        } else {
          setVideos(transformedVideos);
        }
        
        setHasMore(response.hasMore || false);
        setPage(pageNum);
      } else {
        throw new Error(response.error || 'Failed to fetch videos');
      }
    } catch (err) {
      console.warn('Backend video fetch failed, using mock data:', err);
      
      // Fallback to mock data only on first page load
      if (pageNum === 1) {
        setVideos(mockVideos);
        setHasMore(false);
      } else {
        setError('Failed to load more videos. Please try again.');
      }
    } finally {
      if (pageNum === 1) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadVideos(1);
  }, [isAuthenticated]);

  const handleLike = async (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    // Optimistic update
    setVideos(prevVideos => 
      prevVideos.map(v => 
        v.id === videoId 
          ? { 
              ...v, 
              isLiked: !v.isLiked,
              stats: {
                ...v.stats,
                likes: v.isLiked ? v.stats.likes - 1 : v.stats.likes + 1
              }
            } 
          : v
      )
    );

    try {
      const response = await videoService.toggleLike(videoId, video.isLiked);
      
      if (response.success && response.newLikeCount !== undefined) {
        // Update with actual like count from server
        setVideos(prevVideos => 
          prevVideos.map(v => 
            v.id === videoId 
              ? { 
                  ...v, 
                  stats: {
                    ...v.stats,
                    likes: response.newLikeCount!
                  }
                } 
              : v
          )
        );
      }
    } catch (error) {
      console.error('Failed to like video:', error);
      // Revert optimistic update on error
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === videoId 
            ? { 
                ...v, 
                isLiked: !v.isLiked,
                stats: {
                  ...v.stats,
                  likes: v.isLiked ? v.stats.likes + 1 : v.stats.likes - 1
                }
              } 
            : v
        )
      );
    }
  };

  const handleShare = async (video: VideoReelData) => {
    try {
      // Get share URL from backend
      const shareResponse = await videoService.shareVideo(video.id);
      const shareUrl = shareResponse.shareUrl || `${window.location.origin}/videos/${video.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: shareUrl
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(shareUrl);
        alert('Video link copied to clipboard!');
      }
      
      // Update share count optimistically
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === video.id 
            ? { ...v, stats: { ...v.stats, shares: v.stats.shares + 1 } }
            : v
        )
      );
      
      if (!shareResponse.success) {
        console.warn('Failed to track share on backend:', shareResponse.error);
      }
    } catch (error) {
      console.error('Failed to share video:', error);
      
      // Fallback share without backend
      try {
        const fallbackUrl = `${window.location.origin}/videos/${video.id}`;
        if (navigator.share) {
          await navigator.share({
            title: video.title,
            text: video.description,
            url: fallbackUrl
          });
        } else {
          await navigator.clipboard.writeText(fallbackUrl);
          alert('Video link copied to clipboard!');
        }
      } catch (fallbackError) {
        console.error('Fallback share also failed:', fallbackError);
      }
    }
  };

  const handleComment = (videoId: string) => {
    // TODO: Open comments modal or navigate to comments page
    console.log('Open comments for video:', videoId);
    // This could open a modal, or navigate to a comments page
    alert('Comments feature coming soon!');
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const handleProductClick = (productId: string) => {
    // TODO: Navigate to product page or open product modal
    console.log('Open product:', productId);
    // This could navigate to a product detail page
  };

  const handleFollow = async (userId: string) => {
    try {
      // TODO: Call backend API to follow user
      console.log('Follow user:', userId);
      alert('Follow feature coming soon!');
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="black"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        p={3}
        bgcolor="black"
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Oops! Something went wrong
          </Typography>
          {error}
        </Alert>
      </Box>
    );
  }

  if (videos.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        p={3}
        bgcolor="black"
      >
        <Typography variant="h5" color="white">
          No videos available at the moment
        </Typography>
      </Box>
    );
  }

  return (
    <VideoReels
      videos={videos}
      onLike={handleLike}
      onShare={handleShare}
      onComment={handleComment}
      onAddToCart={handleAddToCart}
      onProductClick={handleProductClick}
      onFollow={handleFollow}
    />
  );
};

export default VideoReelsPage;