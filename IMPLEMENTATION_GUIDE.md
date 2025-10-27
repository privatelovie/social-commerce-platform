# Feature Implementation Guide

## ✅ Completed Features (Phase 1)
1. **Socket.IO Integration** - Connected to Railway backend
2. **INR Currency Utility** - All pricing converted to INR  
3. **Saved Posts Page** - Full bookmarking functionality
4. **Clickable Hashtags** - HashtagLink component with navigation
5. **Product Upload** - Complete product upload form with images

---

## 🚧 Remaining Features Implementation

### 6. Fix Like Button & Connect to Backend API

**Files to Update:**
- `frontend/src/components/PostCard.tsx`
- `frontend/src/services/api.js`
- `backend/routes/posts.js`

**Steps:**
1. Create API endpoint in backend:
```javascript
// backend/routes/posts.js
router.post('/:id/like', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post.likes.includes(req.user.id)) {
    post.likes.push(req.user.id);
  } else {
    post.likes = post.likes.filter(id => id !== req.user.id);
  }
  await post.save();
  res.json({ likes: post.likes.length, isLiked: post.likes.includes(req.user.id) });
});
```

2. Update frontend service:
```typescript
// frontend/src/services/api.js
export const likePost = async (postId: string) => {
  const response = await axios.post(`/api/posts/${postId}/like`);
  return response.data;
};
```

3. Update PostCard component to use API

---

### 7. User Search with Autocomplete

**New Component:** `frontend/src/components/UserSearchBar.tsx`

```tsx
import { Autocomplete, TextField, Avatar, Box } from '@mui/material';

const UserSearchBar = () => {
  const [users, setUsers] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const searchUsers = async (query: string) => {
    const response = await axios.get(`/api/users/search?q=${query}`);
    setUsers(response.data);
  };

  return (
    <Autocomplete
      options={users}
      getOptionLabel={(user) => user.username}
      renderOption={(props, user) => (
        <Box component="li" {...props}>
          <Avatar src={user.avatar} sx={{ mr: 2 }} />
          {user.username}
        </Box>
      )}
      renderInput={(params) => (
        <TextField {...params} label="Search users..." />
      )}
      onInputChange={(e, value) => {
        setInputValue(value);
        if (value.length > 2) searchUsers(value);
      }}
    />
  );
};
```

**Backend Route:**
```javascript
// backend/routes/users.js
router.get('/search', async (req, res) => {
  const query = req.query.q;
  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { displayName: { $regex: query, $options: 'i' } }
    ]
  }).limit(10);
  res.json(users);
});
```

---

### 8. Improved Instagram-Style Reels UI

**Update:** `frontend/src/components/VideoReels.tsx`

Key improvements:
1. **Full-screen vertical scroll**
2. **Overlay UI with gradient**
3. **Bottom action bar with like/comment/share**
4. **Side profile button**
5. **Auto-play with intersection observer**

```tsx
<Box sx={{
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  bgcolor: 'black',
  overflowY: 'scroll',
  scrollSnapType: 'y mandatory'
}}>
  {videos.map((video) => (
    <Box
      key={video.id}
      sx={{
        height: '100vh',
        width: '100%',
        scrollSnapAlign: 'start',
        position: 'relative'
      }}
    >
      <video src={video.url} />
      
      {/* Gradient overlay */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
      }} />
      
      {/* Action buttons on right */}
      <Stack
        sx={{
          position: 'absolute',
          right: 12,
          bottom: 100,
          gap: 3
        }}
      >
        <IconButton onClick={handleLike}>
          <Favorite />
          <Typography>{video.likes}</Typography>
        </IconButton>
        {/* More buttons */}
      </Stack>
    </Box>
  ))}
</Box>
```

---

### 9. Multiple Carts System

**New Files:**
- `frontend/src/components/CartManager.tsx`
- `frontend/src/components/CartSelector.tsx`
- Update `frontend/src/context/CartContext.tsx`

**Database Schema:**
```javascript
// backend/models/Cart.js
const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, default: 'My Cart' },
  items: [{
    productId: Schema.Types.ObjectId,
    quantity: Number,
    addedAt: Date
  }],
  isDefault: { type: Boolean, default: false },
  createdAt: Date
});
```

**Context Updates:**
```typescript
interface CartContextType {
  carts: Cart[];
  currentCart: Cart;
  switchCart: (cartId: string) => void;
  createCart: (name: string) => void;
  deleteCart: (cartId: string) => void;
}
```

---

### 10. Cart & Product Sharing

**Component:** `frontend/src/components/ShareDialog.tsx`

```tsx
const ShareDialog = ({ item, type }) => {
  const shareViaMessage = async (recipientId: string) => {
    await axios.post('/api/messages/share', {
      recipientId,
      type, // 'cart' or 'product'
      itemId: item.id,
      message: `Check out this ${type}!`
    });
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Share {type}</DialogTitle>
      <List>
        {contacts.map(contact => (
          <ListItem button onClick={() => shareViaMessage(contact.id)}>
            <Avatar src={contact.avatar} />
            <ListItemText primary={contact.name} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};
```

