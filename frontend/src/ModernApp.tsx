import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  CssBaseline, 
  Snackbar, 
  Alert, 
  Fab,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocialProvider } from './context/SocialContext';
import { CartProvider, useCart } from './context/CartContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { CustomThemeProvider } from './context/ThemeContext';
import ToastProvider from './components/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import queryClient from './config/queryClient';

// Components
import Navigation from './components/Navigation';
import PostCard from './components/PostCard';
import CommentsDrawer from './components/CommentsDrawer';
import CartDrawer from './components/CartDrawer';
import AIGuide from './components/AIGuide';
import VideoReelsPage from './pages/VideoReelsPage';
import MessagingPage from './pages/MessagingPage';
import DirectMessages from './components/DirectMessages';
import EnhancedProfile from './components/EnhancedProfile';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ProfileAnalytics from './components/ProfileAnalytics';
import CreatePost from './components/CreatePost';
import Settings from './components/Settings';
import ProductPage from './components/ProductPage';
import UserSearch from './components/UserSearch';
import HashtagExplorer from './components/HashtagExplorer';
import ProfileEditor from './components/ProfileEditor';
import GoogleAuthProviderWrapper from './components/GoogleAuthProvider';
import GoogleLoginButton from './components/GoogleLoginButton';

// Pages
import ExplorePage from './pages/ExplorePage';

// Services
import demoRealProducts from './services/demoRealProducts';

// Utils
import { getProductImage, getUserAvatar } from './utils/productImages';

// Styles
import './styles/modern.css';
import './styles/mobile.css';


