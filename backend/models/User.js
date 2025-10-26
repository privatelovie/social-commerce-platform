const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const socialLinksSchema = new mongoose.Schema({
  instagram: { type: String, default: '' },
  twitter: { type: String, default: '' },
  tiktok: { type: String, default: '' },
  youtube: { type: String, default: '' },
  website: { type: String, default: '' }
}, { _id: false });


const userSchema = new mongoose.Schema({
  // Basic Info
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Profile Info
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  profile: {
    bio: {
      type: String,
      default: '',
      maxlength: 500
    },
    location: {
      type: String,
      default: '',
      maxlength: 100
    },
    avatar: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    socialLinks: socialLinksSchema
  },
  
  // Creator Info
  isCreator: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  creatorType: {
    type: String,
    enum: ['influencer', 'brand', 'retailer', 'individual', 'business'],
    default: 'individual'
  },
  specialties: [{
    type: String,
    enum: ['fashion', 'tech', 'beauty', 'lifestyle', 'fitness', 'food', 'travel', 'gaming', 'home', 'art']
  }],
  
  // Social Stats
  socialStats: {
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    averageLikes: { type: Number, default: 0 }
  },
  
  // References
  followers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    followedAt: { type: Date, default: Date.now }
  }],
  following: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    followedAt: { type: Date, default: Date.now }
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Saved Items
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  savedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  // Preferences
  preferences: {
    categories: [{ type: String }],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10000 }
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      followers: { type: Boolean, default: true },
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true }
    },
    privacy: {
      showEmail: { type: Boolean, default: false },
      showFollowers: { type: Boolean, default: true },
      showFollowing: { type: Boolean, default: true }
    }
  },
  
  // Account Status
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending', 'deleted'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  
  // AI Insights
  aiInsights: {
    personality: { type: String, default: '' },
    contentStyle: { type: String, default: '' },
    engagementPrediction: { type: Number, default: 0 },
    recommendedCategories: [{ type: String }],
    influenceScore: { type: Number, default: 0 }
  },
  
  // Timestamps
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ followersCount: -1 });
userSchema.index({ isCreator: 1, followersCount: -1 });
userSchema.index({ specialties: 1 });
userSchema.index({ 'stats.engagementRate': -1 });

// Virtual for full name
userSchema.virtual('fullProfile').get(function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    avatar: this.avatar,
    isVerified: this.isVerified,
    isCreator: this.isCreator,
    followersCount: this.followersCount,
    specialties: this.specialties
  };
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.email;
  delete userObject.blockedUsers;
  return userObject;
};

// Method to update stats
userSchema.methods.updateStats = async function() {
  // Update follower and following counts
  this.socialStats.followersCount = this.followers.length;
  this.socialStats.followingCount = this.following.length;
  
  // Try to update post stats if Post model exists
  try {
    const Post = mongoose.model('Post');
    const stats = await Post.aggregate([
      { $match: { author: this._id } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
          totalViews: { $sum: '$viewsCount' },
          avgLikes: { $avg: '$likesCount' }
        }
      }
    ]);
    
    if (stats.length > 0) {
      const stat = stats[0];
      this.socialStats.postsCount = stat.totalPosts;
      this.socialStats.totalLikes = stat.totalLikes;
      this.socialStats.totalViews = stat.totalViews;
      this.socialStats.averageLikes = Math.round(stat.avgLikes);
      this.socialStats.engagementRate = this.socialStats.followersCount > 0 ? 
        (stat.totalLikes / this.socialStats.followersCount * 100) : 0;
    }
  } catch (error) {
    // Post model might not be available during initial setup
    console.log('Could not update post stats:', error.message);
  }
  
  return this.save();
};

// Static method to search users
userSchema.statics.searchUsers = function(query, options = {}) {
  const {
    limit = 20,
    skip = 0,
    sortBy = 'followersCount',
    sortOrder = -1,
    filters = {}
  } = options;
  
  const searchQuery = {
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { displayName: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } }
    ],
    status: 'active',
    ...filters
  };
  
  return this.find(searchQuery)
    .select('-password -email -blockedUsers')
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip)
    .populate('followers following', 'username displayName avatar');
};

// Static method to get trending creators
userSchema.statics.getTrendingCreators = function(limit = 10) {
  return this.find({
    isCreator: true,
    status: 'active',
    'stats.engagementRate': { $gt: 0 }
  })
    .select('-password -email -blockedUsers')
    .sort({ 
      'stats.engagementRate': -1, 
      followersCount: -1,
      'stats.totalLikes': -1 
    })
    .limit(limit);
};

module.exports = mongoose.model('User', userSchema);