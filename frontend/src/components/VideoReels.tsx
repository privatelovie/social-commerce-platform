import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  Fab,
  Chip,
  Button,
  Card,
  CardMedia,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Favorite,
  FavoriteBorder,
  Share,
  ShoppingBag,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Comment,
  Send,
  Close,
  Verified,
  ShoppingCart,
  TrendingUp,
  FiberManualRecord
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useThemeMode } from '../context/ThemeContext';

interface VideoReelData {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified: boolean;
    followers: number;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
    originalPrice?: number;
  };
  hashtags: string[];
  isLiked: boolean;
  duration: number;
  createdAt: Date;
}

interface VideoReelsProps {
  videos: VideoReelData[];
  onLike?: (videoId: string) => void;
  onShare?: (video: VideoReelData) => void;
  onComment?: (videoId: string) => void;
  onAddToCart?: (product: any) => void;
  onProductClick?: (productId: string) => void;
  onFollow?: (userId: string) => void;
}

const VideoReels: React.FC<VideoReelsProps> = ({
  videos,
  onLike,
  onShare,
  onComment,
  onAddToCart,
  onProductClick,
  onFollow
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProduct, setShowProduct] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isScrolling, setIsScrolling] = useState(false);
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef<number>(0);
  const { mode } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentVideo = videos[currentVideoIndex];

  // Auto-play management
  useEffect(() => {
    const video = videoRefs.current[currentVideoIndex];
    if (video) {
      if (isPlaying) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    }
  }, [currentVideoIndex, isPlaying]);

  // Mute/unmute management
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        video.muted = index !== currentVideoIndex || isMuted;
      }
    });
  }, [currentVideoIndex, isMuted]);

  // Progress tracking
  useEffect(() => {
    const video = videoRefs.current[currentVideoIndex];
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleEnded = () => {
      // Auto-advance to next video
      if (currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else {
        setCurrentVideoIndex(0); // Loop back to first video
      }
      setProgress(0);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentVideoIndex, videos.length]);

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
        setProgress(0);
      }
    },
    onSwipedDown: () => {
      if (currentVideoIndex > 0) {
        setCurrentVideoIndex(currentVideoIndex - 1);
        setProgress(0);
      }
    },
    trackMouse: !isMobile
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          if (currentVideoIndex > 0) {
            setCurrentVideoIndex(currentVideoIndex - 1);
            setProgress(0);
          }
          break;
        case 'ArrowDown':
          if (currentVideoIndex < videos.length - 1) {
            setCurrentVideoIndex(currentVideoIndex + 1);
            setProgress(0);
          }
          break;
        case ' ':
          event.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'm':
          setIsMuted(!isMuted);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentVideoIndex, videos.length, isPlaying, isMuted]);

  // Trackpad/Mouse Wheel Navigation with smooth scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let accumulatedDelta = 0;
    const SCROLL_THRESHOLD = 50; // Sensitivity threshold
    const DEBOUNCE_TIME = 150; // ms between video changes

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;
      
      // Debounce rapid scrolls
      if (timeSinceLastScroll < DEBOUNCE_TIME && isScrolling) {
        return;
      }

      // Accumulate delta for smooth detection
      accumulatedDelta += event.deltaY;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Detect scroll direction and change video
      if (Math.abs(accumulatedDelta) > SCROLL_THRESHOLD) {
        setIsScrolling(true);
        lastScrollTime.current = now;

        if (accumulatedDelta > 0) {
          // Scrolling down - next video
          if (currentVideoIndex < videos.length - 1) {
            setCurrentVideoIndex(currentVideoIndex + 1);
            setProgress(0);
          }
        } else {
          // Scrolling up - previous video
          if (currentVideoIndex > 0) {
            setCurrentVideoIndex(currentVideoIndex - 1);
            setProgress(0);
          }
        }

        accumulatedDelta = 0;

        // Reset scrolling flag after debounce time
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, DEBOUNCE_TIME);
      }

      // Auto-reset accumulated delta
      scrollTimeoutRef.current = setTimeout(() => {
        accumulatedDelta = 0;
      }, 200);
    };

    // Use passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentVideoIndex, videos.length, isScrolling]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleLike = () => {
    if (onLike) {
      onLike(currentVideo.id);
    }
    setSnackbarMessage(currentVideo.isLiked ? 'Removed from likes' : 'Added to likes');
    setSnackbarOpen(true);
  };

  const handleShare = () => {
    if (onShare) {
      onShare(currentVideo);
    }
    setSnackbarMessage('Video shared!');
    setSnackbarOpen(true);
  };

  const handleAddToCart = () => {
    if (currentVideo.product && onAddToCart) {
      onAddToCart(currentVideo.product);
    }
    setSnackbarMessage('Added to cart!');
    setSnackbarOpen(true);
  };

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };

  if (!currentVideo) {
    return null;
  }

  return (
    <Box
      {...swipeHandlers}
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: 'black',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Video Player */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: '100%', md: '400px' },
          height: '100%',
          maxHeight: '100vh',
          cursor: 'pointer'
        }}
        onClick={handleVideoClick}
      >
        <AnimatePresence mode="wait">
          <motion.video
            key={currentVideo.id}
            ref={(el) => {
              if (el) {
                videoRefs.current[currentVideoIndex] = el;
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={currentVideo.videoUrl}
            poster={currentVideo.thumbnailUrl}
            loop={false}
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </AnimatePresence>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#fff'
            }
          }}
        />

        {/* Play/Pause Overlay */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              <Fab
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.8)'
                  }
                }}
              >
                <PlayArrow sx={{ fontSize: '2rem' }} />
              </Fab>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Side Action Panel */}
      <Box
        sx={{
          position: 'absolute',
          right: { xs: 10, md: 20 },
          bottom: { xs: 120, md: 100 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 20
        }}
      >
        {/* Creator Avatar */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Avatar
            src={currentVideo.creator.avatar}
            sx={{
              width: 50,
              height: 50,
              border: '3px solid white',
              cursor: 'pointer'
            }}
            onClick={() => onFollow && onFollow(currentVideo.creator.id)}
          />
          {currentVideo.creator.isVerified && (
            <Verified
              sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                fontSize: '20px',
                color: '#1da1f2'
              }}
            />
          )}
        </motion.div>

        {/* Like Button */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Box textAlign="center">
            <IconButton
              onClick={handleLike}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: currentVideo.isLiked ? '#ff3040' : 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              {currentVideo.isLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="caption" color="white" display="block">
              {formatNumber(currentVideo.stats?.likes || 0)}
            </Typography>
          </Box>
        </motion.div>

        {/* Comment Button */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Box textAlign="center">
            <IconButton
              onClick={() => onComment && onComment(currentVideo.id)}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <Comment />
            </IconButton>
            <Typography variant="caption" color="white" display="block">
              {formatNumber(currentVideo.stats?.comments || 0)}
            </Typography>
          </Box>
        </motion.div>

        {/* Share Button */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Box textAlign="center">
            <IconButton
              onClick={handleShare}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <Share />
            </IconButton>
            <Typography variant="caption" color="white" display="block">
              {formatNumber(currentVideo.stats?.shares || 0)}
            </Typography>
          </Box>
        </motion.div>

        {/* Product Button */}
        {currentVideo.product && (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Box textAlign="center">
              <IconButton
                onClick={() => setShowProduct(true)}
                sx={{
                  backgroundColor: 'rgba(255,193,7,0.9)',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: 'rgba(255,193,7,1)'
                  }
                }}
              >
                <ShoppingBag />
              </IconButton>
              <Typography variant="caption" color="white" display="block">
                Shop
              </Typography>
            </Box>
          </motion.div>
        )}
      </Box>

      {/* Bottom Content Panel */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: { xs: 80, md: 100 },
          p: { xs: 2, md: 3 },
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          color: 'white',
          zIndex: 15
        }}
      >
        {/* Creator Info */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h6" fontWeight="bold">
            @{currentVideo.creator?.username || 'Unknown'}
          </Typography>
          {currentVideo.creator.isVerified && (
            <Verified sx={{ fontSize: '18px', color: '#1da1f2' }} />
          )}
          <Button
            size="small"
            variant="contained"
            onClick={() => onFollow && onFollow(currentVideo.creator.id)}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#ff3040',
              '&:hover': {
                backgroundColor: '#e02030'
              }
            }}
          >
            Follow
          </Button>
        </Box>

        {/* Video Description */}
        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.4 }}>
          {currentVideo.description}
        </Typography>

        {/* Hashtags */}
        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          {(currentVideo.hashtags || []).map((hashtag, index) => (
            <Chip
              key={index}
              label={hashtag}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '12px'
              }}
            />
          ))}
        </Box>

        {/* Stats */}
        <Box display="flex" alignItems="center" gap={3}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <TrendingUp sx={{ fontSize: '16px' }} />
            <Typography variant="caption">
              {formatNumber(currentVideo.stats?.views || 0)} views
            </Typography>
          </Box>
          <Typography variant="caption" color="rgba(255,255,255,0.7)">
            {new Date(currentVideo.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {/* Navigation Controls */}
      <Box
        sx={{
          position: 'absolute',
          right: { xs: 10, md: 20 },
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 20
        }}
      >
        <IconButton
          onClick={() => {
            if (currentVideoIndex > 0) {
              setCurrentVideoIndex(currentVideoIndex - 1);
              setProgress(0);
            }
          }}
          disabled={currentVideoIndex === 0}
          sx={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            },
            '&:disabled': {
              color: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          <ArrowUpward />
        </IconButton>

        <IconButton
          onClick={() => {
            if (currentVideoIndex < videos.length - 1) {
              setCurrentVideoIndex(currentVideoIndex + 1);
              setProgress(0);
            }
          }}
          disabled={currentVideoIndex === videos.length - 1}
          sx={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            },
            '&:disabled': {
              color: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          <ArrowDownward />
        </IconButton>
      </Box>

      {/* Control Panel */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          gap: 1,
          zIndex: 20
        }}
      >
        <IconButton
          onClick={() => setIsMuted(!isMuted)}
          sx={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          {isMuted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
      </Box>

      {/* Video Counter */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 20
        }}
      >
        {videos.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 3,
              height: 20,
              backgroundColor: index === currentVideoIndex ? 'white' : 'rgba(255,255,255,0.3)',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
            onClick={() => {
              setCurrentVideoIndex(index);
              setProgress(0);
            }}
          />
        ))}
      </Box>

      {/* Product Dialog */}
      {currentVideo.product && (
        <Dialog
          open={showProduct}
          onClose={() => setShowProduct(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent sx={{ p: 0 }}>
            <Box position="relative">
              <IconButton
                onClick={() => setShowProduct(false)}
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 10,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white'
                }}
              >
                <Close />
              </IconButton>
              
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={currentVideo.product.image}
                  alt={currentVideo.product.name}
                />
                <Box p={3}>
                  <Typography variant="h6" gutterBottom>
                    {currentVideo.product.name}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {currentVideo.product.brand}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      ${currentVideo.product.price}
                    </Typography>
                    {currentVideo.product.originalPrice && (
                      <Typography
                        variant="body2"
                        sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                      >
                        ${currentVideo.product.originalPrice}
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      onClick={handleAddToCart}
                      fullWidth
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (onProductClick) {
                          onProductClick(currentVideo.product!.id);
                        }
                        setShowProduct(false);
                      }}
                      fullWidth
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VideoReels;