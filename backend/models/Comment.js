const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['like', 'love', 'laugh', 'angry', 'sad', 'wow'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { _id: false, timestamps: true });

const moderationSchema = new mongoose.Schema({
  flagged: { type: Boolean, default: false },
  flagReason: { 
    type: String, 
    enum: ['spam', 'harassment', 'hate_speech', 'inappropriate', 'misinformation', 'other']
  },
  moderationScore: { type: Number, default: 0 }, // AI confidence score 0-100
  autoModerated: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  status: { 
    type: String, 
    enum: ['approved', 'pending', 'rejected', 'hidden'],
    default: 'approved'
  }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  // Content
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Relationships
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  
  // Threading support
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment', // Points to root comment of thread
    default: null
  },
  depth: {
    type: Number,
    default: 0,
    max: 5 // Limit thread depth
  },
  
  // Engagement
  reactions: [reactionSchema],
  replyCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  
  // Status
  status: {
    type: String,
    enum: ['published', 'deleted', 'hidden', 'pending_review'],
    default: 'published'
  },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  
  // Media attachments (limited for comments)
  media: [{
    type: { type: String, enum: ['image', 'gif'] },
    url: { type: String, required: true },
    width: { type: Number },
    height: { type: Number }
  }],
  
  // Mentions in comment
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // AI Analysis and Moderation
  aiAnalysis: {
    sentiment: { 
      type: String, 
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    sentimentScore: { type: Number, default: 0 }, // -1 to 1
    toxicityScore: { type: Number, default: 0 }, // 0-1
    topics: [{ type: String }],
    language: { type: String, default: 'en' },
    qualityScore: { type: Number, default: 0 }, // 0-100
    isSpam: { type: Boolean, default: false },
    spamConfidence: { type: Number, default: 0 }
  },
  
  // Moderation
  moderation: moderationSchema,
  
  // Engagement tracking
  engagement: {
    views: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    helpfulVotes: { type: Number, default: 0 }
  },
  
  // Pinned comment (for post authors/moderators)
  isPinned: { type: Boolean, default: false },
  pinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pinnedAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });
commentSchema.index({ thread: 1, depth: 1, createdAt: 1 });
commentSchema.index({ status: 1, 'moderation.status': 1 });
commentSchema.index({ isPinned: 1, post: 1 });
commentSchema.index({ 'aiAnalysis.toxicityScore': -1 });

// Virtual for total reactions count
commentSchema.virtual('reactionsCount').get(function() {
  return this.reactions.length;
});

// Virtual for time ago display
commentSchema.virtual('timeAgo').get(function() {
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

// Virtual for nested replies (populated separately)
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Method to add reaction
commentSchema.methods.addReaction = async function(userId, reactionType) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({
    type: reactionType,
    user: userId
  });
  
  // Update like count (for backwards compatibility)
  this.likesCount = this.reactions.filter(r => r.type === 'like').length;
  
  return this.save();
};

// Method to remove reaction
commentSchema.methods.removeReaction = async function(userId) {
  this.reactions = this.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString()
  );
  
  this.likesCount = this.reactions.filter(r => r.type === 'like').length;
  
  return this.save();
};

// Method to get reaction breakdown
commentSchema.methods.getReactionBreakdown = function() {
  const breakdown = {
    like: 0,
    love: 0,
    laugh: 0,
    angry: 0,
    sad: 0,
    wow: 0
  };
  
  this.reactions.forEach(reaction => {
    breakdown[reaction.type]++;
  });
  
  return breakdown;
};

// Method to flag comment for moderation
commentSchema.methods.flag = async function(reason, reporterId) {
  this.moderation.flagged = true;
  this.moderation.flagReason = reason;
  this.moderation.status = 'pending';
  this.engagement.reportCount += 1;
  
  // If toxicity score is high or multiple reports, auto-hide
  if (this.aiAnalysis.toxicityScore > 0.8 || this.engagement.reportCount >= 3) {
    this.moderation.status = 'hidden';
    this.status = 'hidden';
  }
  
  return this.save();
};

