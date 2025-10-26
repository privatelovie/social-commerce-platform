const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, required: true },
  availability: { 
    type: String, 
    enum: ['in_stock', 'out_of_stock', 'low_stock', 'discontinued'],
    default: 'in_stock'
  }
}, { _id: false });

const reviewSummarySchema = new mongoose.Schema({
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  ratingDistribution: {
    five: { type: Number, default: 0 },
    four: { type: Number, default: 0 },
    three: { type: Number, default: 0 },
    two: { type: Number, default: 0 },
    one: { type: Number, default: 0 }
  },
  sentimentScore: { type: Number, default: 0 }, // -1 to 1
  commonKeywords: [{ type: String }],
  pros: [{ type: String }],
  cons: [{ type: String }]
}, { _id: false });

const trendAnalysisSchema = new mongoose.Schema({
  popularity: { type: Number, default: 0 }, // 0-100 scale
  searchVolume: { type: Number, default: 0 },
  mentionsCount: { type: Number, default: 0 },
  socialEngagement: { type: Number, default: 0 },
  demandScore: { type: Number, default: 0 },
  seasonalityFactor: { type: Number, default: 1 },
  trendDirection: { 
    type: String, 
    enum: ['rising', 'falling', 'stable'],
    default: 'stable'
  },
  peakSeasons: [{ type: String }],
  competitorCount: { type: Number, default: 0 },
  priceCompetitiveness: { type: Number, default: 50 } // 0-100
}, { _id: false });

const aiInsightsSchema = new mongoose.Schema({
  category: { type: String },
  subcategory: { type: String },
  targetAudience: [{ type: String }],
  ageGroup: { type: String },
  gender: { type: String },
  styleCategory: { type: String },
  colorAnalysis: {
    primaryColor: { type: String },
    colorPalette: [{ type: String }],
    colorTrend: { type: String }
  },
  qualityScore: { type: Number, default: 0 }, // 0-100
  valueScore: { type: Number, default: 0 }, // 0-100
  uniquenessScore: { type: Number, default: 0 }, // 0-100
  brandStrength: { type: Number, default: 0 }, // 0-100
  recommendationScore: { type: Number, default: 0 }, // 0-100
  similarProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  complementaryProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  keyFeatures: [{ type: String }],
  useCases: [{ type: String }],
  seasonalRelevance: { type: Number, default: 50 }
}, { _id: false });

const affiliateInfoSchema = new mongoose.Schema({
  isAffiliate: { type: Boolean, default: false },
  program: { type: String },
  commission: { type: Number, default: 0 },
  cookieLength: { type: Number, default: 30 },
  trackingUrl: { type: String },
  deepLink: { type: String },
  promotions: [{
    type: { type: String, enum: ['discount', 'cashback', 'bonus'] },
    value: { type: Number },
    description: { type: String },
    validUntil: { type: Date }
  }]
}, { _id: false });

