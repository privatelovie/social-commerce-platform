# Social Commerce AI Platform - Backend

A sophisticated Node.js backend for a social commerce platform with AI-powered features, real-time interactions, and advanced product tracking.

## 🚀 Features

### 🔐 Authentication & Users
- JWT-based authentication with secure token management
- Advanced user profiles with social stats and creator features
- Follow/unfollow system with privacy controls
- User search and discovery with intelligent suggestions

### 📱 Social Features
- Rich post creation with media, products, and hashtags
- Advanced engagement system (likes, comments, shares, saves)
- Real-time notifications via Socket.IO
- Trending algorithm with customizable feeds
- Comment threading with moderation

### 🛍️ Commerce Integration
- Comprehensive product catalog with AI insights
- Price tracking and history with trend analysis
- Product recommendations and comparisons
- Smart search with filtering and sorting
- Deal alerts and price drop notifications

### 🤖 AI & Analytics
- AI-powered content analysis and sentiment detection
- Product categorization and trend prediction
- User behavior analytics and insights
- Automated content moderation

## 🏗️ Architecture

### Core Models
- **User**: Advanced user profiles with social features
- **Post**: Rich social media posts with product integration
- **Product**: Comprehensive product data with tracking
- **Comment**: Threaded comments with reactions and moderation

### API Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/posts/feed` - Personalized content feed
- `GET /api/products/trending` - Trending products
- `GET /api/users/:username` - User profiles
- And many more...

## 🛠️ Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for live features
- **Security**: Helmet, rate limiting, JWT authentication
- **AI/ML**: OpenAI integration ready
- **File Upload**: Cloudinary/AWS S3 ready
- **Email**: Nodemailer configuration

## 📦 Installation

1. **Clone and Navigate**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   - Install and start MongoDB
   - The database will be created automatically

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Required Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend application URL for CORS

### Optional Environment Variables
- `OPENAI_API_KEY` - For AI features
- `CLOUDINARY_*` - For file uploads
- `SMTP_*` - For email notifications
- `STRIPE_*` - For payment processing

## 🚦 API Endpoints

### Authentication
```
POST /api/auth/register     # Register new user
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user
PUT  /api/auth/profile     # Update profile
```

### Posts & Social
```
GET  /api/posts/feed           # Get personalized feed
GET  /api/posts/trending       # Get trending posts
POST /api/posts               # Create new post
POST /api/posts/:id/like      # Like/unlike post
GET  /api/posts/:id/comments  # Get post comments
```

### Users & Social
```
GET  /api/users/:username          # Get user profile
POST /api/users/:username/follow   # Follow/unfollow user
GET  /api/users/:username/followers # Get user followers
GET  /api/users/suggestions/follow  # Get follow suggestions
```

### Products
```
GET  /api/products/search          # Search products
GET  /api/products/trending        # Trending products
GET  /api/products/:id            # Get product details
POST /api/products/:id/save       # Save/unsave product
GET  /api/products/:id/price-history # Price history
```

## 🔄 Real-time Features (Socket.IO)

### Events
- `like-post` - Real-time post likes
- `follow-user` - New follower notifications
- `new-comment` - Live comment updates
- `typing` - Typing indicators

### Connection
```javascript
io.on('connection', (socket) => {
  // User joins their personal room
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
  });
});
```

## 📊 Database Schema

### User Schema
- Personal info and authentication
- Social relationships (followers/following)
- Preferences and privacy settings
- Creator profile and verification status

### Post Schema
- Rich content with media and products
- Engagement metrics and analytics
- AI analysis and trending scores
- Visibility and scheduling options

### Product Schema
- Comprehensive product information
- Price tracking and history
- AI insights and recommendations
- Retailer information and affiliate data

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Request throttling
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Input Validation** - Mongoose schema validation
- **CORS Configuration** - Cross-origin security

## 📈 Performance Optimizations

- **Database Indexes** - Optimized queries
- **Compression** - Response compression
- **Caching Ready** - Redis integration prepared
- **Aggregation Pipelines** - Efficient data processing
- **Virtual Fields** - Computed properties

## 🧪 Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run test       # Run tests (TODO)
npm run lint       # Code linting (TODO)
```

### Development Tools
- **Morgan** - HTTP request logging
- **Nodemon** - Auto-restart on changes
- **ESLint** - Code linting (TODO)
- **Jest** - Testing framework (TODO)

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure MongoDB Atlas
3. Set up Redis for caching
4. Configure file storage (Cloudinary/S3)
5. Set up monitoring and logging

### Docker (TODO)
```dockerfile
# Dockerfile configuration coming soon
```

## 📋 TODO / Roadmap

### Immediate
- [ ] Complete AI service integration
- [ ] Implement search routes
- [ ] Add analytics routes
- [ ] Set up testing framework

### Features
- [ ] Advanced recommendation engine
- [ ] Real-time collaborative shopping
- [ ] Video content support
- [ ] Advanced creator tools
- [ ] Payment processing integration

### Performance
- [ ] Redis caching layer
- [ ] Database sharding strategy
- [ ] CDN integration
- [ ] API response optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related

- Frontend: React TypeScript application
- Mobile: React Native app (planned)
- Admin Dashboard: Next.js admin panel (planned)

---

Built with ❤️ for modern social commerce experiences.