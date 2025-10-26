import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Avatar,
  Tab,
  Tabs,
  Badge,
  InputAdornment,
  Skeleton,
  Stack,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  LocalOffer as TagIcon,
  Favorite as LikeIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  TrendingUp,
  Category,
  Whatshot as WhatsHot
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import hashtagService, { Hashtag, HashtagPost } from '../services/hashtagService';

interface HashtagExplorerProps {
  onClose?: () => void;
  onHashtagClick?: (hashtag: string) => void;
}

const HashtagExplorer: React.FC<HashtagExplorerProps> = ({ onClose, onHashtagClick }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hashtag[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState<Hashtag | null>(null);
  const [hashtagPosts, setHashtagPosts] = useState<HashtagPost[]>([]);
  const [relatedHashtags, setRelatedHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadTrendingHashtags();
  }, []);

  // Search hashtags when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchHashtags();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadTrendingHashtags = async () => {
    setLoading(true);
    try {
      const trending = await hashtagService.getTrendingHashtags(20);
      setTrendingHashtags(trending);
    } catch (error) {
      console.error('Error loading trending hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchHashtags = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await hashtagService.searchHashtags(searchQuery, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching hashtags:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagSelect = async (hashtag: Hashtag) => {
    setSelectedHashtag(hashtag);
    setCurrentTab(2); // Switch to detail tab
    setPostsLoading(true);
    
    try {
      const [posts, related] = await Promise.all([
        hashtagService.getHashtagPosts(hashtag.name, 0, 10),
        hashtagService.getRelatedHashtags(hashtag.name, 5)
      ]);
      
      setHashtagPosts(posts);
      setRelatedHashtags(related);
    } catch (error) {
      console.error('Error loading hashtag details:', error);
      setHashtagPosts([]);
      setRelatedHashtags([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const renderHashtagCard = (hashtag: Hashtag) => (
    <motion.div
      key={hashtag.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        sx={{ 
          cursor: 'pointer',
          height: '100%',
          '&:hover': { boxShadow: 4 },
          transition: 'all 0.2s ease-in-out'
        }}
        onClick={() => handleHashtagSelect(hashtag)}
      >
        <CardContent>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Chip
              icon={<TagIcon />}
              label={hashtag.name}
              color="primary"
              variant="filled"
              sx={{ fontWeight: 'bold', fontSize: '14px' }}
            />
            {hashtag.trending && (
              <Chip
                icon={<TrendingIcon />}
                label="Trending"
                color="secondary"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
            {hashtag.description || 'No description available'}
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {formatCount(hashtag.count)} posts
            </Typography>
            {hashtag.category && (
              <Chip
                label={hashtag.category}
                size="small"
                variant="outlined"
                sx={{ fontSize: '10px' }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPostCard = (post: HashtagPost) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
            <Avatar src={post.author.avatar} alt={post.author.name} />
            <Box flex={1}>
              <Typography variant="h6" fontWeight="600">
                {post.author.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(post.createdAt)}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {post.content}
          </Typography>
          
          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
            {post.hashtags.map((hashtag, index) => (
              <Chip
                key={index}
                label={hashtag}
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  onHashtagClick?.(hashtag);
                }}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
          
          <Box display="flex" gap={3} alignItems="center">
            <Box display="flex" alignItems="center" gap={0.5}>
              <IconButton size="small" color="primary">
                <LikeIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2">{formatCount(post.engagement.likes)}</Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={0.5}>
              <IconButton size="small" color="primary">
                <CommentIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2">{formatCount(post.engagement.comments)}</Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={0.5}>
              <IconButton size="small" color="primary">
                <ShareIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2">{formatCount(post.engagement.shares)}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderTrendingTab = () => (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp color="primary" />
        Trending Hashtags
      </Typography>
      
      {loading ? (
        <Box display="flex" flexWrap="wrap" gap={3}>
          {[...Array(8)].map((_, index) => (
            <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1 1 22%' } }}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Box>
      ) : (
        <Box display="flex" flexWrap="wrap" gap={3}>
          {trendingHashtags.map((hashtag) => (
            <Box key={hashtag.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1 1 22%' } }}>
              {renderHashtagCard(hashtag)}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderSearchTab = () => (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SearchIcon color="primary" />
        Search Hashtags
      </Typography>
      
      <TextField
        fullWidth
        placeholder="Search hashtags..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          sx: { borderRadius: 3 }
        }}
      />
      
      {searchQuery && (
        <>
          {loading ? (
            <Box display="flex" flexWrap="wrap" gap={3}>
              {[...Array(6)].map((_, index) => (
                <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%' } }}>
                  <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Box>
          ) : searchResults.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={3}>
              {searchResults.map((hashtag) => (
                <Box key={hashtag.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%' } }}>
                  {renderHashtagCard(hashtag)}
                </Box>
              ))}
            </Box>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <SearchIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No hashtags found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try different keywords or browse trending hashtags
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );

  const renderDetailTab = () => (
    <Box>
      {selectedHashtag ? (
        <>
          {/* Hashtag Header */}
          <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h4" fontWeight={700}>
                {selectedHashtag.name}
              </Typography>
              <Button
                variant="contained"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                onClick={() => onHashtagClick?.(selectedHashtag.name)}
              >
                Follow Hashtag
              </Button>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
              {selectedHashtag.description}
            </Typography>
            
            <Box display="flex" gap={4} alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {formatCount(selectedHashtag.count)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Posts
                </Typography>
              </Box>
              
              {selectedHashtag.category && (
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedHashtag.category}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Category
                  </Typography>
                </Box>
              )}
              
              {selectedHashtag.trending && (
                <Chip
                  icon={<WhatsHot />}
                  label="Trending Now"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              )}
            </Box>
          </Paper>
          
          <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={3}>
            {/* Posts */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 65%' } }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Recent Posts
              </Typography>
              
              {postsLoading ? (
                <Stack spacing={2}>
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                  ))}
                </Stack>
              ) : hashtagPosts.length > 0 ? (
                <Box>
                  {hashtagPosts.map((post) => renderPostCard(post))}
                </Box>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <CommentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No posts yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Be the first to post with this hashtag!
                  </Typography>
                </Paper>
              )}
            </Box>
            
            {/* Related Hashtags */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 35%' } }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Related Hashtags
              </Typography>
              
              {relatedHashtags.length > 0 ? (
                <Stack spacing={1}>
                  {relatedHashtags.map((hashtag) => (
                    <Card key={hashtag.id} sx={{ cursor: 'pointer' }} onClick={() => handleHashtagSelect(hashtag)}>
                      <CardContent sx={{ py: 2 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {hashtag.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatCount(hashtag.count)} posts
                            </Typography>
                          </Box>
                          {hashtag.trending && (
                            <TrendingIcon color="secondary" fontSize="small" />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <TagIcon sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No related hashtags found
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <TagIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Select a hashtag to view details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Browse trending hashtags or search for specific topics
          </Typography>
        </Paper>
      )}
    </Box>
  );

  const tabs = [
    { label: 'Trending', content: renderTrendingTab() },
    { label: 'Search', content: renderSearchTab() },
    { label: 'Details', content: renderDetailTab() }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TagIcon color="primary" />
          Hashtag Explorer
        </Typography>
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none'
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {tabs[currentTab].content}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
};

export default HashtagExplorer;