// Method to moderate comment (admin/moderator action)
commentSchema.methods.moderate = async function(action, moderatorId, reason = null) {
  this.moderation.reviewedBy = moderatorId;
  this.moderation.reviewedAt = new Date();
  this.moderation.status = action;
  
  switch (action) {
    case 'approved':
      this.status = 'published';
      break;
    case 'rejected':
    case 'hidden':
      this.status = 'hidden';
      break;
  }
  
  if (reason) {
    this.moderation.flagReason = reason;
  }
  
  return this.save();
};

// Static method to get comment thread
commentSchema.statics.getThread = function(commentId, options = {}) {
  const { maxDepth = 3, limit = 50 } = options;
  
  return this.aggregate([
    { $match: { 
      $or: [
        { _id: mongoose.Types.ObjectId(commentId) },
        { thread: mongoose.Types.ObjectId(commentId) }
      ],
      status: { $ne: 'deleted' }
    }},
    { $sort: { depth: 1, createdAt: 1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [
          { $project: { username: 1, displayName: 1, avatar: 1, isVerified: 1 } }
        ]
      }
    },
    { $unwind: '$author' }
  ]);
};

// Static method to get post comments with pagination
commentSchema.statics.getPostComments = function(postId, options = {}) {
  const { 
    page = 1, 
    limit = 20, 
    sortBy = 'createdAt',
    sortOrder = -1,
    includeReplies = false 
  } = options;
  
  const skip = (page - 1) * limit;
  const query = {
    post: mongoose.Types.ObjectId(postId),
    status: { $in: ['published'] }
  };
  
  // Only get top-level comments if not including replies
  if (!includeReplies) {
    query.parentComment = null;
  }
  
  return this.find(query)
    .populate('author', 'username displayName avatar isVerified')
    .populate('mentions', 'username displayName')
    .sort({ isPinned: -1, [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip);
};

// Static method to search comments
commentSchema.statics.searchComments = function(query, options = {}) {
  const { 
    postId = null,
    userId = null,
    limit = 20,
    skip = 0 
  } = options;
  
  const searchQuery = {
    content: { $regex: query, $options: 'i' },
    status: 'published'
  };
  
  if (postId) searchQuery.post = mongoose.Types.ObjectId(postId);
  if (userId) searchQuery.author = mongoose.Types.ObjectId(userId);
  
  return this.find(searchQuery)
    .populate('author', 'username displayName avatar')
    .populate('post', 'content author')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Pre-save middleware to update thread info and reply counts
commentSchema.pre('save', async function(next) {
  // Set thread reference for nested comments
  if (this.isNew && this.parentComment) {
    const parentComment = await this.constructor.findById(this.parentComment);
    if (parentComment) {
      this.thread = parentComment.thread || parentComment._id;
      this.depth = parentComment.depth + 1;
      
      // Update parent's reply count
      await this.constructor.findByIdAndUpdate(
        this.parentComment,
        { $inc: { replyCount: 1 } }
      );
    }
  }
  
  // Set thread to self if this is a root comment
  if (this.isNew && !this.parentComment) {
    this.thread = this._id;
  }
  
  next();
});

// Post-save middleware to update post's comment count
commentSchema.post('save', async function(doc) {
  if (doc.status === 'published') {
    const Post = mongoose.model('Post');
    const commentCount = await doc.constructor.countDocuments({
      post: doc.post,
      status: 'published'
    });
    
    await Post.findByIdAndUpdate(doc.post, {
      commentsCount: commentCount
    });
  }
});

// Pre-remove middleware to update counts
commentSchema.pre('remove', async function(next) {
  // Update parent comment reply count
  if (this.parentComment) {
    await this.constructor.findByIdAndUpdate(
      this.parentComment,
      { $inc: { replyCount: -1 } }
    );
  }
  
  // Update post comment count
  const Post = mongoose.model('Post');
  await Post.findByIdAndUpdate(this.post, {
    $inc: { commentsCount: -1 }
  });
  
  next();
});

module.exports = mongoose.model('Comment', commentSchema);