**Backend:**
```javascript
router.post('/share', auth, async (req, res) => {
  const { recipientId, type, itemId } = req.body;
  const conversation = await Conversation.findOrCreate({
    participants: [req.user.id, recipientId]
  });
  
  const message = new Message({
    conversationId: conversation.id,
    senderId: req.user.id,
    type: 'share',
    content: {
      type,
      itemId,
      data: type === 'cart' ? await Cart.findById(itemId) : await Product.findById(itemId)
    }
  });
  
  await message.save();
  io.to(`conversation_${conversation.id}`).emit('newMessage', message);
  res.json({ success: true });
});
```

---

### 11. Google OAuth Integration

**Frontend Setup:**
```bash
npm install @react-oauth/google
```

**Component:** `frontend/src/components/GoogleLogin.tsx`
```tsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
  <GoogleLogin
    onSuccess={(credentialResponse) => {
      axios.post('/api/auth/google', {
        token: credentialResponse.credential
      });
    }}
    onError={() => console.log('Login Failed')}
  />
</GoogleOAuthProvider>
```

**Backend:**
```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { token } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  
  const payload = ticket.getPayload();
  let user = await User.findOne({ email: payload.email });
  
  if (!user) {
    user = new User({
      email: payload.email,
      displayName: payload.name,
      avatar: payload.picture,
      googleId: payload.sub,
      isVerified: true
    });
    await user.save();
  }
  
  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ token: jwtToken, user });
});
```

---

### 12. Mobile Responsive Design & Gestures

**Global Theme Updates:** `frontend/src/theme.ts`

```typescript
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingLeft: '8px',
            paddingRight: '8px',
          },
        },
      },
    },
  },
});
```

**Gesture Support:**
```bash
npm install react-use-gesture
```

```tsx
import { useGesture } from 'react-use-gesture';

const bind = useGesture({
  onSwipeLeft: () => nextVideo(),
  onSwipeRight: () => prevVideo(),
  onPinch: ({ offset: [scale] }) => setZoom(scale),
});

<div {...bind()}>{content}</div>
```

**Mobile-specific CSS:**
```css
@media (max-width: 768px) {
  .reel-container {
    height: 100vh;
    width: 100vw;
    position: fixed;
  }
  
  .action-buttons {
    bottom: env(safe-area-inset-bottom);
  }
}
```

---

### 13. Real Analytics Data

**Update:** `frontend/src/components/AnalyticsDashboard.tsx`

Connect to real backend data:
```typescript
useEffect(() => {
  const fetchAnalytics = async () => {
    const response = await axios.get('/api/analytics/dashboard');
    setStats(response.data);
  };
  fetchAnalytics();
}, []);
```

**Backend Route:**
```javascript
router.get('/dashboard', auth, async (req, res) => {
  const stats = {
    totalViews: await VideoView.countDocuments({ userId: req.user.id }),
    totalLikes: await Post.aggregate([
      { $match: { author: req.user.id } },
      { $group: { _id: null, total: { $sum: { $size: '$likes' } } } }
    ]),
    followers: await Follow.countDocuments({ following: req.user.id }),
    revenue: await Order.aggregate([
      { $match: { sellerId: req.user.id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
  };
  res.json(stats);
});
```

---

### 14. Remove Demo Launchers

**Files to Update:**
1. Delete `frontend/src/components/DemoLauncher.tsx`
2. Update `frontend/src/App.tsx` to remove DemoLauncher usage
3. Update routing to go directly to main app
4. Remove mock data imports

```typescript
// Before
<Route path="/" element={<DemoLauncher />} />

// After  
<Route path="/" element={<Navigate to="/feed" />} />
```

---

## Testing Checklist

- [ ] Like button increments/decrements
- [ ] User search returns results
- [ ] Hashtags navigate correctly
- [ ] Product upload saves to backend
- [ ] Saved posts persist
- [ ] Multiple carts switch correctly
- [ ] Cart sharing sends message
- [ ] Google login creates user
- [ ] Mobile gestures work
- [ ] Analytics show real data
- [ ] INR displays correctly
- [ ] No demo launcher visible

---

## Deployment Steps

1. **Backend:**
```bash
cd backend
git push railway main
```

2. **Frontend:**
```bash
cd frontend
npm run build
git push origin master  # Auto-deploys to Vercel
```

3. **Environment Variables:**
- Add `GOOGLE_CLIENT_ID` to Railway
- Add `GOOGLE_CLIENT_ID` to Vercel
- Update `REACT_APP_API_URL` if needed

---

## Priority Order

1. **High Priority** (Must-have for MVP):
   - Like button API
   - User search
   - Remove demo launcher

2. **Medium Priority** (Enhance UX):
   - Improved Reels UI
   - Mobile responsive
   - Real analytics

3. **Nice-to-have** (Can be phased):
   - Multiple carts
   - Google OAuth
   - Advanced sharing

---

## Estimated Timeline

- Like button + User search: **2 hours**
- Reels UI improvements: **4 hours**
- Multiple carts system: **6 hours**
- Cart/product sharing: **3 hours**
- Google OAuth: **4 hours**
- Mobile responsive: **6 hours**
- Analytics integration: **2 hours**
- Remove demos + cleanup: **1 hour**

**Total:** ~28 hours of development

---

## Next Steps

1. Start with high-priority features
2. Test each feature thoroughly
3. Deploy incrementally
4. Gather user feedback
5. Iterate on UX improvements

Good luck! 🚀
