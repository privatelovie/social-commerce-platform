import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Rating,
  IconButton,
  Tabs,
  Tab,
  Stack,
  LinearProgress,
  Alert,
  InputAdornment,
  Autocomplete,
  Fab,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Skeleton
} from '@mui/material';
import {
  Search,
  FilterList,
  TrendingUp,
  LocalOffer,
  ShoppingBag,
  Favorite,
  FavoriteBorder,
  Share,
  CompareArrows,
  Sort,
  ViewModule,
  ViewList,
  ShoppingCart,
  Star,
  LocalFireDepartment,
  NewReleases,
  FlashOn,
  Category
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import demoProductService from '../services/demoRealProducts';
import { OpenProductService } from '../services/productApi';
import { RealProduct } from '../services/productApi';

interface ExplorePageProps {
  onProductClick: (product: RealProduct) => void;
  onWishlist: (product: RealProduct) => void;
  onCompare: (product: RealProduct) => void;
  onShare: (product: RealProduct) => void;
  wishlistItems: RealProduct[];
  compareItems: RealProduct[];
}

interface FilterOptions {
  category: string;
  priceRange: [number, number];
  rating: number;
  sortBy: 'price_low' | 'price_high' | 'rating' | 'popularity' | 'newest';
  source: string;
}

const ExplorePage: React.FC<ExplorePageProps> = ({
  onProductClick,
  onWishlist,
  onCompare,
  onShare,
  wishlistItems = [],
  compareItems = []
}) => {
  // State management
  const [products, setProducts] = useState<RealProduct[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<RealProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    priceRange: [0, 1000],
    rating: 0,
    sortBy: 'popularity',
    source: 'all'
  });

  const { addItem, isInCart } = useCart();
  const openProductService = useMemo(() => new OpenProductService(), []);

  // Categories for filtering
  const categories = [
    'all', 'electronics', 'clothing', 'jewelery', 'books', 'home', 'sports', 'beauty', 'toys'
  ];

  // Load initial trending products
  useEffect(() => {
    loadTrendingProducts();
  }, []);

  // Search when query changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProducts(searchQuery);
      } else {
        setProducts([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters]);

  // Generate search suggestions
  useEffect(() => {
    if (searchQuery.length > 2) {
      const suggestions = [
        `${searchQuery} for men`,
        `${searchQuery} for women`,
        `${searchQuery} deals`,
        `best ${searchQuery}`,
        `cheap ${searchQuery}`,
        `premium ${searchQuery}`
      ];
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const loadTrendingProducts = async () => {
    setLoading(true);
    try {
      // Load from multiple sources
      const [demoTrending, openTrending] = await Promise.allSettled([
        demoProductService.searchProducts('trending'),
        openProductService.searchProducts('electronics')
      ]);

      const trending: RealProduct[] = [];
      
      if (demoTrending.status === 'fulfilled') {
        trending.push(...demoTrending.value.slice(0, 8));
      }
      
      if (openTrending.status === 'fulfilled') {
        trending.push(...openTrending.value.slice(0, 6));
      }

      setTrendingProducts(trending.slice(0, 12));
    } catch (error) {
      console.error('Error loading trending products:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query: string) => {
    setLoading(true);
    try {
      // Search from multiple sources in parallel
      const [demoResults, openResults] = await Promise.allSettled([
        demoProductService.searchProducts(query),
        openProductService.searchProducts(query)
      ]);

      let allProducts: RealProduct[] = [];
      
      if (demoResults.status === 'fulfilled') {
        allProducts.push(...demoResults.value);
      }
      
      if (openResults.status === 'fulfilled') {
        allProducts.push(...openResults.value);
      }

      // Apply filters
      let filteredProducts = applyFilters(allProducts);
      
      // Remove duplicates
      filteredProducts = removeDuplicates(filteredProducts);
      
      setProducts(filteredProducts.slice(0, 50)); // Limit results
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (products: RealProduct[]): RealProduct[] => {
    let filtered = [...products];

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(p => p.rating >= filters.rating);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
    }

    return filtered;
  };

  const removeDuplicates = (products: RealProduct[]): RealProduct[] => {
    const seen = new Set<string>();
    return products.filter(product => {
      const key = `${product.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const handleAddToCart = (product: RealProduct) => {
    addItem(product);
  };

  const isInWishlist = (product: RealProduct) => {
    return wishlistItems.some(item => item.id === product.id);
  };

  const isInCompare = (product: RealProduct) => {
    return compareItems.some(item => item.id === product.id);
  };

  const renderProductCard = (product: RealProduct, index: number) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: '16px',
          border: '1px solid rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
            border: '1px solid #667eea'
          }
        }}
        onClick={() => onProductClick(product)}
      >
        <Box 
          position="relative" 
          sx={{
            height: viewMode === 'grid' ? 240 : 120,
            overflow: 'hidden',
            borderRadius: '12px 12px 0 0'
          }}
        >
          <CardMedia
            component="img"
            image={product.image}
            alt={product.name}
            sx={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
              background: '#f8f9fa',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
          
          {/* Badges */}
          <Box position="absolute" top={8} left={8}>
            {product.originalPrice && (
              <Chip
                label={`${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`}
                size="small"
                color="error"
                sx={{ fontSize: '10px', fontWeight: 'bold', mb: 0.5 }}
              />
            )}
            {product.source && (
              <Chip
                label={product.source.toUpperCase()}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '8px', 
                  background: 'rgba(255,255,255,0.9)',
                  display: 'block'
                }}
              />
            )}
          </Box>

          {/* Action buttons */}
          <Box position="absolute" top={8} right={8}>
            <Stack spacing={0.5}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onWishlist(product);
                }}
                sx={{
                  background: 'rgba(255,255,255,0.9)',
                  '&:hover': { background: 'white' }
                }}
              >
                {isInWishlist(product) ? (
                  <Favorite color="error" sx={{ fontSize: '16px' }} />
                ) : (
                  <FavoriteBorder sx={{ fontSize: '16px' }} />
                )}
              </IconButton>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare(product);
                }}
                sx={{
                  background: 'rgba(255,255,255,0.9)',
                  '&:hover': { background: 'white' }
                }}
              >
                <CompareArrows 
                  sx={{ 
                    fontSize: '16px',
                    color: isInCompare(product) ? '#667eea' : 'inherit'
                  }} 
                />
              </IconButton>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(product);
                }}
                sx={{
                  background: 'rgba(255,255,255,0.9)',
                  '&:hover': { background: 'white' }
                }}
              >
                <Share sx={{ fontSize: '16px' }} />
              </IconButton>
            </Stack>
          </Box>
        </Box>

        <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography 
            variant="h6" 
            fontWeight={600} 
            sx={{ fontSize: '14px', mb: 1 }}
            noWrap
          >
            {product.name}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {product.brand}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Rating value={product.rating} readOnly size="small" precision={0.1} />
            <Typography variant="caption" color="text.secondary">
              ({product.reviewCount})
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              ${product.price}
            </Typography>
            {product.originalPrice && (
              <Typography
                variant="body2"
                sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
              >
                ${product.originalPrice}
              </Typography>
            )}
          </Box>

          <Button
            fullWidth
            variant={isInCart(product.id) ? "outlined" : "contained"}
            startIcon={isInCart(product.id) ? <ShoppingCart /> : <ShoppingBag />}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '12px'
            }}
          >
            {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const currentProducts = activeTab === 0 ? trendingProducts : products;

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '1400px', 
      mx: 'auto',
      px: { xs: 1, sm: 2, md: 3 },
      py: { xs: 2, md: 3 }
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Explore Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover trending products and find your next favorite items
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '16px',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Autocomplete
          freeSolo
          options={searchSuggestions}
          value={searchQuery}
          onChange={(_, newValue) => setSearchQuery(newValue || '')}
          onInputChange={(_, newInputValue) => setSearchQuery(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search for products, brands, or categories..."
              variant="outlined"
              fullWidth
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }
              }}
            />
          )}
        />
      </Paper>

      {/* Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600
            }
          }}
        >
          <Tab
            icon={<TrendingUp />}
            iconPosition="start"
            label="Trending"
          />
          <Tab
            icon={<Search />}
            iconPosition="start"
            label={`Search Results ${products.length > 0 ? `(${products.length})` : ''}`}
            disabled={!searchQuery}
          />
        </Tabs>

        {/* View Controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            startIcon={<FilterList />}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            variant="outlined"
            size="small"
          >
            Filter
          </Button>

          <Button
            startIcon={<Sort />}
            onClick={(e) => setSortAnchor(e.currentTarget)}
            variant="outlined"
            size="small"
          >
            Sort
          </Button>

          <IconButton
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            size="small"
          >
            {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
          </IconButton>
        </Stack>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress sx={{ borderRadius: '4px', height: '6px' }} />
        </Box>
      )}

      {/* Products Grid */}
      {currentProducts.length > 0 ? (
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: viewMode === 'grid' ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
              md: viewMode === 'grid' ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr'
            },
            gap: { xs: 2, md: 3 },
            width: '100%',
            justifyItems: 'stretch',
            alignItems: 'start'
          }}
        >
          {currentProducts.map((product, index) => (
            renderProductCard(product, index)
          ))}
        </Box>
      ) : !loading && activeTab === 1 && searchQuery ? (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          No products found for "{searchQuery}". Try different keywords or filters.
        </Alert>
      ) : !loading && activeTab === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Loading trending products...
          </Typography>
        </Box>
      ) : null}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
        PaperProps={{ sx: { minWidth: 250, p: 2 } }}
      >
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Category
        </Typography>
        <Stack spacing={1} mb={2}>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filters.category === cat ? "contained" : "text"}
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
              sx={{ justifyContent: 'flex-start' }}
            >
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setFilters({
            category: 'all',
            priceRange: [0, 1000],
            rating: 0,
            sortBy: 'popularity',
            source: 'all'
          })}
        >
          Reset Filters
        </Button>
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchor}
        open={Boolean(sortAnchor)}
        onClose={() => setSortAnchor(null)}
        PaperProps={{ sx: { minWidth: 200 } }}
      >
        {[
          { key: 'popularity', label: 'Most Popular' },
          { key: 'rating', label: 'Highest Rated' },
          { key: 'price_low', label: 'Price: Low to High' },
          { key: 'price_high', label: 'Price: High to Low' },
          { key: 'newest', label: 'Newest First' }
        ].map(option => (
          <MenuItem
            key={option.key}
            onClick={() => {
              setFilters(prev => ({ ...prev, sortBy: option.key as any }));
              setSortAnchor(null);
            }}
            selected={filters.sortBy === option.key}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Compare FAB */}
      {compareItems.length > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <Badge badgeContent={compareItems.length} color="error">
            <CompareArrows />
          </Badge>
        </Fab>
      )}
    </Box>
  );
};

export default ExplorePage;