const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

const router = express.Router();

// Get feed posts (authenticated user's personalized feed)
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, algorithm = 'chronological' } = req.query;
    const skip = (page - 1) * limit;

    // Get user's following list
    const user = await User.findById(req.user.userId);
    const followingIds = user.following.map(f => f.user);

    let posts;
    
    if (algorithm === 'trending') {
      // Algorithmic feed with trending content
      posts = await Post.aggregate([
        {
          $match: {
            $or: [
              { author: { $in: [user._id, ...followingIds] } },
              { 
                trendingScore: { $gte: 10 },
                status: 'published',
                visibility: 'public'
              }
            ]
          }
        },
        {
          $addFields: {
            isFollowing: { $in: ['$author', followingIds] },
            ageHours: { 
              $divide: [{ $subtract: [new Date(), '$createdAt'] }, 3600000] 
            }
          }
        },
        {
          $addFields: {
            feedScore: {
              $add: [
                { $cond: [{ $lte: ['$ageHours', 24] }, 10, 0] },
                { $cond: ['$isFollowing', 20, 0] },
                { $multiply: ['$trendingScore', 0.5] },
                { $multiply: ['$likesCount', 0.1] }
              ]
            }
          }
        },
        { $sort: { feedScore: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
            pipeline: [
              { $project: { username: 1, displayName: 1, avatar: 1, isVerified: 1, isCreator: 1 } }
            ]
          }
        },
        { $unwind: '$author' }
      ]);
    } else {
      // Chronological feed
      posts = await Post.getFeed(user._id, followingIds, {
        limit: parseInt(limit),
        skip
      });
    }

    // Add user interaction data
    const postsWithInteractions = posts.map(post => ({
      ...post.toObject(),
      isLiked: post.likes.includes(req.user.userId),
      isSaved: user.savedPosts.includes(post._id)
    }));

    res.json({
      posts: postsWithInteractions,
      hasMore: posts.length === parseInt(limit),
      algorithm
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({
      error: 'Server error retrieving feed'
    });
  }
});

// Get trending posts
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const { category, timeFrame = 24, limit = 20 } = req.query;
    
    const posts = await Post.getTrending({
      category,
      timeFrame: parseInt(timeFrame),
      limit: parseInt(limit)
    });

    const postsWithInteractions = req.user ? posts.map(post => ({
      ...post.toObject(),
      isLiked: post.likes.includes(req.user.userId)
    })) : posts;

    res.json({
      posts: postsWithInteractions
    });
  } catch (error) {
    console.error('Trending posts error:', error);
    res.status(500).json({
      error: 'Server error retrieving trending posts'
    });
  }
});

// Search posts
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { 
      q: query, 
      category, 
      sortBy = 'relevance',
      page = 1, 
      limit = 20 
    } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const skip = (page - 1) * limit;
    const filters = {};
    
    if (category) {
      filters.categories = category;
    }

    const posts = await Post.searchPosts(query, {
      filters,
      sortBy,
      limit: parseInt(limit),
      skip
    });

    const postsWithInteractions = req.user ? posts.map(post => ({
      ...post.toObject(),
      isLiked: post.likes.includes(req.user.userId)
    })) : posts;

    res.json({
      posts: postsWithInteractions,
      query,
      hasMore: posts.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({
      error: 'Server error searching posts'
    });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username displayName avatar isVerified isCreator')
      .populate('products.productId')
      .populate('mentions', 'username displayName avatar');

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    // Check visibility
    if (post.visibility === 'private' || post.status !== 'published') {
      if (!req.user || post.author._id.toString() !== req.user.userId) {
        return res.status(404).json({
          error: 'Post not found'
        });
      }
    }

    // Increment view count
    if (req.user && post.author._id.toString() !== req.user.userId) {
      await post.addView(req.user.userId);
    }

    const postWithInteractions = {
      ...post.toObject(),
      isLiked: req.user ? post.likes.includes(req.user.userId) : false,
      isSaved: req.user ? (await User.findById(req.user.userId)).savedPosts.includes(post._id) : false
    };

    res.json({
      post: postWithInteractions
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      error: 'Server error retrieving post'
    });
  }
});

