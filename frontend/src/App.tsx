import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  CardMedia,
  Button,
  TextField,
  Box,
  Chip,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton
} from '@mui/material';
import { 
  Search as SearchIcon, 
  ShoppingCart, 
  Favorite, 
  Share, 
  AccountCircle 
} from '@mui/icons-material';
import './App.css';

// Mock data for the demo
const mockProducts = [
  {
    id: 1,
    name: "Smart Wireless Headphones",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
    rating: 4.5,
    likes: 124
  },
  {
    id: 2,
    name: "Eco-Friendly Water Bottle",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300",
    rating: 4.8,
    likes: 89
  },
  {
    id: 3,
    name: "Minimalist Desk Lamp",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    rating: 4.3,
    likes: 56
  },
  {
    id: 4,
    name: "Organic Cotton T-Shirt",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
    rating: 4.6,
    likes: 203
  }
];

const mockPosts = [
  {
    id: 1,
    user: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b25fc4e4?w=100",
    content: "Just got these amazing wireless headphones! The sound quality is incredible 🎧 #TechReview",
    product: mockProducts[0],
    likes: 45,
    time: "2 hours ago"
  },
  {
    id: 2,
    user: "Mike Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    content: "Loving this eco-friendly water bottle! Perfect for my daily workouts 💪 #SustainableLiving",
    product: mockProducts[1],
    likes: 23,
    time: "4 hours ago"
  }
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('feed');

  const ProductCard = ({ product }: { product: any }) => (
    <Card sx={{ maxWidth: 300, margin: 1 }}>
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={product.name}
      />
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {product.name}
        </Typography>
        <Typography variant="h5" color="primary" gutterBottom>
          ${product.price}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Chip label={`★ ${product.rating}`} size="small" />
          <Box>
            <IconButton size="small">
              <Favorite />
            </IconButton>
            <Typography variant="caption">{product.likes}</Typography>
          </Box>
        </Box>
        <Button variant="contained" fullWidth sx={{ mt: 1 }}>
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );

  const PostCard = ({ post }: { post: any }) => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <Avatar src={post.avatar} sx={{ mr: 2 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {post.user}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {post.time}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body1" mb={2}>
        {post.content}
      </Typography>
      {post.product && (
        <Box display="flex" p={1} border={1} borderColor="grey.300" borderRadius={1}>
          <img 
            src={post.product.image} 
            alt={post.product.name}
            style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 16 }}
          />
          <Box>
            <Typography variant="subtitle2">{post.product.name}</Typography>
            <Typography variant="h6" color="primary">${post.product.price}</Typography>
            <Button size="small" variant="outlined">View Product</Button>
          </Box>
        </Box>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Box>
          <IconButton size="small">
            <Favorite />
          </IconButton>
          <Typography variant="caption">{post.likes} likes</Typography>
        </Box>
        <IconButton size="small">
          <Share />
        </IconButton>
      </Box>
    </Paper>
  );

  return (
    <div className="App">
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Social Commerce Platform
          </Typography>
          <TextField
            placeholder="Search products..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              backgroundColor: 'white', 
              borderRadius: 1, 
              mr: 2,
              minWidth: 300
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
          <IconButton color="inherit">
            <ShoppingCart />
          </IconButton>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2 }}>
        {/* Navigation */}
        <Box mb={3}>
          <Button 
            variant={currentView === 'feed' ? 'contained' : 'text'}
            onClick={() => setCurrentView('feed')}
            sx={{ mr: 2 }}
          >
            Social Feed
          </Button>
          <Button 
            variant={currentView === 'products' ? 'contained' : 'text'}
            onClick={() => setCurrentView('products')}
          >
            Products
          </Button>
        </Box>

        {currentView === 'feed' && (
          <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
            <Box flex={2}>
              <Typography variant="h5" gutterBottom>
                Social Feed
              </Typography>
              {mockPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </Box>
            <Box flex={1}>
              <Typography variant="h6" gutterBottom>
                Trending Products
              </Typography>
              <List>
                {mockProducts.slice(0, 3).map(product => (
                  <ListItem key={product.id}>
                    <ListItemAvatar>
                      <Avatar src={product.image} variant="rounded" />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={product.name}
                      secondary={`$${product.price} • ★ ${product.rating}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        )}

        {currentView === 'products' && (
          <div>
            <Typography variant="h5" gutterBottom>
              Featured Products
            </Typography>
            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2}>
              {mockProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Box>
          </div>
        )}
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'grey.100', p: 3, mt: 5 }}>
        <Typography variant="body2" align="center" color="text.secondary">
          © 2024 Social Commerce Platform. Built with React & Material-UI.
        </Typography>
      </Box>
    </div>
  );
}

export default App;