const productSchema = new mongoose.Schema({
  // Basic Product Information
  name: { type: String, required: true },
  description: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String },
  sku: { type: String, unique: true, sparse: true },
  
  // Pricing
  currentPrice: { type: Number, required: true },
  originalPrice: { type: Number },
  currency: { type: String, default: 'USD' },
  priceHistory: [priceHistorySchema],
  
  // Images and Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false },
    width: { type: Number },
    height: { type: Number }
  }],
  videos: [{
    url: { type: String },
    thumbnail: { type: String },
    duration: { type: Number },
    type: { type: String, enum: ['product_demo', 'unboxing', 'review', 'tutorial'] }
  }],
  
  // Category and Classification
  category: { type: String, required: true },
  subcategory: { type: String },
  tags: [{ type: String }],
  
  // Product Details
  specifications: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  features: [{ type: String }],
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    unit: { type: String, default: 'cm' }
  },
  
  // Availability and Stock
  availability: { 
    type: String, 
    enum: ['in_stock', 'out_of_stock', 'low_stock', 'discontinued', 'pre_order'],
    default: 'in_stock'
  },
  stockQuantity: { type: Number, default: 0 },
  
  // Retailer Information
  retailers: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    price: { type: Number, required: true },
    availability: { 
      type: String, 
      enum: ['in_stock', 'out_of_stock', 'low_stock'],
      default: 'in_stock'
    },
    shipping: {
      cost: { type: Number, default: 0 },
      time: { type: String },
      freeShippingMinimum: { type: Number }
    },
    rating: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }],
  
  // Reviews and Ratings
  reviewSummary: reviewSummarySchema,
  
  // Trend Analysis
  trendAnalysis: trendAnalysisSchema,
  
  // AI Insights
  aiInsights: aiInsightsSchema,
  
  // Affiliate Information
  affiliateInfo: affiliateInfoSchema,
  
  // Engagement Metrics
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },
  
  // Social Media Integration
  socialMentions: [{
    platform: { type: String },
    url: { type: String },
    sentiment: { type: String, enum: ['positive', 'negative', 'neutral'] },
    engagement: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Creator Integration
  featuredBy: [{
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Performance Metrics
  conversionRate: { type: Number, default: 0 },
  clickThroughRate: { type: Number, default: 0 },
  popularityScore: { type: Number, default: 0 },
  
  // Status and Tracking
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'discontinued', 'pending_review'],
    default: 'active'
  },
  trackingEnabled: { type: Boolean, default: true },
  lastTracked: { type: Date, default: Date.now },
  
  // SEO and Search
  searchKeywords: [{ type: String }],
  seoTitle: { type: String },
  seoDescription: { type: String },
  
  // Seasonal Information
  seasonal: {
    isSeasonalProduct: { type: Boolean, default: false },
    seasons: [{ type: String, enum: ['spring', 'summer', 'fall', 'winter', 'holiday'] }],
    peakMonths: [{ type: Number, min: 1, max: 12 }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ currentPrice: 1 });
productSchema.index({ 'trendAnalysis.popularity': -1 });
productSchema.index({ popularityScore: -1 });
productSchema.index({ status: 1, trackingEnabled: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'aiInsights.category': 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.currentPrice) return 0;
  return Math.round(((this.originalPrice - this.currentPrice) / this.originalPrice) * 100);
});

// Virtual for best price among retailers
productSchema.virtual('bestPrice').get(function() {
  if (!this.retailers || this.retailers.length === 0) return this.currentPrice;
  const availableRetailers = this.retailers.filter(r => r.availability === 'in_stock');
  if (availableRetailers.length === 0) return this.currentPrice;
  return Math.min(...availableRetailers.map(r => r.price));
});

// Virtual for price trend
productSchema.virtual('priceTrend').get(function() {
  if (!this.priceHistory || this.priceHistory.length < 2) return 'stable';
  const recent = this.priceHistory.slice(-5); // Last 5 price points
  const trend = recent[recent.length - 1].price - recent[0].price;
  if (trend > 0) return 'rising';
  if (trend < 0) return 'falling';
  return 'stable';
});

// Method to add price history entry
productSchema.methods.addPriceHistory = function(price, source, originalPrice = null, availability = 'in_stock') {
  const entry = {
    price,
    originalPrice: originalPrice || price,
    discount: originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    source,
    availability,
    timestamp: new Date()
  };
  
  this.priceHistory.push(entry);
  this.currentPrice = price;
  if (originalPrice) this.originalPrice = originalPrice;
  this.availability = availability;
  this.lastTracked = new Date();
  
  // Keep only last 30 price history entries
  if (this.priceHistory.length > 30) {
    this.priceHistory = this.priceHistory.slice(-30);
  }
  
  return this.save();
};

// Method to update popularity score
productSchema.methods.updatePopularityScore = function() {
  const engagementWeight = 0.3;
  const trendWeight = 0.4;
  const reviewWeight = 0.2;
  const socialWeight = 0.1;
  
  const engagementScore = Math.min(100, (this.views + this.clicks * 2 + this.saves * 3 + this.shares * 4) / 100);
  const trendScore = this.trendAnalysis.popularity || 0;
  const reviewScore = (this.reviewSummary.averageRating / 5) * 100;
  const socialScore = Math.min(100, this.socialMentions.length * 5);
  
  this.popularityScore = Math.round(
    engagementScore * engagementWeight +
    trendScore * trendWeight +
    reviewScore * reviewWeight +
    socialScore * socialWeight
  );
  
  return this.popularityScore;
};

// Static method to find trending products
productSchema.statics.findTrending = function(options = {}) {
  const {
    category = null,
    limit = 20,
    timeFrame = 7 // days
  } = options;
  
  const cutoff = new Date(Date.now() - timeFrame * 24 * 60 * 60 * 1000);
  const query = {
    status: 'active',
    updatedAt: { $gte: cutoff }
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ 
      'trendAnalysis.popularity': -1, 
      popularityScore: -1,
      views: -1 
    })
    .limit(limit)
    .populate('featuredBy.creator', 'username displayName avatar isVerified');
};