// Create new post
router.post('/', auth, async (req, res) => {
  try {
    const {
      content,
      media = [],
      products = [],
      type = 'text',
      visibility = 'public',
      location,
      hashtags = [],
      mentions = [],
      categories = [],
      scheduledFor
    } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Post content is required'
      });
    }

    const post = new Post({
      author: req.user.userId,
      content: content.trim(),
      media,
      products,
      type,
      visibility,
      location,
      hashtags: hashtags.map(tag => tag.toLowerCase()),
      mentions,
      categories,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      publishedAt: scheduledFor ? null : new Date()
    });

    await post.save();

    // Populate author info
    await post.populate('author', 'username displayName avatar isVerified isCreator');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      error: 'Server error creating post'
    });
  }
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({
        error: 'You can only edit your own posts'
      });
    }

    const {
      content,
      media,
      products,
      visibility,
      location,
      hashtags,
      mentions,
      categories
    } = req.body;

    // Update fields
    if (content !== undefined) post.content = content.trim();
    if (media !== undefined) post.media = media;
    if (products !== undefined) post.products = products;
    if (visibility !== undefined) post.visibility = visibility;
    if (location !== undefined) post.location = location;
    if (hashtags !== undefined) post.hashtags = hashtags.map(tag => tag.toLowerCase());
    if (mentions !== undefined) post.mentions = mentions;
    if (categories !== undefined) post.categories = categories;

    await post.save();
    await post.populate('author', 'username displayName avatar isVerified isCreator');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      error: 'Server error updating post'
    });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    // Check ownership or admin rights
    if (post.author.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'You can only delete your own posts'
      });
    }

    // Soft delete - mark as deleted
    post.status = 'deleted';
    await post.save();

    res.json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      error: 'Server error deleting post'
    });
  }
});

// Like/unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    await post.toggleLike(req.user.userId);

    res.json({
      message: 'Like status updated',
      likesCount: post.likesCount,
      isLiked: post.likes.includes(req.user.userId)
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      error: 'Server error updating like status'
    });
  }
});

// Save/unsave post
router.post('/:id/save', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    const user = await User.findById(req.user.userId);
    const savedIndex = user.savedPosts.indexOf(req.params.id);

    if (savedIndex > -1) {
      user.savedPosts.splice(savedIndex, 1);
      post.savesCount = Math.max(0, post.savesCount - 1);
    } else {
      user.savedPosts.push(req.params.id);
      post.savesCount += 1;
    }

    await user.save();
    await post.save();

    res.json({
      message: 'Save status updated',
      savesCount: post.savesCount,
      isSaved: savedIndex === -1
    });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({
      error: 'Server error updating save status'
    });
  }
});

// Share post
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { platform = 'copy' } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    await post.addShare(req.user.userId, platform);

    res.json({
      message: 'Share recorded',
      sharesCount: post.sharesCount
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      error: 'Server error recording share'
    });
  }
});

// Get post comments
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt' } = req.query;
    
    const comments = await Comment.getPostComments(req.params.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy
    });

    res.json({
      comments,
      hasMore: comments.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      error: 'Server error retrieving comments'
    });
  }
});

// Add comment to post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content, parentComment = null, media = [] } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Comment content is required'
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    const comment = new Comment({
      content: content.trim(),
      author: req.user.userId,
      post: req.params.id,
      parentComment,
      media
    });

    await comment.save();
    await comment.populate('author', 'username displayName avatar isVerified');

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      error: 'Server error adding comment'
    });
  }
});

// Get user's posts
router.get('/user/:username', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const query = {
      author: user._id,
      status: 'published'
    };

    // Show private posts only to the owner
    if (!req.user || req.user.userId !== user._id.toString()) {
      query.visibility = { $in: ['public'] };
    } else {
      query.visibility = { $in: ['public', 'followers', 'private'] };
    }

    const posts = await Post.find(query)
      .populate('author', 'username displayName avatar isVerified isCreator')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const postsWithInteractions = req.user ? posts.map(post => ({
      ...post.toObject(),
      isLiked: post.likes.includes(req.user.userId)
    })) : posts;

    res.json({
      posts: postsWithInteractions,
      hasMore: posts.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      error: 'Server error retrieving user posts'
    });
  }
});

module.exports = router;