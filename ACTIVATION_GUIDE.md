# 🚀 Feature Activation Guide

## Overview
This guide will help you activate the key features of your social commerce platform. Your backend is already fully set up and ready to use!

---

## ✅ Status Summary

### **Backend (Already Implemented ✓)**
- ✅ WebSocket/Socket.IO server running on port 5000
- ✅ Real-time messaging routes & models
- ✅ User search API endpoints
- ✅ Follow/unfollow system
- ✅ Profile update endpoints
- ✅ Authentication with JWT

### **Frontend (Partially Implemented)**
- ✅ Socket.IO client integration
- ✅ Messaging service with full API
- ✅ Search bar UI component
- ✅ Auth context with profile updates
- ⚠️ **Needs**: Backend connection configuration
- ⚠️ **Needs**: Follow button integration in UI
- ⚠️ **Needs**: User search results display

---

## 1️⃣ Activate Real-Time Messaging (WebSocket)

### Current Status
Your WebSocket setup is **95% complete**! The backend Socket.IO server is running, and the frontend has the messaging service ready.

### What You Need to Do

#### Step 1: Verify Backend is Running
```bash
# From the backend directory
cd C:\Users\jlove\projects\social-commerce-ai-platform\backend
npm start
```

You should see:
```
🚀 Server running on port 5000
✅ Connected to MongoDB
```

#### Step 2: Set Frontend Environment Variables
Add these to your Vercel environment variables (or `.env.local` for development):

```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

For local development:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

#### Step 3: Test WebSocket Connection

The socket automatically connects when a user logs in. Check your browser console for:
```
Socket connected: <socket-id>
📱 User <user-id> joined their room
```

### Backend Socket Events Available

| Event | Description | Usage |
|-------|-------------|-------|
| `join` | Join user's personal room | Auto-called on login |
| `join-conversation` | Join a chat room | Call when opening a conversation |
| `typing` | Send typing indicators | Call while user types |
| `message-delivered` | Mark message as delivered | Auto-called when received |
| `message-read` | Mark message as read | Call when message is viewed |
| `follow-user` | Real-time follow notification | Auto-called on follow |

### Frontend Socket Methods Available

```typescript
// Import the messaging service
import { messagingService } from '../services/messagingService';

// Listen for new messages
messagingService.on('messageReceived', (message) => {
  console.log('New message:', message);
});

// Send typing indicator
messagingService.startTyping(conversationId);
messagingService.stopTyping(conversationId);

// Join/leave conversation
messagingService.joinConversation(conversationId);
messagingService.leaveConversation(conversationId);
```

---

## 2️⃣ Activate User Search Functionality

### Current Status
- ✅ Backend search API at `/api/users?q=<query>`
- ✅ Global search API at `/api/search/global?q=<query>`
- ✅ Search bar component in Navigation.tsx
- ⚠️ Currently only searches products, not users

### What You Need to Do

The search bar in your Navigation component currently only searches products. To add user search, the component needs to call the backend user search API.

#### Backend Endpoints Available

```bash
# Search users
GET /api/users?q=<query>&page=1&limit=20&verified=true

# Global search (users, posts, products, hashtags)
GET /api/search/global?q=<query>&type=all

# Search suggestions/autocomplete
GET /api/search/suggestions?q=<query>

