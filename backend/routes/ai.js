const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Product = require('../models/Product');

const router = express.Router();

// Simple sentiment analysis (placeholder for real AI service)
const analyzeSentiment = (text) => {
  const positiveWords = ['good', 'great', 'amazing', 'awesome', 'excellent', 'fantastic', 'wonderful', 'perfect', 'love', 'best'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'disappointing', 'poor', 'sad', 'angry'];
  
  const words = text.toLowerCase().split(' ');
  let positiveScore = 0;
  let negativeScore = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveScore++;
    if (negativeWords.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return { sentiment: 'positive', score: 0.6 + (positiveScore * 0.1) };
  if (negativeScore > positiveScore) return { sentiment: 'negative', score: -0.6 - (negativeScore * 0.1) };
  return { sentiment: 'neutral', score: 0 };
};

// Extract keywords from text
const extractKeywords = (text) => {
  const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by'];
  const words = text.toLowerCase().match(/\w+/g) || [];
  const wordFreq = {};
  
  words.forEach(word => {
    if (word.length > 3 && !stopWords.includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
};

// Analyze post content
router.post('/analyze/content', auth, async (req, res) => {
  try {
    const { content, type = 'post' } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Content is required for analysis'
      });
    }
    
    const text = content.trim();
    
    // Basic analysis
    const sentiment = analyzeSentiment(text);
    const keywords = extractKeywords(text);
    const hashtags = (text.match(/#\w+/g) || []).map(tag => tag.substring(1));
    
    // Content metrics
    const metrics = {
      wordCount: text.split(' ').length,
      characterCount: text.length,
      hashtagCount: hashtags.length,
      mentionCount: (text.match(/@\w+/g) || []).length,
      readabilityScore: Math.max(0, 100 - text.split(' ').length * 0.5), // Simple readability
      engagementPrediction: Math.random() * 100 // Placeholder for ML prediction
    };
    
    // Suggested improvements
    const suggestions = [];
    if (metrics.hashtagCount === 0) {
      suggestions.push('Consider adding relevant hashtags to increase discoverability');
    }
    if (metrics.wordCount > 300) {
      suggestions.push('Consider shortening the content for better engagement');
    }
    if (sentiment.sentiment === 'negative') {
      suggestions.push('Consider adding more positive language to improve engagement');
    }
    
    const analysis = {
      sentiment,
      keywords,
      hashtags,
      metrics,
      suggestions,
      categories: [], // TODO: Implement category classification
      toxicityScore: Math.random() * 0.1, // Placeholder - should be low for good content
      spamScore: Math.random() * 0.1,
      qualityScore: Math.max(0, 100 - (metrics.wordCount > 500 ? 20 : 0))
    };
    
    res.json({
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Content analysis error:', error);
    res.status(500).json({
      error: 'Server error analyzing content'
    });
  }
});

// Get personalized recommendations for user
router.get('/recommendations/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    let recommendations = [];
    
    switch (type) {
      case 'posts':
        // Recommend posts based on user interests and following
        const followingIds = user.following.map(f => f.user);
        const userCategories = user.preferences.categories || [];
        
        recommendations = await Post.find({
          $or: [
            { author: { $in: followingIds } },
            { categories: { $in: userCategories } },
            { hashtags: { $in: userCategories } }
          ],
          status: 'published',
          visibility: 'public',
          author: { $ne: user._id } // Don't recommend own posts
        })
          .populate('author', 'username displayName profile.avatar isVerified')
          .sort({ trendingScore: -1, createdAt: -1 })
          .limit(parseInt(limit));
        break;
        
      case 'users':
        // Recommend users based on mutual connections and interests
        recommendations = await User.aggregate([
          {
            $match: {
              _id: { $nin: [user._id, ...followingIds] },
              status: 'active'
            }
          },
          {
            $addFields: {
              mutualFollowers: {
                $size: {
                  $setIntersection: ['$followers.user', followingIds]
                }
              },
              commonInterests: {
                $size: {
                  $setIntersection: ['$specialties', userCategories]
                }
              }
            }
          },
          {
            $addFields: {
              recommendationScore: {
                $add: [
                  { $multiply: ['$mutualFollowers', 10] },
                  { $multiply: ['$commonInterests', 5] },
                  { $multiply: ['$socialStats.followersCount', 0.001] },
                  { $cond: ['$isVerified', 20, 0] },
                  { $cond: ['$isCreator', 15, 0] }
                ]
              }
            }
          },
          { $sort: { recommendationScore: -1 } },
          { $limit: parseInt(limit) },
          {
            $project: {
              username: 1,
              displayName: 1,
              'profile.avatar': 1,
              'profile.bio': 1,
              isVerified: 1,
              isCreator: 1,
              socialStats: 1,
              mutualFollowers: 1,
              commonInterests: 1,
              recommendationScore: 1
            }
          }
        ]);
        break;
        
      case 'products':
        // Recommend products based on user preferences and saved items
        const savedProducts = user.savedProducts || [];
        const priceRange = user.preferences.priceRange || { min: 0, max: 10000 };
        
        recommendations = await Product.find({
          _id: { $nin: savedProducts },
          status: 'active',
          currentPrice: { 
            $gte: priceRange.min, 
            $lte: priceRange.max 
          },
          category: { $in: userCategories.length > 0 ? userCategories : ['fashion', 'tech', 'beauty'] }
        })
          .sort({ popularityScore: -1, 'reviewSummary.averageRating': -1 })
          .limit(parseInt(limit));
        break;
        
      case 'hashtags':
        // Recommend hashtags based on user's post history and trending topics
        const userPosts = await Post.find({ author: user._id }).select('hashtags');
        const userHashtags = userPosts.flatMap(post => post.hashtags);
        
        recommendations = await Post.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
              status: 'published'
            }
          },
          { $unwind: '$hashtags' },
          {
            $match: {
              hashtags: { $nin: userHashtags }
            }
          },
          {
            $group: {
              _id: '$hashtags',
              count: { $sum: 1 },
              avgLikes: { $avg: '$likesCount' }
            }
          },
          { $sort: { count: -1, avgLikes: -1 } },
          { $limit: parseInt(limit) },
          {
            $project: {
              hashtag: '$_id',
              popularity: '$count',
              averageLikes: '$avgLikes',
              _id: 0
            }
          }
        ]);
        break;
        
      default:
        return res.status(400).json({
          error: 'Invalid recommendation type. Available: posts, users, products, hashtags'
        });
    }
    
    res.json({
      type,
      recommendations,
      userId: user._id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      error: 'Server error generating recommendations'
    });
  }
});

