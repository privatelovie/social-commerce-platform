const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

// Get trending products
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const { category, timeFrame = 7, limit = 20 } = req.query;

    const products = await Product.findTrending({
      category,
      timeFrame: parseInt(timeFrame),
      limit: parseInt(limit)
    });

    res.json({
      products,
      timeFrame: parseInt(timeFrame)
    });
  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      error: 'Server error retrieving trending products'
    });
  }
});

// Search products with advanced filtering
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const {
      q: query,
      category,
      brand,
      minPrice,
      maxPrice,
      sortBy = 'relevance',
      page = 1,
      limit = 20,
      inStock = true
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters'
      });
    }

    const skip = (page - 1) * limit;
    const options = {
      category,
      brand,
      sortBy,
      limit: parseInt(limit),
      skip
    };

    // Price range filter
    if (minPrice || maxPrice) {
      options.priceRange = {
        min: minPrice ? parseFloat(minPrice) : 0,
        max: maxPrice ? parseFloat(maxPrice) : Number.MAX_SAFE_INTEGER
      };
    }

    // Add availability filter
    let searchResults = await Product.smartSearch(query.trim(), options);

    // Filter by stock status if requested
    if (inStock === 'true') {
      searchResults = searchResults.filter(product => 
        ['in_stock', 'low_stock'].includes(product.availability)
      );
    }

    res.json({
      products: searchResults,
      query: query.trim(),
      filters: {
        category,
        brand,
        priceRange: options.priceRange,
        sortBy,
        inStock
      },
      hasMore: searchResults.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Product search error:', error);
    res.status(500).json({
      error: 'Server error searching products'
    });
  }
});

// Get single product with detailed info
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('featuredBy.creator', 'username displayName avatar isVerified')
      .populate('aiInsights.similarProducts', 'name currentPrice images brand')
      .populate('aiInsights.complementaryProducts', 'name currentPrice images brand');

    if (!product || product.status !== 'active') {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    // Get user-specific data if authenticated
    let userInteractions = {};
    if (req.user) {
      const user = await User.findById(req.user.userId);
      userInteractions = {
        isSaved: user.savedProducts.includes(product._id),
        hasViewed: true
      };
    }

    res.json({
      product: {
        ...product.toObject(),
        ...userInteractions
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Server error retrieving product'
    });
  }
});

// Get price drops/deals
router.get('/deals/price-drops', optionalAuth, async (req, res) => {
  try {
    const { 
      minDiscount = 10, 
      category, 
      limit = 50 
    } = req.query;

    const priceDrops = await Product.findPriceDrops({
      minDiscountPercent: parseInt(minDiscount),
      category,
      limit: parseInt(limit)
    });

    res.json({
      deals: priceDrops,
      minDiscount: parseInt(minDiscount)
    });
  } catch (error) {
    console.error('Get price drops error:', error);
    res.status(500).json({
      error: 'Server error retrieving price drops'
    });
  }
});

// Get product recommendations
router.get('/:id/recommendations', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const recommendations = await Product.getRecommendations(
      req.params.id,
      req.user?.userId,
      parseInt(limit)
    );

    res.json({
      recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      error: 'Server error retrieving recommendations'
    });
  }
});

// Track product interaction (click, save, etc.)
router.post('/:id/track', optionalAuth, async (req, res) => {
  try {
    const { action, metadata = {} } = req.body;
    
    if (!['click', 'save', 'share', 'purchase'].includes(action)) {
      return res.status(400).json({
        error: 'Invalid tracking action'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    // Update product metrics
    switch (action) {
      case 'click':
        product.clicks += 1;
        break;
      case 'save':
        if (req.user) {
          const user = await User.findById(req.user.userId);
          const savedIndex = user.savedProducts.indexOf(product._id);
          
          if (savedIndex === -1) {
            user.savedProducts.push(product._id);
            product.saves += 1;
            await user.save();
          }
        }
        break;
      case 'share':
        product.shares += 1;
        break;
      case 'purchase':
        product.purchases += 1;
        break;
    }

    await product.save();

    res.json({
      message: 'Interaction tracked successfully',
      action,
      newMetrics: {
        clicks: product.clicks,
        saves: product.saves,
        shares: product.shares,
        purchases: product.purchases
      }
    });
  } catch (error) {
    console.error('Track product interaction error:', error);
    res.status(500).json({
      error: 'Server error tracking interaction'
    });
  }
});

// Get product categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          subcategories: { $addToSet: '$subcategory' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Server error retrieving categories'
    });
  }
});

