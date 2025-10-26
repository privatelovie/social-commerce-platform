import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Drawer,
  Chip,
  Container,
  Snackbar
} from '@mui/material';
import { 
  Add,
  ShoppingCartCheckout,
  VerifiedUser,
  Send
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Context Providers
import { CartProvider } from './context/CartContext';

// Components
import Navigation from './components/Navigation';
import PostCard from './components/PostCard';

// Services
import { RealProduct } from './services/productApi';



const mockUsers = [
  {
    id: 1,
    username: "@techguru",
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    verified: true,
    followers: 12500,
    following: 892,
    bio: "Tech reviewer & gadget enthusiast 📱✨",
    aiPersonality: "tech-savvy"
  },
  {
    id: 2,
    username: "@fashionista_sara",
    name: "Sara Williams", 
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b25fc4e4?w=100",
    verified: false,
    followers: 8900,
    following: 1200,
    bio: "Fashion blogger | Sustainable style advocate 🌿👗",
    aiPersonality: "fashion-forward"
  }
];

const advancedProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    price: 1199.99,
    originalPrice: 1299.99,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    rating: 4.8,
    reviewCount: 2847,
    category: "Electronics",
    subcategory: "Smartphones",
    inStock: true,
    discount: 8,
    description: "Latest iPhone with titanium design, A17 Pro chip, and advanced camera system",
    features: ["48MP Main Camera", "A17 Pro Chip", "Titanium Design", "USB-C"],
    aiScore: 95,
    sentimentScore: 0.85,
    trendingScore: 98,
    reviews: [
      {
        id: 1,
        user: { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108755-2616b25fc4e4?w=50" },
        rating: 5,
        comment: "Amazing camera quality! The titanium build feels incredibly premium. Worth every penny.",
        date: "2024-01-15",
        verified: true
      },
      {
        id: 2,
        user: { name: "Mike Johnson", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50" },
        rating: 4,
        comment: "Great performance but the price is quite steep. Camera is definitely the standout feature.",
        date: "2024-01-12",
        verified: true
      },
      {
        id: 3,
        user: { name: "Emily Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50" },
        rating: 5,
        comment: "Love the new Action Button and USB-C! Finally made the switch from Android and couldn't be happier.",
        date: "2024-01-10",
        verified: false
      }
    ]
  },
  {
    id: 2,
    name: "AirPods Pro (3rd Gen)",
    brand: "Apple",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400",
    rating: 4.7,
    reviewCount: 1923,
    category: "Electronics",
    subcategory: "Headphones",
    inStock: true,
    description: "Next-level ANC with Adaptive Transparency and Spatial Audio",
    features: ["Active Noise Cancellation", "Spatial Audio", "MagSafe Charging"],
    aiScore: 92,
    sentimentScore: 0.82,
    trendingScore: 89,
    reviews: [
      {
        id: 1,
        user: { name: "Alex Thompson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" },
        rating: 5,
        comment: "Best noise cancellation I've ever experienced. Perfect for commuting and work.",
        date: "2024-01-14",
        verified: true
      },
      {
        id: 2,
        user: { name: "Jessica Liu", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" },
        rating: 4,
        comment: "Great sound quality but I wish the battery lasted longer. Still recommend them!",
        date: "2024-01-11",
        verified: true
      }
    ]
  },
  {
    id: 3,
    name: "Nike Dunk Low Retro",
    brand: "Nike",
    price: 110.00,
    originalPrice: 130.00,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    rating: 4.6,
    reviewCount: 5421,
    category: "Fashion",
    subcategory: "Sneakers",
    inStock: true,
    discount: 15,
    description: "Classic basketball style meets street fashion",
    features: ["Premium Leather", "Rubber Outsole", "Classic Design"],
    aiScore: 88,
    sentimentScore: 0.79,
    trendingScore: 94,
    reviews: [
      {
        id: 1,
        user: { name: "Jordan Smith", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50" },
        rating: 5,
        comment: "Classic design that never goes out of style. Super comfortable for daily wear.",
        date: "2024-01-13",
        verified: true
      },
      {
        id: 2,
        user: { name: "Maya Patel", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=50" },
        rating: 4,
        comment: "Love the retro look! Fits true to size and great quality for the price.",
        date: "2024-01-09",
        verified: false
      }
    ]
  }
];

const socialPosts = [
  {
    id: 1,
    user: mockUsers[0],
    content: "Just got my hands on the new iPhone 15 Pro Max! 📱 The titanium build feels premium and the cameras are INSANE. Already shot some 4K ProRes footage. Worth the upgrade? 🤔 #iPhone15Pro #TechReview",
    timestamp: "2 hours ago",
    likes: 1247,
    comments: 89,
    shares: 34,
    bookmarks: 156,
    product: advancedProducts[0],
    aiInsight: "Based on 1,200+ similar reviews, users love the camera quality but find the price steep",
    sentimentScore: 0.84,
    engagement: "high",
    hashtags: ["#iPhone15Pro", "#TechReview"],
    media: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600"
    ],
    postComments: [
      {
        id: 1,
        user: { name: "Lisa Park", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50" },
        content: "The camera quality in those shots is incredible! Definitely considering this upgrade now.",
        timestamp: "1 hour ago",
        likes: 23
      },
      {
        id: 2,
        user: { name: "David Kim", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=50" },
        content: "Price is steep but the features look worth it. Great review!",
        timestamp: "45 minutes ago",
        likes: 12
      }
    ]
  },
  {
    id: 2,
    user: mockUsers[1],
    content: "Sustainable fashion haul! 🌱✨ These Nike Dunks are made from recycled materials and they're so comfy. Fashion doesn't have to hurt the planet 💚 #SustainableFashion #EcoFriendly",
    timestamp: "4 hours ago",
    likes: 892,
    comments: 67,
    shares: 23,
    bookmarks: 145,
    product: advancedProducts[2],
    aiInsight: "Sustainable fashion posts get 40% more engagement. Users appreciate eco-conscious choices",
    sentimentScore: 0.91,
    engagement: "medium-high",
    hashtags: ["#SustainableFashion", "#EcoFriendly"],
    media: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
    ],
    postComments: [
      {
        id: 1,
        user: { name: "Emma Wilson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b25fc4e4?w=50" },
        content: "Love seeing more sustainable options! Do they feel different from regular sneakers?",
        timestamp: "3 hours ago",
        likes: 15
      }
    ]
  },
  {
    id: 3,
    user: {
      id: 4,
      username: "@techreviewer",
      name: "Tech Insider",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      verified: true,
      followers: 89000,
      following: 234,
      bio: "Latest tech reviews & insights 📱💻"
    },
    content: "AirPods Pro 3rd Gen review: The noise cancellation is next level! Perfect for my daily commute and work calls. The spatial audio makes movies feel cinematic. 🎧 #AirPods #TechReview",
    timestamp: "6 hours ago",
    likes: 654,
    comments: 43,
    shares: 18,
    bookmarks: 87,
    product: advancedProducts[1],
    aiInsight: "Audio quality and noise cancellation are the most mentioned features in recent reviews",
    sentimentScore: 0.87,
    engagement: "medium",
    hashtags: ["#AirPods", "#TechReview"],
    media: [
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600"
    ],
    postComments: [
      {
        id: 1,
        user: { name: "Chris Martinez", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" },
        content: "Been using mine for 2 months now. Battery life could be better but the sound quality is amazing!",
        timestamp: "5 hours ago",
        likes: 28
      },
      {
        id: 2,
        user: { name: "Sarah Thompson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50" },
        content: "How's the fit? I had issues with the previous generation falling out.",
        timestamp: "4 hours ago",
        likes: 8
      }
    ]
  },
  {
    id: 4,
    user: {
      id: 5,
      username: "@styleinfluencer",
      name: "Fashion Forward",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      verified: false,
      followers: 45000,
      following: 1500,
      bio: "Fashion & lifestyle content creator 👗✨"
    },
    content: "Spring wardrobe essentials! 🌸 Loving these versatile pieces that can be dressed up or down. What are your must-haves for the season? #SpringFashion #OOTD",
    timestamp: "8 hours ago",
    likes: 1205,
    comments: 156,
    shares: 89,
    bookmarks: 234,
    aiInsight: "Fashion content performs best during seasonal transitions",
    sentimentScore: 0.76,
    engagement: "high",
    hashtags: ["#SpringFashion", "#OOTD"],
    media: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600"
    ],
    postComments: [
      {
        id: 1,
        user: { name: "Olivia Chen", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50" },
        content: "Love your styling! Where did you get that blazer?",
        timestamp: "7 hours ago",
        likes: 34
      },
      {
        id: 2,
        user: { name: "Mia Rodriguez", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=50" },
        content: "These colors are perfect for spring! So inspiring 🌼",
        timestamp: "6 hours ago",
        likes: 19
      }
    ]
  }
];


function App() {
  // State management
  const [currentView, setCurrentView] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistItems, setWishlistItems] = useState<RealProduct[]>([]);
  const [posts, setPosts] = useState(socialPosts);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<number>>(new Set());
  
  // User & Social State
  const [currentUser] = useState(mockUsers[0]);
  const [followedUsers, setFollowedUsers] = useState<number[]>([2, 3]);
  
  // Shopping State
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  
  // AI & Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Post Creation
  const [newPostContent, setNewPostContent] = useState('');
  
  // UI Feedback
  const [cartMessage, setCartMessage] = useState('');
  
  // Comment System
  const [showComments, setShowComments] = useState<{ [postId: number]: boolean }>({});
  const [newComment, setNewComment] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState<number | null>(null);
  
  // Product Reviews
  const [showReviews, setShowReviews] = useState<{ [productId: number]: boolean }>({});
  // const [selectedProductReviews, setSelectedProductReviews] = useState<any>(null);
  
  // Notifications 
  const [notifications] = useState<any[]>([]);
  
  // AI insights
  const [aiInsightsEnabled] = useState(true);

  // Social Functions
  const handleLikePost = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };
  
  const handleBookmarkPost = (postId: number) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };
  
  const handleFollowUser = (userId: number) => {
    setFollowedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    const newPost = {
      id: Date.now(),
      user: currentUser,
      content: newPostContent,
      timestamp: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarks: 0,
      hashtags: [],
      engagement: 'new',
      sentimentScore: 0.8,
      aiInsight: 'Your new post is trending!',
      media: [],
      postComments: []
    } as any;
    
    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
  };
  
  // Comment Functions
  const toggleComments = (postId: number) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };
  
  const handleAddComment = (postId: number) => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      user: { name: currentUser.name, avatar: currentUser.avatar },
      content: newComment,
      timestamp: 'now',
      likes: 0
    };
    
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            postComments: [...(post.postComments || []), comment],
            comments: post.comments + 1
          }
        : post
    ));
    
    setNewComment('');
    setActiveCommentPost(null);
  };
  
  // Product Review Functions
  const toggleProductReviews = (productId: number) => {
    setShowReviews(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  // Shopping Functions
  const addToCart = (product: any, selectedVariant?: any, quantity = 1) => {
    const cartItem = {
      cartId: `${product.id}-${Date.now()}`,
      ...product,
      quantity,
      selectedVariant,
      addedAt: new Date().toISOString()
    };
    
    setCartItems(prev => [...prev, cartItem]);
    setCartMessage(`${product.name} added to cart!`);
  };
  
  const toggleWishlist = (product: any) => {
    setWishlistItems(prev => {
      const isInWishlist = prev.find(item => item.id === product.id);
      return isInWishlist 
        ? prev.filter(item => item.id !== product.id)
        : [...prev, product];
    });
  };

  // Filter posts by search
  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.hashtags && post.hashtags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );
  
  // Calculate counts for badges
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const notificationsCount = notifications.length;

  // Simple Cart Drawer
  const CartDrawer = () => (
    <Drawer
      anchor="right"
      open={showCart}
      onClose={() => setShowCart(false)}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100vw', sm: 450 }, p: 2 } }}
    >
      <Typography variant="h6" gutterBottom>
        Shopping Cart ({cartItemsCount})
      </Typography>
      {cartItems.length === 0 ? (
        <Box textAlign="center" p={4}>
          <ShoppingCartCheckout sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Your cart is empty
          </Typography>
        </Box>
      ) : (
        cartItems.map(item => (
          <Card key={item.cartId} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="body2" color="primary">
                ${item.price} x {item.quantity}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Drawer>
  );

  // Simple Trending Sidebar
  const TrendingSidebar = () => (
    <Card sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Trending Topics
      </Typography>
      <Stack spacing={1}>
        <Chip label="#TechReview2024" onClick={() => setSearchQuery('#TechReview2024')} />
        <Chip label="#iPhone15Pro" onClick={() => setSearchQuery('#iPhone15Pro')} />
        <Chip label="#SustainableFashion" onClick={() => setSearchQuery('#SustainableFashion')} />
      </Stack>
    </Card>
  );

  return (
    <CartProvider>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pb: { xs: 8, md: 0 }
      }}>
        {/* Navigation */}
        <Navigation
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartItemsCount={cartItemsCount}
        wishlistCount={wishlistCount}
        notificationsCount={notificationsCount}
        onCartOpen={() => setShowCart(true)}
        onNotificationsOpen={() => setShowNotifications(!showNotifications)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 2, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left Sidebar - Desktop Only */}
          <Box sx={{ width: 280, display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              {/* Create Post Card */}
              <Card sx={{ 
                mb: 3, 
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>  
                    <Avatar src={currentUser.avatar} sx={{ width: 40, height: 40 }} />
                    <Typography variant="h6" fontWeight={600}>
                      What's happening?
                    </Typography>
                  </Box>
                  <TextField
                    multiline
                    rows={3}
                    placeholder="Share your thoughts, products, or discoveries..."
                    variant="outlined"
                    fullWidth
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px'
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreatePost}
                    fullWidth
                    disabled={!newPostContent.trim()}
                    sx={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      py: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b5b95 100%)',
                      }
                    }}
                  >
                    Share Post
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>
          
          {/* Main Feed */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* View Content */}
              <AnimatePresence mode="wait">
                {/* Feed View */}
                {currentView === 'feed' && (
                  <motion.div
                    key="feed"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Mobile Create Post */}
                    <Card sx={{ 
                      display: { xs: 'block', md: 'none' },
                      mb: 3,
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <TextField
                          placeholder="What's happening?"
                          variant="outlined"
                          fullWidth
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px'
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={handleCreatePost}
                                disabled={!newPostContent.trim()}
                                sx={{
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                              >
                                Post
                              </Button>
                            )
                          }}
                        />
                      </CardContent>
                    </Card>
                    
                    {/* Posts Feed */}
                    {filteredPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <PostCard
                          post={post}
                          currentUser={currentUser}
                          isLiked={likedPosts.has(post.id)}
                          isBookmarked={bookmarkedPosts.has(post.id)}
                          isFollowing={followedUsers.includes(post.user.id)}
                          onLike={handleLikePost}
                          onBookmark={handleBookmarkPost}
                          onFollow={handleFollowUser}
                          onAddToCart={addToCart}
                          onProductClick={toggleProductReviews}
                          onWishlist={toggleWishlist}
                          wishlistItems={wishlistItems}
                          aiInsightsEnabled={aiInsightsEnabled}
                          onToggleComments={toggleComments}
                        />
                        
                        {/* Comments Section */}
                        <Card sx={{ 
                          mt: -1,
                          mb: 2,
                          borderRadius: '0 0 16px 16px',
                          background: 'rgba(255, 255, 255, 0.98)',
                          display: showComments[post.id] ? 'block' : 'none'
                        }}>
                          <CardContent sx={{ pt: 1 }}>
                            {/* Add Comment */}
                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                              <Avatar src={currentUser.avatar} sx={{ width: 32, height: 32 }} />
                              <TextField
                                placeholder="Write a comment..."
                                variant="outlined"
                                size="small"
                                fullWidth
                                value={activeCommentPost === post.id ? newComment : ''}
                                onFocus={() => setActiveCommentPost(post.id)}
                                onChange={(e) => setNewComment(e.target.value)}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px'
                                  }
                                }}
                                InputProps={{
                                  endAdornment: activeCommentPost === post.id && newComment && (
                                    <Button
                                      size="small"
                                      onClick={() => handleAddComment(post.id)}
                                      sx={{ minWidth: 'auto', p: 0.5 }}
                                    >
                                      <Send sx={{ fontSize: 16 }} />
                                    </Button>
                                  )
                                }}
                              />
                            </Box>
                            
                            {/* Comments List */}
                            <Stack spacing={2}>
                              {post.postComments?.map((comment: any) => (
                                <Box key={comment.id} sx={{ display: 'flex', gap: 1 }}>
                                  <Avatar src={comment.user.avatar} sx={{ width: 28, height: 28 }} />
                                  <Box sx={{ 
                                    background: 'rgba(0, 0, 0, 0.04)', 
                                    borderRadius: '12px', 
                                    p: 1.5, 
                                    flex: 1 
                                  }}>
                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '13px' }}>
                                      {comment.user.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '13px', mt: 0.5 }}>
                                      {comment.content}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                      {comment.timestamp} • {comment.likes} likes
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                
                {/* Explore View */}
                {currentView === 'explore' && (
                  <motion.div
                    key="explore"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                      Explore Products
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                      {advancedProducts.map(product => (
                        <Box key={product.id}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              borderRadius: '16px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                              }
                            }}
                            onClick={() => toggleProductReviews(product.id)}
                          >
                            <CardMedia
                              component="img"
                              height="200"
                              image={product.image}
                              alt={product.name}
                            />
                            <CardContent>
                              <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {product.name}
                              </Typography>
                              <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                                ${product.price}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Typography component="span" sx={{ fontSize: 14, fontWeight: 600 }}>
                                  {product.rating}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({product.reviewCount} reviews)
                                </Typography>
                              </Box>
                              <Button 
                                variant="contained" 
                                fullWidth
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product);
                                }}
                                sx={{ 
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                              >
                                Add to Cart
                              </Button>
                            </CardContent>
                          </Card>
                          
                          {/* Product Reviews */}
                          {showReviews[product.id] && (
                            <Card sx={{ 
                              mt: 2,
                              borderRadius: '16px',
                              background: 'rgba(255, 255, 255, 0.98)'
                            }}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  Customer Reviews
                                </Typography>
                                <Stack spacing={2}>
                                  {product.reviews?.map((review: any) => (
                                    <Box key={review.id} sx={{ 
                                      p: 2, 
                                      border: '1px solid rgba(0,0,0,0.08)', 
                                      borderRadius: '12px' 
                                    }}>
                                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <Avatar src={review.user.avatar} sx={{ width: 32, height: 32 }} />
                                        <Box>
                                          <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" fontWeight={600}>
                                              {review.user.name}
                                            </Typography>
                                            {review.verified && (
                                              <VerifiedUser sx={{ fontSize: 14, color: '#4CAF50' }} />
                                            )}
                                          </Box>
                                          <Box display="flex" alignItems="center" gap={1}>
                                            <Stack direction="row" spacing={0.5}>
                                              {[1, 2, 3, 4, 5].map(star => (
                                                <Box
                                                  key={star}
                                                  sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: star <= review.rating ? '#FFD700' : '#E0E0E0'
                                                  }}
                                                />
                                              ))}
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary">
                                              {review.date}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Box>
                                      <Typography variant="body2" sx={{ ml: 5 }}>
                                        {review.comment}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Stack>
                              </CardContent>
                            </Card>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </motion.div>
                )}
                
                {/* Trending View */}
                {currentView === 'trending' && (
                  <motion.div
                    key="trending"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                      Trending Now 🔥
                    </Typography>
                    
                    {/* Trending Posts */}
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Hot Posts
                    </Typography>
                    
                    {posts
                      .filter(post => post.engagement === 'high' || post.likes > 800)
                      .map((post) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <PostCard
                            post={post}
                            currentUser={currentUser}
                            isLiked={likedPosts.has(post.id)}
                            isBookmarked={bookmarkedPosts.has(post.id)}
                            isFollowing={followedUsers.includes(post.user.id)}
                            onLike={handleLikePost}
                            onBookmark={handleBookmarkPost}
                            onFollow={handleFollowUser}
                            onAddToCart={addToCart}
                            onProductClick={toggleProductReviews}
                            onWishlist={toggleWishlist}
                            wishlistItems={wishlistItems}
                            aiInsightsEnabled={aiInsightsEnabled}
                            onToggleComments={toggleComments}
                          />
                        </motion.div>
                      ))}
                  </motion.div>
                )}
                
                {/* Profile View */}
                {currentView === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card sx={{ 
                      mb: 3,
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)'
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box display="flex" gap={3} mb={3}>
                          <Avatar 
                            src={currentUser.avatar} 
                            sx={{ width: 100, height: 100, border: '4px solid white' }}
                          />
                          <Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                              {currentUser.name}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              {currentUser.username}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {currentUser.bio}
                            </Typography>
                            <Box display="flex" gap={4}>
                              <Box>
                                <Typography variant="h6" fontWeight={700}>
                                  {currentUser.followers.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Followers
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="h6" fontWeight={700}>
                                  {currentUser.following.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Following
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="h6" fontWeight={700}>
                                  {posts.filter(p => p.user.id === currentUser.id).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Posts
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                    
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Your Posts
                    </Typography>
                    
                    {posts
                      .filter(post => post.user.id === currentUser.id)
                      .map((post) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <PostCard
                            post={post}
                            currentUser={currentUser}
                            isLiked={likedPosts.has(post.id)}
                            isBookmarked={bookmarkedPosts.has(post.id)}
                            isFollowing={followedUsers.includes(post.user.id)}
                            onLike={handleLikePost}
                            onBookmark={handleBookmarkPost}
                            onFollow={handleFollowUser}
                            onAddToCart={addToCart}
                            onProductClick={toggleProductReviews}
                            onWishlist={toggleWishlist}
                            wishlistItems={wishlistItems}
                            aiInsightsEnabled={aiInsightsEnabled}
                            onToggleComments={toggleComments}
                          />
                        </motion.div>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Box>
          
          {/* Right Sidebar - Desktop Only */}
          <Box sx={{ width: 280, display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <TrendingSidebar />
            </Box>
          </Box>
        </Box>
      </Container>
      
      {/* Modals and Drawers */}
      <CartDrawer />
      
      {/* Cart feedback snackbar */}
      <Snackbar
        open={!!cartMessage}
        autoHideDuration={3000}
        onClose={() => setCartMessage('')}
        message={cartMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      </Box>
    </CartProvider>
  );
}

export default App;
