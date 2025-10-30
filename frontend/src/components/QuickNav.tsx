import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton,
  Grid2,
  Chip,
  Avatar
} from '@mui/material';
import {
  Home,
  Explore,
  VideoLibrary,
  Message,
  TrendingUp,
  Person,
  ShoppingCart,
  Favorite
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface QuickNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentUser: any;
  cartItemsCount: number;
  wishlistCount: number;
}

const QuickNav: React.FC<QuickNavProps> = ({
  currentView,
  onViewChange,
  currentUser,
  cartItemsCount,
  wishlistCount
}) => {
  const navItems = [
    { key: 'feed', label: 'Feed', icon: Home, color: '#667eea', description: 'Latest social posts and updates' },
    { key: 'explore', label: 'Explore', icon: Explore, color: '#f093fb', description: 'Discover new products and creators' },
    { key: 'videos', label: 'Reels', icon: VideoLibrary, color: '#ff6b6b', description: 'Short video content like Instagram Reels' },
    { key: 'messages', label: 'Messages', icon: Message, color: '#4ecdc4', description: 'Chat with friends and share products' },
    { key: 'trending', label: 'Trending', icon: TrendingUp, color: '#45b7d1', description: 'What\'s hot right now' },
    { key: 'profile', label: 'Profile', icon: Person, color: '#96ceb4', description: 'Your personal profile and posts' },
  ];

  const handleNavClick = (key: string) => {
    onViewChange(key);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          sx={{ 
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          🎉 Welcome to SocialCommerce
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Your all-in-one social shopping platform with Instagram Reels-style videos!
        </Typography>
        
        {/* Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Chip
            icon={<ShoppingCart />}
            label={`${cartItemsCount} items in cart`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<Favorite />}
            label={`${wishlistCount} favorites`}
            color="error"
            variant="outlined"
          />
          <Chip
            avatar={<Avatar src={currentUser?.avatar} sx={{ width: 24, height: 24 }} />}
            label={currentUser?.displayName || currentUser?.username || 'User'}
            color="default"
            variant="outlined"
          />
        </Box>

        <Typography variant="body1" sx={{ mb: 4, fontWeight: 500 }}>
          Click on any feature below to explore:
        </Typography>
      </Box>

      <Grid2 container spacing={3}>
        {navItems.map((item, index) => (
          <Grid2 key={item.key} size={{ xs: 12, sm: 6, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  height: '100%',
                  borderRadius: 3,
                  border: currentView === item.key ? `2px solid ${item.color}` : '2px solid transparent',
                  background: currentView === item.key ? `${item.color}10` : 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${item.color}30`,
                    border: `2px solid ${item.color}`
                  }
                }}
                onClick={() => handleNavClick(item.key)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <item.icon sx={{ fontSize: 40, color: item.color }} />
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 1,
                      color: currentView === item.key ? item.color : 'text.primary'
                    }}
                  >
                    {item.label}
                    {item.key === 'videos' && (
                      <Chip 
                        size="small" 
                        label="NEW" 
                        color="error" 
                        sx={{ ml: 1, fontSize: '10px' }}
                      />
                    )}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid2>
        ))}
      </Grid2>

      {/* Current View Indicator */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Currently viewing: <strong>{navItems.find(item => item.key === currentView)?.label || 'Unknown'}</strong>
        </Typography>
        {currentView === 'videos' && (
          <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 500 }}>
            🎬 Enjoy the new Instagram Reels-style video experience!
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default QuickNav;