// Get popular brands
router.get('/meta/brands', async (req, res) => {
  try {
    const { category } = req.query;
    
    const matchQuery = { status: 'active' };
    if (category) {
      matchQuery.category = category;
    }

    const brands = await Product.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          avgPrice: { $avg: '$currentPrice' },
          avgRating: { $avg: '$reviewSummary.averageRating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json({ 
      brands,
      category: category || 'all'
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      error: 'Server error retrieving brands'
    });
  }
});

// Get user's saved products
router.get('/user/saved', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.userId);
    
    const savedProducts = await Product.find({
      _id: { $in: user.savedProducts },
      status: 'active'
    })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const productsWithSaveStatus = savedProducts.map(product => ({
      ...product.toObject(),
      isSaved: true
    }));

    res.json({
      products: productsWithSaveStatus,
      hasMore: savedProducts.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get saved products error:', error);
    res.status(500).json({
      error: 'Server error retrieving saved products'
    });
  }
});

// Save/unsave product
router.post('/:id/save', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    const user = await User.findById(req.user.userId);
    const savedIndex = user.savedProducts.indexOf(req.params.id);

    if (savedIndex > -1) {
      // Unsave
      user.savedProducts.splice(savedIndex, 1);
      product.saves = Math.max(0, product.saves - 1);
    } else {
      // Save
      user.savedProducts.push(req.params.id);
      product.saves += 1;
    }

    await user.save();
    await product.save();

    res.json({
      message: savedIndex === -1 ? 'Product saved' : 'Product unsaved',
      isSaved: savedIndex === -1,
      savesCount: product.saves
    });
  } catch (error) {
    console.error('Save product error:', error);
    res.status(500).json({
      error: 'Server error updating save status'
    });
  }
});

// Get price history for a product
router.get('/:id/price-history', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    let startDate;
    switch (timeRange) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredHistory = product.priceHistory.filter(
      entry => entry.timestamp >= startDate
    );

    // Calculate price statistics
    const prices = filteredHistory.map(entry => entry.price);
    const stats = prices.length > 0 ? {
      currentPrice: product.currentPrice,
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      priceChange: prices.length > 1 ? 
        ((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2) : 0
    } : null;

    res.json({
      priceHistory: filteredHistory,
      stats,
      timeRange,
      productName: product.name
    });
  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({
      error: 'Server error retrieving price history'
    });
  }
});

// Compare products
router.post('/compare', optionalAuth, async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 5) {
      return res.status(400).json({
        error: 'Please provide 2-5 product IDs for comparison'
      });
    }

    const products = await Product.find({
      _id: { $in: productIds },
      status: 'active'
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        error: 'One or more products not found'
      });
    }

    // Generate comparison data
    const comparison = {
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        brand: product.brand,
        currentPrice: product.currentPrice,
        originalPrice: product.originalPrice,
        discountPercentage: product.discountPercentage,
        rating: product.reviewSummary.averageRating,
        reviewCount: product.reviewSummary.totalReviews,
        features: product.features,
        specifications: product.specifications,
        images: product.images,
        availability: product.availability
      })),
      priceRange: {
        min: Math.min(...products.map(p => p.currentPrice)),
        max: Math.max(...products.map(p => p.currentPrice))
      },
      avgRating: products.reduce((sum, p) => sum + p.reviewSummary.averageRating, 0) / products.length
    };

    res.json({ comparison });
  } catch (error) {
    console.error('Compare products error:', error);
    res.status(500).json({
      error: 'Server error comparing products'
    });
  }
});

module.exports = router;