// Static method for price drop alerts
productSchema.statics.findPriceDrops = function(options = {}) {
  const {
    minDiscountPercent = 10,
    category = null,
    limit = 50
  } = options;
  
  const query = {
    status: 'active',
    availability: { $in: ['in_stock', 'low_stock'] },
    originalPrice: { $exists: true },
    $expr: {
      $gte: [
        { $divide: [{ $subtract: ['$originalPrice', '$currentPrice'] }, '$originalPrice'] },
        minDiscountPercent / 100
      ]
    }
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ updatedAt: -1 })
    .limit(limit);
};

// Static method for smart search
productSchema.statics.smartSearch = function(query, options = {}) {
  const {
    category = null,
    priceRange = null,
    brand = null,
    sortBy = 'relevance',
    limit = 20,
    skip = 0
  } = options;
  
  const searchQuery = {
    $text: { $search: query },
    status: 'active'
  };
  
  if (category) searchQuery.category = category;
  if (brand) searchQuery.brand = brand;
  if (priceRange) {
    searchQuery.currentPrice = {
      $gte: priceRange.min,
      $lte: priceRange.max
    };
  }
  
  let sortOption = {};
  switch (sortBy) {
    case 'price_low':
      sortOption = { currentPrice: 1 };
      break;
    case 'price_high':
      sortOption = { currentPrice: -1 };
      break;
    case 'popularity':
      sortOption = { popularityScore: -1, views: -1 };
      break;
    case 'rating':
      sortOption = { 'reviewSummary.averageRating': -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    default:
      sortOption = { score: { $meta: 'textScore' }, popularityScore: -1 };
  }
  
  return this.find(searchQuery)
    .sort(sortOption)
    .limit(limit)
    .skip(skip)
    .populate('featuredBy.creator', 'username displayName avatar');
};

// Static method for recommendations
productSchema.statics.getRecommendations = function(productId, userId = null, limit = 10) {
  return this.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(productId) } },
    {
      $lookup: {
        from: 'products',
        let: { 
          category: '$category',
          similarIds: '$aiInsights.similarProducts',
          complementaryIds: '$aiInsights.complementaryProducts'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$category', '$$category'] },
                  { $in: ['$_id', '$$similarIds'] },
                  { $in: ['$_id', '$$complementaryIds'] }
                ]
              },
              status: 'active',
              _id: { $ne: mongoose.Types.ObjectId(productId) }
            }
          },
          { $sort: { popularityScore: -1, 'reviewSummary.averageRating': -1 } },
          { $limit: limit }
        ],
        as: 'recommendations'
      }
    },
    { $unwind: '$recommendations' },
    { $replaceRoot: { newRoot: '$recommendations' } }
  ]);
};

// Pre-save middleware to update popularity score
productSchema.pre('save', function(next) {
  if (this.isModified('views') || this.isModified('clicks') || 
      this.isModified('saves') || this.isModified('shares')) {
    this.updatePopularityScore();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);