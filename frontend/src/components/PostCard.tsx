import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Chip,
  Rating,
  Alert,
  Stack,
  Collapse,
  Divider,
  LinearProgress,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
  BookmarkBorder,
  Bookmark,
  ShoppingBag,
  Star,
  PersonAdd,
  Psychology,
  SmartToy,
  ExpandMore,
  ExpandLess,
  ThumbUp,
  ThumbDown,
  TrendingUp,
  PriceCheck,
  LocalOffer,
  Verified,
  CompareArrows,
  ShoppingCart,
  Reviews
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import demoProductService from '../services/demoRealProducts';
import { RealProduct, ProductReview } from '../services/productApi';
import { parseHashtags } from './HashtagLink';

interface PostCardProps {
  post: any;
  currentUser: any;
  isLiked: boolean;
  isBookmarked: boolean;
  isFollowing: boolean;
  onLike: (postId: number) => void;
  onBookmark: (postId: number) => void;
  onFollow: (userId: number) => void;
  onAddToCart: (product: any) => void;
  onProductClick: (product: any) => void;
  onWishlist: (product: any) => void;
  wishlistItems: any[];
  aiInsightsEnabled: boolean;
  onToggleComments?: (postId: number) => void;
  onShare?: (post: any) => void;
  onCompareProduct?: (product: any) => void;
  cartItems?: any[];
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  isLiked,
  isBookmarked,
  isFollowing,
  onLike,
  onBookmark,
  onFollow,
  onAddToCart,
  onProductClick,
  onWishlist,
  wishlistItems,
  aiInsightsEnabled,
  onToggleComments,
  onShare,
  onCompareProduct,
  cartItems = []
}) => {
  // State for enhanced features
  const [showReviews, setShowReviews] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [priceDropped, setPriceDropped] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<RealProduct[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Check if product is in cart and wishlist
  const isInCart = cartItems.some(item => item.product.id === post.product?.id);
  const isInWishlist = wishlistItems.some(item => item.id === post.product?.id);

  // Load product reviews when product is available
  useEffect(() => {
    if (post.product && showReviews && !reviews.length) {
      loadProductReviews();
    }
  }, [post.product, showReviews]);

  // Check price trends
  useEffect(() => {
    if (post.product) {
      checkPriceTrends();
    }
  }, [post.product]);

  const loadProductReviews = async () => {
    if (!post.product) return;
    
    setLoadingReviews(true);
    try {
      const productReviews = await demoProductService.getProductReviews(post.product.id);
      setReviews(productReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkPriceTrends = async () => {
    if (!post.product) return;
    
    // Simulate price drop detection
    const hasDiscount = post.product.originalPrice && post.product.originalPrice > post.product.price;
    setPriceDropped(hasDiscount);
  };

  const loadRelatedProducts = async () => {
    if (!post.product) return;
    
    setLoadingRelated(true);
    try {
      const products = await demoProductService.searchProducts(post.product.category || post.product.name);
      const filtered = products.filter(p => p.id !== post.product.id).slice(0, 3);
      setRelatedProducts(filtered);
    } catch (error) {
      console.error('Error loading related products:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post);
    } else {
      setShareDialogOpen(true);
    }
  };

  const handleProductExpand = () => {
    setExpandedProduct(!expandedProduct);
    if (!expandedProduct && relatedProducts.length === 0) {
      loadRelatedProducts();
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
    >
      <Card 
        sx={{ 
          mb: 3,
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': { 
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }
        }}
      >
        {/* Post Header */}
        <CardContent sx={{ p: { xs: 2, md: 3 }, pb: 2 }}>
          <Box display="flex" alignItems="flex-start" gap={{ xs: 1.5, md: 2 }}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Avatar 
                src={post.user.avatar} 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  cursor: 'pointer',
                  '&:hover': {
                    border: '2px solid #667eea'
                  }
                }}
              />
            </motion.div>
            
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: '15px' }}>
                  {post.user.name}
                </Typography>
                
                {post.user.verified && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                  >
                    <Chip 
                      icon={<Star sx={{ fontSize: '12px !important' }} />}
                      label="Verified"
                      size="small"
                      sx={{ 
                        height: 20,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '11px',
                        '& .MuiChip-icon': { fontSize: '12px' }
                      }}
                    />
                  </motion.div>
                )}
                
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {post.user.username} • {post.timestamp}
                </Typography>
              </Box>
              
              {!isFollowing && post.user.id !== currentUser.id && (
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  style={{ display: 'inline-block' }}
                >
                  <Button 
                    size="small" 
                    variant="contained"
                    startIcon={<PersonAdd sx={{ fontSize: '14px' }} />}
                    onClick={() => onFollow(post.user.id)}
                    sx={{
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      px: 2,
                      py: 0.5,
                      fontWeight: 600,
                      fontSize: '12px',
                      textTransform: 'none',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b5b95 100%)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    Follow
                  </Button>
                </motion.div>
              )}
            </Box>
          </Box>
          
          {/* Post Content */}
          <Typography 
            variant="body1" 
            sx={{ 
              mt: 2, 
              mb: 2,
              lineHeight: 1.6,
              fontSize: '15px',
              fontWeight: 400,
              color: 'text.primary'
            }}
          >
            {parseHashtags(post.content, (tag) => {
              console.log('Clicked hashtag:', tag);
              // Could trigger search/explore view with this hashtag
            })}
          </Typography>
          
          {/* AI Generated Badge */}
          {post.isAIGenerated && (
            <Chip 
              icon={<SmartToy sx={{ fontSize: '14px !important' }} />}
              label="AI Generated"
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ mb: 2, fontSize: '11px' }}
            />
          )}
          
          {/* Media Gallery */}
          {post.media && post.media.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: post.media.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 1,
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {post.media.map((mediaUrl: string, index: number) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardMedia
                      component="img"
                      image={mediaUrl}
                      alt={`Post media ${index + 1}`}
                      sx={{ 
                        borderRadius: '8px',
                        height: post.media.length === 1 ? 400 : 200,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </Box>
          )}
          
          {/* Enhanced Product Card */}
          {post.product && (
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                sx={{ 
                  border: priceDropped ? '2px solid #4caf50' : '1px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '16px',
                  mb: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  background: priceDropped ? 'rgba(76, 175, 80, 0.02)' : 'white',
                  '&:hover': { 
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                    border: priceDropped ? '2px solid #4caf50' : '2px solid #667eea',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {/* Price Drop Alert */}
                {priceDropped && (
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <TrendingUp sx={{ fontSize: '16px' }} />
                    <Typography variant="caption" fontWeight={600}>
                      🔥 Price Drop Alert! Limited Time Offer
                    </Typography>
                  </Box>
                )}
                
                <Box 
                  display="flex" 
                  p={{ xs: 1.5, md: 2 }} 
                  gap={{ xs: 1.5, md: 2 }} 
                  onClick={() => onProductClick(post.product)}
                  sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'center', sm: 'flex-start' }
                  }}
                >
                  <Box position="relative">
                    <CardMedia
                      component="img"
                      image={post.product.image}
                      alt={post.product.name}
                      sx={{ 
                        width: { xs: 100, sm: 120 }, 
                        height: { xs: 100, sm: 120 }, 
                        borderRadius: '12px',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        background: '#f8f9fa',
                        flexShrink: 0
                      }}
                    />
                    {post.product.originalPrice && (
                      <Chip
                        label={`${Math.round(((post.product.originalPrice - post.product.price) / post.product.originalPrice) * 100)}% OFF`}
                        size="small"
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          fontSize: '10px',
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #f5576c 0%, #e63946 100%)'
                        }}
                      />
                    )}
                  </Box>
                  
                  <Box flex={1}>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                      <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ fontSize: '16px', mb: 0.5 }}>
                          {post.product.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="text.secondary">
                            {post.product.brand}
                          </Typography>
                          {post.product.source && (
                            <Chip 
                              label={post.product.source.charAt(0).toUpperCase() + post.product.source.slice(1)}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '10px', height: '20px' }}
                            />
                          )}
                        </Box>
                      </Box>
                      
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductExpand();
                        }}
                        sx={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
                      >
                        {expandedProduct ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Rating value={post.product.rating} readOnly size="small" precision={0.1} />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {post.product.rating} ({post.product.reviewCount} reviews)
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Reviews sx={{ fontSize: '12px' }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowReviews(!showReviews);
                        }}
                        sx={{ fontSize: '10px', minWidth: 'auto', px: 1 }}
                      >
                        Reviews
                      </Button>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Typography variant="h5" color="primary" fontWeight="bold">
                        ${post.product.price}
                      </Typography>
                      {post.product.originalPrice && (
                        <Typography 
                          variant="body2" 
                          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                        >
                          ${post.product.originalPrice}
                        </Typography>
                      )}
                      {priceDropped && (
                        <Chip 
                          icon={<PriceCheck sx={{ fontSize: '12px !important' }} />}
                          label="Best Price"
                          size="small"
                          color="success"
                          sx={{ fontSize: '10px', fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                    
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={1} 
                      sx={{ width: '100%' }}
                    >
                      <Button 
                        variant={isInCart ? "outlined" : "contained"}
                        size="small" 
                        fullWidth
                        startIcon={isInCart ? <ShoppingCart sx={{ fontSize: '14px' }} /> : <ShoppingBag sx={{ fontSize: '14px' }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(post.product);
                        }}
                        sx={{
                          borderRadius: '10px',
                          fontSize: { xs: '12px', sm: '11px' },
                          py: 0.8,
                          px: { xs: 2, sm: 1.5 },
                          fontWeight: 600,
                          minWidth: { xs: 'auto', sm: 120 }
                        }}
                      >
                        {isInCart ? 'In Cart' : 'Add to Cart'}
                      </Button>
                      
                      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Tooltip title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onWishlist(post.product);
                            }}
                            sx={{
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              borderRadius: '10px',
                              color: isInWishlist ? '#f5576c' : 'inherit'
                            }}
                          >
                            {isInWishlist ? 
                              <Favorite sx={{ fontSize: '16px' }} /> : 
                              <FavoriteBorder sx={{ fontSize: '16px' }} />
                            }
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      {onCompareProduct && (
                        <Tooltip title="Compare Product">
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCompareProduct(post.product);
                            }}
                            sx={{
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              borderRadius: '10px'
                            }}
                          >
                            <CompareArrows sx={{ fontSize: '16px' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
                </Box>
                
                {/* Expanded Product Details */}
                <Collapse in={expandedProduct}>
                  <Divider />
                  <Box p={2}>
                    {/* Product Features */}
                    {post.product.features && post.product.features.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          Key Features:
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {post.product.features.slice(0, 5).map((feature: string, index: number) => (
                            <Chip 
                              key={index}
                              label={feature}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '10px', mb: 0.5 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    
                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          Similar Products:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                          {relatedProducts.map((relatedProduct) => (
                            <Card 
                              key={relatedProduct.id}
                              sx={{ 
                                minWidth: 120,
                                cursor: 'pointer',
                                border: '1px solid rgba(0,0,0,0.1)',
                                '&:hover': { borderColor: '#667eea' }
                              }}
                              onClick={() => onProductClick(relatedProduct)}
                            >
                              <CardMedia
                                component="img"
                                height="80"
                                image={relatedProduct.image}
                                alt={relatedProduct.name}
                                sx={{ objectFit: 'cover' }}
                              />
                              <Box p={1}>
                                <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 600 }}>
                                  {relatedProduct.name.substring(0, 30)}...
                                </Typography>
                                <Typography variant="caption" color="primary" display="block" fontWeight="bold">
                                  ${relatedProduct.price}
                                </Typography>
                              </Box>
                            </Card>
                          ))}
                        </Stack>
                      </Box>
                    )}
                    
                    {loadingRelated && (
                      <Box display="flex" justifyContent="center" py={2}>
                        <LinearProgress sx={{ width: '50%' }} />
                      </Box>
                    )}
                  </Box>
                </Collapse>
                
                {/* Product Reviews Section */}
                <Collapse in={showReviews}>
                  <Divider />
                  <Box p={2}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Customer Reviews
                    </Typography>
                    
                    {loadingReviews ? (
                      <Box display="flex" justifyContent="center" py={2}>
                        <LinearProgress sx={{ width: '100%' }} />
                      </Box>
                    ) : (
                      <Stack spacing={1.5} maxHeight={300} sx={{ overflowY: 'auto' }}>
                        {reviews.map((review) => (
                          <Box key={review.id} sx={{ 
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            p: 1.5
                          }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Avatar 
                                src={review.user.avatar} 
                                sx={{ width: 24, height: 24 }}
                              />
                              <Typography variant="caption" fontWeight={600}>
                                {review.user.name}
                              </Typography>
                              {review.user.verified && (
                                <Verified sx={{ fontSize: '12px', color: '#4caf50' }} />
                              )}
                              <Rating value={review.rating} readOnly size="small" />
                            </Box>
                            
                            <Typography variant="body2" fontWeight={600} gutterBottom sx={{ fontSize: '12px' }}>
                              {review.title}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary' }}>
                              {review.comment}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.date).toLocaleDateString()}
                              </Typography>
                              {review.verified && (
                                <Chip 
                                  label="Verified Purchase" 
                                  size="small" 
                                  color="success"
                                  variant="outlined"
                                  sx={{ fontSize: '9px', height: '16px' }}
                                />
                              )}
                              <Box display="flex" alignItems="center" gap={0.5} ml="auto">
                                <IconButton size="small" sx={{ p: 0.25 }}>
                                  <ThumbUp sx={{ fontSize: '12px' }} />
                                </IconButton>
                                <Typography variant="caption">{review.helpful}</Typography>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    )}
                    
                    {reviews.length === 0 && !loadingReviews && (
                      <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                        No reviews yet. Be the first to review!
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Card>
            </motion.div>
          )}
          
          {/* AI Insights */}
          {aiInsightsEnabled && post.aiInsight && (
            <Alert 
              icon={<Psychology sx={{ fontSize: '18px' }} />} 
              severity="info" 
              sx={{ 
                mb: 2,
                borderRadius: '12px',
                background: 'rgba(102, 126, 234, 0.05)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                '& .MuiAlert-icon': {
                  color: '#667eea'
                }
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '13px' }}>
                <strong>AI Insight:</strong> {post.aiInsight}
              </Typography>
            </Alert>
          )}
        </CardContent>
        
        {/* Post Actions */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={0.5}>
              {/* Like Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  startIcon={
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 1.2 }}
                    >
                      {isLiked ? 
                        <Favorite sx={{ color: '#f5576c', fontSize: '18px' }} /> : 
                        <FavoriteBorder sx={{ color: '#64748b', fontSize: '18px' }} />
                      }
                    </motion.div>
                  }
                  onClick={() => onLike(post.id)}
                  size="medium"
                  sx={{
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5,
                    minWidth: 'auto',
                    color: isLiked ? '#f5576c' : '#64748b',
                    fontWeight: 600,
                    fontSize: '13px',
                    textTransform: 'none',
                    '&:hover': {
                      background: isLiked ? 'rgba(245, 87, 108, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      color: isLiked ? '#f5576c' : '#1a202c'
                    }
                  }}
                >
                  {post.likes + (isLiked ? 1 : 0)}
                </Button>
              </motion.div>
              
              {/* Comment Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  startIcon={<ChatBubbleOutline sx={{ fontSize: '18px' }} />}
                  size="medium"
                  onClick={() => onToggleComments?.(post.id)}
                  sx={{
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5,
                    minWidth: 'auto',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '13px',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'rgba(100, 116, 139, 0.1)',
                      color: '#1a202c'
                    }
                  }}
                >
                  {post.comments}
                </Button>
              </motion.div>
              
              {/* Share Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  startIcon={<Share sx={{ fontSize: '18px' }} />}
                  size="medium"
                  onClick={handleShare}
                  sx={{
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5,
                    minWidth: 'auto',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '13px',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'rgba(100, 116, 139, 0.1)',
                      color: '#1a202c'
                    }
                  }}
                >
                  {post.shares || 0}
                </Button>
              </motion.div>
            </Box>
            
            {/* Action Buttons */}
            <Box display="flex" gap={1}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton 
                  size="small"
                  onClick={() => onBookmark(post.id)}
                  sx={{
                    background: isBookmarked ? 'rgba(102, 126, 234, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                    color: isBookmarked ? '#667eea' : '#64748b',
                    borderRadius: '10px',
                    '&:hover': {
                      background: isBookmarked ? 'rgba(102, 126, 234, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {isBookmarked ? 
                    <Bookmark sx={{ fontSize: '18px' }} /> : 
                    <BookmarkBorder sx={{ fontSize: '18px' }} />
                  }
                </IconButton>
              </motion.div>
            </Box>
          </Box>
        </Box>
      </Card>
      
      {/* Share Dialog */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share this post</DialogTitle>
        <DialogContent>
          <Stack spacing={2} py={2}>
            <Button
              startIcon={<Share />}
              variant="outlined"
              fullWidth
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setShareDialogOpen(false);
              }}
            >
              Copy Link
            </Button>
            
            <Button
              startIcon={<Share />}
              variant="outlined"
              fullWidth
              onClick={() => {
                const text = `Check out this ${post.product ? 'product' : 'post'}: ${post.content}`;
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
                setShareDialogOpen(false);
              }}
              sx={{ color: '#1da1f2', borderColor: '#1da1f2' }}
            >
              Share on Twitter
            </Button>
            
            {post.product && (
              <Button
                startIcon={<ShoppingBag />}
                variant="outlined"
                fullWidth
                onClick={() => {
                  const text = `Found this amazing product: ${post.product.name} for $${post.product.price}!`;
                  navigator.clipboard.writeText(text + ' ' + window.location.href);
                  setShareDialogOpen(false);
                }}
                sx={{ color: '#4caf50', borderColor: '#4caf50' }}
              >
                Share Product Details
              </Button>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default PostCard;
