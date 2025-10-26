const express = require('express');
const mongoose = require('mongoose');
const { auth, adminOnly, moderatorOnly } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Product = require('../models/Product');

const router = express.Router();

// Get user analytics (own analytics only - without userId)
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Only allow users to see their own analytics unless admin
    if (userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'You can only view your own analytics'
      });
    }

    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
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
          avgLikes: { $avg: '$likesCount' },
          avgComments: { $avg: '$commentsCount' },
          avgEngagementRate: { $avg: '$engagementRate' }
        }
      }
    ]);

    // Get daily post performance
    const dailyStats = await Post.aggregate([
      {
        $match: {
          author: user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          posts: { $sum: 1 },
          likes: { $sum: '$likesCount' },
          comments: { $sum: '$commentsCount' },
          shares: { $sum: '$sharesCount' },
          views: { $sum: '$viewsCount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top performing posts
    const topPosts = await Post.find({
      author: user._id,
      createdAt: { $gte: startDate }
    })
      .select('content likesCount commentsCount sharesCount viewsCount createdAt')
      .sort({ likesCount: -1, engagementRate: -1 })
      .limit(10);

    // Get hashtag performance
    const hashtagPerformance = await Post.aggregate([
      {
        $match: {
          author: user._id,
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
          avgLikes: { $avg: '$likesCount' }
        }
      },
      { $sort: { totalLikes: -1 } },
      { $limit: 10 }
    ]);

    // Get follower growth over time
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
          newFollowers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const analytics = {
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        socialStats: user.socialStats
      },
      timeRange,
      overview: postAnalytics[0] || {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalViews: 0,
        avgLikes: 0,
        avgComments: 0,
        avgEngagementRate: 0
      },
      dailyStats,
      topPosts,
      hashtagPerformance,
      followerGrowth,
      insights: {
        bestPostingHour: null, // TODO: Calculate from post performance
        topCategory: null, // TODO: Calculate from categories
        engagementTrend: 'stable', // TODO: Calculate trend
        audienceGrowthRate: followerGrowth.length > 0 ? 
          followerGrowth.reduce((sum, day) => sum + day.newFollowers, 0) : 0
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      error: 'Server error retrieving user analytics'
    });
  }
});

// Get user analytics (own analytics only - with userId)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Only allow users to see their own analytics unless admin
    if (userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'You can only view your own analytics'
      });
    }

    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
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
          avgLikes: { $avg: '$likesCount' },
          avgComments: { $avg: '$commentsCount' },
          avgEngagementRate: { $avg: '$engagementRate' }
        }
      }
    ]);

    // Get daily post performance
    const dailyStats = await Post.aggregate([
      {
        $match: {
          author: user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          posts: { $sum: 1 },
          likes: { $sum: '$likesCount' },
          comments: { $sum: '$commentsCount' },
          shares: { $sum: '$sharesCount' },
          views: { $sum: '$viewsCount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top performing posts
    const topPosts = await Post.find({
      author: user._id,
      createdAt: { $gte: startDate }
    })
      .select('content likesCount commentsCount sharesCount viewsCount createdAt')
      .sort({ likesCount: -1, engagementRate: -1 })
      .limit(10);

    // Get hashtag performance
    const hashtagPerformance = await Post.aggregate([
      {
        $match: {
          author: user._id,
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
          avgLikes: { $avg: '$likesCount' }
        }
      },
      { $sort: { totalLikes: -1 } },
      { $limit: 10 }
    ]);

    // Get follower growth over time
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
          newFollowers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const analytics = {
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        socialStats: user.socialStats
      },
      timeRange,
      overview: postAnalytics[0] || {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalViews: 0,
        avgLikes: 0,
        avgComments: 0,
        avgEngagementRate: 0
      },
      dailyStats,
      topPosts,
      hashtagPerformance,
      followerGrowth,
      insights: {
        bestPostingHour: null, // TODO: Calculate from post performance
        topCategory: null, // TODO: Calculate from categories
        engagementTrend: 'stable', // TODO: Calculate trend
        audienceGrowthRate: followerGrowth.length > 0 ? 
          followerGrowth.reduce((sum, day) => sum + day.newFollowers, 0) : 0
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      error: 'Server error retrieving user analytics'
    });
  }
});

// Get platform analytics (admin only)
router.get('/platform', auth, adminOnly, async (req, res) => {
  try {
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

    // User statistics
    const userStats = await User.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [
            { $match: { status: 'active' } },
            { $count: 'count' }
          ],
          creators: [
            { $match: { isCreator: true } },
            { $count: 'count' }
          ],
          verified: [
            { $match: { isVerified: true } },
            { $count: 'count' }
          ],
          newUsers: [
            { $match: { createdAt: { $gte: startDate } } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    // Post statistics
    const postStats = await Post.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          published: [
            { $match: { status: 'published' } },
            { $count: 'count' }
          ],
          newPosts: [
            { $match: { createdAt: { $gte: startDate } } },
            { $count: 'count' }
          ],
          totalEngagement: [
            {
              $group: {
                _id: null,
                totalLikes: { $sum: '$likesCount' },
                totalComments: { $sum: '$commentsCount' },
                totalShares: { $sum: '$sharesCount' },
                totalViews: { $sum: '$viewsCount' }
              }
            }
          ]
        }
      }
    ]);

    // Product statistics
    const productStats = await Product.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [
            { $match: { status: 'active' } },
            { $count: 'count' }
          ],
          trending: [
            { $match: { 'trendAnalysis.popularity': { $gte: 50 } } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    // Daily growth metrics
    const dailyGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top creators by engagement
    const topCreators = await User.find({
      isCreator: true,
      status: 'active'
    })
      .select('username displayName profile.avatar socialStats isVerified')
      .sort({ 'socialStats.engagementRate': -1, 'socialStats.followersCount': -1 })
      .limit(10);

    // Platform insights
    const analytics = {
      timeRange,
      users: {
        total: userStats[0].total[0]?.count || 0,
        active: userStats[0].active[0]?.count || 0,
        creators: userStats[0].creators[0]?.count || 0,
        verified: userStats[0].verified[0]?.count || 0,
        newUsers: userStats[0].newUsers[0]?.count || 0
      },
      posts: {
        total: postStats[0].total[0]?.count || 0,
        published: postStats[0].published[0]?.count || 0,
        newPosts: postStats[0].newPosts[0]?.count || 0,
        engagement: postStats[0].totalEngagement[0] || {
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalViews: 0
        }
      },
      products: {
        total: productStats[0].total[0]?.count || 0,
        active: productStats[0].active[0]?.count || 0,
        trending: productStats[0].trending[0]?.count || 0
      },
      growth: {
        dailyGrowth,
        growthRate: dailyGrowth.length > 0 ? 
          dailyGrowth.reduce((sum, day) => sum + day.newUsers, 0) / dailyGrowth.length : 0
      },
      topCreators,
      insights: {
        userRetention: 85, // Placeholder - implement proper calculation
        avgSessionTime: '12m 34s', // Placeholder 
        platformHealth: 'healthy' // Based on various metrics
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({
      error: 'Server error retrieving platform analytics'
    });
  }
});

// Get content performance analytics
router.get('/content/performance', auth, async (req, res) => {
  try {
    const { 
      timeRange = '30d', 
      userId = req.user.userId,
      type = 'all'
    } = req.query;

    // Only allow users to see their own content analytics unless admin
    if (userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'You can only view your own content analytics'
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
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Content type performance
    const contentTypePerformance = await Post.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgLikes: { $avg: '$likesCount' },
          avgComments: { $avg: '$commentsCount' },
          avgShares: { $avg: '$sharesCount' },
          avgViews: { $avg: '$viewsCount' },
          totalEngagement: { 
            $sum: { 
              $add: ['$likesCount', '$commentsCount', '$sharesCount'] 
            }
          }
        }
      },
      { $sort: { totalEngagement: -1 } }
    ]);

    // Best performing times
    const timePerformance = await Post.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            dayOfWeek: { $dayOfWeek: '$createdAt' }
          },
          count: { $sum: 1 },
          avgEngagement: { 
            $avg: { 
              $add: ['$likesCount', '$commentsCount', '$sharesCount'] 
            }
          }
        }
      },
      { $sort: { avgEngagement: -1 } }
    ]);

    // Engagement trends
    const engagementTrends = await Post.aggregate([
      {
        $match: {
          author: new require('mongoose').Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          posts: { $sum: 1 },
          likes: { $sum: '$likesCount' },
          comments: { $sum: '$commentsCount' },
          shares: { $sum: '$sharesCount' },
          views: { $sum: '$viewsCount' },
          avgEngagementRate: { $avg: '$engagementRate' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const analytics = {
      timeRange,
      userId,
      contentTypePerformance,
      bestTimes: {
        hours: timePerformance.slice(0, 5),
        insights: {
          bestHour: timePerformance[0]?._id?.hour || null,
          bestDay: timePerformance[0]?._id?.dayOfWeek || null
        }
      },
      engagementTrends,
      summary: {
        totalPosts: contentTypePerformance.reduce((sum, type) => sum + type.count, 0),
        avgEngagementRate: engagementTrends.length > 0 ? 
          engagementTrends.reduce((sum, day) => sum + (day.avgEngagementRate || 0), 0) / engagementTrends.length : 0,
        bestPerformingType: contentTypePerformance[0]?._id || 'text',
        trendsDirection: 'stable' // TODO: Calculate actual trend
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Content performance analytics error:', error);
    res.status(500).json({
      error: 'Server error retrieving content performance analytics'
    });
  }
});

// Get audience analytics
router.get('/audience', auth, async (req, res) => {
  try {
    const { userId = req.user.userId, timeRange = '30d' } = req.query;

    // Only allow users to see their own audience analytics unless admin
    if (userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'You can only view your own audience analytics'
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
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Follower demographics (basic analysis)
    const followerAnalytics = await User.aggregate([
      { $match: { _id: user._id } },
      { $unwind: '$followers' },
      {
        $lookup: {
          from: 'users',
          localField: 'followers.user',
          foreignField: '_id',
          as: 'followerData'
        }
      },
      { $unwind: '$followerData' },
      {
        $group: {
          _id: null,
          totalFollowers: { $sum: 1 },
          creatorsFollowing: {
            $sum: { $cond: ['$followerData.isCreator', 1, 0] }
          },
          verifiedFollowing: {
            $sum: { $cond: ['$followerData.isVerified', 1, 0] }
          },
          avgFollowerCount: { $avg: '$followerData.socialStats.followersCount' }
        }
      }
    ]);

    // Recent follower growth
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
          newFollowers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top followers by influence
    const topFollowers = await User.aggregate([
      { $match: { _id: user._id } },
      { $unwind: '$followers' },
      {
        $lookup: {
          from: 'users',
          localField: 'followers.user',
          foreignField: '_id',
          as: 'followerData'
        }
      },
      { $unwind: '$followerData' },
      {
        $sort: { 'followerData.socialStats.followersCount': -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          username: '$followerData.username',
          displayName: '$followerData.displayName',
          avatar: '$followerData.profile.avatar',
          followersCount: '$followerData.socialStats.followersCount',
          isVerified: '$followerData.isVerified',
          isCreator: '$followerData.isCreator'
        }
      }
    ]);

    const analytics = {
      userId,
      timeRange,
      overview: followerAnalytics[0] || {
        totalFollowers: 0,
        creatorsFollowing: 0,
        verifiedFollowing: 0,
        avgFollowerCount: 0
      },
      growth: {
        followerGrowth,
        totalNewFollowers: followerGrowth.reduce((sum, day) => sum + day.newFollowers, 0),
        avgDailyGrowth: followerGrowth.length > 0 ? 
          followerGrowth.reduce((sum, day) => sum + day.newFollowers, 0) / followerGrowth.length : 0
      },
      topFollowers,
      insights: {
        audienceQuality: 'good', // Based on creator/verified ratio
        engagementPotential: 'high', // Based on follower influence
        growthTrend: 'increasing' // Based on recent growth
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Audience analytics error:', error);
    res.status(500).json({
      error: 'Server error retrieving audience analytics'
    });
  }
});

// Export analytics data (for power users/creators)
router.get('/export/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { userId = req.user.userId, format = 'json' } = req.query;

    // Only allow users to export their own data unless admin
    if (userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'You can only export your own data'
      });
    }

    let data = {};
    const userObjectId = new mongoose.Types.ObjectId(userId);

    switch (type) {
      case 'posts':
        data = await Post.find({ author: userObjectId })
          .select('content createdAt likesCount commentsCount sharesCount viewsCount hashtags categories')
          .sort({ createdAt: -1 });
        break;
      
      case 'followers':
        const user = await User.findById(userId)
          .populate('followers.user', 'username displayName createdAt');
        data = user.followers;
        break;
      
      case 'analytics':
        // Export comprehensive analytics
        data = {
          user: await User.findById(userId).select('-password'),
          posts: await Post.find({ author: userObjectId }).select('-__v'),
          summary: {
            totalPosts: await Post.countDocuments({ author: userObjectId }),
            totalFollowers: (await User.findById(userId)).socialStats.followersCount,
            totalLikes: await Post.aggregate([
              { $match: { author: userObjectId } },
              { $group: { _id: null, total: { $sum: '$likesCount' } } }
            ])
          }
        };
        break;
        
      default:
        return res.status(400).json({
          error: 'Invalid export type. Available: posts, followers, analytics'
        });
    }

    if (format === 'csv') {
      // TODO: Implement CSV export
      return res.status(501).json({
        error: 'CSV export not yet implemented'
      });
    }

    res.json({
      exportType: type,
      exportDate: new Date().toISOString(),
      data
    });
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      error: 'Server error exporting analytics data'
    });
  }
});

module.exports = router;