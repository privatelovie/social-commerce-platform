import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  Stack,
  Chip,
  Rating,
  IconButton,
  Paper,
  Divider,
  LinearProgress,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Edit,
  LocationOn,
  CalendarToday,
  Link as LinkIcon,
  Share,
  MoreVert,
  Favorite,
  ShoppingBag,
  Star,
  TrendingUp,
  LocalOffer,
  PersonAdd,
  PersonRemove,
  Block,
  Flag,
  Message,
  ShoppingCart,
  Reviews,
  PhotoCamera,
  Settings,
  Verified
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { RealProduct, ProductReview } from '../services/productApi';
import demoProductService from '../services/demoRealProducts';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  verified: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  stats: {
    followers: number;
    following: number;
    posts: number;
    reviews: number;
    wishlistItems: number;
  };
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  }[];
}

interface Post {
  id: string;
  content: string;
  media: string[];
  product?: RealProduct;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isAIGenerated: boolean;
}

interface ProfilePageProps {
  userId?: string;
  currentUser: any;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
  onProductClick: (product: RealProduct) => void;
  onWishlist: (product: RealProduct) => void;
  wishlistItems: RealProduct[];
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  userId,
  currentUser,
  onFollow,
  onMessage,
  onBlock,
  onReport,
  onProductClick,
  onWishlist,
  wishlistItems = []
}) => {
  // State management
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userReviews, setUserReviews] = useState<ProductReview[]>([]);
  const [userWishlist, setUserWishlist] = useState<RealProduct[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const { addItem, isInCart } = useCart();
  const isOwnProfile = !userId || userId === currentUser?.id;

  // Load user data
  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // Mock user profile - in real app, fetch from API
      const mockProfile: UserProfile = {
        id: userId || currentUser?.id || '1',
        name: isOwnProfile ? currentUser?.name || 'Demo User' : 'Sarah Johnson',
        username: isOwnProfile ? currentUser?.username || 'demo_user' : 'sarahj',
        avatar: isOwnProfile ? currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' : 'https://images.unsplash.com/photo-1494790108755-2616b4094b2e?w=150',
        bio: 'Fashion enthusiast & tech lover. Always hunting for the best deals! 🛍️✨',
        location: 'San Francisco, CA',
        website: 'https://demo-user.example.com',
        joinDate: '2023-01-15',
        verified: true,
        tier: 'gold',
        stats: {
          followers: 1247,
          following: 892,
          posts: 234,
          reviews: 156,
          wishlistItems: 89
        },
        badges: [
          {
            id: 'early_adopter',
            name: 'Early Adopter',
            description: 'Joined in the first month',
            icon: '🚀',
            color: '#667eea'
          },
          {
            id: 'top_reviewer',
            name: 'Top Reviewer',
            description: '100+ helpful reviews',
            icon: '⭐',
            color: '#ffd700'
          },
          {
            id: 'deal_hunter',
            name: 'Deal Hunter',
            description: 'Found 50+ amazing deals',
            icon: '🎯',
            color: '#4caf50'
          }
        ]
      };

      // Mock posts
      const mockPosts: Post[] = [
        {
          id: '1',
          content: 'Just found this amazing wireless charger! The design is so sleek and it works perfectly with my iPhone. Highly recommend! 📱⚡',
          media: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400'],
          product: {
            id: 'wireless_charger_1',
            name: 'Premium Wireless Charger',
            brand: 'TechCorp',
            price: 49.99,
            originalPrice: 79.99,
            currency: 'USD',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
            images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400'],
            rating: 4.8,
            reviewCount: 234,
            category: 'Electronics',
            description: 'Fast wireless charging for all Qi-enabled devices',
            features: ['Fast Charging', 'Qi Compatible', 'LED Indicator'],
            availability: 'in_stock',
            url: '#',
            source: 'demo' as any,
            lastUpdated: new Date().toISOString()
          },
          timestamp: '2 hours ago',
          likes: 23,
          comments: 7,
          shares: 3,
          isAIGenerated: false
        }
      ];

      setUserProfile(mockProfile);
      setUserPosts(mockPosts);

      // Load user's reviews and wishlist
      await Promise.all([
        loadUserReviews(),
        loadUserWishlist()
      ]);

    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReviews = async () => {
    try {
      // Mock reviews - in real app, fetch user's reviews from API
      const mockReviews: ProductReview[] = [
        {
          id: 'review_1',
          productId: 'product_1',
          user: {
            name: userProfile?.name || 'User',
            avatar: userProfile?.avatar || '',
            verified: userProfile?.verified || false
          },
          rating: 5,
          title: 'Excellent product quality!',
          comment: 'I absolutely love this item. The quality is outstanding and it arrived quickly. Would definitely recommend to anyone looking for something similar.',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          helpful: 12,
          verified: true,
          source: 'social_commerce'
        }
      ];
      setUserReviews(mockReviews);
    } catch (error) {
      console.error('Error loading user reviews:', error);
    }
  };

  const loadUserWishlist = async () => {
    try {
      // Load some sample wishlist items
      const wishlistProducts = await demoProductService.searchProducts('electronics');
      setUserWishlist(wishlistProducts.slice(0, 6));
    } catch (error) {
      console.error('Error loading user wishlist:', error);
    }
  };

  const handleFollow = () => {
    if (onFollow && userProfile) {
      onFollow(userProfile.id);
      setIsFollowing(!isFollowing);
      
      // Update follower count
      setUserProfile(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          followers: prev.stats.followers + (isFollowing ? -1 : 1)
        }
      } : null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'diamond': return '#b9f2ff';
      default: return '#667eea';
    }
  };

  if (loading || !userProfile) {
    return (
      <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '16px', mb: 3 }} />
        <Box 
          display="grid" 
          gridTemplateColumns={{
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          }}
          gap={3}
        >
          {[...Array(6)].map((_, i) => (
            <Box key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '12px' }} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      {/* Profile Header */}
      <Paper
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
            p: 4,
            color: 'white',
            position: 'relative'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box display="flex" alignItems="flex-start" gap={3} mb={3}>
              <Box position="relative">
                <Avatar
                  src={userProfile.avatar}
                  sx={{
                    width: 120,
                    height: 120,
                    border: `4px solid ${getTierColor(userProfile.tier)}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                  }}
                />
                {isOwnProfile && (
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': { backgroundColor: 'grey.100' }
                    }}
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="h4" fontWeight={700}>
                    {userProfile.name}
                  </Typography>
                  {userProfile.verified && (
                    <Verified sx={{ color: '#4caf50', fontSize: 28 }} />
                  )}
                  <Chip
                    label={userProfile.tier.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: getTierColor(userProfile.tier),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  @{userProfile.username}
                </Typography>

                <Typography variant="body1" sx={{ opacity: 0.9, mb: 2, maxWidth: '600px' }}>
                  {userProfile.bio}
                </Typography>

                <Stack direction="row" spacing={3} flexWrap="wrap">
                  {userProfile.location && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationOn fontSize="small" />
                      <Typography variant="body2">{userProfile.location}</Typography>
                    </Box>
                  )}
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="body2">
                      Joined {new Date(userProfile.joinDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </Typography>
                  </Box>
                  {userProfile.website && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LinkIcon fontSize="small" />
                      <Typography
                        variant="body2"
                        component="a"
                        href={userProfile.website}
                        target="_blank"
                        sx={{ color: 'inherit', textDecoration: 'underline' }}
                      >
                        Website
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>

              {!isOwnProfile && (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={isFollowing ? "outlined" : "contained"}
                    startIcon={isFollowing ? <PersonRemove /> : <PersonAdd />}
                    onClick={handleFollow}
                    sx={{
                      backgroundColor: isFollowing ? 'transparent' : 'white',
                      color: isFollowing ? 'white' : 'primary.main',
                      border: isFollowing ? '2px solid white' : 'none',
                      '&:hover': {
                        backgroundColor: isFollowing ? 'rgba(255,255,255,0.1)' : 'grey.100'
                      }
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>

                  <IconButton
                    onClick={() => onMessage && onMessage(userProfile.id)}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <Message />
                  </IconButton>

                  <IconButton
                    onClick={() => setShareDialogOpen(true)}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <Share />
                  </IconButton>
                </Stack>
              )}

              {isOwnProfile && (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditDialogOpen(true)}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Edit Profile
                  </Button>

                  <IconButton
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <Settings />
                  </IconButton>
                </Stack>
              )}
            </Box>

            {/* Stats */}
            <Box 
              display="grid" 
              gridTemplateColumns={{
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(4, 1fr)'
              }}
              gap={3}
            >
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700}>
                  {userProfile.stats.followers.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Followers
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700}>
                  {userProfile.stats.following.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Following
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700}>
                  {userProfile.stats.posts}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Posts
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700}>
                  {userProfile.stats.reviews}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Reviews
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Paper>

      {/* Badges */}
      {userProfile.badges.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Achievements
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {userProfile.badges.map((badge) => (
              <Chip
                key={badge.id}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>{badge.icon}</span>
                    <span>{badge.name}</span>
                  </Box>
                }
                sx={{
                  backgroundColor: badge.color,
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    px: 2,
                    py: 1
                  }
                }}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Content Tabs */}
      <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            backgroundColor: 'rgba(102, 126, 234, 0.05)',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600
            }
          }}
        >
          <Tab
            icon={<Reviews />}
            iconPosition="start"
            label={`Posts (${userProfile.stats.posts})`}
          />
          <Tab
            icon={<Favorite />}
            iconPosition="start"
            label={`Wishlist (${userProfile.stats.wishlistItems})`}
          />
          <Tab
            icon={<Star />}
            iconPosition="start"
            label={`Reviews (${userProfile.stats.reviews})`}
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {userPosts.length > 0 ? (
                  <Box display="flex" flexDirection="column" gap={3}>
                    {userPosts.map((post) => (
                      <Card key={post.id} sx={{ borderRadius: '12px' }}>
                        <CardContent>
                          <Typography variant="body1" paragraph>
                            {post.content}
                          </Typography>
                          {post.media.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              {post.media.map((mediaUrl, index) => (
                                <img
                                  key={index}
                                  src={mediaUrl}
                                  alt="Post media"
                                  style={{
                                    width: '100%',
                                    maxHeight: '300px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          <Stack direction="row" spacing={3}>
                            <Typography variant="body2" color="text.secondary">
                              ❤️ {post.likes}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              💬 {post.comments}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📤 {post.shares}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="info">No posts yet</Alert>
                )}
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {userWishlist.length > 0 ? (
                  <Box 
                    display="grid" 
                    gridTemplateColumns={{
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)'
                    }}
                    gap={3}
                  >
                    {userWishlist.map((product) => (
                      <Card
                        key={product.id}
                        sx={{
                          borderRadius: '12px',
                          cursor: 'pointer',
                          '&:hover': { boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)' }
                        }}
                        onClick={() => onProductClick(product)}
                      >
                          <CardMedia
                            component="img"
                            height="200"
                            image={product.image}
                            alt={product.name}
                          />
                          <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {product.brand}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                              <Rating value={product.rating} readOnly size="small" />
                              <Typography variant="caption">
                                ({product.reviewCount})
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography variant="h6" color="primary" fontWeight="bold">
                                ${product.price}
                              </Typography>
                              <Button
                                size="small"
                                variant={isInCart(product.id) ? "outlined" : "contained"}
                                startIcon={<ShoppingCart />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addItem(product);
                                }}
                              >
                                {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="info">No items in wishlist</Alert>
                )}
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {userReviews.length > 0 ? (
                  <Stack spacing={2}>
                    {userReviews.map((review) => (
                      <Card key={review.id} sx={{ borderRadius: '12px' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="body2" fontWeight={600}>
                              {review.title}
                            </Typography>
                            {review.verified && (
                              <Chip
                                label="Verified Purchase"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          <Typography variant="body2" paragraph>
                            {review.comment}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.date).toLocaleDateString()} • {review.helpful} found this helpful
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">No reviews yet</Alert>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Name"
              defaultValue={userProfile.name}
              fullWidth
            />
            <TextField
              label="Bio"
              defaultValue={userProfile.bio}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Location"
              defaultValue={userProfile.location}
              fullWidth
            />
            <TextField
              label="Website"
              defaultValue={userProfile.website}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setEditDialogOpen(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Profile Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Button
              startIcon={<LinkIcon />}
              variant="outlined"
              fullWidth
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setShareDialogOpen(false);
              }}
            >
              Copy Profile Link
            </Button>
            <Button
              startIcon={<Share />}
              variant="outlined"
              fullWidth
              onClick={() => {
                const text = `Check out ${userProfile.name}'s profile!`;
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
                window.open(url, '_blank');
                setShareDialogOpen(false);
              }}
              sx={{ color: '#1da1f2', borderColor: '#1da1f2' }}
            >
              Share on Twitter
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;