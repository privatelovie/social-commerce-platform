import React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack
} from '@mui/material';
import {
  VideoLibrary,
  PlayArrow,
  TrendingUp,
  ShoppingBag,
  Favorite,
  Share,
  Comment,
  Message as MessageIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  Group as GroupIcon,
  Phone as PhoneIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface DemoLauncherProps {
  onLaunchReels: () => void;
  onLaunchApp: () => void;
  onLaunchMessaging?: () => void;
  onLaunchExplore?: () => void;
}

const DemoLauncher: React.FC<DemoLauncherProps> = ({ onLaunchReels, onLaunchApp, onLaunchMessaging, onLaunchExplore }) => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              fontWeight="bold" 
              sx={{ 
                color: 'white', 
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              🚀 SocialCommerce Platform
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                mb: 4,
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              The complete social shopping experience with Video Reels, Real-time Messaging & AI-powered Commerce
            </Typography>
            
            {/* Features Highlight */}
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={2} 
              sx={{ justifyContent: 'center', mb: 4 }}
            >
              <Chip 
                icon={<VideoLibrary />}
                label="Video Reels"
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
              />
              <Chip 
                icon={<MessageIcon />}
                label="Real-time Messaging"
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
              />
              <Chip 
                icon={<ShoppingBag />}
                label="Smart Commerce"
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
              />
              <Chip 
                icon={<NotificationsIcon />}
                label="Live Notifications"
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
              />
            </Stack>
          </Box>

          {/* Demo Cards */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {/* Reels Demo Card */}
        <Grid item xs={12} sm={6} md={4} component="div">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={onLaunchReels}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: '#ff6b6b', 
                        width: 60, 
                        height: 60,
                        mr: 2
                      }}>
                        <VideoLibrary sx={{ fontSize: 30 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          Video Reels Experience
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Just like Instagram & TikTok
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      Discover short-form videos with integrated shopping features. Swipe up/down to navigate, 
                      double-tap to like, and shop directly from videos!
                    </Typography>
                    
                    {/* Features List */}
                    <Stack spacing={1} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PlayArrow sx={{ color: '#4caf50', fontSize: 20 }} />
                        <Typography variant="body2">Vertical video playback with auto-advance</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingBag sx={{ color: '#2196f3', fontSize: 20 }} />
                        <Typography variant="body2">Product integration with one-click shopping</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Favorite sx={{ color: '#f44336', fontSize: 20 }} />
                        <Typography variant="body2">Like, share, and comment on videos</Typography>
                      </Box>
                    </Stack>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #ff5252 0%, #ff9800 100%)',
                        }
                      }}
                    >
                      🎬 Try Reels Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Messaging Demo Card */}
        <Grid item xs={12} sm={6} md={4} component="div">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={onLaunchMessaging}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: '#00bcd4', 
                        width: 60, 
                        height: 60,
                        mr: 2
                      }}>
                        <ChatIcon sx={{ fontSize: 30 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          Live Messaging
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Real-time conversations
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      Experience real-time messaging with product sharing, group chats, typing indicators, 
                      and seamless cart integration!
                    </Typography>
                    
                    {/* Features List */}
                    <Stack spacing={1} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MessageIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                        <Typography variant="body2">Real-time messaging with Socket.IO</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingBag sx={{ color: '#2196f3', fontSize: 20 }} />
                        <Typography variant="body2">Product sharing and cart integration</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                        <Typography variant="body2">Group chats and user search</Typography>
                      </Box>
                    </Stack>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={!onLaunchMessaging}
                      sx={{
                        background: onLaunchMessaging ? 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)' : 'grey.400',
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        '&:hover': onLaunchMessaging ? {
                          background: 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)',
                        } : {}
                      }}
                    >
                      💬 Try Messaging
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Explore Demo Card */}
        <Grid item xs={12} sm={6} md={4} component="div">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={onLaunchExplore}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: '#9c27b0', 
                        width: 60, 
                        height: 60,
                        mr: 2
                      }}>
                        <TrendingUp sx={{ fontSize: 30 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          Smart Explore
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          AI-powered discovery
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      Discover products through AI-powered recommendations, trending items, 
                      personalized feeds, and smart search capabilities.
                    </Typography>
                    
                    {/* Features List */}
                    <Stack spacing={1} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp sx={{ color: '#4caf50', fontSize: 20 }} />
                        <Typography variant="body2">Trending and personalized recommendations</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Favorite sx={{ color: '#f44336', fontSize: 20 }} />
                        <Typography variant="body2">Wishlist and comparison tools</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Share sx={{ color: '#ff9800', fontSize: 20 }} />
                        <Typography variant="body2">Advanced filtering and categories</Typography>
                      </Box>
                    </Stack>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={!onLaunchExplore}
                      sx={{
                        background: onLaunchExplore ? 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)' : 'grey.400',
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        '&:hover': onLaunchExplore ? {
                          background: 'linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%)',
                        } : {}
                      }}
                    >
                      🔍 Explore Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Full App Demo Card */}
        <Grid item xs={12} sm={6} md={4} component="div">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={onLaunchApp}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: '#667eea', 
                        width: 60, 
                        height: 60,
                        mr: 2
                      }}>
                        <TrendingUp sx={{ fontSize: 30 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          Full App Experience
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Complete social commerce platform
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      Experience the complete platform with social feeds, video reels, real-time messaging, 
                      smart commerce, and comprehensive user profiles!
                    </Typography>
                    
                    {/* Features List */}
                    <Stack spacing={1} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideoLibrary sx={{ color: '#4caf50', fontSize: 20 }} />
                        <Typography variant="body2">Video Reels with shopping integration</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MessageIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                        <Typography variant="body2">Real-time messaging and notifications</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingBag sx={{ color: '#ff9800', fontSize: 20 }} />
                        <Typography variant="body2">Complete commerce with cart and checkout</Typography>
                      </Box>
                    </Stack>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                      sx={{
                        borderColor: '#667eea',
                        color: '#667eea',
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        '&:hover': {
                          borderColor: '#5a67d8',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        }
                      }}
                    >
                      🚀 Launch Full App
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Quick Stats */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
              ✨ Platform Highlights
            </Typography>
            <Grid container spacing={4} sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Grid item xs={12} md={6} component="div">
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>📱</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Video Reels</Typography>
              </Grid>
          <Grid item xs={12} md={3} component="div">
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>💬</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Live Messaging</Typography>
              </Grid>
          <Grid item xs={12} md={3} component="div">
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>🛒</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Smart Commerce</Typography>
              </Grid>
          <Grid item xs={6} md={3} component="div">
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>🔔</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Real-time Alerts</Typography>
              </Grid>
          <Grid item xs={6} md={3} component="div">
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>🤖</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>AI Powered</Typography>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default DemoLauncher;