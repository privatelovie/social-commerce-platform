const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Product = require('../models/Product');

const router = express.Router();

// Global search across all content types
router.get('/global', optionalAuth, async (req, res) => {
  try {
    const { 
      q: query, 
      type = 'all', 
      page = 1, 
      limit = 20 
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters'
      });
    }

    const skip = (page - 1) * limit;
    const searchTerm = query.trim();
    const results = {};

    // Search users if requested or all types
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { username: { $regex: searchTerm, $options: 'i' } },
          { displayName: { $regex: searchTerm, $options: 'i' } },
          { 'profile.bio': { $regex: searchTerm, $options: 'i' } }
        ],
        status: 'active'
      })
        .select('username displayName profile.avatar profile.bio isVerified isCreator socialStats')
        .sort({ 'socialStats.followersCount': -1, isVerified: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      results.users = users;
    }

    // Search posts if requested or all types  
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        $or: [
          { content: { $regex: searchTerm, $options: 'i' } },
          { hashtags: { $regex: searchTerm, $options: 'i' } },
          { categories: { $regex: searchTerm, $options: 'i' } }
        ],
        status: 'published',
        visibility: 'public'
      })
        .populate('author', 'username displayName profile.avatar isVerified')
        .sort({ trendingScore: -1, likesCount: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      // Add user interaction data if authenticated
      const postsWithInteractions = req.user ? posts.map(post => ({
        ...post.toObject(),
        isLiked: post.likes.includes(req.user.userId)
      })) : posts;

      results.posts = postsWithInteractions;
    }

    // Search products if requested or all types
    if (type === 'all' || type === 'products') {
      const products = await Product.find({
        $text: { $search: searchTerm },
        status: 'active'
      })
        .sort({ score: { $meta: 'textScore' }, popularityScore: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      results.products = products;
    }

    // Search hashtags if requested or all types
    if (type === 'all' || type === 'hashtags') {
      const hashtagPosts = await Post.aggregate([
        {
          $match: {
            hashtags: { $regex: searchTerm, $options: 'i' },
            status: 'published',
            visibility: 'public'
          }
        },
        {
          $unwind: '$hashtags'
        },
        {
          $match: {
            hashtags: { $regex: searchTerm, $options: 'i' }
          }
        },
        {
          $group: {
            _id: '$hashtags',
            count: { $sum: 1 },
            recentPosts: { $push: '$_id' }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: parseInt(limit)
        }
      ]);

      results.hashtags = hashtagPosts;
    }

    res.json({
      query: searchTerm,
      type,
      results,
      hasMore: Object.values(results).some(arr => arr.length === parseInt(limit))
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      error: 'Server error performing search'
    });
  }
});

// Search suggestions/autocomplete
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.trim().length < 1) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = query.trim();
    const suggestions = [];

    // Get user suggestions
    const users = await User.find({
      $or: [
        { username: { $regex: `^${searchTerm}`, $options: 'i' } },
        { displayName: { $regex: `^${searchTerm}`, $options: 'i' } }
      ],
      status: 'active'
    })
      .select('username displayName profile.avatar isVerified')
      .sort({ 'socialStats.followersCount': -1 })
      .limit(5);

    users.forEach(user => {
      suggestions.push({
        type: 'user',
        text: user.displayName,
        username: user.username,
        avatar: user.profile.avatar,
        isVerified: user.isVerified
      });
    });

    // Get hashtag suggestions
    const hashtags = await Post.aggregate([
      {
        $match: {
          hashtags: { $regex: `^${searchTerm}`, $options: 'i' },
          status: 'published'
        }
      },
      { $unwind: '$hashtags' },
      {
        $match: {
          hashtags: { $regex: `^${searchTerm}`, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    hashtags.forEach(hashtag => {
      suggestions.push({
        type: 'hashtag',
        text: `#${hashtag._id}`,
        count: hashtag.count
      });
    });

    // Get recent searches for this user (if authenticated)
    if (req.user) {
      // TODO: Implement recent searches storage
    }

    res.json({
      query: searchTerm,
      suggestions: suggestions.slice(0, 10)
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      error: 'Server error getting search suggestions'
    });
  }
});

// Get trending searches
router.get('/trending', async (req, res) => {
  try {
    // Get trending hashtags
    const trendingHashtags = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
          status: 'published'
        }
      },
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          recentPosts: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get trending users (most followed recently)
    const trendingUsers = await User.find({
      isCreator: true,
      status: 'active'
    })
      .select('username displayName profile.avatar isVerified socialStats')
      .sort({ 'socialStats.engagementRate': -1, 'socialStats.followersCount': -1 })
      .limit(10);

    // Get trending products
    const trendingProducts = await Product.find({
      status: 'active',
      'trendAnalysis.popularity': { $gte: 10 }
    })
      .select('name brand currentPrice images trendAnalysis.popularity')
      .sort({ 'trendAnalysis.popularity': -1 })
      .limit(10);

    res.json({
      trending: {
        hashtags: trendingHashtags,
        users: trendingUsers,
        products: trendingProducts
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Trending searches error:', error);
    res.status(500).json({
      error: 'Server error getting trending searches'
    });
  }
});

// Advanced filter search
router.post('/filter', optionalAuth, async (req, res) => {
  try {
    const {
      query = '',
      filters = {},
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.body;

    const skip = (page - 1) * limit;
    const results = {};

    // Build dynamic query based on filters
    const buildQuery = (baseQuery = {}) => {
      const query = { ...baseQuery };

      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        query.createdAt = {};
        if (start) query.createdAt.$gte = new Date(start);
        if (end) query.createdAt.$lte = new Date(end);
      }

      if (filters.location) {
        query['location.name'] = { $regex: filters.location, $options: 'i' };
      }

      if (filters.verified !== undefined) {
        query.isVerified = filters.verified;
      }

      if (filters.creators !== undefined) {
        query.isCreator = filters.creators;
      }

      return query;
    };

    // Search posts with filters
    if (!filters.type || filters.type === 'posts') {
      let postQuery = {
        status: 'published',
        visibility: 'public'
      };

      if (query.trim()) {
        postQuery.$or = [
          { content: { $regex: query.trim(), $options: 'i' } },
          { hashtags: { $regex: query.trim(), $options: 'i' } }
        ];
      }

      if (filters.categories && filters.categories.length > 0) {
        postQuery.categories = { $in: filters.categories };
      }

      if (filters.hashtags && filters.hashtags.length > 0) {
        postQuery.hashtags = { $in: filters.hashtags };
      }

      postQuery = buildQuery(postQuery);

      let sortOption = {};
      switch (sortBy) {
        case 'recent':
          sortOption = { createdAt: -1 };
          break;
        case 'popular':
          sortOption = { likesCount: -1, createdAt: -1 };
          break;
        case 'trending':
          sortOption = { trendingScore: -1, createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }

      const posts = await Post.find(postQuery)
        .populate('author', 'username displayName profile.avatar isVerified')
        .sort(sortOption)
        .limit(parseInt(limit))
        .skip(skip);

      results.posts = posts;
    }

    // Search users with filters
    if (!filters.type || filters.type === 'users') {
      let userQuery = {
        status: 'active'
      };

      if (query.trim()) {
        userQuery.$or = [
          { username: { $regex: query.trim(), $options: 'i' } },
          { displayName: { $regex: query.trim(), $options: 'i' } },
          { 'profile.bio': { $regex: query.trim(), $options: 'i' } }
        ];
      }

      if (filters.specialties && filters.specialties.length > 0) {
        userQuery.specialties = { $in: filters.specialties };
      }

      if (filters.followerRange) {
        const { min, max } = filters.followerRange;
        userQuery['socialStats.followersCount'] = {};
        if (min !== undefined) userQuery['socialStats.followersCount'].$gte = min;
        if (max !== undefined) userQuery['socialStats.followersCount'].$lte = max;
      }

      userQuery = buildQuery(userQuery);

      const users = await User.find(userQuery)
        .select('username displayName profile isVerified isCreator socialStats')
        .sort({ 'socialStats.followersCount': -1 })
        .limit(parseInt(limit))
        .skip(skip);

      results.users = users;
    }

    res.json({
      query,
      filters,
      sortBy,
      results,
      hasMore: Object.values(results).some(arr => arr.length === parseInt(limit))
    });
  } catch (error) {
    console.error('Filter search error:', error);
    res.status(500).json({
      error: 'Server error performing filtered search'
    });
  }
});

// Save search query for user (if authenticated)
router.post('/save-query', auth, async (req, res) => {
  try {
    const { query, type = 'general' } = req.body;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Query must be at least 2 characters'
      });
    }

    // TODO: Implement search history storage
    // For now, just acknowledge the save
    res.json({
      message: 'Search query saved',
      query: query.trim(),
      type
    });
  } catch (error) {
    console.error('Save search query error:', error);
    res.status(500).json({
      error: 'Server error saving search query'
    });
  }
});

// Get search analytics (admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    // Simple check - in production you'd want proper admin middleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    let startDate;
    switch (timeRange) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Basic analytics - in production you'd track this properly
    const analytics = {
      topHashtags: await Post.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'published'
          }
        },
        { $unwind: '$hashtags' },
        {
          $group: {
            _id: '$hashtags',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      topCategories: await Post.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'published'
          }
        },
        { $unwind: '$categories' },
        {
          $group: {
            _id: '$categories',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      searchVolume: {
        // Placeholder - implement proper search tracking
        total: 0,
        unique: 0,
        timeRange
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Search analytics error:', error);
    res.status(500).json({
      error: 'Server error getting search analytics'
    });
  }
});

module.exports = router;