// Mock Social Posts
const mockSocialPosts = [
  {
    id: '1',
    user: {
      id: '1',
      username: 'fitness_guru_mike',
      displayName: 'Mike Fitness',
      avatar: getUserAvatar('Mike Fitness'),
      isVerified: true
    },
    content: 'Finally found the perfect home gym setup! 💪🏠 This compact equipment gives me a full-body workout without taking up my entire living room. Game changer for busy schedules! #HomeGym #FitnessMotivation #WorkoutFromHome',
    media: [getProductImage('fitness', 0)],
    timestamp: '3 hours ago',
    likes: 956,
    comments: 74,
    shares: 28,
    bookmarks: 132,
    isLiked: false,
    isBookmarked: false,
    hashtags: ['#HomeGym', '#FitnessMotivation', '#WorkoutFromHome'],
    product: {
      id: '1',
      name: 'Compact Home Gym System',
      price: 399.99,
      image: getProductImage('fitness', 0),
      description: 'Complete home workout solution in minimal space',
      rating: 4.7,
      reviewCount: 1843,
      brand: 'FitHome',
      inStock: true
    }
  },
  {
    id: '2',
    user: {
      id: '2',
      username: 'coffee_connoisseur_alex',
      displayName: 'Alex Coffee',
      avatar: getUserAvatar('Alex Coffee'),
      isVerified: false
    },
    content: 'My morning ritual just got an upgrade! ☕️✨ This espresso machine creates café-quality drinks at home. The milk frother is incredible - perfect latte art every time! #CoffeeLovers #LatteArt #MorningRitual',
    media: [getProductImage('home', 0), getProductImage('home', 1)],
    timestamp: '5 hours ago',
    likes: 634,
    comments: 42,
    shares: 19,
    bookmarks: 87,
    isLiked: true,
    isBookmarked: false,
    hashtags: ['#CoffeeLovers', '#LatteArt', '#MorningRitual'],
    product: {
      id: '2',
      name: 'Professional Espresso Machine',
      price: 599.99,
      image: getProductImage('home', 2),
      description: 'Barista-quality espresso maker for home use',
      rating: 4.9,
      reviewCount: 567,
      brand: 'BrewMaster',
      inStock: true
    }
  },
  {
    id: '3',
    user: {
      id: '3',
      username: 'travel_nomad_luna',
      displayName: 'Luna Wanderlust',
      avatar: getUserAvatar('Luna Wanderlust'),
      isVerified: true
    },
    content: 'Essential travel gear that actually makes a difference! 🎒✈️ This backpack has saved my back on countless adventures. Smart compartments, weather-resistant, and TSA-friendly. Worth every penny! #TravelGear #DigitalNomad #Backpacking',
    media: [getProductImage('fashion', 4)],
    timestamp: '8 hours ago',
    likes: 1123,
    comments: 95,
    shares: 67,
    bookmarks: 203,
    isLiked: false,
    isBookmarked: true,
    hashtags: ['#TravelGear', '#DigitalNomad', '#Backpacking'],
    product: {
      id: '3',
      name: 'Adventure Pro Travel Backpack',
      price: 179.99,
      image: getProductImage('fashion', 4),
      description: 'Ultimate travel companion for modern nomads',
      rating: 4.8,
      reviewCount: 2156,
      brand: 'WanderPack',
      inStock: true
    }
  },
  {
    id: '4',
    user: {
      id: '4',
      username: 'plant_parent_zoe',
      displayName: 'Zoe Green',
      avatar: 'https://ui-avatars.com/api/?name=Zoe+Green&background=2E7D32&color=fff&size=100',
      isVerified: false
    },
    content: 'My indoor garden is thriving! 🌿🌱 These smart plant sensors have been a game-changer. They monitor soil moisture, light levels, and send alerts to my phone. Perfect for busy plant parents! #PlantParent #SmartGardening #IndoorPlants',
    media: [
      'https://picsum.photos/600/400?random=27',
      'https://picsum.photos/600/400?random=28'
    ],
    timestamp: '6 hours ago',
    likes: 743,
    comments: 52,
    shares: 31,
    bookmarks: 98,
    isLiked: false,
    isBookmarked: true,
    hashtags: ['#PlantParent', '#SmartGardening', '#IndoorPlants'],
    product: {
      id: '4',
      name: 'Smart Plant Monitoring System',
      price: 89.99,
      image: 'https://picsum.photos/300/300?random=29',
      description: 'Keep your plants happy with smart monitoring',
      rating: 4.6,
      reviewCount: 892,
      brand: 'GreenTech',
      inStock: true
    }
  },
  {
    id: '5',
    user: {
      id: '5',
      username: 'chef_marco_italian',
      displayName: 'Marco Rossi',
      avatar: 'https://ui-avatars.com/api/?name=Marco+Rossi&background=D32F2F&color=fff&size=100',
      isVerified: true
    },
    content: 'Authentic pasta night! 🍝🇮🇹 This pasta maker brings the taste of Italy to my kitchen. Fresh noodles make all the difference - the texture and flavor are incredible! Nonna would be proud 😊 #PastaNight #ItalianCooking #HomeMade',
    media: ['https://picsum.photos/600/400?random=30'],
    timestamp: '1 day ago',
    likes: 1456,
    comments: 128,
    shares: 89,
    bookmarks: 267,
    isLiked: true,
    isBookmarked: false,
    hashtags: ['#PastaNight', '#ItalianCooking', '#HomeMade'],
    product: {
      id: '5',
      name: 'Authentic Italian Pasta Maker',
      price: 249.99,
      image: 'https://picsum.photos/300/300?random=31',
      description: 'Professional-grade pasta maker for home chefs',
      rating: 4.9,
      reviewCount: 1643,
      brand: 'PastaVera',
      inStock: true
    }
  }
];

