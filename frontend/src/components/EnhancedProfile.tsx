import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Badge,
  Tooltip,
  Fab,
  Menu,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Edit,
  Share,
  Message,
  MoreVert,
  Verified,
  LocationOn,
  Link as LinkIcon,
  CalendarToday,
  ShoppingBag,
  Store,
  GridView,
  ViewList,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Add,
  Star,
  TrendingUp,
  Visibility,
  Settings,
  PersonAdd,
  PersonRemove
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, User } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import AnalyticsDashboard from './AnalyticsDashboard';

interface Post {
  id: string;
  content: string;
  images: string[];
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  hashtags: string[];
  products?: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  category: string;
  isLiked: boolean;
  sales: number;
}

interface EnhancedProfileProps {
  userId?: string;
  isOwnProfile?: boolean;
  onProductClick?: (product: Product) => void;
  onPostClick?: (post: Post) => void;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
  onEditProfile?: () => void;
}

const EnhancedProfile: React.FC<EnhancedProfileProps> = ({
  userId,
  isOwnProfile = true,
  onProductClick,
  onPostClick,
  onFollowToggle,
  onEditProfile
}) => {
  const { user } = useAuth();
  const { followUser, unfollowUser, following } = useSocial();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Mock data initialization
  useEffect(() => {
    // In a real app, fetch user data based on userId
    if (isOwnProfile && user) {
      // Ensure user has all required properties with defaults
      setProfileUser({
        ...user,
        postCount: user.postCount ?? 0,
        salesCount: user.salesCount ?? 0,
        totalEarnings: user.totalEarnings ?? 0,
        followerCount: user.followerCount ?? 0,
        followingCount: user.followingCount ?? 0,
        isCreator: user.isCreator ?? false,
        creatorLevel: user.creatorLevel ?? 'bronze'
      });
    } else {
      // Mock profile for viewing others
      setProfileUser({
        id: '2',
        username: 'sarah_style',
        email: 'sarah@example.com',
        displayName: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
        bio: 'Fashion enthusiast & lifestyle blogger ✨ Sharing my style journey and favorite finds 🛍️ #fashion #lifestyle #style',
        isVerified: true,
        followerCount: 12500,
        followingCount: 890,
        postCount: 342,
        salesCount: 156,
        totalEarnings: 25680.50,
        joinDate: '2023-01-15',
        location: 'New York, USA',
        website: 'https://sarahjohnson.com',
        isCreator: true,
        creatorLevel: 'gold',
        // Add required User fields
        followers: 0,
        following: 0,
        posts: 0
      });
      setIsFollowing(false);
    }

    loadUserContent();
  }, [userId, user, isOwnProfile]);

  const loadUserContent = () => {
    // Mock posts
    const mockPosts: Post[] = [
      {
        id: '1',
        content: 'Just got this amazing new collection! The quality is incredible and the fit is perfect. Swipe to see all the pieces I picked up ✨ #fashion #haul #style',
        images: [
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
        ],
        timestamp: new Date(Date.now() - 3600000),
        likes: 1250,
        comments: 89,
        shares: 156,
        isLiked: true,
        hashtags: ['fashion', 'haul', 'style'],
        products: [
          {
            id: '1',
            name: 'Elegant Summer Dress',
            price: 89.99,
            originalPrice: 129.99,
            image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop',
            description: 'Perfect for summer occasions',
            rating: 4.8,
            reviews: 124,
            inStock: true,
            category: 'Dresses',
            isLiked: false,
            sales: 45
          }
        ]
      },
      {
        id: '2',
        content: 'Behind the scenes of today\'s photoshoot! Thank you to everyone who made this possible 📸 More content coming soon!',
        images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop'],
        timestamp: new Date(Date.now() - 86400000),
        likes: 2100,
        comments: 156,
        shares: 89,
        isLiked: false,
        hashtags: ['photoshoot', 'behindthescenes'],
      }
    ];

    // Mock products
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Elegant Summer Dress',
        price: 89.99,
        originalPrice: 129.99,
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop',
        description: 'Perfect for summer occasions with breathable fabric',
        rating: 4.8,
        reviews: 124,
        inStock: true,
        category: 'Dresses',
        isLiked: false,
        sales: 45
      },
      {
        id: '2',
        name: 'Casual Denim Jacket',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=300&h=300&fit=crop',
        description: 'Classic denim jacket for everyday wear',
        rating: 4.6,
        reviews: 89,
        inStock: true,
        category: 'Jackets',
        isLiked: true,
        sales: 32
      },
      {
        id: '3',
        name: 'Luxury Handbag',
        price: 299.99,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop',
        description: 'Premium leather handbag with gold hardware',
        rating: 4.9,
        reviews: 67,
        inStock: false,
        category: 'Accessories',
        isLiked: false,
        sales: 18
      }
    ];

    setPosts(mockPosts);
    setProducts(mockProducts);
  };

  const handleFollowToggle = async () => {
    if (!profileUser) return;

    if (isFollowing) {
      await unfollowUser(profileUser.id);
      setIsFollowing(false);
      setProfileUser(prev => prev ? { ...prev, followerCount: (prev.followerCount || 0) - 1 } : null);
    } else {
      await followUser(profileUser.id);
      setIsFollowing(true);
      setProfileUser(prev => prev ? { ...prev, followerCount: (prev.followerCount || 0) + 1 } : null);
    }

    onFollowToggle?.(profileUser.id, !isFollowing);
  };

  const handlePostLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleProductLike = (productId: string) => {
    setProducts(prev => prev.map(product =>
      product.id === productId
        ? { ...product, isLiked: !product.isLiked }
        : product
    ));
  };

  if (!profileUser) return null;

  const tabContent = [
    { label: 'Posts', icon: <GridView />, count: posts.length },
    { label: 'Shop', icon: <Store />, count: products.length },
    { label: 'Analytics', icon: <TrendingUp />, count: null, ownerOnly: true }
  ];

  const filteredTabs = isOwnProfile ? tabContent : tabContent.filter(tab => !tab.ownerOnly);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Profile Header */}
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
          <Avatar
            src={profileUser.avatar}
            sx={{ width: 120, height: 120 }}
          />
          
          <Box sx={{ flex: 1 }}>
            {/* User Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h4" fontWeight="bold">
                {profileUser.displayName}
              </Typography>
              {profileUser.isVerified && (
                <Verified color="primary" />
              )}
              {profileUser.isCreator && (
                <Chip
                  label={profileUser.creatorLevel?.toUpperCase() || 'BRONZE'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              @{profileUser.username}
            </Typography>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  {(profileUser.postCount || 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posts
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  {(profileUser.followerCount || 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Followers
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  {(profileUser.followingCount || 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Following
                </Typography>
              </Box>
              {profileUser.isCreator && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    {profileUser.salesCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sales
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Bio */}
            <Typography variant="body1" sx={{ mb: 2, maxWidth: 500 }}>
              {profileUser.bio}
            </Typography>

            {/* Location & Website */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              {profileUser.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {profileUser.location}
                  </Typography>
                </Box>
              )}
              {profileUser.website && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LinkIcon fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    color="primary"
                    component="a"
                    href={profileUser.website}
                    target="_blank"
                    sx={{ textDecoration: 'none' }}
                  >
                    {profileUser.website.replace('https://', '')}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Joined {new Date(profileUser.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isOwnProfile ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => onEditProfile?.()}
                >
                  Edit Profile
                </Button>
                <IconButton onClick={() => setShowAnalytics(true)}>
                  <Settings />
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  startIcon={isFollowing ? <PersonRemove /> : <PersonAdd />}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
                <Button variant="outlined" startIcon={<Message />}>
                  Message
                </Button>
                <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                  <MoreVert />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {filteredTabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  <Typography variant="body2">
                    {tab.label} {tab.count !== null && `(${tab.count})`}
                  </Typography>
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* Posts Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Posts</Typography>
                <Box>
                  <IconButton
                    onClick={() => setViewMode('grid')}
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                  >
                    <GridView />
                  </IconButton>
                  <IconButton
                    onClick={() => setViewMode('list')}
                    color={viewMode === 'list' ? 'primary' : 'default'}
                  >
                    <ViewList />
                  </IconButton>
                </Box>
              </Box>

              {viewMode === 'grid' ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card sx={{ cursor: 'pointer' }} onClick={() => onPostClick?.(post)}>
                        {post.images.length > 0 && (
                          <CardMedia
                            component="img"
                            height="200"
                            image={post.images[0]}
                            alt="Post image"
                          />
                        )}
                        <CardContent>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {post.content.slice(0, 100)}...
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePostLike(post.id); }}>
                                {post.isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
                              </IconButton>
                              <Typography variant="caption">{post.likes}</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {post.comments} comments
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {post.shares} shares
                            </Typography>
                          </Box>

                          {post.hashtags.length > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {post.hashtags.slice(0, 3).map(tag => (
                                <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {posts.map(post => (
                    <Card key={post.id} sx={{ cursor: 'pointer' }} onClick={() => onPostClick?.(post)}>
                      <CardContent>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {post.images.length > 0 && (
                            <img
                              src={post.images[0]}
                              alt="Post"
                              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                            />
                          )}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              {post.content}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                {post.likes} likes
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {post.comments} comments
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Shop Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Shop</Typography>
                {isOwnProfile && (
                  <Button startIcon={<Add />} variant="outlined">
                    Add Product
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card sx={{ cursor: 'pointer', position: 'relative' }} onClick={() => onProductClick?.(product)}>
                      <Badge
                        badgeContent={!product.inStock ? 'Out of Stock' : product.originalPrice ? 'Sale' : ''}
                        color={!product.inStock ? 'error' : 'secondary'}
                        sx={{ '& .MuiBadge-badge': { top: 16, right: 16 } }}
                      >
                        <CardMedia
                          component="img"
                          height="240"
                          image={product.image}
                          alt={product.name}
                        />
                      </Badge>
                      
                      <IconButton
                        sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
                        onClick={(e) => { e.stopPropagation(); handleProductLike(product.id); }}
                      >
                        {product.isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
                      </IconButton>

                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }} noWrap>
                          {product.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" color="primary.main">
                            ${product.price}
                          </Typography>
                          {product.originalPrice && (
                            <Typography variant="body2" sx={{ textDecoration: 'line-through' }} color="text.secondary">
                              ${product.originalPrice}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Star fontSize="small" color="warning" />
                            <Typography variant="body2">{product.rating}</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            ({product.reviews} reviews)
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {product.description}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Chip label={product.category} size="small" variant="outlined" />
                          {isOwnProfile && (
                            <Typography variant="caption" color="text.secondary">
                              {product.sales} sold
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </Box>
          )}

          {/* Analytics Tab (Owner Only) */}
          {activeTab === 2 && isOwnProfile && (
            <AnalyticsDashboard />
          )}
        </Box>
      </Paper>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <Share sx={{ mr: 2 }} />
          Share Profile
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <Store sx={{ mr: 2 }} />
          Visit Shop
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setMenuAnchor(null)}>
          Report Profile
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EnhancedProfile;