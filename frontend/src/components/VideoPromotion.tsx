import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemButton,
  Tooltip,
  LinearProgress,
  Fab,
  Menu,
  MenuItem
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VideoCall,
  Upload,
  ShoppingBag,
  Close,
  Add,
  Delete,
  Edit,
  Share,
  Favorite,
  FavoriteBorder,
  Comment,
  Visibility
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
}

interface VideoPromo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  products: Product[];
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  isLiked: boolean;
  createdAt: string;
}

interface VideoPromotionProps {
  onProductClick: (product: Product) => void;
  onCreateVideo?: (videoData: any) => void;
}

const VideoPromotion: React.FC<VideoPromotionProps> = ({ onProductClick, onCreateVideo }) => {
  const [videos, setVideos] = useState<VideoPromo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoPromo | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    file: null as File | null,
    products: [] as Product[]
  });
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock products for linking
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Nike Air Max 270',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
      description: 'Premium running shoes with air cushioning',
      inStock: true
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      price: 999.99,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop',
      description: 'Latest iPhone with titanium design',
      inStock: true
    },
    {
      id: '3',
      name: 'Sony WH-1000XM5',
      price: 349.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      description: 'Premium noise-canceling headphones',
      inStock: false
    }
  ];

  // Mock video promos
  React.useEffect(() => {
    const mockVideos: VideoPromo[] = [
      {
        id: '1',
        title: 'Summer Fashion Haul 2024',
        description: 'Check out these amazing summer pieces! Perfect for beach days and city walks. #fashion #summer #style',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop',
        creator: {
          name: 'Sarah Style',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
          verified: true
        },
        products: mockProducts.slice(0, 2),
        stats: { views: 12500, likes: 1250, comments: 89, shares: 156 },
        isLiked: false,
        createdAt: '2024-01-07'
      },
      {
        id: '2',
        title: 'Tech Review: Latest Gadgets',
        description: 'Unboxing and reviewing the hottest tech products of 2024! Links to purchase below. #tech #review #gadgets',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=600&fit=crop',
        creator: {
          name: 'Tech Mike',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          verified: true
        },
        products: mockProducts.slice(1, 3),
        stats: { views: 8900, likes: 890, comments: 124, shares: 78 },
        isLiked: true,
        createdAt: '2024-01-06'
      }
    ];
    setVideos(mockVideos);
  }, []);

  const handleVideoClick = (video: VideoPromo) => {
    setSelectedVideo(video);
    setIsPlaying(video.id);
  };

  const handlePlayPause = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(videoId);
      } else {
        video.pause();
        setIsPlaying(null);
      }
    }
  };

  const handleLike = (videoId: string) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { 
            ...video, 
            isLiked: !video.isLiked,
            stats: { 
              ...video.stats, 
              likes: video.isLiked ? video.stats.likes - 1 : video.stats.likes + 1 
            }
          }
        : video
    ));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setNewVideo(prev => ({ ...prev, file }));
    }
  };

  const handleProductAdd = (product: Product) => {
    if (!newVideo.products.find(p => p.id === product.id)) {
      setNewVideo(prev => ({
        ...prev,
        products: [...prev.products, product]
      }));
    }
    setProductSearchOpen(false);
  };

  const handleProductRemove = (productId: string) => {
    setNewVideo(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  const handleCreateVideo = () => {
    if (newVideo.title && newVideo.file) {
      const videoData = {
        ...newVideo,
        id: Date.now().toString(),
        videoUrl: URL.createObjectURL(newVideo.file),
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop',
        creator: {
          name: 'You',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
          verified: false
        },
        stats: { views: 0, likes: 0, comments: 0, shares: 0 },
        isLiked: false,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setVideos(prev => [videoData, ...prev]);
      setNewVideo({ title: '', description: '', file: null, products: [] });
      setIsCreateModalOpen(false);
      onCreateVideo?.(videoData);
    }
  };

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Video Promotions
        </Typography>
        <Button
          variant="contained"
          startIcon={<VideoCall />}
          onClick={() => setIsCreateModalOpen(true)}
          sx={{ borderRadius: 3 }}
        >
          Create Video
        </Button>
      </Box>

      {/* Video Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {/* Video Thumbnail/Player */}
              <Box sx={{ position: 'relative', aspectRatio: '9/16', maxHeight: 400 }}>
                {selectedVideo?.id === video.id ? (
                  <video
                    ref={el => {
                      if (el) {
                        videoRefs.current[video.id] = el;
                      }
                    }}
                    src={video.videoUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    controls
                    autoPlay
                  />
                ) : (
                  <>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleVideoClick(video)}
                    >
                      <IconButton
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.9)', 
                          color: 'primary.main',
                          '&:hover': { bgcolor: 'white' }
                        }}
                      >
                        <PlayArrow fontSize="large" />
                      </IconButton>
                    </Box>
                  </>
                )}

                {/* Creator Info Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Avatar src={video.creator.avatar} sx={{ width: 32, height: 32 }} />
                  <Typography variant="body2" color="white" fontWeight="bold">
                    {video.creator.name}
                  </Typography>
                  {video.creator.verified && (
                    <Chip size="small" label="✓" sx={{ bgcolor: 'primary.main', color: 'white', height: 20 }} />
                  )}
                </Box>
              </Box>

              <CardContent>
                {/* Video Info */}
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {video.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {video.description}
                </Typography>

                {/* Stats */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility fontSize="small" color="action" />
                    <Typography variant="caption">{video.stats.views.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleLike(video.id)}>
                      {video.isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
                    </IconButton>
                    <Typography variant="caption">{video.stats.likes}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Comment fontSize="small" color="action" />
                    <Typography variant="caption">{video.stats.comments}</Typography>
                  </Box>
                </Box>

                {/* Linked Products */}
                {video.products.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      Featured Products
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {video.products.map(product => (
                        <Box
                          key={product.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => onProductClick(product)}
                        >
                          <Avatar src={product.image} variant="rounded" sx={{ width: 40, height: 40 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="primary.main">
                              ${product.price}
                            </Typography>
                          </Box>
                          <Chip
                            label={product.inStock ? 'In Stock' : 'Out of Stock'}
                            size="small"
                            color={product.inStock ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Create Video Modal */}
      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Create Video Promotion</Typography>
            <IconButton onClick={() => setIsCreateModalOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
            {/* Video Upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Video File</Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: newVideo.file ? 'success.main' : 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {newVideo.file ? (
                  <Box>
                    <Typography color="success.main">{newVideo.file.name}</Typography>
                    <Typography variant="caption">Click to change</Typography>
                  </Box>
                ) : (
                  <Box>
                    <Upload fontSize="large" color="action" />
                    <Typography variant="h6" color="text.secondary">
                      Click to upload video
                    </Typography>
                    <Typography variant="caption">MP4, MOV, AVI up to 100MB</Typography>
                  </Box>
                )}
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                hidden
                onChange={handleFileSelect}
              />
            </Box>

            {/* Video Details */}
            <TextField
              label="Video Title"
              value={newVideo.title}
              onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newVideo.description}
              onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe your video and use hashtags..."
            />

            {/* Product Linking */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2">Linked Products</Typography>
                <Button
                  startIcon={<Add />}
                  onClick={() => setProductSearchOpen(true)}
                  size="small"
                >
                  Add Product
                </Button>
              </Box>
              {newVideo.products.length > 0 ? (
                <List dense>
                  {newVideo.products.map(product => (
                    <ListItem key={product.id}>
                      <ListItemAvatar>
                        <Avatar src={product.image} variant="rounded" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={product.name}
                        secondary={`$${product.price}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton onClick={() => handleProductRemove(product.id)}>
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No products linked yet
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateVideo}
            disabled={!newVideo.title || !newVideo.file}
          >
            Create Video
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Search Modal */}
      <Dialog open={productSearchOpen} onClose={() => setProductSearchOpen(false)}>
        <DialogTitle>Select Products to Link</DialogTitle>
        <DialogContent>
          <TextField
            label="Search Products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <List>
            {filteredProducts.map(product => (
              <ListItem key={product.id}>
                <ListItemButton onClick={() => handleProductAdd(product)}>
                <ListItemAvatar>
                  <Avatar src={product.image} variant="rounded" />
                </ListItemAvatar>
                  <ListItemText
                    primary={product.name}
                    secondary={`$${product.price} • ${product.inStock ? 'In Stock' : 'Out of Stock'}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VideoPromotion;