// Authentication Modal Component
const AuthModal: React.FC<{
  open: boolean;
  onClose: () => void;
  type: 'login' | 'register';
  onToggleType: () => void;
}> = ({ open, onClose, type, onToggleType }) => {
  const { login, register, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'login') {
      const success = await login(email, password);
      if (success) onClose();
    } else {
      const success = await register({ username, email, password, displayName });
      if (success) onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight="bold">
            {type === 'login' ? 'Welcome Back' : 'Join SocialCommerce'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 4 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {type === 'register' && (
            <>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                }}
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '24px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
            }}
          />
          
          {(error || authError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || authError}
            </Alert>
          )}
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 2,
              background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #115293 0%, #0d3c6b 100%)',
              },
            }}
          >
            {loading ? 'Loading...' : type === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
          
          {type === 'login' && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                <Box sx={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
                <Typography sx={{ mx: 2, color: 'text.secondary' }}>or</Typography>
                <Box sx={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
              </Box>
              
              <GoogleLoginButton
                onSuccess={onClose}
                onError={(error) => setAuthError(error)}
              />
            </>
          )}
          
          <Button
            variant="text"
            fullWidth
            onClick={onToggleType}
            sx={{ textDecoration: 'underline' }}
          >
            {type === 'login' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Main App Content Component
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { state: cartState, addItem: addToCart, toggleCart, setCartOpen } = useCart();
  const { state: favoritesState, toggleFavorite, isFavorite } = useFavorites();
  const [currentView, setCurrentView] = useState('feed');
  const [posts, setPosts] = useState(mockSocialPosts);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showProductPage, setShowProductPage] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showHashtagExplorer, setShowHashtagExplorer] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  // const [showDemoLauncher, setShowDemoLauncher] = useState(true); // Removed

  // Handle navigation
  const handleNavigate = (path: string) => {
    if (path === '/people' || path === 'people') {
      setShowUserSearch(true);
      setCurrentView('people');
    } else if (path === '/hashtags' || path === 'hashtags') {
      setShowHashtagExplorer(true);
      setCurrentView('hashtags');
    } else if (path === '/edit-profile' || path === 'edit-profile') {
      setShowProfileEditor(true);
      setCurrentView('edit-profile');
    } else {
      setCurrentView(path.replace('/', '') || 'feed');
    }
  };

  // Handle product page navigation
  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setShowProductPage(true);
  };

  // Handle hashtag click
  const handleHashtagClick = (hashtag: string) => {
    // You could implement hashtag filtering in the feed or navigate to hashtag explorer
    setShowHashtagExplorer(true);
    setCurrentView('hashtags');
    setSnackbarMessage(`Exploring ${hashtag} posts`);
  };

  // Handle search
  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log('Searching for:', query);
  };

  // Handle product recommendations
  const handleProductRecommend = (category: string) => {
    // Implement product recommendations
    console.log('Recommending products for:', category);
    setCurrentView('explore');
  };

  // Handle post interactions
  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setCommentsOpen(true);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleShareCart = (chatId: string) => {
    setSnackbarMessage('Cart shared successfully!');
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setSnackbarMessage(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (product: any) => {
    const wasAdded = toggleFavorite(product);
    if (wasAdded) {
      setSnackbarMessage(`${product.name} added to favorites!`);
    } else {
      setSnackbarMessage(`${product.name} removed from favorites`);
    }
  };

  const handlePostCreated = (newPost: any) => {
    setPosts(prev => [newPost, ...prev]);
    setSnackbarMessage('Post created successfully!');
    setCurrentView('feed');
  };

  // Demo launcher handlers removed - app starts directly in feed

  // Landing page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
          p: 3,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            sx={{
              p: 6,
              borderRadius: 4,
              textAlign: 'center',
              maxWidth: 500,
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 2 }}>
              SocialCommerce
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              The future of social shopping is here. Discover, share, and shop with AI-powered recommendations.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => {
                  setAuthModalType('login');
                  setAuthModalOpen(true);
                }}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
                }}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<RegisterIcon />}
                onClick={() => {
                  setAuthModalType('register');
                  setAuthModalOpen(true);
                }}
                sx={{ px: 4, py: 1.5 }}
              >
                Create Account
              </Button>
            </Box>
          </Paper>
        </motion.div>

        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          type={authModalType}
          onToggleType={() => setAuthModalType(type => type === 'login' ? 'register' : 'login')}
        />
      </Box>
    );
  }

  // App starts directly - no demo launcher needed

  // Main authenticated app
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <Navigation
        currentUser={user!}
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartItemsCount={cartState.totalItems}
        wishlistCount={favoritesState.totalItems}
        notificationsCount={0}
        onCartOpen={() => setCartDrawerOpen(true)}
        onNotificationsOpen={() => setSnackbarMessage('Notifications opened!')}
        onProductClick={(product) => handleProductClick(product.id)}
      />

      <Container 
        maxWidth="xl" 
        sx={{ 
          pt: { xs: 12, md: 8 },
          pb: { xs: 12, md: 4 },
          px: { xs: 1, sm: 2, md: 3, lg: 4 },
          minHeight: 'calc(100vh - 140px)'
        }}
      >
        <AnimatePresence mode="wait">
          {/* Feed View */}
          {currentView === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ 
                maxWidth: { xs: '100%', sm: 600 }, 
                mx: 'auto',
                px: { xs: 0, sm: 0 }
              }}>
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PostCard
                      post={post}
                      currentUser={user!}
                      isLiked={post.isLiked}
                      isBookmarked={post.isBookmarked}
                      isFollowing={false}
                      onLike={() => handleLikePost(post.id)}
                      onBookmark={() => {}}
                      onFollow={() => {}}
                      onAddToCart={handleAddToCart}
                      onProductClick={() => post.product && handleProductClick(post.product.id)}
                      onWishlist={handleToggleWishlist}
                      onToggleComments={() => handlePostClick(post)}
                      wishlistItems={favoritesState.items.map(fav => fav.product)}
                      cartItems={cartState.items}
                      aiInsightsEnabled={true}
                    />
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          )}

          {/* Explore View */}
          {currentView === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ExplorePage
                onProductClick={(product) => handleProductClick(product.id)}
                onWishlist={handleToggleWishlist}
                onCompare={() => {}}
                onShare={() => {}}
                wishlistItems={favoritesState.items.map(fav => fav.product)}
                compareItems={[]}
              />
            </motion.div>
          )}

          {/* Video Reels View */}
          {currentView === 'videos' && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VideoReelsPage />
            </motion.div>
          )}

          {/* Messages View */}
          {currentView === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MessagingPage />
            </motion.div>
          )}

          {/* Profile View */}
          {currentView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EnhancedProfile
                isOwnProfile={true}
                onProductClick={(product) => handleProductClick(product.id)}
                onPostClick={handlePostClick}
                onFollowToggle={() => {}}
                onEditProfile={() => handleNavigate('edit-profile')}
              />
            </motion.div>
          )}

          {/* Analytics View */}
          {currentView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileAnalytics />
            </motion.div>
          )}

          {/* Create View */}
          {currentView === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CreatePost onPostCreated={handlePostCreated} />
            </motion.div>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Settings onClose={() => setCurrentView('feed')} />
            </motion.div>
          )}

          {/* Trending View */}
          {currentView === 'trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ExplorePage
                onProductClick={(product) => handleProductClick(product.id)}
                onWishlist={handleToggleWishlist}
                onCompare={() => {}}
                onShare={() => {}}
                wishlistItems={favoritesState.items.map(fav => fav.product)}
                compareItems={[]}
              />
            </motion.div>
          )}

          {/* User Search View */}
          {currentView === 'people' && (
            <motion.div
              key="people"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UserSearch onClose={() => setCurrentView('feed')} />
            </motion.div>
          )}

          {/* Hashtag Explorer View */}
          {currentView === 'hashtags' && (
            <motion.div
              key="hashtags"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HashtagExplorer
                onClose={() => setCurrentView('feed')}
                onHashtagClick={handleHashtagClick}
              />
            </motion.div>
          )}

          {/* Profile Editor View */}
          {currentView === 'edit-profile' && (
            <motion.div
              key="edit-profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileEditor
                onClose={() => setCurrentView('feed')}
                onSave={(profileData) => {
                  console.log('Profile saved:', profileData);
                  setSnackbarMessage('Profile updated successfully!');
                  setCurrentView('profile');
                }}
              />
            </motion.div>
          )}

          {/* Analytics View */}
          {currentView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* AI Guide Assistant */}
      <AIGuide
        onNavigate={handleNavigate}
        onSearch={handleSearch}
        onProductRecommend={handleProductRecommend}
      />

      {/* Comments Drawer */}
      <CommentsDrawer
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={selectedPost?.id || ''}
        postAuthor={selectedPost?.user}
        currentUser={user!}
        comments={[]}
        onAddComment={async () => {}}
        onLikeComment={() => {}}
        onDislikeComment={() => {}}
        onDeleteComment={() => {}}
        onEditComment={() => {}}
        onReportComment={() => {}}
        loading={false}
      />

      {/* Cart Drawer */}
      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarMessage('')} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Product Page Dialog */}
      <Dialog
        open={showProductPage}
        onClose={() => setShowProductPage(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '95vh',
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        {selectedProductId && (
          <ProductPage
            productId={selectedProductId}
            onClose={() => setShowProductPage(false)}
          />
        )}
      </Dialog>
    </Box>
  );
};

// Main App Component with Providers
const ModernApp: React.FC = () => {
  return (
    <ErrorBoundary level="page">
      <GoogleAuthProviderWrapper>
        <QueryClientProvider client={queryClient}>
          <CustomThemeProvider>
            <AuthProvider>
              <SocialProvider>
                <CartProvider>
                  <FavoritesProvider>
                    <ToastProvider>
                      <Router>
                        <ErrorBoundary level="section">
                          <AppContent />
                        </ErrorBoundary>
                      </Router>
                    </ToastProvider>
                  </FavoritesProvider>
                </CartProvider>
              </SocialProvider>
            </AuthProvider>
          </CustomThemeProvider>
          {/* React Query DevTools - only in development */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </GoogleAuthProviderWrapper>
    </ErrorBoundary>
  );
};

export default ModernApp;