// Predict post performance
router.post('/predict/engagement', auth, async (req, res) => {
  try {
    const { content, hashtags = [], scheduledTime } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: 'Content is required for engagement prediction'
      });
    }
    
    const user = await User.findById(req.user.userId);
    const userStats = user.socialStats;
    
    // Simple engagement prediction based on various factors
    let baseScore = userStats.averageLikes || 10;
    
    // Content factors
    const wordCount = content.split(' ').length;
    if (wordCount >= 50 && wordCount <= 150) baseScore *= 1.2; // Optimal length
    if (wordCount > 300) baseScore *= 0.8; // Too long
    
    // Hashtag factors
    if (hashtags.length >= 3 && hashtags.length <= 8) baseScore *= 1.15;
    if (hashtags.length > 15) baseScore *= 0.9; // Too many hashtags
    
    // Sentiment factors
    const sentiment = analyzeSentiment(content);
    if (sentiment.sentiment === 'positive') baseScore *= 1.1;
    if (sentiment.sentiment === 'negative') baseScore *= 0.9;
    
    // Timing factors (if scheduled time provided)
    let timingMultiplier = 1;
    if (scheduledTime) {
      const scheduleHour = new Date(scheduledTime).getHours();
      // Peak hours: 9-11 AM, 2-4 PM, 7-9 PM
      if ((scheduleHour >= 9 && scheduleHour <= 11) || 
          (scheduleHour >= 14 && scheduleHour <= 16) || 
          (scheduleHour >= 19 && scheduleHour <= 21)) {
        timingMultiplier = 1.3;
      }
    }
    
    const prediction = {
      predictedLikes: Math.round(baseScore * timingMultiplier),
      predictedComments: Math.round(baseScore * 0.1 * timingMultiplier),
      predictedShares: Math.round(baseScore * 0.05 * timingMultiplier),
      engagementRate: Math.min(15, (baseScore * timingMultiplier) / Math.max(userStats.followersCount, 1) * 100),
      confidence: 0.75, // Placeholder confidence score
      factors: {
        contentLength: wordCount <= 150 ? 'optimal' : wordCount > 300 ? 'too_long' : 'good',
        hashtagUsage: hashtags.length >= 3 && hashtags.length <= 8 ? 'optimal' : 'suboptimal',
        sentiment: sentiment.sentiment,
        timing: timingMultiplier > 1 ? 'peak_hours' : 'off_peak'
      },
      suggestions: []
    };
    
    // Add suggestions
    if (wordCount > 300) {
      prediction.suggestions.push('Consider shortening the content for better engagement');
    }
    if (hashtags.length < 3) {
      prediction.suggestions.push('Add more relevant hashtags to increase discoverability');
    }
    if (timingMultiplier <= 1) {
      prediction.suggestions.push('Consider posting during peak hours (9-11 AM, 2-4 PM, or 7-9 PM)');
    }
    
    res.json({
      prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Engagement prediction error:', error);
    res.status(500).json({
      error: 'Server error predicting engagement'
    });
  }
});

