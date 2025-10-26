import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Divider,
  Autocomplete,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  PhotoCamera,
  VideoCall,
  LocationOn,
  EmojiEmotions,
  ShoppingBag,
  Close,
  Add,
  AttachMoney,
  Category,
  LocalOffer,
  Visibility,
  Public,
  People,
  Lock,
  Schedule
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import demoProductService from '../services/demoRealProducts';
import { RealProduct } from '../services/productApi';
import hashtagService from '../services/hashtagService';

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
  onClose?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated, onClose }) => {
  const { user } = useAuth();
  const { extractHashtags, trendingHashtags } = useSocial();
  
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<RealProduct | null>(null);
  const [productQuery, setProductQuery] = useState('');
  const [searchedProducts, setSearchedProducts] = useState<RealProduct[]>([]);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [emojiDialogOpen, setEmojiDialogOpen] = useState(false);
  const [searchingProducts, setSearchingProducts] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Common emojis for quick access
  const commonEmojis = ['😀', '😂', '🥰', '😍', '🤔', '😎', '🔥', '💯', '❤️', '👍', '🎉', '✨'];

  // Extract hashtags from content
  const detectedHashtags = hashtagService.extractHashtags(content);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedImages.length > 4) {
      alert('Maximum 4 images allowed');
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedVideo(file);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setSelectedVideo(null);
  };

  const searchProducts = async (query: string) => {
    if (!query.trim()) return;
    
    setSearchingProducts(true);
    try {
      const results = await demoProductService.searchProducts(query);
      setSearchedProducts(results.slice(0, 8));
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setSearchingProducts(false);
    }
  };

  const handleProductSelect = (product: RealProduct) => {
    setSelectedProduct(product);
    setProductDialogOpen(false);
    setProductQuery('');
  };

  const addEmoji = (emoji: string) => {
    setContent(content + emoji);
    setEmojiDialogOpen(false);
  };

  const handlePost = async () => {
    if (!content.trim() && selectedImages.length === 0 && !selectedVideo) {
      alert('Please add some content, images, or video to your post');
      return;
    }

    setLoading(true);

    try {
      // Simulate post creation
      const newPost = {
        id: Date.now().toString(),
        user: {
          id: user?.id || '1',
          username: user?.username || 'user',
          displayName: user?.displayName || 'User',
          avatar: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          isVerified: user?.isVerified || false
        },
        content,
        media: selectedImages.map(img => URL.createObjectURL(img)),
        video: selectedVideo ? URL.createObjectURL(selectedVideo) : null,
        location,
        timestamp: 'now',
        likes: 0,
        comments: 0,
        shares: 0,
        bookmarks: 0,
        isLiked: false,
        isBookmarked: false,
        hashtags: detectedHashtags,
        product: selectedProduct,
        privacy,
        scheduledDate: scheduledDate || null
      };

      // Register hashtags with service
      for (const hashtag of detectedHashtags) {
        await hashtagService.addHashtag(hashtag, {
          id: newPost.id,
          hashtags: detectedHashtags,
          content: newPost.content,
          author: {
            id: newPost.user.id,
            name: newPost.user.displayName,
            avatar: newPost.user.avatar
          },
          createdAt: new Date().toISOString(),
          engagement: {
            likes: 0,
            comments: 0,
            shares: 0
          }
        });
      }

      // Call parent callback
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Reset form
      setContent('');
      setSelectedImages([]);
      setSelectedVideo(null);
      setLocation('');
      setSelectedProduct(null);
      setPrivacy('public');
      setScheduledDate('');

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Card sx={{ borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar src={user?.avatar} sx={{ width: 48, height: 48 }} />
            <Box flex={1}>
              <Typography variant="h6" fontWeight={600}>
                Create New Post
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share what's on your mind
              </Typography>
            </Box>
            {onClose && (
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            )}
          </Box>

          {/* Content Input */}
          <TextField
            multiline
            minRows={4}
            maxRows={8}
            placeholder="What's happening? Use # for hashtags..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                fontSize: '16px',
                lineHeight: 1.5
              }
            }}
          />

          {/* Detected Hashtags */}
          {detectedHashtags.length > 0 && (
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Hashtags:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {detectedHashtags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={`#${tag}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Trending Hashtag Suggestions */}
          {content.includes('#') && trendingHashtags.length > 0 && (
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Trending hashtags:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {trendingHashtags.slice(0, 5).map((hashtag) => (
                  <Chip 
                    key={hashtag.tag}
                    label={`#${hashtag.tag}`} 
                    size="small" 
                    variant="outlined"
                    onClick={() => setContent(content + ` #${hashtag.tag}`)}
                    sx={{ 
                      mb: 0.5,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Selected Images */}
          {selectedImages.length > 0 && (
            <Box mb={2}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedImages.map((image, index) => (
                  <Box key={index} sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(25% - 6px)' }, position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      style={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Selected Video */}
          {selectedVideo && (
            <Box mb={2}>
              <Box position="relative">
                <video
                  controls
                  style={{
                    width: '100%',
                    maxHeight: 300,
                    borderRadius: '8px'
                  }}
                >
                  <source src={URL.createObjectURL(selectedVideo)} />
                </video>
                <IconButton
                  size="small"
                  onClick={removeVideo}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}

          {/* Selected Product */}
          {selectedProduct && (
            <Card variant="outlined" sx={{ mb: 2, borderRadius: '12px' }}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {selectedProduct.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedProduct.brand}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${selectedProduct.price}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => setSelectedProduct(null)}>
                    <Close />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Location Input */}
          {location && (
            <TextField
              fullWidth
              placeholder="Add location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <LocationOn sx={{ color: 'text.secondary', mr: 1 }} />
              }}
              sx={{ mb: 2 }}
            />
          )}

          {/* Privacy Setting */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">
              <Typography variant="body2" fontWeight={600}>
                Who can see this post?
              </Typography>
            </FormLabel>
            <RadioGroup
              row
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as any)}
            >
              <FormControlLabel 
                value="public" 
                control={<Radio size="small" />} 
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Public fontSize="small" />
                    <Typography variant="caption">Public</Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                value="friends" 
                control={<Radio size="small" />} 
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <People fontSize="small" />
                    <Typography variant="caption">Friends</Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                value="private" 
                control={<Radio size="small" />} 
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Lock fontSize="small" />
                    <Typography variant="caption">Private</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* Schedule Post */}
          <TextField
            type="datetime-local"
            label="Schedule Post (Optional)"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 3 }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <Schedule sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />

          <Divider sx={{ mb: 2 }} />

          {/* Action Buttons */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" spacing={1}>
              {/* Image Upload */}
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedVideo !== null}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
                }}
              >
                <PhotoCamera />
              </IconButton>

              {/* Video Upload */}
              <IconButton
                onClick={() => videoInputRef.current?.click()}
                disabled={selectedImages.length > 0}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
                }}
              >
                <VideoCall />
              </IconButton>

              {/* Location */}
              <IconButton
                onClick={() => setLocation(location ? '' : 'Add location...')}
                color={location ? 'primary' : 'default'}
                sx={{ 
                  border: '1px solid',
                  borderColor: location ? 'primary.main' : 'divider',
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
                }}
              >
                <LocationOn />
              </IconButton>

              {/* Emoji */}
              <IconButton
                onClick={() => setEmojiDialogOpen(true)}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
                }}
              >
                <EmojiEmotions />
              </IconButton>

              {/* Product */}
              <IconButton
                onClick={() => setProductDialogOpen(true)}
                color={selectedProduct ? 'primary' : 'default'}
                sx={{ 
                  border: '1px solid',
                  borderColor: selectedProduct ? 'primary.main' : 'divider',
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
                }}
              >
                <ShoppingBag />
              </IconButton>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              {content.length}/2000
            </Typography>
          </Box>

          {/* Post Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handlePost}
            disabled={loading || (!content.trim() && selectedImages.length === 0 && !selectedVideo)}
            sx={{
              borderRadius: '12px',
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b5b95 100%)',
              }
            }}
          >
            {loading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <LinearProgress sx={{ width: 100, height: 2 }} />
                Posting...
              </Box>
            ) : scheduledDate ? (
              'Schedule Post'
            ) : (
              'Post'
            )}
          </Button>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ display: 'none' }}
          />
        </CardContent>
      </Card>

      {/* Product Search Dialog */}
      <Dialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Product to Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search for products..."
            value={productQuery}
            onChange={(e) => {
              setProductQuery(e.target.value);
              searchProducts(e.target.value);
            }}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <ShoppingBag sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />

          {searchingProducts && (
            <Box display="flex" justifyContent="center" py={2}>
              <LinearProgress sx={{ width: '50%' }} />
            </Box>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {searchedProducts.map((product) => (
              <Box key={product.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
                <Card
                  variant="outlined"
                  onClick={() => handleProductSelect(product)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                    }
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: 150, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.brand}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${product.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Emoji Dialog */}
      <Dialog
        open={emojiDialogOpen}
        onClose={() => setEmojiDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Emoji</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {commonEmojis.map((emoji) => (
              <Box key={emoji} sx={{ width: 'calc(25% - 6px)' }}>
                <Button
                  onClick={() => addEmoji(emoji)}
                  sx={{
                    fontSize: '24px',
                    minWidth: 'auto',
                    width: '100%',
                    aspectRatio: '1/1'
                  }}
                >
                  {emoji}
                </Button>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmojiDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreatePost;