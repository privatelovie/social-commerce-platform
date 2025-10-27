import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  Stack,
  Fade
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Send,
  MoreVert,
  VolumeUp,
  VolumeOff,
  ShoppingBag,
  Verified
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatINR, convertToINR } from '../utils/currency';

interface ReelData {
  id: string;
  videoUrl: string;
  creator: {
    id: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  music?: {
    title: string;
    artist: string;
  };
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface EnhancedReelsProps {
  reels: ReelData[];
  onLike?: (reelId: string) => void;
  onComment?: (reelId: string) => void;
  onShare?: (reelId: string) => void;
  onProductClick?: (productId: string) => void;
  onFollow?: (userId: string) => void;
}

const EnhancedReels: React.FC<EnhancedReelsProps> = ({
  reels,
  onLike,
  onComment,
  onShare,
  onProductClick,
  onFollow
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCaption, setShowCaption] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const currentReel = reels[currentIndex];

  // Handle scroll-based navigation
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (e.deltaY > 0 && currentIndex < reels.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleScroll);
      return () => container.removeEventListener('wheel', handleScroll);
    }
  }, [currentIndex, reels.length]);

  // Handle touch swipe
  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < reels.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  // Auto-play management
  useEffect(() => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      video.currentTime = 0;
      if (isPlaying) {
        video.play().catch(console.error);
      }
    }
  }, [currentIndex, isPlaying]);

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleVideoClick = () => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        video.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <Box
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'black',
        overflow: 'hidden',
        zIndex: 1300
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentReel.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        >
          {/* Video */}
          <video
            ref={(el) => {
              if (el) videoRefs.current[currentIndex] = el;
            }}
            src={currentReel.videoUrl}
            loop
            muted={isMuted}
            playsInline
            onClick={handleVideoClick}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer'
            }}
          />

          {/* Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '45%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
              pointerEvents: 'none'
            }}
          />

          {/* Top Bar - Close/Menu */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 16, md: 24 },
              left: 0,
              right: 0,
              px: 2,
              display: 'flex',
              justifyContent: 'space-between',
              zIndex: 10
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Reels
            </Typography>
            <IconButton sx={{ color: 'white' }}>
              <MoreVert />
            </IconButton>
          </Box>

          {/* Right Side Actions */}
          <Stack
            spacing={3}
            sx={{
              position: 'absolute',
              right: 12,
              bottom: { xs: 120, md: 140 },
              alignItems: 'center',
              zIndex: 10
            }}
          >
            {/* Creator Avatar with Follow */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={currentReel.creator.avatar}
                sx={{
                  width: 48,
                  height: 48,
                  border: '2px solid white',
                  cursor: 'pointer'
                }}
                onClick={() => onFollow && onFollow(currentReel.creator.id)}
              />
              {currentReel.creator.isVerified && (
                <Verified
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    fontSize: 18,
                    color: '#1da1f2',
                    bgcolor: 'white',
                    borderRadius: '50%'
                  }}
                />
              )}
            </Box>

            {/* Like */}
            <Box sx={{ textAlign: 'center' }}>
              <IconButton
                onClick={() => onLike && onLike(currentReel.id)}
                sx={{
                  color: currentReel.isLiked ? '#ff3040' : 'white',
                  transition: 'transform 0.2s',
                  '&:active': { transform: 'scale(1.3)' }
                }}
              >
                {currentReel.isLiked ? <Favorite fontSize="large" /> : <FavoriteBorder fontSize="large" />}
              </IconButton>
              <Typography variant="caption" sx={{ color: 'white', display: 'block', mt: -0.5 }}>
                {formatCount(currentReel.likes)}
              </Typography>
            </Box>

            {/* Comments */}
            <Box sx={{ textAlign: 'center' }}>
              <IconButton
                onClick={() => onComment && onComment(currentReel.id)}
                sx={{ color: 'white' }}
              >
                <ChatBubbleOutline fontSize="large" />
              </IconButton>
              <Typography variant="caption" sx={{ color: 'white', display: 'block', mt: -0.5 }}>
                {formatCount(currentReel.comments)}
              </Typography>
            </Box>

            {/* Share */}
            <Box sx={{ textAlign: 'center' }}>
              <IconButton
                onClick={() => onShare && onShare(currentReel.id)}
                sx={{ color: 'white' }}
              >
                <Send fontSize="large" />
              </IconButton>
              <Typography variant="caption" sx={{ color: 'white', display: 'block', mt: -0.5 }}>
                {formatCount(currentReel.shares)}
              </Typography>
            </Box>

            {/* Mute/Unmute */}
            <IconButton
              onClick={() => setIsMuted(!isMuted)}
              sx={{ color: 'white' }}
            >
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
          </Stack>

          {/* Bottom Info */}
          <Fade in={showCaption}>
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 20, md: 40 },
                left: 16,
                right: 80,
                zIndex: 10
              }}
            >
              {/* Username */}
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                  @{currentReel.creator.username}
                </Typography>
              </Box>

              {/* Caption */}
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {currentReel.caption}
              </Typography>

              {/* Music Info */}
              {currentReel.music && (
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Typography variant="caption" sx={{ color: 'white', opacity: 0.9 }}>
                    🎵 {currentReel.music.title} · {currentReel.music.artist}
                  </Typography>
                </Box>
              )}

              {/* Product Tag */}
              {currentReel.product && (
                <Box
                  onClick={() => onProductClick && onProductClick(currentReel.product!.id)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    borderRadius: 20,
                    px: 2,
                    py: 1,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  <img
                    src={currentReel.product.image}
                    alt={currentReel.product.name}
                    style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }}
                  />
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                      {currentReel.product.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      {formatINR(convertToINR(currentReel.product.price))}
                    </Typography>
                  </Box>
                  <ShoppingBag fontSize="small" />
                </Box>
              )}
            </Box>
          </Fade>

          {/* Progress Indicators */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 60, md: 72 },
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 0.5,
              zIndex: 10
            }}
          >
            {reels.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 40,
                  height: 2,
                  bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
                  borderRadius: 1,
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </Box>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default EnhancedReels;
