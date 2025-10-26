import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Button,
  Chip,
  Divider,
  Tab,
  Tabs,
  Card,
  CardContent,
  IconButton,
  Badge,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Search,
  PersonAdd,
  PersonRemove,
  Message,
  Block,
  Report,
  Verified,
  Close,
  TrendingUp,
  LocationOn,
  Business,
  Star,
  People,
  PersonSearch,
  Explore,
  LocalOffer
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';

interface UserSearchProps {
  onClose?: () => void;
  onUserSelect?: (user: SearchUser) => void;
}

interface SearchUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  location?: string;
  website?: string;
  isFollowing?: boolean;
  isFollower?: boolean;
  mutualFollowers?: number;
  tags: string[];
  lastActive: string;
  isCreator: boolean;
  creatorLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const UserSearch: React.FC<UserSearchProps> = ({ onClose, onUserSelect }) => {
  const { user: currentUser } = useAuth();
  const { followUser, unfollowUser, followers, following, loading } = useSocial();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Mock users database
  const mockUsers: SearchUser[] = [
    {
      id: '2',
      username: 'sarah_style',
      displayName: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      bio: 'Fashion influencer | Sustainable lifestyle advocate | NYC 🌱✨',
      isVerified: true,
      followerCount: 25600,
      followingCount: 890,
      postCount: 1240,
      location: 'New York, USA',
      website: 'https://sarahjohnson.com',
      mutualFollowers: 12,
      tags: ['fashion', 'lifestyle', 'sustainability'],
      lastActive: '2 hours ago',
      isCreator: true,
      creatorLevel: 'gold'
    },
    {
      id: '3',
      username: 'tech_mike',
      displayName: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      bio: 'Tech reviewer | Gadget enthusiast | Building the future 🚀',
      isVerified: false,
      followerCount: 8900,
      followingCount: 450,
      postCount: 890,
      location: 'San Francisco, USA',
      mutualFollowers: 8,
      tags: ['technology', 'reviews', 'gadgets'],
      lastActive: '1 day ago',
      isCreator: true,
      creatorLevel: 'silver'
    },
    {
      id: '4',
      username: 'creative_anna',
      displayName: 'Anna Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1534008757030-27299c4371b6?w=100&h=100&fit=crop&crop=face',
      bio: 'Digital artist | UI/UX Designer | Coffee addict ☕🎨',
      isVerified: true,
      followerCount: 15300,
      followingCount: 670,
      postCount: 2100,
      location: 'Barcelona, Spain',
      website: 'https://annarodriguez.design',
      mutualFollowers: 23,
      tags: ['design', 'art', 'creativity'],
      lastActive: '30 minutes ago',
      isCreator: true,
      creatorLevel: 'platinum'
    },
    {
      id: '5',
      username: 'fitness_alex',
      displayName: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop&crop=face',
      bio: 'Fitness coach | Nutrition expert | Helping you reach your goals 💪',
      isVerified: false,
      followerCount: 12800,
      followingCount: 320,
      postCount: 756,
      location: 'Los Angeles, USA',
      mutualFollowers: 5,
      tags: ['fitness', 'health', 'motivation'],
      lastActive: '4 hours ago',
      isCreator: true,
      creatorLevel: 'silver'
    },
    {
      id: '6',
      username: 'foodie_emma',
      displayName: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      bio: 'Food blogger | Recipe creator | Exploring flavors worldwide 🍕🌍',
      isVerified: true,
      followerCount: 34200,
      followingCount: 1200,
      postCount: 1890,
      location: 'London, UK',
      website: 'https://emmaeats.com',
      mutualFollowers: 18,
      tags: ['food', 'recipes', 'travel'],
      lastActive: '1 hour ago',
      isCreator: true,
      creatorLevel: 'gold'
    }
  ];

  useEffect(() => {
    loadSuggestedUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadSuggestedUsers = () => {
    // Filter out current user and add follow status
    const suggested = mockUsers
      .filter(user => user.id !== currentUser?.id)
      .map(user => ({
        ...user,
        isFollowing: following.some(f => f.id === user.id),
        isFollower: followers.some(f => f.id === user.id)
      }))
      .sort(() => Math.random() - 0.5) // Random shuffle
      .slice(0, 10);
    
    setSuggestedUsers(suggested);
  };

  const performSearch = async () => {
    setSearchLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const query = searchQuery.toLowerCase();
    const results = mockUsers.filter(user => 
      user.id !== currentUser?.id &&
      (user.username.toLowerCase().includes(query) ||
       user.displayName.toLowerCase().includes(query) ||
       user.bio.toLowerCase().includes(query) ||
       user.tags.some(tag => tag.toLowerCase().includes(query)))
    ).map(user => ({
      ...user,
      isFollowing: following.some(f => f.id === user.id),
      isFollower: followers.some(f => f.id === user.id)
    }));
    
    setSearchResults(results);
    setSearchLoading(false);
  };

  const handleFollowToggle = async (targetUser: SearchUser) => {
    try {
      if (targetUser.isFollowing) {
        await unfollowUser(targetUser.id);
        // Update local state
        setSearchResults(prev => prev.map(user => 
          user.id === targetUser.id 
            ? { ...user, isFollowing: false, followerCount: user.followerCount - 1 }
            : user
        ));
        setSuggestedUsers(prev => prev.map(user => 
          user.id === targetUser.id 
            ? { ...user, isFollowing: false, followerCount: user.followerCount - 1 }
            : user
        ));
      } else {
        await followUser(targetUser.id);
        // Update local state
        setSearchResults(prev => prev.map(user => 
          user.id === targetUser.id 
            ? { ...user, isFollowing: true, followerCount: user.followerCount + 1 }
            : user
        ));
        setSuggestedUsers(prev => prev.map(user => 
          user.id === targetUser.id 
            ? { ...user, isFollowing: true, followerCount: user.followerCount + 1 }
            : user
        ));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleUserClick = (user: SearchUser) => {
    setSelectedUser(user);
    setProfileDialogOpen(true);
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getCreatorLevelColor = (level?: string) => {
    switch (level) {
      case 'platinum': return '#E5E4E2';
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return '#9E9E9E';
    }
  };

  const renderUserCard = (user: SearchUser, showMutualFollowers = true) => (
    <Card
      key={user.id}
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }}
      onClick={() => handleUserClick(user)}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box position="relative">
            <Avatar src={user.avatar} sx={{ width: 56, height: 56 }} />
            {user.isCreator && (
              <Chip
                size="small"
                label={user.creatorLevel}
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  left: -4,
                  height: 16,
                  fontSize: '9px',
                  fontWeight: 'bold',
                  backgroundColor: getCreatorLevelColor(user.creatorLevel),
                  color: user.creatorLevel === 'platinum' ? 'black' : 'white'
                }}
              />
            )}
          </Box>
          
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '16px' }}>
                {user.displayName}
              </Typography>
              {user.isVerified && (
                <Verified sx={{ fontSize: '16px', color: 'primary.main' }} />
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              @{user.username}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1, fontSize: '14px' }}>
              {user.bio}
            </Typography>
            
            {user.location && (
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <LocationOn sx={{ fontSize: '14px', color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {user.location}
                </Typography>
              </Box>
            )}
            
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography variant="caption" color="text.secondary">
                <strong>{formatNumber(user.followerCount)}</strong> followers
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>{formatNumber(user.postCount)}</strong> posts
              </Typography>
            </Box>
            
            {showMutualFollowers && user.mutualFollowers && user.mutualFollowers > 0 && (
              <Typography variant="caption" color="primary.main">
                {user.mutualFollowers} mutual followers
              </Typography>
            )}
            
            <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
              {user.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '10px', height: '20px' }}
                />
              ))}
            </Stack>
          </Box>
          
          <Stack spacing={1}>
            <Button
              variant={user.isFollowing ? "outlined" : "contained"}
              size="small"
              startIcon={user.isFollowing ? <PersonRemove /> : <PersonAdd />}
              onClick={(e) => {
                e.stopPropagation();
                handleFollowToggle(user);
              }}
              disabled={loading.followers}
              sx={{
                borderRadius: '20px',
                px: 2,
                textTransform: 'none',
                fontWeight: 600,
                minWidth: user.isFollowing ? '100px' : '80px'
              }}
            >
              {user.isFollowing ? 'Following' : 'Follow'}
            </Button>
            
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // Handle message
              }}
              sx={{ border: '1px solid rgba(0,0,0,0.1)' }}
            >
              <Message fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  const tabs = [
    { label: 'Search', icon: <PersonSearch /> },
    { label: 'Suggested', icon: <TrendingUp /> },
    { label: 'Following', icon: <People /> },
    { label: 'Followers', icon: <Star /> }
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 0: // Search
        return (
          <Box>
            {searchLoading && <LinearProgress sx={{ mb: 2 }} />}
            {searchQuery && searchResults.length === 0 && !searchLoading && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No users found for "{searchQuery}". Try searching with different keywords.
              </Alert>
            )}
            {searchResults.map(user => renderUserCard(user))}
            {!searchQuery && (
              <Box textAlign="center" py={4}>
                <PersonSearch sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Search for Users
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Find friends by username, name, or interests
                </Typography>
              </Box>
            )}
          </Box>
        );
        
      case 1: // Suggested
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Suggested for You
            </Typography>
            {suggestedUsers.map(user => renderUserCard(user))}
          </Box>
        );
        
      case 2: // Following
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Following ({following.length})
            </Typography>
            {following.map(user => renderUserCard(user as SearchUser, false))}
          </Box>
        );
        
      case 3: // Followers
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Followers ({followers.length})
            </Typography>
            {followers.map(user => renderUserCard(user as SearchUser, false))}
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box>
      <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <PersonSearch />
            <Typography variant="h5" fontWeight={600}>
              Discover People
            </Typography>
          </Box>
          {onClose && (
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          )}
        </Box>

        {/* Search Bar */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Search users by name, username, or interests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              sx: { borderRadius: '25px' }
            }}
          />
        </Box>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {/* Content */}
        <Box sx={{ p: 2, minHeight: 400, maxHeight: 600, overflow: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Paper>

      {/* User Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={selectedUser.avatar} sx={{ width: 48, height: 48 }} />
                <Box>
                  <Typography variant="h6">{selectedUser.displayName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{selectedUser.username}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedUser.bio}
              </Typography>
              
              <Box display="flex" gap={4} mb={2}>
                <Box textAlign="center">
                  <Typography variant="h6">{formatNumber(selectedUser.followerCount)}</Typography>
                  <Typography variant="caption" color="text.secondary">Followers</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6">{formatNumber(selectedUser.followingCount)}</Typography>
                  <Typography variant="caption" color="text.secondary">Following</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6">{formatNumber(selectedUser.postCount)}</Typography>
                  <Typography variant="caption" color="text.secondary">Posts</Typography>
                </Box>
              </Box>
              
              {selectedUser.location && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LocationOn fontSize="small" />
                  <Typography variant="body2">{selectedUser.location}</Typography>
                </Box>
              )}
              
              {selectedUser.website && (
                <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                  {selectedUser.website}
                </Typography>
              )}
              
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {selectedUser.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setProfileDialogOpen(false)}>Close</Button>
              <Button
                variant={selectedUser.isFollowing ? "outlined" : "contained"}
                onClick={() => {
                  handleFollowToggle(selectedUser);
                  setProfileDialogOpen(false);
                }}
              >
                {selectedUser.isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default UserSearch;