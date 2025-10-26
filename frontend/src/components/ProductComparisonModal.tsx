import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Rating,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Divider,
  Paper,
  Grid,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Close,
  ShoppingBag,
  Share,
  Favorite,
  FavoriteBorder,
  CheckCircle,
  Cancel,
  TrendingUp,
  Star,
  CompareArrows,
  Delete
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { RealProduct } from '../services/productApi';
import { useCart } from '../context/CartContext';

interface ProductComparisonModalProps {
  open: boolean;
  onClose: () => void;
  products: RealProduct[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: RealProduct) => void;
  onWishlist: (product: RealProduct) => void;
  onShare: (product: RealProduct) => void;
  wishlistItems: RealProduct[];
  maxProducts?: number;
}

const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  open,
  onClose,
  products,
  onRemoveProduct,
  onAddToCart,
  onWishlist,
  onShare,
  wishlistItems = [],
  maxProducts = 4
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'detailed'>('overview');
  const [winner, setWinner] = useState<string | null>(null);
  const { isInCart } = useCart();

  // Calculate comparison winner based on rating and price
  useEffect(() => {
    if (products.length >= 2) {
      const scores = products.map(product => {
        const ratingScore = (product.rating || 0) * 20; // Max 100
        const priceScore = Math.max(0, 100 - (product.price / 10)); // Lower price = higher score
        const reviewScore = Math.min(50, (product.reviewCount || 0) / 10); // Max 50
        return {
          id: product.id,
          score: ratingScore + priceScore + reviewScore
        };
      });

      const topProduct = scores.reduce((prev, current) => 
        current.score > prev.score ? current : prev
      );
      setWinner(topProduct.id);
    }
  }, [products]);

  const isInWishlist = (product: RealProduct) => {
    return wishlistItems.some(item => item.id === product.id);
  };

  const getComparisonFeatures = () => {
    // Extract all unique features from all products
    const allFeatures = new Set<string>();
    const allSpecs = new Set<string>();

    products.forEach(product => {
      product.features?.forEach(feature => allFeatures.add(feature));
      Object.keys(product.specifications || {}).forEach(spec => allSpecs.add(spec));
    });

    return {
      features: Array.from(allFeatures),
      specs: Array.from(allSpecs)
    };
  };

  const { features, specs } = getComparisonFeatures();

  const renderProductCard = (product: RealProduct, index: number) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          border: winner === product.id ? '2px solid #4caf50' : '1px solid rgba(0,0,0,0.1)',
          borderRadius: '12px',
          background: winner === product.id ? 'rgba(76, 175, 80, 0.02)' : 'white'
        }}
      >
        {/* Winner badge */}
        {winner === product.id && (
          <Chip
            icon={<Star />}
            label="Best Value"
            color="success"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 2,
              fontWeight: 'bold'
            }}
          />
        )}

        {/* Remove button */}
        <IconButton
          size="small"
          onClick={() => onRemoveProduct(product.id)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            backgroundColor: 'rgba(255,255,255,0.9)',
            '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' }
          }}
        >
          <Delete fontSize="small" />
        </IconButton>

        <CardMedia
          component="img"
          height="150"
          image={product.image}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />

        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
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

          <Stack spacing={1}>
            <Button
              fullWidth
              variant={isInCart(product.id) ? "outlined" : "contained"}
              startIcon={<ShoppingBag />}
              onClick={() => onAddToCart(product)}
              size="small"
            >
              {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
            </Button>

            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                onClick={() => onWishlist(product)}
                sx={{
                  border: '1px solid rgba(0,0,0,0.1)',
                  flex: 1,
                  borderRadius: '8px'
                }}
              >
                {isInWishlist(product) ? (
                  <Favorite color="error" fontSize="small" />
                ) : (
                  <FavoriteBorder fontSize="small" />
                )}
              </IconButton>

              <IconButton
                size="small"
                onClick={() => onShare(product)}
                sx={{
                  border: '1px solid rgba(0,0,0,0.1)',
                  flex: 1,
                  borderRadius: '8px'
                }}
              >
                <Share fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderDetailedComparison = () => (
    <Box>
      {/* Basic Info Table */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Basic Information
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3, borderRadius: '8px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Property</TableCell>
              {products.map(product => (
                <TableCell key={product.id} align="center" sx={{ fontWeight: 'bold' }}>
                  {product.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Brand</TableCell>
              {products.map(product => (
                <TableCell key={product.id} align="center">
                  {product.brand}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Price</TableCell>
              {products.map(product => (
                <TableCell key={product.id} align="center">
                  <Typography
                    fontWeight="bold"
                    color={winner === product.id ? 'success.main' : 'inherit'}
                  >
                    ${product.price}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Rating</TableCell>
              {products.map(product => (
                <TableCell key={product.id} align="center">
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <Rating value={product.rating} readOnly size="small" />
                    <Typography variant="body2">
                      {product.rating}
                    </Typography>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Reviews</TableCell>
              {products.map(product => (
                <TableCell key={product.id} align="center">
                  {product.reviewCount}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Availability</TableCell>
              {products.map(product => (
                <TableCell key={product.id} align="center">
                  <Chip
                    label={product.availability === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                    color={product.availability === 'in_stock' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Features Comparison */}
      {features.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Features
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3, borderRadius: '8px' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Feature</TableCell>
                  {products.map(product => (
                    <TableCell key={product.id} align="center" sx={{ fontWeight: 'bold' }}>
                      {product.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {features.map(feature => (
                  <TableRow key={feature}>
                    <TableCell>{feature}</TableCell>
                    {products.map(product => (
                      <TableCell key={product.id} align="center">
                        {product.features?.includes(feature) ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Cancel color="error" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Specifications */}
      {specs.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Specifications
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: '8px' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Specification</TableCell>
                  {products.map(product => (
                    <TableCell key={product.id} align="center" sx={{ fontWeight: 'bold' }}>
                      {product.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {specs.map(spec => (
                  <TableRow key={spec}>
                    <TableCell>{spec}</TableCell>
                    {products.map(product => (
                      <TableCell key={product.id} align="center">
                        {product.specifications?.[spec] || 'N/A'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );

  if (products.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box textAlign="center" py={4}>
            <CompareArrows sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No products to compare
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Add products to comparison from the product listings or search results.
            </Typography>
            <Button variant="contained" onClick={onClose}>
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px', maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <CompareArrows color="primary" />
            <Typography variant="h5" fontWeight={600}>
              Compare Products ({products.length}/{maxProducts})
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* View Toggle */}
        <Stack direction="row" spacing={1} mt={2}>
          <Button
            variant={activeView === 'overview' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setActiveView('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeView === 'detailed' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setActiveView('detailed')}
          >
            Detailed
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <AnimatePresence mode="wait">
          {activeView === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {products.length >= 2 && winner && (
                <Alert 
                  severity="success" 
                  icon={<TrendingUp />}
                  sx={{ mb: 3, borderRadius: '12px' }}
                >
                  Based on price, rating, and reviews, we recommend{' '}
                  <strong>{products.find(p => p.id === winner)?.name}</strong> as the best value!
                </Alert>
              )}

              <Box 
                display="grid" 
                gridTemplateColumns={{
                  xs: '1fr',
                  sm: products.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                  md: products.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'
                }}
                gap={3}
              >
                {products.map((product, index) => (
                  <Box key={product.id}>
                    {renderProductCard(product, index)}
                  </Box>
                ))}
              </Box>

              {products.length < maxProducts && (
                <Alert 
                  severity="info" 
                  sx={{ mt: 3, borderRadius: '12px' }}
                >
                  You can compare up to {maxProducts} products. Add more products from search results or product listings.
                </Alert>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detailed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderDetailedComparison()}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={() => {
            // Add all products to cart
            products.forEach(product => onAddToCart(product));
            onClose();
          }}
          startIcon={<ShoppingBag />}
        >
          Add All to Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductComparisonModal;