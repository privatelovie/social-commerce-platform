const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

const router = express.Router();

// Get user profile
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('following.user', 'username displayName avatar isVerified')
      .populate('followers.user', 'username displayName avatar isVerified');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get post counts
    const postsCount = await Post.countDocuments({
      author: user._id,
      status: 'published',
      visibility: { $in: ['public'] }
    });

    const isFollowing = req.user ? 
      user.followers.some(f => f.user._id.toString() === req.user.userId) : false;
    
    const isOwnProfile = req.user ? req.user.userId === user._id.toString() : false;

    // Prepare user data with privacy considerations
    const userData = {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      profile: user.profile,
      socialStats: {
        ...user.socialStats,
        postsCount
      },
      isVerified: user.isVerified,
      isCreator: user.isCreator,
      createdAt: user.createdAt,
      isFollowing,
      isOwnProfile
    };

    // Include sensitive data only for own profile
    if (isOwnProfile) {
      userData.email = user.email;
      userData.preferences = user.preferences;
      userData.following = user.following;
      userData.followers = user.followers;
    } else {
      // Public follower/following counts only
      userData.followersCount = user.socialStats.followersCount;
      userData.followingCount = user.socialStats.followingCount;
    }

    res.json({
      user: userData
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Server error retrieving user profile'
    });
  }
});

// Search users
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { q: query, page = 1, limit = 20, verified, creators } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters'
      });
    }

    const skip = (page - 1) * limit;
    const searchQuery = {
      status: 'active',
      $or: [
        { username: { $regex: query.trim(), $options: 'i' } },
        { displayName: { $regex: query.trim(), $options: 'i' } },
        { 'profile.bio': { $regex: query.trim(), $options: 'i' } }
      ]
    };

    if (verified === 'true') {
      searchQuery.isVerified = true;
    }

    if (creators === 'true') {
      searchQuery.isCreator = true;
    }

    const users = await User.find(searchQuery)
      .select('username displayName profile.avatar profile.bio isVerified isCreator socialStats')
      .sort({ 
        isVerified: -1, 
        'socialStats.followersCount': -1, 
        'socialStats.postsCount': -1 
      })
      .limit(parseInt(limit))
      .skip(skip);

    res.json({
      users,
      query: query.trim(),
      hasMore: users.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: 'Server error searching users'
    });
  }
});

// Follow/unfollow user
router.post('/:username/follow', auth, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    const currentUser = await User.findById(req.user.userId);

    if (!targetUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    if (targetUser._id.toString() === req.user.userId) {
      return res.status(400).json({
        error: 'You cannot follow yourself'
      });
    }

    const isCurrentlyFollowing = currentUser.following.some(
      f => f.user.toString() === targetUser._id.toString()
    );

    if (isCurrentlyFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        f => f.user.toString() !== targetUser._id.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        f => f.user.toString() !== currentUser._id.toString()
      );

      // Update stats
      await currentUser.updateStats();
      await targetUser.updateStats();
    } else {
      // Follow
      currentUser.following.push({
        user: targetUser._id,
        followedAt: new Date()
      });
      targetUser.followers.push({
        user: currentUser._id,
        followedAt: new Date()
      });

      // Update stats
      await currentUser.updateStats();
      await targetUser.updateStats();
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isCurrentlyFollowing ? 'User unfollowed' : 'User followed',
      isFollowing: !isCurrentlyFollowing,
      followersCount: targetUser.socialStats.followersCount
    });
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({
      error: 'Server error updating follow status'
    });
  }
});

// Get user's followers
router.get('/:username/followers', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check privacy - only show followers to the user themselves or public profiles
    const isOwnProfile = req.user ? req.user.userId === user._id.toString() : false;
    
    if (!isOwnProfile && user.preferences.privacy.showFollowers === false) {
      return res.status(403).json({
        error: 'User\'s followers are private'
      });
    }

    const followers = await User.aggregate([
      { $match: { _id: user._id } },
      { $unwind: '$followers' },
      { $sort: { 'followers.followedAt': -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'followers.user',
          foreignField: '_id',
          as: 'followerUser',
          pipeline: [
            {
              $project: {
                username: 1,
                displayName: 1,
                'profile.avatar': 1,
                'profile.bio': 1,
                isVerified: 1,
                isCreator: 1,
                'socialStats.followersCount': 1
              }
            }
          ]
        }
      },
      { $unwind: '$followerUser' },
      {
        $project: {
          user: '$followerUser',
          followedAt: '$followers.followedAt'
        }
      }
    ]);

    res.json({
      followers,
      hasMore: followers.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      error: 'Server error retrieving followers'
    });
  }
});

