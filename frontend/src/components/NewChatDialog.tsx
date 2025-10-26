import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
  Autocomplete,
  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Business as BusinessIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import messagingService, { User as MessagingUser, CreateConversationData } from '../services/messagingService';

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onConversationCreated?: (conversationId: string) => void;
}

interface UserSearchResult extends MessagingUser {
  mutualFollowers?: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  lastActive?: string;
  isOnline: boolean; // Make required to match MessagingUser
}

interface GroupChatData {
  name: string;
  description: string;
  participants: UserSearchResult[];
  isPrivate: boolean;
}

const NewChatDialog: React.FC<NewChatDialogProps> = ({
  open,
  onClose,
  onConversationCreated,
}) => {
  const { user: currentUser } = useAuth();
  
  // State management
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [recentContacts, setRecentContacts] = useState<UserSearchResult[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Group chat state
  const [groupChatData, setGroupChatData] = useState<GroupChatData>({
    name: '',
    description: '',
    participants: [],
    isPrivate: false,
  });
  const [creatingChat, setCreatingChat] = useState(false);

  // Load initial data when dialog opens
  useEffect(() => {
    if (open) {
      loadInitialData();
    } else {
      // Reset state when dialog closes
      resetState();
    }
  }, [open]);

  // Search users when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const resetState = () => {
    setCurrentTab(0);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setError(null);
    setGroupChatData({
      name: '',
      description: '',
      participants: [],
      isPrivate: false,
    });
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load recent contacts and suggested users in parallel
      const [recentResponse, suggestedResponse] = await Promise.all([
        messagingService.getRecentContacts(),
        messagingService.getSuggestedUsers(),
      ]);
      
      if (recentResponse.success && recentResponse.users) {
        setRecentContacts(recentResponse.users);
      }
      
      if (suggestedResponse.success && suggestedResponse.users) {
        setSuggestedUsers(suggestedResponse.users);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      setSearching(true);
      const response = await messagingService.searchUsers(query);
      
      if (response.success && response.users) {
        setSearchResults(response.users);
      } else {
        setError(response.error || 'Failed to search users');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleStartDirectChat = async (user: UserSearchResult) => {
    try {
      setCreatingChat(true);
      
      const conversationData: CreateConversationData = {
        type: 'direct',
        participantIds: [user.id],
      };
      
      const response = await messagingService.createConversation(conversationData);
      
      if (response.success && response.conversation) {
        onConversationCreated?.(response.conversation.id);
        onClose();
      } else {
        setError(response.error || 'Failed to create conversation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create conversation');
    } finally {
      setCreatingChat(false);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!groupChatData.name.trim() || groupChatData.participants.length === 0) {
      setError('Please provide a group name and select at least one participant');
      return;
    }

    try {
      setCreatingChat(true);
      
      const conversationData: CreateConversationData = {
        type: 'group',
        participantIds: groupChatData.participants.map(p => p.id),
        groupName: groupChatData.name,
        groupAvatar: groupChatData.description,
      };
      
      const response = await messagingService.createConversation(conversationData);
      
      if (response.success && response.conversation) {
        onConversationCreated?.(response.conversation.id);
        onClose();
      } else {
        setError(response.error || 'Failed to create group chat');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create group chat');
    } finally {
      setCreatingChat(false);
    }
  };

  const toggleUserSelection = (user: UserSearchResult) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const addUserToGroup = (user: UserSearchResult) => {
    setGroupChatData(prev => ({
      ...prev,
      participants: prev.participants.find(p => p.id === user.id)
        ? prev.participants
        : [...prev.participants, user],
    }));
  };

  const removeUserFromGroup = (userId: string) => {
    setGroupChatData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== userId),
    }));
  };

  // Render user item
  const renderUserItem = (user: UserSearchResult, options?: {
    showAddButton?: boolean;
    showRemoveButton?: boolean;
    showSelectCheckbox?: boolean;
    onAdd?: () => void;
    onRemove?: () => void;
    onSelect?: () => void;
    showOnlineStatus?: boolean;
  }) => {
    const isSelected = selectedUsers.find(u => u.id === user.id);
    const isInGroup = groupChatData.participants.find(p => p.id === user.id);

    return (
      <ListItem
        key={user.id}
        sx={{
          borderRadius: 2,
          mb: 0.5,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <ListItemAvatar>
          <Badge
            variant="dot"
            color="success"
            invisible={!options?.showOnlineStatus || !user.isOnline}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Avatar src={user.avatar} alt={user.displayName}>
              {user.displayName.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                {user.displayName}
              </Typography>
              {user.isVerified && (
                <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              )}
              {user.mutualFollowers && user.mutualFollowers > 0 && (
                <Chip
                  size="small"
                  label={`${user.mutualFollowers} mutual`}
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 20 }}
                />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>
              {user.lastActive && !user.isOnline && (
                <Typography variant="caption" color="text.secondary">
                  Last active {user.lastActive}
                </Typography>
              )}
              {user.isOnline && (
                <Typography variant="caption" color="success.main">
                  Online now
                </Typography>
              )}
            </Box>
          }
        />
        
        <ListItemSecondaryAction>
          {options?.showSelectCheckbox && (
            <Checkbox
              checked={!!isSelected}
              onChange={options.onSelect}
              color="primary"
            />
          )}
          
          {options?.showAddButton && !isInGroup && (
            <IconButton
              onClick={options.onAdd}
              color="primary"
              size="small"
            >
              <AddIcon />
            </IconButton>
          )}
          
          {options?.showRemoveButton && isInGroup && (
            <IconButton
              onClick={options.onRemove}
              color="error"
              size="small"
            >
              <RemoveIcon />
            </IconButton>
          )}
          
          {currentTab === 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonIcon />}
              onClick={() => handleStartDirectChat(user)}
              disabled={creatingChat}
            >
              Chat
            </Button>
          )}
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  // Render direct messages tab
  const renderDirectMessagesTab = () => (
    <Box sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
      {/* Search */}
      <TextField
        placeholder="Search people..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searching && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
      />

      {/* Results */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {searchQuery && searchResults.length > 0 ? (
          <List>
            {searchResults.map(user => 
              renderUserItem(user, { showOnlineStatus: true })
            )}
          </List>
        ) : searchQuery && !searching ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            No users found matching "{searchQuery}"
          </Typography>
        ) : (
          <>
            {/* Recent Contacts */}
            {recentContacts.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Recent
                </Typography>
                <List>
                  {recentContacts.slice(0, 5).map(user => 
                    renderUserItem(user, { showOnlineStatus: true })
                  )}
                </List>
                <Divider sx={{ my: 2 }} />
              </>
            )}

            {/* Suggested Users */}
            {suggestedUsers.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Suggested for you
                </Typography>
                <List>
                  {suggestedUsers.map(user => 
                    renderUserItem(user, { showOnlineStatus: true })
                  )}
                </List>
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );

  // Render group chat tab
  const renderGroupChatTab = () => (
    <Box sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
      {/* Group details */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
        <TextField
          label="Group name"
          value={groupChatData.name}
          onChange={(e) => setGroupChatData(prev => ({ ...prev, name: e.target.value }))}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          required
        />
        
        <TextField
          label="Description (optional)"
          value={groupChatData.description}
          onChange={(e) => setGroupChatData(prev => ({ ...prev, description: e.target.value }))}
          fullWidth
          size="small"
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={groupChatData.isPrivate}
              onChange={(e) => setGroupChatData(prev => ({ ...prev, isPrivate: e.target.checked }))}
            />
          }
          label="Private group"
        />

        {/* Selected participants */}
        {groupChatData.participants.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Participants ({groupChatData.participants.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {groupChatData.participants.map(user => (
                <Chip
                  key={user.id}
                  avatar={<Avatar src={user.avatar} />}
                  label={user.displayName}
                  onDelete={() => removeUserFromGroup(user.id)}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Add participants */}
      <TextField
        placeholder="Search people to add..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* User list */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {(searchQuery ? searchResults : [...recentContacts, ...suggestedUsers]).map(user => 
            renderUserItem(user, {
              showAddButton: true,
              onAdd: () => addUserToGroup(user),
              showOnlineStatus: true,
            })
          )}
        </List>
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            New Message
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}
        >
          <Tab
            icon={<PersonIcon />}
            label="Direct Message"
            iconPosition="start"
          />
          <Tab
            icon={<GroupIcon />}
            label="Group Chat"
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {currentTab === 0 && renderDirectMessagesTab()}
          {currentTab === 1 && renderGroupChatTab()}
        </Box>
      </DialogContent>

      {currentTab === 1 && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={creatingChat}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateGroupChat}
            disabled={!groupChatData.name.trim() || groupChatData.participants.length === 0 || creatingChat}
            startIcon={creatingChat ? <CircularProgress size={16} /> : <GroupIcon />}
          >
            {creatingChat ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default NewChatDialog;