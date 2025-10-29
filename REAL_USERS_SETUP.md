# Real Users and Messaging Setup Guide

## Current Status

Your application already supports real user authentication! Here's what's currently working:

### ✅ What's Already Implemented

1. **User Registration & Login**
   - Email/password authentication
   - Google OAuth integration
   - JWT token-based sessions
   - User profiles with avatars

2. **Backend API**
   - MongoDB database for user storage
   - Authentication endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/google`)
   - User management

3. **Frontend**
   - Registration form
   - Login modal
   - Google Sign-In button
   - Authentication context

## How Real Users Work Right Now

### Creating Accounts

Users can create accounts in 3 ways:

1. **Email/Password Registration**
   ```
   - Click "Create Account" button on landing page
   - Enter username, display name, email, and password
   - Account is created in MongoDB
   - User is automatically logged in
   ```

2. **Google OAuth**
   ```
   - Click "Sign in with Google" button
   - Authenticate with Google
   - Account is created/logged in automatically
   ```

3. **Direct API Registration** (for testing)
   ```bash
   curl -X POST https://your-backend.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123",
       "displayName": "Test User"
     }'
   ```

### User Authentication Flow

1. User creates account or logs in
2. Backend verifies credentials
3. JWT token is generated
4. Token stored in localStorage
5. User stays logged in across sessions
6. Token refreshes automatically

## Setting Up Messaging Feature

The messaging feature needs to be activated. Here's how:

### Backend Setup

Your backend already has WebSocket support. Add real-time messaging:

1. **Install Socket.IO** (if not already installed)
   ```bash
   cd backend
   npm install socket.io socket.io-client
   ```

2. **Create Chat Schema** (`backend/models/Message.js`)
   ```javascript
   const mongoose = require('mongoose');

   const messageSchema = new mongoose.Schema({
     conversationId: { type: String, required: true, index: true },
     sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     content: { type: String, required: true },
     type: { type: String, enum: ['text', 'image', 'product'], default: 'text' },
     productId: { type: String },
     read: { type: Boolean, default: false },
     createdAt: { type: Date, default: Date.now }
   });

   module.exports = mongoose.model('Message', messageSchema);
   ```

3. **Add Socket.IO to Server** (`backend/server.js`)
   ```javascript
   const socketIo = require('socket.io');
   
   const io = socketIo(server, {
     cors: {
       origin: process.env.FRONTEND_URL,
       credentials: true
     }
   });

   io.on('connection', (socket) => {
     console.log('User connected:', socket.id);

     socket.on('join-conversation', (conversationId) => {
       socket.join(conversationId);
     });

     socket.on('send-message', async (messageData) => {
       const message = new Message(messageData);
       await message.save();
       io.to(messageData.conversationId).emit('new-message', message);
     });

     socket.on('disconnect', () => {
       console.log('User disconnected:', socket.id);
     });
   });
   ```

4. **Add Message Routes** (`backend/routes/messages.js`)
   ```javascript
   router.get('/conversations', auth, async (req, res) => {
     // Get user's conversations
   });

   router.get('/conversations/:id/messages', auth, async (req, res) => {
     // Get messages for conversation
   });

   router.post('/messages', auth, async (req, res) => {
     // Create new message
   });
   ```

### Frontend Setup

Your frontend already has messaging UI components. Connect them:

1. **Add Socket.IO Client**
   ```bash
   cd frontend
   npm install socket.io-client
   ```

2. **The MessagingPage component** (`frontend/src/pages/MessagingPage.tsx`) is already created!
   - It just needs to connect to your backend WebSocket
   - Update the socket connection URL to your backend

3. **Enable Messaging in Navigation**
   - The messaging button is already in your Navigation component
   - It navigates to `/messages` view
   - This is already working!

## Testing Real Users

### Test Scenario 1: Create Two Users

1. **User 1**
   ```
   - Open your app in browser
   - Click "Create Account"
   - Username: alice
   - Email: alice@test.com
   - Password: password123
   - Display Name: Alice Smith
   ```

2. **User 2** (in incognito window)
   ```
   - Open your app in incognito
   - Click "Create Account"
   - Username: bob
   - Email: bob@test.com
   - Password: password123
   - Display Name: Bob Jones
   ```

3. **Test Messaging**
   ```
   - As Alice: Click Messages icon
   - Search for "bob"
   - Start conversation
   - Send message: "Hi Bob!"
   - As Bob: See notification
   - Reply: "Hello Alice!"
   ```

## Environment Variables Needed

Make sure these are set in Vercel:

### Backend
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FRONTEND_URL=https://social-commerce-platform.vercel.app
```

### Frontend
```
REACT_APP_GOOGLE_CLIENT_ID=629577412217-2a966tj7k9g121gi1umj03rp4n6j2d1r.apps.googleusercontent.com
REACT_APP_API_URL=https://your-backend.vercel.app
REACT_APP_SOCKET_URL=https://your-backend.vercel.app
```

## Database Collections

Your MongoDB database will have:

1. **users** - User accounts
2. **messages** - Chat messages (when you add it)
3. **posts** - User posts
4. **products** - Product listings
5. **carts** - User shopping carts

## Current Limitations & Next Steps

### What's Working
✅ User registration
✅ User login
✅ Authentication persistence
✅ User profiles
✅ Protected routes

### What Needs Activation
⚠️ Real-time messaging (WebSocket setup)
⚠️ User search functionality
⚠️ Friend/follow system
⚠️ Profile customization

### Quick Activation Steps

1. **Deploy Backend Changes**
   ```bash
   git add backend/
   git commit -m "Add messaging support"
   git push
   ```

2. **Update Environment Variables**
   - Add REACT_APP_SOCKET_URL in Vercel

3. **Test**
   - Create two accounts
   - Try sending messages

## Troubleshooting

### Users Can't Register
- Check MongoDB connection
- Verify MONGODB_URI in environment variables
- Check backend logs in Vercel

### Messages Not Sending
- Check WebSocket connection
- Verify CORS settings
- Check browser console for errors

### Google OAuth Not Working
- Verify REACT_APP_GOOGLE_CLIENT_ID is set
- Check authorized origins in Google Console
- Ensure callback URL is correct

## Support

For issues:
1. Check Vercel logs (Backend & Frontend)
2. Check browser console
3. Verify all environment variables are set
4. Test API endpoints directly with curl/Postman