// Get user's following
router.get('/:username/following', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const isOwnProfile = req.user ? req.user.userId === user._id.toString() : false;
    
    if (!isOwnProfile && user.preferences.privacy.showFollowing === false) {
      return res.status(403).json({
        error: 'User\'s following list is private'
      });
    }

    const following = await User.aggregate([
      { $match: { _id: user._id } },
      { $unwind: '$following' },
      { $sort: { 'following.followedAt': -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'following.user',
          foreignField: '_id',
          as: 'followingUser',
          pipeline: [
            {
              $project: {
                username: 1,
                displayName: 1,
                'profile.avatar': 1,
                'profile.bio': 1,
                isVerified: 1,
                isCreator: 1,
                'socialStats.followersCount': 1
              }
            }
          ]
        }
      },
      { $unwind: '$followingUser' },
      {
        $project: {
          user: '$followingUser',
          followedAt: '$following.followedAt'
        }
      }
    ]);

    res.json({
      following,
      hasMore: following.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      error: 'Server error retrieving following list'
    });
  }
});

// Get user's saved posts
router.get('/:username/saved', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Only allow access to own saved posts
    if (req.user.userId !== user._id.toString()) {
      return res.status(403).json({
        error: 'You can only view your own saved posts'
      });
    }

    const savedPosts = await Post.find({
      _id: { $in: user.savedPosts },
      status: 'published'
    })
      .populate('author', 'username displayName avatar isVerified isCreator')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const postsWithInteractions = savedPosts.map(post => ({
      ...post.toObject(),
      isLiked: post.likes.includes(req.user.userId),
      isSaved: true // Obviously true since these are saved posts
    }));

    res.json({
      posts: postsWithInteractions,
      hasMore: savedPosts.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({
      error: 'Server error retrieving saved posts'
    });
  }
});

// Get trending creators
router.get('/trending/creators', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      isCreator: true,
      status: 'active'
    };

    if (category) {
      query['creatorProfile.category'] = category;
    }

    const creators = await User.find(query)
      .select('username displayName profile isVerified isCreator socialStats creatorProfile')
      .sort({
        'socialStats.engagementRate': -1,
        'socialStats.followersCount': -1,
        'socialStats.postsCount': -1
      })
      .limit(parseInt(limit))
      .skip(skip);

    res.json({
      creators,
      hasMore: creators.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get trending creators error:', error);
    res.status(500).json({
      error: 'Server error retrieving trending creators'
    });
  }
});

// Get user analytics (own profile only)
router.get('/:username/analytics', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Only allow access to own analytics
    if (req.user.userId !== user._id.toString()) {
      return res.status(403).json({
        error: 'You can only view your own analytics'
      });
    }

    const { timeRange = '30d' } = req.query;
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
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get post analytics
    const postAnalytics = await Post.aggregate([
      {
        $match: {
          author: user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
          totalComments: { $sum: '$commentsCount' },
          totalShares: { $sum: '$sharesCount' },
          totalViews: { $sum: '$viewsCount' },
          avgEngagementRate: { $avg: '$engagementRate' }
        }
      }
    ]);

    // Get follower growth
    const followerGrowth = await User.aggregate([
      { $match: { _id: user._id } },
      { $unwind: '$followers' },
      {
        $match: {
          'followers.followedAt': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$followers.followedAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const analytics = {
      overview: postAnalytics[0] || {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalViews: 0,
        avgEngagementRate: 0
      },
      followerGrowth,
      currentStats: user.socialStats,
      timeRange
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      error: 'Server error retrieving analytics'
    });
  }
});

// Get suggested users to follow
router.get('/suggestions/follow', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const currentUser = await User.findById(req.user.userId);
    const followingIds = currentUser.following.map(f => f.user);

    // Get users with mutual followers or similar interests
    const suggestions = await User.aggregate([
      {
        $match: {
          _id: { $nin: [currentUser._id, ...followingIds] },
          status: 'active'
        }
      },
      {
        $addFields: {
          mutualFollowers: {
            $size: {
              $setIntersection: [
                '$followers.user',
                followingIds
              ]
            }
          },
          popularityScore: {
            $add: [
              { $multiply: ['$socialStats.followersCount', 0.3] },
              { $multiply: ['$socialStats.postsCount', 0.2] },
              { $multiply: ['$socialStats.engagementRate', 50] }
            ]
          }
        }
      },
      {
        $addFields: {
          suggestionScore: {
            $add: [
              { $multiply: ['$mutualFollowers', 10] },
              { $multiply: ['$popularityScore', 0.1] },
              { $cond: ['$isVerified', 5, 0] },
              { $cond: ['$isCreator', 3, 0] }
            ]
          }
        }
      },
      { $sort: { suggestionScore: -1, 'socialStats.followersCount': -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          username: 1,
          displayName: 1,
          'profile.avatar': 1,
          'profile.bio': 1,
          isVerified: 1,
          isCreator: 1,
          'socialStats.followersCount': 1,
          mutualFollowers: 1
        }
      }
    ]);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get follow suggestions error:', error);
    res.status(500).json({
      error: 'Server error retrieving follow suggestions'
    });
  }
});

module.exports = router;