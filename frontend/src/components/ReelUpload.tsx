import React, { useState, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Card,
  CardMedia,
  Chip,
  LinearProgress,
  Alert,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  Close,
  CloudUpload,
  VideoLibrary,
  Link as LinkIcon,
  LocalOffer,
  Add,
  Delete,
  CheckCircle
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import demoProductService from '../services/demoRealProducts';
import { RealProduct } from '../services/productApi';

interface ReelUploadProps {
  open: boolean;
  onClose: () => void;
  onUpload?: (reelData: any) => void;
}

const ReelUpload: React.FC<ReelUploadProps> = ({ open, onClose, onUpload }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [linkedProduct, setLinkedProduct] = useState<RealProduct | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions, setProductSuggestions] = useState<RealProduct[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchingProducts, setSearchingProducts] = useState(false);

  // Handle video file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }

      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Video file size must be less than 100MB');
        return;
      }

      setVideoFile(file);
      setError(null);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
    }
  };

  // Search for products
  const handleProductSearch = async (query: string) => {
    if (query.length < 2) {
      setProductSuggestions([]);
      return;
    }

    setSearchingProducts(true);
    try {
      const results = await demoProductService.searchProducts(query);
      setProductSuggestions(results.slice(0, 10));
    } catch (error) {
      console.error('Product search error:', error);
    } finally {
      setSearchingProducts(false);
    }
  };

  // Add hashtag
  const handleAddHashtag = () => {
    const cleaned = currentHashtag.trim().replace(/^#/, '');
    if (cleaned && !hashtags.includes(cleaned)) {
      setHashtags([...hashtags, cleaned]);
      setCurrentHashtag('');
    }
  };

  // Remove hashtag
  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  // Handle upload
  const handleUpload = async () => {
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(uploadInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      // In a real app, this would upload to your backend/cloud storage
      // For now, we'll create a demo reel object
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(uploadInterval);
      setUploadProgress(100);

      const reelData = {
        id: Date.now().toString(),
        videoUrl: videoPreview, // In production, this would be the uploaded URL
        thumbnailUrl: videoPreview,
        title,
        description,
        hashtags,
        product: linkedProduct ? {
          id: linkedProduct.id,
          name: linkedProduct.name,
          price: linkedProduct.price,
          image: linkedProduct.image,
          brand: linkedProduct.brand
        } : undefined,
        creator: {
          id: user?.id || '',
          username: user?.username || '',
          displayName: user?.displayName || '',
          avatar: user?.avatar || '',
          isVerified: user?.isVerified || false,
          followers: user?.followerCount || 0
        },
        stats: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0
        },
        isLiked: false,
        duration: 0,
        createdAt: new Date()
      };

      if (onUpload) {
        onUpload(reelData);
      }

      // Reset form
      handleClose();
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload reel');
    } finally {
      setUploading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!uploading) {
      setVideoFile(null);
      setVideoPreview('');
      setTitle('');
      setDescription('');
      setHashtags([]);
      setLinkedProduct(null);
      setProductSearch('');
      setUploadProgress(0);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <VideoLibrary color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Upload Reel
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={uploading}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Video Upload Section */}
        <Card sx={{ mb: 3, p: 3, border: '2px dashed', borderColor: 'divider', borderRadius: 3 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {videoPreview ? (
            <Box>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <video
                  src={videoPreview}
                  controls
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    borderRadius: '12px',
                    backgroundColor: '#000'
                  }}
                />
                <IconButton
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview('');
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                  }}
                >
                  <Delete />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {videoFile?.name} ({(videoFile!.size / (1024 * 1024)).toFixed(2)} MB)
              </Typography>
            </Box>
          ) : (
            <Box 
              textAlign="center" 
              py={4}
              sx={{ cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Click to upload video
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MP4, MOV, AVI (max 100MB)
              </Typography>
            </Box>
          )}
        </Card>

        {/* Title and Description */}
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your reel a catchy title..."
          disabled={uploading}
          sx={{ mb: 2 }}
          required
        />

        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your reel..."
          multiline
          rows={3}
          disabled={uploading}
          sx={{ mb: 2 }}
        />

        {/* Hashtags */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Hashtags
          </Typography>
          <Box display="flex" gap={1} mb={1}>
            <TextField
              size="small"
              value={currentHashtag}
              onChange={(e) => setCurrentHashtag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddHashtag();
                }
              }}
              placeholder="Add hashtag (e.g., fashion, tech)"
              disabled={uploading}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddHashtag}
              disabled={uploading || !currentHashtag.trim()}
            >
              Add
            </Button>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {hashtags.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                onDelete={() => handleRemoveHashtag(tag)}
                disabled={uploading}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        {/* Product Linking */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            <LinkIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
            Link a Product (Optional)
          </Typography>
          
          {linkedProduct ? (
            <Card sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar
                src={linkedProduct.image}
                variant="rounded"
                sx={{ width: 60, height: 60 }}
              />
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {linkedProduct.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {linkedProduct.brand} • ${linkedProduct.price}
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setLinkedProduct(null)}
                disabled={uploading}
              >
                <Delete />
              </IconButton>
            </Card>
          ) : (
            <Autocomplete
              options={productSuggestions}
              getOptionLabel={(option) => option.name}
              loading={searchingProducts}
              onInputChange={(_, value) => {
                setProductSearch(value);
                handleProductSearch(value);
              }}
              onChange={(_, value) => {
                if (value) {
                  setLinkedProduct(value);
                }
              }}
              disabled={uploading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search for products to link..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchingProducts && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box display="flex" gap={2} alignItems="center" width="100%">
                    <Avatar
                      src={option.image}
                      variant="rounded"
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.brand} • ${option.price}
                      </Typography>
                    </Box>
                  </Box>
                </li>
              )}
            />
          )}
        </Box>

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mt: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Uploading...
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={handleClose} 
          disabled={uploading}
          sx={{ borderRadius: '12px' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={uploading || !videoFile || !title.trim()}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          sx={{
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
            px: 3
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Reel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReelUpload;
