import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Close,
  CloudUpload,
  Add,
  Delete,
  Image as ImageIcon
} from '@mui/icons-material';
import { convertToINR, formatINR } from '../utils/currency';

interface ProductUploadProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: any) => void;
}

const ProductUpload: React.FC<ProductUploadProps> = ({ open, onClose, onSubmit }) => {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    condition: 'new',
    stock: '1',
    images: [] as string[],
    tags: [] as string[]
  });
  const [currentTag, setCurrentTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [error, setError] = useState('');

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Living',
    'Beauty',
    'Sports',
    'Books',
    'Toys',
    'Food',
    'Other'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setImagePreview([...imagePreview, ...newImages]);
            setProductData({
              ...productData,
              images: [...productData.images, ...newImages]
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = imagePreview.filter((_, i) => i !== index);
    setImagePreview(newImages);
    setProductData({
      ...productData,
      images: newImages
    });
  };

  const addTag = () => {
    if (currentTag && !productData.tags.includes(currentTag)) {
      setProductData({
        ...productData,
        tags: [...productData.tags, currentTag]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setProductData({
      ...productData,
      tags: productData.tags.filter(t => t !== tag)
    });
  };

  const handleSubmit = () => {
    // Validation
    if (!productData.name || !productData.price || !productData.category) {
      setError('Please fill in all required fields');
      return;
    }

    if (imagePreview.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    const product = {
      ...productData,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      createdAt: new Date().toISOString(),
      id: Date.now().toString()
    };

    onSubmit(product);
    handleClose();
  };

  const handleClose = () => {
    setProductData({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      condition: 'new',
      stock: '1',
      images: [],
      tags: []
    });
    setImagePreview([]);
    setError('');
    setCurrentTag('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Upload Product</Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Image Upload */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Product Images *
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            fullWidth
            sx={{ mb: 2 }}
          >
            Upload Images
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Button>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            {imagePreview.map((img, index) => (
              <Box key={index} sx={{ position: 'relative', width: 100, height: 100 }}>
                <img
                  src={img}
                  alt={`Preview ${index}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'error.dark' }
                  }}
                  onClick={() => removeImage(index)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Product Name */}
        <TextField
          fullWidth
          label="Product Name *"
          value={productData.name}
          onChange={(e) => setProductData({ ...productData, name: e.target.value })}
          sx={{ mb: 2 }}
        />

        {/* Description */}
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          value={productData.description}
          onChange={(e) => setProductData({ ...productData, description: e.target.value })}
          sx={{ mb: 2 }}
        />

        {/* Price and Category */}
        <Box display="flex" gap={2} sx={{ mb: 2 }}>
          <TextField
            label="Price (INR) *"
            type="number"
            value={productData.price}
            onChange={(e) => setProductData({ ...productData, price: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Category *</InputLabel>
            <Select
              value={productData.category}
              label="Category *"
              onChange={(e) => setProductData({ ...productData, category: e.target.value })}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Brand and Condition */}
        <Box display="flex" gap={2} sx={{ mb: 2 }}>
          <TextField
            label="Brand"
            value={productData.brand}
            onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Condition</InputLabel>
            <Select
              value={productData.condition}
              label="Condition"
              onChange={(e) => setProductData({ ...productData, condition: e.target.value })}
            >
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="like-new">Like New</MenuItem>
              <MenuItem value="used">Used</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Stock */}
        <TextField
          fullWidth
          label="Stock Quantity"
          type="number"
          value={productData.stock}
          onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
          sx={{ mb: 2 }}
        />

        {/* Tags */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Tags (for search)
          </Typography>
          <Box display="flex" gap={1} sx={{ mb: 1 }}>
            <TextField
              size="small"
              placeholder="Add tag..."
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              fullWidth
            />
            <Button onClick={addTag} startIcon={<Add />}>
              Add
            </Button>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {productData.tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => removeTag(tag)}
                size="small"
              />
            ))}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Upload Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductUpload;