# Trending searches
GET /api/search/trending
```

#### Example API Response

```json
{
  "users": [
    {
      "_id": "userId123",
      "username": "john_doe",
      "displayName": "John Doe",
      "profile": {
        "avatar": "https://...",
        "bio": "Tech enthusiast"
      },
      "isVerified": true,
      "isCreator": true,
      "socialStats": {
        "followersCount": 1250,
        "followingCount": 342,
        "postsCount": 89
      }
    }
  ],
  "query": "john",
  "hasMore": false
}
```

#### Integration Steps

1. **Add user search to Navigation.tsx** (around line 153-212):
```typescript
// Add to performSearch function
const performSearch = async (query: string) => {
  setSearchLoading(true);
  try {
    // Existing product search code...
    
    // ADD: User search
    const userResponse = await fetch(
      `${apiConfig.baseURL}/users?q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      }
    );
    const userData = await userResponse.json();
    
    // Convert to search results
    const userResults: SearchResult[] = userData.users?.map((user: any) => ({
      type: 'creator' as const,
      id: user._id,
      title: user.displayName,
      subtitle: `@${user.username} • ${user.socialStats.followersCount} followers`,
      image: user.profile.avatar
    })) || [];
    
    setSearchResults([...recentResults, ...userResults, ...productResults]);
  } catch (error) {
    console.error('Search error:', error);
  } finally {
    setSearchLoading(false);
  }
};
```

2. **Handle user clicks**:
```typescript
const handleSearchClick = (result: SearchResult) => {
  if (result.type === 'creator') {
    // Navigate to user profile
    onViewChange('profile');
    // Or use router to navigate to /profile/:username
  }
  // ... existing code
};
```

---

## 3️⃣ Activate Friend/Follow System

### Current Status
- ✅ Backend follow/unfollow API at `/api/users/:username/follow`
- ✅ Get followers API at `/api/users/:username/followers`
- ✅ Get following API at `/api/users/:username/following`
- ⚠️ Need UI components to follow/unfollow users

### Backend API

```bash
# Follow or unfollow a user (toggles)
POST /api/users/:username/follow
Authorization: Bearer <token>

# Response:
{
  "message": "User followed", // or "User unfollowed"
  "isFollowing": true,
  "followersCount": 1251
}

# Get user's followers
GET /api/users/:username/followers?page=1&limit=20

# Get user's following
GET /api/users/:username/following?page=1&limit=20
```

### Integration Steps

#### Option A: Add to Profile Component

Create a follow button component:

```typescript
// components/FollowButton.tsx
import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { PersonAdd, PersonRemove } from '@mui/icons-material';

interface FollowButtonProps {
  username: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  username,
  initialIsFollowing,
  onFollowChange
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${username}/follow`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      setIsFollowing(data.isFollowing);
      onFollowChange?.(data.isFollowing);
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outlined" : "contained"}
      color="primary"
      startIcon={loading ? <CircularProgress size={16} /> : (isFollowing ? <PersonRemove /> : <PersonAdd />)}
      onClick={handleFollow}
      disabled={loading}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};
```

#### Option B: Add to Search Results

Update the search results to include follow buttons for users.

---

## 4️⃣ Activate Profile Customization

### Current Status
- ✅ Backend profile update API at `/api/auth/profile`
- ✅ Settings component with profile edit form
- ✅ Auth context with `updateProfile` function
- ✅ Already working!

### Available Profile Fields

```typescript
{
  displayName: string;
  bio: string;
  avatar: string; // URL
  location: string;
  website: string;
  // Plus frontend-specific fields in Settings
}
```

### How to Use

The profile customization is already activated! Users can:

1. Click on their avatar/profile icon
2. Navigate to Settings
3. Go to the "Account" tab
4. Click "Edit" button
5. Update their profile fields
6. Click "Save"

### Avatar Upload (To Implement)

The current setup uses avatar URLs. To add image upload:

```typescript
// Add to Settings.tsx or create AvatarUpload component
const handleAvatarUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/auth/upload-avatar`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      }
    );
    
    const data = await response.json();
    if (data.avatarUrl) {
      await updateProfile({ avatar: data.avatarUrl });
    }
  } catch (error) {
    console.error('Avatar upload error:', error);
  }
};
```

---

## 🧪 Testing Checklist

### Test WebSocket Connection
- [ ] Open browser console
- [ ] Log in to the app
- [ ] Check for "Socket connected" message
- [ ] Open Messages view
- [ ] Select a conversation
- [ ] Check for "joined conversation" message

### Test User Search
- [ ] Click on search bar
- [ ] Type a username or name
- [ ] Verify users appear in results
- [ ] Click on a user result
- [ ] Verify navigation to profile

### Test Follow System
- [ ] Navigate to another user's profile
- [ ] Click "Follow" button
- [ ] Verify button changes to "Unfollow"
- [ ] Verify follower count increases
- [ ] Click "Unfollow"
- [ ] Verify button changes back to "Follow"

### Test Profile Customization
- [ ] Go to Settings → Account tab
- [ ] Click "Edit" button
- [ ] Change display name
- [ ] Update bio
- [ ] Click "Save"
- [ ] Verify changes reflect in UI
- [ ] Refresh page and verify changes persist

---

## 🔧 Troubleshooting

### WebSocket Not Connecting

**Check:**
1. Backend server is running: `http://localhost:5000`
2. CORS is configured correctly in `backend/server.js`
3. Environment variables are set correctly
4. No firewall blocking WebSocket connections

**Fix:**
```javascript
// In backend/server.js, verify CORS config:
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### Search Not Returning Results

**Check:**
1. MongoDB is running and has data
2. Backend API is accessible
3. JWT token is valid
4. Network tab in browser shows API calls

**Fix:**
```bash
# Check backend logs
cd backend
npm start

# Test API directly
curl http://localhost:5000/api/users?q=test
```

### Follow Button Not Working

**Check:**
1. User is authenticated
2. JWT token is in localStorage
3. Backend returns proper response
4. Not trying to follow self

**Debug:**
```javascript
// Check auth token
console.log('Auth token:', localStorage.getItem('authToken'));

// Check API response
const response = await fetch('/api/users/:username/follow');
console.log(await response.json());
```

### Profile Updates Not Saving

**Check:**
1. Auth token is valid
2. Fields being updated are allowed
3. Backend receives the request
4. No validation errors

**Debug:**
```javascript
// In Settings.tsx handleSaveProfile:
console.log('Updating profile with:', {
  displayName: settings.displayName,
  bio: settings.bio,
  // ... other fields
});
```

---

## 📚 Additional Resources

### Backend Routes Documentation
- Auth: `backend/routes/auth.js`
- Users: `backend/routes/users.js`
- Messages: `backend/routes/messages.js`
- Search: `backend/routes/search.js`

### Frontend Services
- Auth: `frontend/src/services/authService.ts`
- Messaging: `frontend/src/services/messagingService.ts`
- API Client: `frontend/src/services/apiClient.ts`

### Configuration Files
- Backend Config: `backend/.env`
- Frontend Config: `frontend/.env.local`
- API Endpoints: `frontend/src/config/api.ts`

---

## 🎉 Next Steps

Once these features are activated, you can:

1. **Add Real Users**: Have people sign up at `/login` (registration already works!)
2. **Test Messaging**: Create conversations and send messages
3. **Build Social Graph**: Follow users and see their content
4. **Customize Profiles**: Update avatars, bios, and other info

Your platform has all the backend infrastructure ready to support thousands of users. Just connect the frontend components to the existing APIs!

---

## 🆘 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check backend server logs
3. Verify environment variables
4. Test API endpoints directly with curl/Postman
5. Check MongoDB connection status

All the infrastructure is in place - you just need to wire up the frontend! 🚀
