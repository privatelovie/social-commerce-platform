import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Avatar,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
  Paper
} from '@mui/material';
import { Search, Verified } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  followers?: number;
}

interface UserSearchBarProps {
  onUserSelect?: (user: User) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({ 
  onUserSelect, 
  placeholder = 'Search users...',
  fullWidth = false 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (inputValue.length > 2) {
      searchUsers(inputValue);
    } else {
      setUsers([]);
    }
  }, [inputValue]);

  const searchUsers = async (query: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/search?q=${query}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      // Fallback to mock data for demo
      const mockUsers: User[] = [
        {
          id: '1',
          username: '@techguru',
          displayName: 'Alex Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          isVerified: true,
          followers: 12500
        },
        {
          id: '2',
          username: '@fashionista_sara',
          displayName: 'Sara Williams',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b25fc4e4?w=100',
          isVerified: false,
          followers: 8900
        },
        {
          id: '3',
          username: '@john_doe',
          displayName: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
          isVerified: true,
          followers: 5400
        }
      ].filter(u => 
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.displayName.toLowerCase().includes(query.toLowerCase())
      );
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User | null) => {
    if (user) {
      if (onUserSelect) {
        onUserSelect(user);
      } else {
        navigate(`/profile/${user.id}`);
      }
    }
  };

  return (
    <Autocomplete
      fullWidth={fullWidth}
      options={users}
      loading={loading}
      getOptionLabel={(user) => user.username}
      filterOptions={(x) => x} // Disable built-in filtering since we do server-side
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_, value) => handleUserSelect(value)}
      onInputChange={(_, value) => setInputValue(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, user) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 1.5,
            px: 2,
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <Avatar 
            src={user.avatar} 
            alt={user.displayName}
            sx={{ width: 40, height: 40 }}
          />
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="body1" fontWeight="medium">
                {user.displayName}
              </Typography>
              {user.isVerified && (
                <Verified fontSize="small" color="primary" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {user.username}
            </Typography>
            {user.followers !== undefined && (
              <Typography variant="caption" color="text.secondary">
                {user.followers.toLocaleString()} followers
              </Typography>
            )}
          </Box>
        </Box>
      )}
      PaperComponent={(props) => (
        <Paper {...props} elevation={8} />
      )}
      noOptionsText={
        inputValue.length < 3 
          ? 'Type at least 3 characters to search' 
          : 'No users found'
      }
    />
  );
};

export default UserSearchBar;
