import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Badge,
  Button,
  Autocomplete,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Popper,
  Fade,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications,
  ShoppingCart,
  Favorite,
  Add,
  Home,
  Explore,
  TrendingUp,
  Person,
  Settings,
  LocalOffer,
  Star,
  History,
  DarkMode,
  LightMode,
  VideoLibrary,
  Message,
  Logout
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useThemeMode } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import demoProductService from '../services/demoRealProducts';
import { OpenProductService } from '../services/productApi';
import { RealProduct } from '../services/productApi';
import priceTrackingService from '../services/priceTrackingService';

interface SearchResult {
  type: 'product' | 'creator' | 'recent';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  price?: number;
  rating?: number;
  data?: any;
}

interface NavigationProps {
  currentUser: any;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  cartItemsCount: number;
  wishlistCount: number;
  notificationsCount: number;
  onCartOpen: () => void;
  onNotificationsOpen: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  onProductClick?: (product: RealProduct) => void;
  onSearch?: (query: string, type: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  cartItemsCount,
  wishlistCount,
  notificationsCount,
  onCartOpen,
  onNotificationsOpen,
  currentView,
  onViewChange,
  onProductClick,
  onSearch
}) => {
  // State for search functionality
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<RealProduct[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const { state: cartState } = useCart();
  const { mode: themeMode, toggleTheme } = useThemeMode();
  const openProductService = useMemo(() => new OpenProductService(), []);
  
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if API call fails
      window.location.href = '/login';
    }
  };
  
  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('social_commerce_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);
  
  // Load trending products on mount
  useEffect(() => {
    loadTrendingProducts();
  }, []);
  
  // Search when query changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);
  
  const loadTrendingProducts = async () => {
    try {
      const [demoTrending, openTrending] = await Promise.allSettled([
        demoProductService.searchProducts('electronics'),
        openProductService.searchProducts('trending')
      ]);
      
      const trending: RealProduct[] = [];
      if (demoTrending.status === 'fulfilled') {
        trending.push(...demoTrending.value.slice(0, 3));
      }
      if (openTrending.status === 'fulfilled') {
        trending.push(...openTrending.value.slice(0, 2));
      }
      
      setTrendingProducts(trending.slice(0, 5));
    } catch (error) {
      console.error('Error loading trending products:', error);
    }
  };
  
  const performSearch = async (query: string) => {
    setSearchLoading(true);
    try {
      // Search products from multiple sources
      const [demoResults, openResults] = await Promise.allSettled([
        demoProductService.searchProducts(query),
        openProductService.searchProducts(query)
      ]);
      
      const allProducts: RealProduct[] = [];
      if (demoResults.status === 'fulfilled') {
        allProducts.push(...demoResults.value.slice(0, 5));
      }
      if (openResults.status === 'fulfilled') {
        allProducts.push(...openResults.value.slice(0, 3));
      }
      
      // Convert to search results
      const productResults: SearchResult[] = allProducts.map(product => ({
        type: 'product' as const,
        id: product.id,
        title: product.name,
        subtitle: `${product.brand} • $${product.price}`,
        image: product.image,
        price: product.price,
        rating: product.rating,
        data: product
      }));
      
      // Add recent searches if query matches
      const recentResults: SearchResult[] = recentSearches
        .filter(recent => recent.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map((recent, index) => ({
          type: 'recent' as const,
          id: `recent_${index}`,
          title: recent,
          subtitle: 'Recent search'
        }));
      
      // Mock creator results (in a real app, search creators from API)
      const creatorResults: SearchResult[] = [];
      if (query.toLowerCase().includes('tech') || query.toLowerCase().includes('gadget')) {
        creatorResults.push({
          type: 'creator' as const,
          id: 'creator_1',
          title: 'TechReviewer',
          subtitle: '1.2M followers • Tech Expert',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50'
        });
      }
      
      setSearchResults([...recentResults, ...creatorResults, ...productResults]);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handleSearchClick = (result: SearchResult) => {
    if (result.type === 'product' && result.data && onProductClick) {
      onProductClick(result.data);
    } else if (result.type === 'recent') {
      onSearchChange(result.title);
      if (onSearch) {
        onSearch(result.title, 'all');
      }
    } else if (result.type === 'creator') {
      // Navigate to creator profile
      if (onSearch) {
        onSearch(result.title, 'creator');
      }
    }
    
    setSearchOpen(false);
    
    // Add to recent searches
    if (result.type !== 'recent') {
      const newRecent = [result.title, ...recentSearches.filter(r => r !== result.title)].slice(0, 10);
      setRecentSearches(newRecent);
      localStorage.setItem('social_commerce_recent_searches', JSON.stringify(newRecent));
    }
  };
  
  const handleSearchFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setAnchorEl(event.currentTarget);
    setSearchOpen(true);
  };
  
  const handleSearchBlur = () => {
    // Delay closing to allow clicking on results
    setTimeout(() => {
      setSearchOpen(false);
      setAnchorEl(null);
    }, 200);
  };
  // Desktop nav items - full navigation
  const desktopNavItems = [
    { key: 'feed', label: 'Feed', icon: Home },
    { key: 'explore', label: 'Explore', icon: Explore },
    { key: 'videos', label: 'Reels', icon: VideoLibrary },
    { key: 'messages', label: 'Messages', icon: Message },
    { key: 'trending', label: 'Trending', icon: TrendingUp },
    { key: 'profile', label: 'Profile', icon: Person }
  ];

  // Mobile nav items - essential navigation only
  const mobileNavItems = [
    { key: 'feed', label: 'Feed', icon: Home },
    { key: 'videos', label: 'Reels', icon: VideoLibrary },
    { key: 'explore', label: 'Explore', icon: Explore },
    { key: 'messages', label: 'Messages', icon: Message },
    { key: 'profile', label: 'Profile', icon: Person }
  ];

  return (
    <>
      {/* Top App Bar */}
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          color: '#1a1a1a',
          width: '100%',
          left: 0,
          right: 0,
          zIndex: 1100
        }}
      >
        <Toolbar sx={{ 
          py: 1, 
          px: { xs: 1, sm: 2, md: 3 },
          minHeight: { xs: 56, md: 64 },
          width: '100%'
        }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800,
                mr: 4,
                fontSize: { xs: '1.4rem', md: '1.8rem' },
                background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                cursor: 'pointer'
              }}
              onClick={() => onViewChange('feed')}
            >
              SocialCommerce
            </Typography>
          </motion.div>
          
          {/* Search Bar - Desktop */}
          <Box sx={{ 
            flex: 1, 
            maxWidth: 500, 
            mx: { xs: 1, md: 4 },
            display: { xs: 'none', md: 'block' },
            position: 'relative'
          }}>
            <TextField
              placeholder="Search creators, products, posts..."
              variant="outlined"
              size="medium"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '50px',
                  height: '44px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 1)',
                    border: '1px solid rgba(25, 118, 210, 0.3)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  },
                  '&.Mui-focused': {
                    background: 'rgba(255, 255, 255, 1)',
                    border: '1px solid #1976d2',
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
                  }
                },
                '& .MuiOutlinedInput-input': {
                  padding: '10px 16px',
                  fontWeight: 500,
                  fontSize: '14px'
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#1976d2', mr: 1, ml: 1, fontSize: 20 }} />,
              }}
            />
            
            {/* Search Results Dropdown */}
            <Popper 
              open={searchOpen && (searchResults.length > 0 || searchQuery.length > 0)}
              anchorEl={anchorEl}
              placement="bottom-start"
              style={{ 
                zIndex: 1400, 
                width: anchorEl?.clientWidth,
                marginTop: '8px'
              }}
              transition
              modifiers={[
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                },
              ]}
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={200}>
                  <Paper 
                    elevation={12}
                    sx={{ 
                      borderRadius: '16px',
                      overflow: 'hidden',
                      maxHeight: '500px',
                      overflowY: 'auto',
                      border: '1px solid rgba(0,0,0,0.1)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      background: 'white'
                    }}
                  >
                    <List sx={{ p: 0 }}>
                      {searchLoading ? (
                        <ListItem>
                          <Box display="flex" alignItems="center" gap={2} width="100%">
                            <SearchIcon color="primary" />
                            <Typography variant="body2">Searching...</Typography>
                          </Box>
                        </ListItem>
                      ) : searchQuery.length === 0 ? (
                        // Show trending and recent when no query
                        <>
                          {recentSearches.length > 0 && (
                            <>
                              <ListItem sx={{ py: 0.5, px: 2, background: 'rgba(0,0,0,0.02)' }}>
                                <Typography variant="caption" fontWeight={600} color="text.secondary">
                                  Recent Searches
                                </Typography>
                              </ListItem>
                              {recentSearches.slice(0, 3).map((search, index) => (
                                <ListItem 
                                  key={index}
                                  onClick={() => handleSearchClick({ 
                                    type: 'recent', 
                                    id: `recent_${index}`, 
                                    title: search,
                                    subtitle: 'Recent search'
                                  })}
                                  sx={{ py: 1, '&:hover': { background: 'rgba(25, 118, 210, 0.05)' }, cursor: 'pointer' }}
                                >
                                  <ListItemAvatar>
                                    <History color="action" />
                                  </ListItemAvatar>
                                  <ListItemText 
                                    primary={search}
                                    secondary="Recent search"
                                    primaryTypographyProps={{ fontSize: '14px' }}
                                    secondaryTypographyProps={{ fontSize: '12px' }}
                                  />
                                </ListItem>
                              ))}
                            </>
                          )}
                          
                          {trendingProducts.length > 0 && (
                            <>
                              <ListItem sx={{ py: 0.5, px: 2, background: 'rgba(0,0,0,0.02)' }}>
                                <Typography variant="caption" fontWeight={600} color="text.secondary">
                                  Trending Products
                                </Typography>
                              </ListItem>
                              {trendingProducts.slice(0, 3).map((product) => (
                                <ListItem 
                                  key={product.id}
                                  onClick={() => handleSearchClick({ 
                                    type: 'product', 
                                    id: product.id, 
                                    title: product.name,
                                    subtitle: `${product.brand} • $${product.price}`,
                                    image: product.image,
                                    data: product
                                  })}
                                  sx={{ py: 1, '&:hover': { background: 'rgba(25, 118, 210, 0.05)' }, cursor: 'pointer' }}
                                >
                                  <ListItemAvatar>
                                    <Avatar src={product.image} sx={{ width: 32, height: 32 }} />
                                  </ListItemAvatar>
                                  <ListItemText 
                                    primary={product.name}
                                    secondary={
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="caption">{product.brand}</Typography>
                                        <Typography variant="caption" color="primary" fontWeight="bold">
                                          ${product.price}
                                        </Typography>
                                      </Box>
                                    }
                                    primaryTypographyProps={{ fontSize: '14px', noWrap: true }}
                                  />
                                  <TrendingUp color="primary" fontSize="small" />
                                </ListItem>
                              ))}
                            </>
                          )}
                        </>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((result) => (
                          <ListItem 
                            key={result.id}
                            onClick={() => handleSearchClick(result)}
                            sx={{ py: 1, '&:hover': { background: 'rgba(25, 118, 210, 0.05)' }, cursor: 'pointer' }}
                          >
                            <ListItemAvatar>
                              {result.type === 'product' ? (
                                <Avatar src={result.image} sx={{ width: 32, height: 32 }} />
                              ) : result.type === 'creator' ? (
                                <Avatar src={result.image} sx={{ width: 32, height: 32 }} />
                              ) : (
                                <History color="action" />
                              )}
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" noWrap>
                                    {result.title}
                                  </Typography>
                                  {result.type === 'product' && result.rating && (
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <Star sx={{ fontSize: '12px', color: '#ffc107' }} />
                                      <Typography variant="caption">{result.rating}</Typography>
                                    </Box>
                                  )}
                                </Box>
                              }
                              secondary={result.subtitle}
                              primaryTypographyProps={{ fontSize: '14px' }}
                              secondaryTypographyProps={{ fontSize: '12px' }}
                            />
                            {result.type === 'product' && (
                              <Chip 
                                label={`$${result.price}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontSize: '10px' }}
                              />
                            )}
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <Box display="flex" alignItems="center" gap={2} width="100%" py={2}>
                            <SearchIcon color="disabled" />
                            <Typography variant="body2" color="text.secondary">
                              No results found for "{searchQuery}"
                            </Typography>
                          </Box>
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Fade>
              )}
            </Popper>
          </Box>
          
          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 3 }}>
            {desktopNavItems.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                onClick={() => onViewChange(key)}
                startIcon={<Icon />}
                sx={{
                  borderRadius: '12px',
                  px: 2,
                  py: 1,
                  color: currentView === key ? '#1976d2' : '#64748b',
                  background: currentView === key ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  fontWeight: currentView === key ? 600 : 500,
                  textTransform: 'none',
                  '&:hover': {
                    background: currentView === key ? 'rgba(25, 118, 210, 0.15)' : 'rgba(100, 116, 139, 0.08)'
                  }
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
          
          {/* Action Icons */}
          <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1 }}>
            {/* Create Button - Desktop */}
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => onViewChange('create')}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
                px: 2,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #115293 0%, #0d3c6b 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }
              }}
            >
              Create
            </Button>
            
            {/* Notifications */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton 
                onClick={onNotificationsOpen}
                sx={{ 
                  display: { xs: 'none', sm: 'inline-flex' },
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 1)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Badge 
                  badgeContent={notificationsCount} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '10px',
                      height: '16px',
                      minWidth: '16px'
                    }
                  }}
                >
                  <Notifications sx={{ color: '#667eea', fontSize: 20 }} />
                </Badge>
              </IconButton>
            </motion.div>
            
            {/* Theme Toggle - Desktop only */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton 
                onClick={toggleTheme}
                sx={{ 
                  display: { xs: 'none', sm: 'inline-flex' },
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 1)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                {themeMode === 'dark' ? (
                  <LightMode sx={{ color: '#fbbf24', fontSize: 20 }} />
                ) : (
                  <DarkMode sx={{ color: '#6b7280', fontSize: 20 }} />
                )}
              </IconButton>
            </motion.div>
            
            {/* Wishlist - Desktop only */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton 
                sx={{ 
                  display: { xs: 'none', sm: 'inline-flex' },
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 1)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Badge 
                  badgeContent={wishlistCount} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '10px',
                      height: '16px',
                      minWidth: '16px'
                    }
                  }}
                >
                  <Favorite sx={{ color: '#f5576c', fontSize: 20 }} />
                </Badge>
              </IconButton>
            </motion.div>
            
            {/* Cart - Visible on both mobile and desktop */}
            <IconButton 
              onClick={onCartOpen}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 1)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <Badge 
                badgeContent={cartItemsCount} 
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '10px',
                    height: '16px',
                    minWidth: '16px'
                  }
                }}
              >
                <ShoppingCart sx={{ color: '#667eea', fontSize: { xs: 20, sm: 20 } }} />
              </Badge>
            </IconButton>
            
            {/* Profile Avatar - Desktop only */}
            <Avatar 
              src={currentUser?.avatar} 
              onClick={() => onViewChange('profile')}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                width: 36, 
                height: 36, 
                cursor: 'pointer',
                border: '2px solid rgba(102, 126, 234, 0.2)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  border: '2px solid #667eea',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }
              }}
            />
            
            {/* Logout Button - Desktop only */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton 
                onClick={handleLogout}
                sx={{ 
                  display: { xs: 'none', sm: 'inline-flex' },
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                  }
                }}
              >
                <Logout sx={{ color: '#ef4444', fontSize: 20 }} />
              </IconButton>
            </motion.div>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Mobile Search Bar */}
      <Box sx={{ 
        display: { xs: 'block', md: 'none' },
        p: 2,
        background: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
      }}>
        <TextField
          placeholder="Search creators, products, posts..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          fullWidth
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.9)'
            }
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: '#667eea', mr: 1, ml: 0.5 }} />,
          }}
        />
      </Box>
      
      {/* Mobile Bottom Navigation - Simplified */}
      <Box sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        display: { xs: 'flex', md: 'none' },
        justifyContent: 'space-around',
        alignItems: 'center',
        py: 1.5,
        px: 2,
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
      }}>
        {/* Essential Navigation Icons */}
        {mobileNavItems.map(({ key, icon: Icon }) => (
          <IconButton
            key={key}
            onClick={() => onViewChange(key)}
            sx={{
              color: currentView === key ? '#667eea' : '#64748b',
              background: currentView === key ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              borderRadius: '12px',
              p: 1.2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: currentView === key ? 'rgba(102, 126, 234, 0.15)' : 'rgba(100, 116, 139, 0.08)'
              }
            }}
          >
            <Icon fontSize="medium" />
          </IconButton>
        ))}
        
        {/* Mobile Create Button */}
        <IconButton
          onClick={() => onViewChange('create')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 1.2,
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b5b95 100%)',
              transform: 'scale(1.05)'
            }
          }}
        >
          <Add fontSize="medium" />
        </IconButton>
      </Box>
    </>
  );
};

export default Navigation;