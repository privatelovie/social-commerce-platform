const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const socketIO = require('socket.io');
const http = require('http');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const productRoutes = require('./routes/products');
const searchRoutes = require('./routes/search');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const messageRoutes = require('./routes/messages');
const cartRoutes = require('./routes/cart');

// TODO: Implement services
// const ProductTracker = require('./services/ProductTracker');
// const AIService = require('./services/AIService');
// const NotificationService = require('./services/NotificationService');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-commerce-ai-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Please ensure MongoDB is installed and running, or use MongoDB Atlas');
    console.log('💡 For local install: https://www.mongodb.com/try/download/community');
    console.log('💡 For cloud Atlas: https://www.mongodb.com/cloud/atlas');
    // Don't exit, let the server run without DB for testing
  }
};

connectDB();

// Socket.IO for real-time features
const connectedUsers = new Map(); // Track online users

io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    socket.userId = userId;
    connectedUsers.set(userId, {
      socketId: socket.id,
      connectedAt: new Date()
    });
    
    // Broadcast user online status to their contacts
    socket.broadcast.emit('user-online', { userId, timestamp: new Date() });
    console.log(`📱 User ${userId} joined their room`);
  });

  // Handle real-time messaging
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`💬 User ${socket.userId} joined conversation ${conversationId}`);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`👋 User ${socket.userId} left conversation ${conversationId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { conversationId, isTyping } = data;
    socket.to(`conversation:${conversationId}`).emit('user-typing', {
      userId: socket.userId,
      conversationId,
      isTyping,
      timestamp: new Date()
    });
  });

  // Handle message delivery status
  socket.on('message-delivered', (data) => {
    const { messageId, conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('message-status-updated', {
      messageId,
      status: 'delivered',
      timestamp: new Date()
    });
  });

  socket.on('message-read', (data) => {
    const { messageId, conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('message-status-updated', {
      messageId,
      status: 'read',
      timestamp: new Date()
    });
  });

  // Handle real-time likes
  socket.on('like-post', (data) => {
    socket.broadcast.emit('post-liked', {
      ...data,
      timestamp: new Date()
    });
  });

  // Handle real-time follows
  socket.on('follow-user', (data) => {
    io.to(`user:${data.followedUserId}`).emit('new-follower', {
      ...data,
      timestamp: new Date()
    });
  });

  // Handle real-time comments
  socket.on('new-comment', (data) => {
    socket.broadcast.emit('comment-added', {
      ...data,
      timestamp: new Date()
    });
  });

  // Handle cart sharing notifications
  socket.on('cart-shared', (data) => {
    io.to(`user:${data.recipientId}`).emit('cart-share-notification', {
      ...data,
      timestamp: new Date()
    });
  });

  // Handle product sharing
  socket.on('product-shared', (data) => {
    io.to(`user:${data.recipientId}`).emit('product-share-notification', {
      ...data,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
    
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      // Broadcast user offline status
      socket.broadcast.emit('user-offline', { 
        userId: socket.userId, 
        timestamp: new Date() 
      });
    }
  });
});

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/cart', cartRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// TODO: Initialize services when implemented
// const productTracker = new ProductTracker();
// const aiService = new AIService();
// const notificationService = new NotificationService(io);
// productTracker.startTracking();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;