// Get trending topics and insights
router.get('/insights/trending', optionalAuth, async (req, res) => {
  try {
    const { timeRange = '24h', category } = req.query;
    
    let startDate;
    switch (timeRange) {
      case '1h':
        startDate = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    // Trending hashtags
    const trendingHashtags = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'published',
          ...(category && { categories: category })
        }
      },
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
          avgEngagement: { $avg: { $add: ['$likesCount', '$commentsCount'] } }
        }
      },
      { $sort: { count: -1, avgEngagement: -1 } },
      { $limit: 20 }
    ]);
    
    // Trending keywords
    const trendingKeywords = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'published'
        }
      },
      {
        $project: {
          words: { $split: [{ $toLower: '$content' }, ' '] },
          likesCount: 1
        }
      },
      { $unwind: '$words' },
      {
        $match: {
          words: { $regex: /^[a-zA-Z]{4,}$/ } // Only words with 4+ characters
        }
      },
      {
        $group: {
          _id: '$words',
          count: { $sum: 1 },
          avgLikes: { $avg: '$likesCount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);
    
    // Content performance insights
    const contentInsights = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'published'
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgLikes: { $avg: '$likesCount' },
          avgComments: { $avg: '$commentsCount' },
          avgShares: { $avg: '$sharesCount' }
        }
      },
      { $sort: { avgLikes: -1 } }
    ]);
    
    const insights = {
      timeRange,
      category: category || 'all',
      trending: {
        hashtags: trendingHashtags.slice(0, 10),
        keywords: trendingKeywords.slice(0, 10),
        contentTypes: contentInsights
      },
      insights: {
        bestPerformingContentType: contentInsights[0]?._id || 'text',
        topHashtag: trendingHashtags[0]?._id || null,
        avgEngagementIncrease: '15%', // Placeholder
        peakHours: [9, 14, 19] // Placeholder
      },
      recommendations: [
        'Focus on visual content for higher engagement',
        'Use trending hashtags in your niche',
        'Post during peak hours for maximum reach',
        'Keep captions concise and engaging'
      ]
    };
    
    res.json({
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Trending insights error:', error);
    res.status(500).json({
      error: 'Server error retrieving trending insights'
    });
  }
});

// Auto-generate hashtags for content
router.post('/generate/hashtags', auth, async (req, res) => {
  try {
    const { content, category } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: 'Content is required for hashtag generation'
      });
    }
    
    const keywords = extractKeywords(content);
    const existingHashtags = (content.match(/#\w+/g) || []).map(tag => tag.substring(1).toLowerCase());
    
    // Generate hashtags based on keywords and category
    let suggestedHashtags = [];
    
    // Add keyword-based hashtags
    keywords.forEach(keyword => {
      if (!existingHashtags.includes(keyword.toLowerCase())) {
        suggestedHashtags.push(`#${keyword}`);
      }
    });
    
    // Add category-based hashtags
    const categoryHashtags = {
      fashion: ['style', 'ootd', 'fashion', 'trendy', 'outfit'],
      tech: ['technology', 'innovation', 'digital', 'gadgets', 'future'],
      beauty: ['beauty', 'makeup', 'skincare', 'cosmetics', 'glam'],
      lifestyle: ['life', 'motivation', 'inspiration', 'wellness', 'mindset'],
      food: ['food', 'recipe', 'cooking', 'delicious', 'foodie']
    };
    
    if (category && categoryHashtags[category]) {
      categoryHashtags[category].forEach(hashtag => {
        if (!existingHashtags.includes(hashtag) && !suggestedHashtags.includes(`#${hashtag}`)) {
          suggestedHashtags.push(`#${hashtag}`);
        }
      });
    }
    
    // Get popular hashtags from similar content
    const similarPosts = await Post.find({
      $text: { $search: keywords.slice(0, 3).join(' ') },
      status: 'published'
    })
      .select('hashtags')
      .limit(10);
    
    const popularHashtags = {};
    similarPosts.forEach(post => {
      post.hashtags.forEach(hashtag => {
        popularHashtags[hashtag] = (popularHashtags[hashtag] || 0) + 1;
      });
    });
    
    // Add top popular hashtags
    Object.entries(popularHashtags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([hashtag]) => {
        if (!existingHashtags.includes(hashtag.toLowerCase()) && 
            !suggestedHashtags.includes(`#${hashtag}`)) {
          suggestedHashtags.push(`#${hashtag}`);
        }
      });
    
    res.json({
      originalHashtags: existingHashtags.map(tag => `#${tag}`),
      suggestedHashtags: suggestedHashtags.slice(0, 15),
      keywords,
      category: category || 'general'
    });
  } catch (error) {
    console.error('Hashtag generation error:', error);
    res.status(500).json({
      error: 'Server error generating hashtags'
    });
  }
});

module.exports = router;