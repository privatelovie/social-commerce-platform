const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'gif'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  width: { type: Number },
  height: { type: Number },
  duration: { type: Number }, // for videos
  size: { type: Number }, // file size in bytes
  altText: { type: String, default: '' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  brand: { type: String },
  image: { type: String },
  url: { type: String },
  affiliate: {
    isAffiliate: { type: Boolean, default: false },
    commission: { type: Number, default: 0 },
    trackingUrl: { type: String }
  }
}, { _id: false });

const engagementSchema = new mongoose.Schema({
  views: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 } // time spent viewing
  }],
  shares: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    platform: { type: String, enum: ['twitter', 'facebook', 'instagram', 'tiktok', 'copy'] },
    timestamp: { type: Date, default: Date.now }
  }],
  saves: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { _id: false });

const aiAnalysisSchema = new mongoose.Schema({
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  sentimentScore: { type: Number, default: 0 }, // -1 to 1
  categories: [{ type: String }],
  keywords: [{ type: String }],
  hashtags: [{ type: String }],
  engagementPrediction: { type: Number, default: 0 },
  viralityScore: { type: Number, default: 0 },
  contentQuality: { type: Number, default: 0 },
  bestPostingTime: { type: String },
  suggestedImprovements: [{ type: String }]
}, { _id: false });

const postSchema = new mongoose.Schema({
  // Basic Post Info
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Media Content
  media: [mediaSchema],
  
  // Product Integration
  products: [productSchema],
  
  // Post Type
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'product', 'review', 'story', 'poll'],
    default: 'text'
  },
  
  // Engagement Metrics
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  savesCount: { type: Number, default: 0 },
  
  // User Interactions
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Detailed Engagement
  engagement: engagementSchema,
  
  // Post Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deleted', 'reported'],
    default: 'published'
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  
  // Monetization
  isSponsored: { type: Boolean, default: false },
  sponsorInfo: {
    brandName: { type: String },
    campaignId: { type: String },
    disclosureText: { type: String, default: '#ad' }
  },
  
  // Location
  location: {
    name: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Tags and Categories
  hashtags: [{ type: String }],
  mentions: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  categories: [{ type: String }],
  
  // AI Analysis
  aiAnalysis: aiAnalysisSchema,
  
  // Scheduling
  scheduledFor: { type: Date },
  publishedAt: { type: Date },
  
  // Performance Tracking
  impressions: { type: Number, default: 0 },
  reach: { type: Number, default: 0 },
  clickThroughRate: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  
  // Trending Signals
  trendingScore: { type: Number, default: 0 },
  viralityFactors: {
    rapidEngagement: { type: Number, default: 0 },
    shareVelocity: { type: Number, default: 0 },
    crossPlatformShares: { type: Number, default: 0 },
    influencerShares: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ status: 1, visibility: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ categories: 1 });
postSchema.index({ likesCount: -1, createdAt: -1 });
postSchema.index({ trendingScore: -1, createdAt: -1 });
postSchema.index({ 'aiAnalysis.viralityScore': -1 });
postSchema.index({ 'products.productId': 1 });

// Virtual for engagement rate
postSchema.virtual('engagementRate').get(function() {
  if (this.impressions === 0) return 0;
  return ((this.likesCount + this.commentsCount + this.sharesCount) / this.impressions * 100);
});

// Virtual for formatted date
postSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return 'now';
});

// Method to increment view count
postSchema.methods.addView = async function(userId, duration = 0) {
  // Check if user already viewed this post recently
  const recentView = this.engagement.views.find(
    view => view.userId.toString() === userId.toString() &&
    (Date.now() - view.timestamp) < 300000 // 5 minutes
  );
  
  if (!recentView) {
    this.engagement.views.push({ userId, duration });
    this.viewsCount = this.engagement.views.length;
    this.impressions += 1;
    return this.save();
  }
  
  return this;
};

// Method to toggle like
postSchema.methods.toggleLike = async function(userId) {
  const likedIndex = this.likes.indexOf(userId);
  
  if (likedIndex > -1) {
    this.likes.splice(likedIndex, 1);
    this.likesCount = Math.max(0, this.likesCount - 1);
  } else {
    this.likes.push(userId);
    this.likesCount += 1;
  }
  
  return this.save();
};

// Method to add share
postSchema.methods.addShare = async function(userId, platform = 'copy') {
  this.engagement.shares.push({ userId, platform });
  this.sharesCount = this.engagement.shares.length;
  
  // Update virality factors
  this.viralityFactors.shareVelocity += 1;
  if (platform !== 'copy') {
    this.viralityFactors.crossPlatformShares += 1;
  }
  
  return this.save();
};

// Method to calculate trending score
postSchema.methods.calculateTrendingScore = function() {
  const ageHours = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  const ageDecay = Math.max(0, 1 - ageHours / 24); // Decay over 24 hours
  
  const engagementScore = (
    (this.likesCount * 1) +
    (this.commentsCount * 2) +
    (this.sharesCount * 3) +
    (this.savesCount * 2)
  );
  
  const viralityScore = (
    this.viralityFactors.rapidEngagement +
    this.viralityFactors.shareVelocity * 2 +
    this.viralityFactors.crossPlatformShares * 1.5 +
    this.viralityFactors.influencerShares * 3
  );
  
  this.trendingScore = (engagementScore + viralityScore) * ageDecay;
  return this.trendingScore;
};

// Static method to get trending posts
postSchema.statics.getTrending = function(options = {}) {
  const {
    limit = 20,
    category = null,
    timeFrame = 24 // hours
  } = options;
  
  const cutoff = new Date(Date.now() - timeFrame * 60 * 60 * 1000);
  const query = {
    status: 'published',
    visibility: { $in: ['public', 'followers'] },
    createdAt: { $gte: cutoff }
  };
  
  if (category) {
    query.categories = category;
  }
  
  return this.find(query)
    .populate('author', 'username displayName avatar isVerified isCreator')
    .populate('products.productId')
    .sort({ trendingScore: -1, likesCount: -1 })
    .limit(limit);
};

// Static method to search posts
postSchema.statics.searchPosts = function(query, options = {}) {
  const {
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1,
    filters = {}
  } = options;
  
  const searchQuery = {
    $or: [
      { content: { $regex: query, $options: 'i' } },
      { hashtags: { $regex: query, $options: 'i' } },
      { categories: { $regex: query, $options: 'i' } }
    ],
    status: 'published',
    visibility: 'public',
    ...filters
  };
  
  return this.find(searchQuery)
    .populate('author', 'username displayName avatar isVerified')
    .populate('products.productId')
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip);
};

// Static method to get feed posts
postSchema.statics.getFeed = function(userId, followingIds, options = {}) {
  const {
    limit = 20,
    skip = 0,
    includeOwnPosts = true
  } = options;
  
  const authorIds = includeOwnPosts ? 
    [userId, ...followingIds] : followingIds;
  
  return this.find({
    author: { $in: authorIds },
    status: 'published',
    visibility: { $in: ['public', 'followers'] }
  })
    .populate('author', 'username displayName avatar isVerified isCreator')
    .populate('products.productId')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Pre-save middleware to update trending score
postSchema.pre('save', function(next) {
  if (this.isModified('likesCount') || this.isModified('commentsCount') || 
      this.isModified('sharesCount') || this.isModified('savesCount')) {
    this.calculateTrendingScore();
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);