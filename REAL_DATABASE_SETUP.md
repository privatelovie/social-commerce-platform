# Real Database Setup Guide for SocialCommerce Platform

This guide will help you set up a **real backend with database** for your SocialCommerce platform, enabling:
- ✅ Real user authentication (registration & login)
- ✅ Real-time messaging between users
- ✅ Post creation and interaction
- ✅ Social features (likes, comments, follows)
- ✅ Product management

## 🚀 Quick Start

### Step 1: Install MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/social-commerce`)

#### Option B: MongoDB Local (Development)
**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. MongoDB will run on `mongodb://localhost:27017`

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Step 2: Configure Backend Environment

1. Navigate to the backend folder:
```bash
cd backend
```

2. Copy `.env.example` to `.env`:
```bash
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux
```

3. Edit `.env` file with your settings:
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database - Use your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/social-commerce-ai-platform
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/social-commerce

# JWT Security - CHANGE THIS to a random secure string
JWT_SECRET=your-super-secret-jwt-key-change-this-NOW-123456789

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Optional: File Upload (for images/videos)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- Express (web server)
- MongoDB/Mongoose (database)
- Socket.IO (real-time chat)
- JWT (authentication)
- Bcrypt (password encryption)
- And more...

### Step 4: Start the Backend Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
🌐 Frontend URL: http://localhost:3000
```

### Step 5: Update Frontend to Use Real Backend

The frontend is already configured to connect to the backend at `http://localhost:5000`.

1. Open a NEW terminal window
2. Navigate to frontend folder:
```bash
cd frontend
```

3. Start the frontend:
```bash
npm start
```

The frontend will open at http://localhost:3000 and automatically connect to your backend!

## ✅ What's Already Built

### Backend Features ✨

#### 1. **User Authentication** (`/api/auth`)
- ✅ Register new users: `POST /api/auth/register`
- ✅ Login: `POST /api/auth/login`
- ✅ Get current user: `GET /api/auth/me`
- ✅ Update profile: `PUT /api/auth/profile`
- ✅ Password hashing with bcrypt
- ✅ JWT tokens for secure sessions

#### 2. **User Management** (`/api/users`)
- ✅ Get user profiles
- ✅ Follow/unfollow users
- ✅ Get followers/following lists
- ✅ Search users
- ✅ Update profile info

#### 3. **Posts** (`/api/posts`)
- ✅ Create posts with images/videos
- ✅ Get feed (following users' posts)
- ✅ Like/unlike posts
- ✅ Comment on posts
- ✅ Share posts
- ✅ Trending posts

#### 4. **Real-time Messaging** (`/api/messages` + Socket.IO)
- ✅ Send messages to users
- ✅ Get conversations
- ✅ Real-time message delivery
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message read receipts
- ✅ Share products/carts in chat

#### 5. **Products** (`/api/products`)
- ✅ Product catalog
- ✅ Search products
- ✅ Product recommendations
- ✅ Add to cart
- ✅ Wishlist management

#### 6. **Shopping Cart** (`/api/cart`)
- ✅ Add items to cart
- ✅ Update quantities
- ✅ Remove items
- ✅ Get cart total
- ✅ Share cart with friends

#### 7. **AI Features** (`/api/ai`)
- ✅ Product recommendations
- ✅ Content analysis
- ✅ Search assistance

#### 8. **Analytics** (`/api/analytics`)
- ✅ User engagement metrics
- ✅ Post performance
- ✅ Shopping behavior

## 📝 Database Schema

### Collections

#### Users
- Username, email, password (encrypted)
- Profile (bio, avatar, location)
- Social stats (followers, following, posts count)
- Preferences and settings
- Verification status

#### Posts
- Author reference
- Content, media (images/videos)
- Linked products
- Engagement (likes, comments, shares, views)
- Hashtags, mentions
- AI analysis

#### Messages
- Sender, recipient
- Content, media attachments
- Conversation ID
- Status (sent, delivered, read)
- Reactions, replies
- Shared content (products, carts, posts)

#### Products
- Name, description, price
- Images, brand
- Category, tags
- Stock status
- Ratings and reviews

#### Cart
- User reference
- Items (products, quantities)
- Totals, shipping
- Expiry date

## 🧪 Testing the API

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create a Post (with JWT token)
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "content": "My first real post! 🎉",
    "type": "text"
  }'
```

### Send a Message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "recipientId": "RECIPIENT_USER_ID",
    "content": "Hello! This is a real message!"
  }'
```

## 🔧 Frontend Integration

The frontend already has API services configured! Just make sure both backend and frontend are running:

1. **Backend**: `cd backend && npm start` (port 5000)
2. **Frontend**: `cd frontend && npm start` (port 3000)

The frontend will automatically:
- Connect to `http://localhost:5000` for API calls
- Connect to Socket.IO for real-time features
- Store JWT tokens in localStorage
- Handle authentication state

## 🌐 Deploying to Production

### Backend Deployment Options:

#### 1. Heroku (Free Tier Available)
```bash
cd backend
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-secret-key
git push heroku main
```

#### 2. Railway.app (Recommended)
1. Sign up at https://railway.app
2. New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Auto-deploys on git push

#### 3. Render.com (Free Tier)
1. Sign up at https://render.com
2. New → Web Service
3. Connect your GitHub repo
4. Add environment variables
5. Deploy

### Database: MongoDB Atlas
- Always use MongoDB Atlas for production (free tier available)
- Enable IP whitelist (allow all: `0.0.0.0/0` for development)
- Use strong passwords
- Enable authentication

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` already
2. **Use strong JWT_SECRET** - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Use HTTPS in production** - Most hosting providers auto-provision SSL
4. **Enable CORS carefully** - Only allow your frontend domain
5. **Rate limiting** - Already configured for auth endpoints
6. **Validate all inputs** - Mongoose schemas handle this

## 📱 Real-Time Features

### Socket.IO Events

The backend already handles these real-time events:

- `connection` - User connects
- `join` - User joins their room
- `join-conversation` - Join a chat conversation
- `typing` - Typing indicators
- `message-delivered` - Message delivery status
- `message-read` - Message read status
- `like-post` - Real-time post likes
- `follow-user` - Real-time follows
- `new-comment` - Real-time comments
- `disconnect` - User disconnects

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Check if port 5000 is available
- Run `npm install` again

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `FRONTEND_URL` in backend `.env`
- Check browser console for CORS errors
- Verify `apiClient.ts` has correct backend URL

### Database connection failed
- MongoDB not running locally
- Wrong connection string in `.env`
- For Atlas: Check network access settings
- For Atlas: Verify username/password

### Real-time messaging not working
- Backend Socket.IO server must be running
- Frontend must connect to Socket.IO
- Check browser console for Socket.IO errors
- Verify CORS settings allow WebSocket connections

## 📚 API Documentation

Complete API documentation available at:
- Backend README: `backend/README.md`
- Test API script: `backend/test-full-api.js`
- Run tests: `cd backend && npm run test:full`

## 🎉 You're All Set!

You now have a fully functional social commerce platform with:
- ✅ Real user accounts
- ✅ Real database storage
- ✅ Real-time messaging
- ✅ Social interactions
- ✅ Shopping features
- ✅ AI-powered recommendations

**Create your first account at http://localhost:3000 and start connecting with real users!**
