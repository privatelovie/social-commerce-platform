import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Chip,
  Tab,
  Tabs,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Bookmark,
  BookmarkBorder,
  Favorite,
  Comment,
  Share,
  ShoppingCart,
  Delete
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatINR, convertToINR } from '../utils/currency';

interface SavedPost {
  id: string;
  type: 'post' | 'product' | 'reel';
  content: {
    id: string;
    title?: string;
    description?: string;
    image?: string;
    video?: string;
    price?: number;
    author?: {
      name: string;
      avatar: string;
      username: string;
    };
    stats?: {
      likes: number;
      comments: number;
      shares: number;
    };
  };
  savedAt: Date;
  category?: string;
}

const SavedPostsPage: React.FC = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [filter, setFilter] = useState<'all' | 'posts' | 'products' | 'reels'>('all');

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    setLoading(true);
    try {
      // Load from localStorage for now
      const saved = localStorage.getItem('savedPosts');
      if (saved) {
        setSavedPosts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const unsavePost = (postId: string) => {
    const updated = savedPosts.filter(p => p.id !== postId);
    setSavedPosts(updated);
    localStorage.setItem('savedPosts', JSON.stringify(updated));
  };

  const filteredPosts = filter === 'all' 
    ? savedPosts 
    : savedPosts.filter(p => p.type === filter.slice(0, -1));

  const handleTabChange = (_: any, newValue: number) => {
    setCurrentTab(newValue);
    const filters: ('all' | 'posts' | 'products' | 'reels')[] = ['all', 'posts', 'products', 'reels'];
    setFilter(filters[newValue]);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🔖 Saved Posts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your bookmarked content - {savedPosts.length} items saved
        </Typography>
      </Box>

      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={`All (${savedPosts.length})`} />
        <Tab label={`Posts (${savedPosts.filter(p => p.type === 'post').length})`} />
        <Tab label={`Products (${savedPosts.filter(p => p.type === 'product').length})`} />
        <Tab label={`Reels (${savedPosts.filter(p => p.type === 'reel').length})`} />
      </Tabs>

      {filteredPosts.length === 0 ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          No saved {filter === 'all' ? 'items' : filter} yet. Start bookmarking content you love!
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredPosts.map((item) => (
            <Grid key={item.id} xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{ height: '100%', position: 'relative' }}>
                  {item.content.image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.content.image}
                      alt={item.content.title}
                    />
                  )}
                  
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                    onClick={() => unsavePost(item.id)}
                  >
                    <Bookmark color="primary" />
                  </IconButton>

                  <CardContent>
                    {item.type === 'product' && item.content.price && (
                      <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                        {formatINR(convertToINR(item.content.price))}
                      </Typography>
                    )}
                    
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      {item.content.title || 'Untitled'}
                    </Typography>
                    
                    {item.content.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.content.description.substring(0, 100)}...
                      </Typography>
                    )}

                    {item.content.author && (
                      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                        <img 
                          src={item.content.author.avatar} 
                          alt={item.content.author.name}
                          style={{ width: 24, height: 24, borderRadius: '50%' }}
                        />
                        <Typography variant="caption">
                          {item.content.author.username}
                        </Typography>
                      </Box>
                    )}

                    {item.content.stats && (
                      <Box display="flex" gap={2} sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Favorite fontSize="small" color="error" />
                          <Typography variant="caption">{item.content.stats.likes}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Comment fontSize="small" />
                          <Typography variant="caption">{item.content.stats.comments}</Typography>
                        </Box>
                      </Box>
                    )}

                    <Chip 
                      label={item.type} 
                      size="small" 
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SavedPostsPage;
