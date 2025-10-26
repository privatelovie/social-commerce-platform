import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Rating,
  Chip,
  Divider,
  Card,
  CardContent,
  Avatar,
  Stack,
  Tab,
  Tabs,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Tooltip,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
  CompareArrows,
  LocalShipping,
  Security,
  VerifiedUser,
  Star,
  ThumbUp,
  ThumbDown,
  Report,
  ExpandMore,
  Close,
  ArrowBack,
  PhotoCamera,
  VideoCall,
  AttachMoney,
  LocalOffer,
  TrendingUp,
  CheckCircle,
  Error,
  Info,
  Warning
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSocial } from '../context/SocialContext';
import demoProductService from '../services/demoRealProducts';
import { RealProduct, ProductReview } from '../services/productApi';

interface ProductPageProps {
  productId: string;
  onClose?: () => void;
  onBack?: () => void;
}

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  inStock: boolean;
  image?: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
}

const ProductPage: React.FC<ProductPageProps> = ({ productId, onClose, onBack }) => {
  const { user } = useAuth();
  const { addItem, isInCart } = useCart();
  const { addNotification } = useSocial();
  
  const [product, setProduct] = useState<RealProduct | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [userReview, setUserReview] = useState({ rating: 5, title: '', comment: '' });
  const [priceAlertDialogOpen, setPriceAlertDialogOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');

  // Mock product variants
  const mockVariants: Record<string, ProductVariant[]> = {
    size: [
      { id: 'size-s', name: 'Size', value: 'S', inStock: true },
      { id: 'size-m', name: 'Size', value: 'M', inStock: true },
      { id: 'size-l', name: 'Size', value: 'L', inStock: false },
      { id: 'size-xl', name: 'Size', value: 'XL', inStock: true }
    ],
    color: [
      { id: 'color-black', name: 'Color', value: 'Black', inStock: true },
      { id: 'color-white', name: 'Color', value: 'White', inStock: true },
      { id: 'color-blue', name: 'Color', value: 'Blue', inStock: true }
    ]
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      // Load product details
      const productData = await demoProductService.getProductById(productId);
      setProduct(productData);
      
      // Load reviews
      const reviewsData = await demoProductService.getProductReviews(productId);
      setReviews(reviewsData);
      
      // Load related products
      if (productData?.category) {
        const related = await demoProductService.searchProducts(productData.category);
        setRelatedProducts(
          related
            .filter(p => p.id !== productId)
            .slice(0, 6)
            .map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.image,
              rating: p.rating,
              reviewCount: p.reviewCount || 0
            }))
        );
      }
    } catch (error) {
      console.error('Error loading product:', error);
      addNotification({
        type: 'system',
        title: 'Error',
        message: 'Failed to load product details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const selectedVariantValues = Object.values(selectedVariants);
    addItem(product, quantity, selectedVariantValues.length > 0 ? selectedVariants : undefined);
    
    addNotification({
      type: 'system',
      title: 'Added to Cart',
      message: `${product.name} has been added to your cart`
    });
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    addNotification({
      type: 'system',
      title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
      message: `${product?.name} ${isWishlisted ? 'removed from' : 'added to'} your wishlist`
    });
  };

  const handleSubmitReview = async () => {
    if (!product || !user) return;
    
    const newReview: ProductReview = {
      id: Date.now().toString(),
      productId: product.id,
      user: {
        name: user.displayName,
        avatar: user.avatar,
        verified: user.isVerified
      },
      rating: userReview.rating,
      title: userReview.title,
      comment: userReview.comment,
      date: new Date().toISOString(),
      helpful: 0,
      verified: true,
      source: 'user'
    };
    
    setReviews([newReview, ...reviews]);
    setReviewDialogOpen(false);
    setUserReview({ rating: 5, title: '', comment: '' });
    
    addNotification({
      type: 'system',
      title: 'Review Submitted',
      message: 'Your review has been submitted successfully'
    });
  };

  const handlePriceAlert = () => {
    if (!product || !targetPrice) return;
    
    addNotification({
      type: 'system',
      title: 'Price Alert Set',
      message: `You'll be notified when ${product.name} drops to $${targetPrice}`
    });
    
    setPriceAlertDialogOpen(false);
    setTargetPrice('');
  };

  const calculateDiscountPercentage = () => {
    if (!product?.originalPrice || !product?.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderProductImages = () => {
    const images = product?.images || [product?.image || ''];
    
    return (
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={images[currentImageIndex]}
          alt={product?.name}
          sx={{
            width: '100%',
            height: 400,
            objectFit: 'cover',
            borderRadius: '12px'
          }}
        />
        
        {images.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
            {images.map((image, index) => (
              <Box
                key={index}
                component="img"
                src={image}
                alt={`${product?.name} ${index + 1}`}
                onClick={() => setCurrentImageIndex(index)}
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: currentImageIndex === index ? '2px solid' : '1px solid',
                  borderColor: currentImageIndex === index ? 'primary.main' : 'divider',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main'
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  };

  const renderProductInfo = () => (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        {product?.name}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        by {product?.brand}
      </Typography>
      
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Rating value={product?.rating || 0} readOnly precision={0.1} />
        <Typography variant="body2" color="text.secondary">
          ({product?.reviewCount || reviews.length} reviews)
        </Typography>
      </Box>
      
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography variant="h3" color="primary.main" fontWeight={700}>
          {formatPrice(product?.price || 0)}
        </Typography>
        
        {product?.originalPrice && product.originalPrice > product.price && (
          <>
            <Typography variant="h5" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
              {formatPrice(product.originalPrice)}
            </Typography>
            <Chip
              label={`${calculateDiscountPercentage()}% OFF`}
              color="error"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </>
        )}
      </Box>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        {product?.description}
      </Typography>
      
      {/* Variants Selection */}
      {Object.entries(mockVariants).map(([variantType, variants]) => (
        <Box key={variantType} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, textTransform: 'capitalize' }}>
            {variantType}:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {variants.map((variant) => (
              <Button
                key={variant.id}
                variant={selectedVariants[variantType] === variant.value ? "contained" : "outlined"}
                onClick={() => setSelectedVariants(prev => ({
                  ...prev,
                  [variantType]: variant.value
                }))}
                disabled={!variant.inStock}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  mb: 0.5
                }}
              >
                {variant.value}
                {!variant.inStock && ' (Out of Stock)'}
              </Button>
            ))}
          </Stack>
        </Box>
      ))}
      
      {/* Quantity Selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Quantity:
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            sx={{ minWidth: 'auto', width: 40, height: 40 }}
          >
            -
          </Button>
          <Typography variant="h6" sx={{ mx: 2, minWidth: 30, textAlign: 'center' }}>
            {quantity}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setQuantity(quantity + 1)}
            sx={{ minWidth: 'auto', width: 40, height: 40 }}
          >
            +
          </Button>
        </Box>
      </Box>
      
      {/* Action Buttons */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart}
          disabled={isInCart(product?.id || '')}
          sx={{
            borderRadius: '12px',
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 600,
            fontSize: '16px'
          }}
        >
          {isInCart(product?.id || '') ? 'In Cart' : 'Add to Cart'}
        </Button>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={isWishlisted ? <Favorite /> : <FavoriteBorder />}
            onClick={handleToggleWishlist}
            sx={{ flex: 1, borderRadius: '12px' }}
          >
            {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
          </Button>
          
          <IconButton
            onClick={() => setShareDialogOpen(true)}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}
          >
            <Share />
          </IconButton>
          
          <IconButton
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}
          >
            <CompareArrows />
          </IconButton>
        </Box>
      </Stack>
      
      {/* Features */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <LocalShipping color="primary" />
          <Typography variant="body2">Free shipping on orders over $50</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Security color="primary" />
          <Typography variant="body2">30-day return policy</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <VerifiedUser color="primary" />
          <Typography variant="body2">2-year warranty included</Typography>
        </Box>
      </Stack>
      
      <Button
        variant="text"
        startIcon={<AttachMoney />}
        onClick={() => setPriceAlertDialogOpen(true)}
        sx={{ textTransform: 'none' }}
      >
        Set Price Alert
      </Button>
    </Box>
  );

  const renderReviews = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Customer Reviews
        </Typography>
        <Button
          variant="contained"
          onClick={() => setReviewDialogOpen(true)}
          disabled={!user}
        >
          Write Review
        </Button>
      </Box>
      
      {/* Reviews Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={4}>
            <Box textAlign="center">
              <Typography variant="h2" fontWeight={700}>
                {product?.rating || 0}
              </Typography>
              <Rating value={product?.rating || 0} readOnly />
              <Typography variant="body2" color="text.secondary">
                Based on {reviews.length} reviews
              </Typography>
            </Box>
            
            <Box flex={1}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(r => Math.floor(r.rating) === stars).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                
                return (
                  <Box key={stars} display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="body2" sx={{ minWidth: 20 }}>
                      {stars}
                    </Typography>
                    <Star fontSize="small" />
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 30 }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Individual Reviews */}
      <Stack spacing={2}>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent>
              <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                <Avatar src={review.user.avatar} />
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h6" fontWeight={600}>
                      {review.user.name}
                    </Typography>
                    {review.user.verified && (
                      <CheckCircle sx={{ fontSize: 16, color: 'primary.main' }} />
                    )}
                    {review.verified && (
                      <Chip label="Verified Purchase" size="small" color="success" variant="outlined" />
                    )}
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" sx={{ mb: 1, fontSize: '16px' }}>
                    {review.title}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {review.comment}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Button
                      size="small"
                      startIcon={<ThumbUp />}
                      sx={{ textTransform: 'none' }}
                    >
                      Helpful ({review.helpful})
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Report />}
                      sx={{ textTransform: 'none' }}
                    >
                      Report
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  const renderRelatedProducts = () => (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Related Products
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {relatedProducts.map((relatedProduct) => (
          <Card 
            key={relatedProduct.id} 
            sx={{ 
              width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' },
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }}
          >
            <Box
              component="img"
              src={relatedProduct.image}
              alt={relatedProduct.name}
              sx={{ width: '100%', height: 200, objectFit: 'cover' }}
            />
            <CardContent>
              <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                {relatedProduct.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Rating value={relatedProduct.rating} readOnly size="small" />
                <Typography variant="caption" color="text.secondary">
                  ({relatedProduct.reviewCount})
                </Typography>
              </Box>
              <Typography variant="h6" color="primary.main">
                {formatPrice(relatedProduct.price)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  const tabs = [
    { label: 'Overview', content: renderProductInfo() },
    { label: 'Reviews', content: renderReviews() },
    { label: 'Related', content: renderRelatedProducts() }
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading product details...</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Product not found
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        {onBack && (
          <IconButton onClick={onBack}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h4" fontWeight={700} flex={1}>
          Product Details
        </Typography>
        {onClose && (
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        )}
      </Box>
      
      <Box sx={{ display: { md: 'flex' }, gap: 4, mb: 4 }}>
        {/* Product Images */}
        <Box sx={{ flex: 1, mb: { xs: 3, md: 0 } }}>
          {renderProductImages()}
        </Box>
        
        {/* Product Info */}
        <Box sx={{ flex: 1 }}>
          {renderProductInfo()}
        </Box>
      </Box>
      
      {/* Tabs */}
      <Box>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {tabs[currentTab].content}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Product</DialogTitle>
        <DialogContent>
          <Typography>Share this amazing product with your friends!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Share</Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Rating:</Typography>
              <Rating
                value={userReview.rating}
                onChange={(_, value) => setUserReview(prev => ({ ...prev, rating: value || 5 }))}
              />
            </Box>
            
            <TextField
              label="Review Title"
              value={userReview.title}
              onChange={(e) => setUserReview(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
            />
            
            <TextField
              label="Your Review"
              value={userReview.comment}
              onChange={(e) => setUserReview(prev => ({ ...prev, comment: e.target.value }))}
              multiline
              rows={4}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained">Submit Review</Button>
        </DialogActions>
      </Dialog>

      {/* Price Alert Dialog */}
      <Dialog open={priceAlertDialogOpen} onClose={() => setPriceAlertDialogOpen(false)}>
        <DialogTitle>Set Price Alert</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Get notified when this product drops to your target price.
          </Typography>
          <TextField
            label="Target Price"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            type="number"
            fullWidth
            InputProps={{ startAdornment: '$' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceAlertDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePriceAlert} variant="contained">Set Alert</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductPage;