const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  // Basic Message Info
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  
  // Content
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file', 'cart', 'product', 'post'],
    default: 'text'
  },
  
  // Media attachments
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'file']
    },
    url: { type: String, required: true },
    filename: { type: String },
    size: { type: Number },
    mimeType: { type: String }
  }],
  
  // Special content types
  sharedContent: {
    cart: {
      items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
        totalPrice: { type: Number, required: true }
      }],
      totalAmount: { type: Number },
      currency: { type: String, default: 'USD' }
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
  },
  
  // Reply functionality
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readAt: { type: Date },
  deliveredAt: { type: Date },
  
  // Reactions
  reactions: [reactionSchema],
  
  // Message flags
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  originalContent: { type: String },
  
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Moderation
  isReported: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ status: 1, recipient: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for reaction counts
messageSchema.virtual('reactionCounts').get(function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
  });
  return counts;
});

// Virtual for has user reacted
messageSchema.methods.hasUserReacted = function(userId, emoji) {
  return this.reactions.some(reaction => 
    reaction.user.toString() === userId.toString() && 
    reaction.emoji === emoji
  );
};

// Generate conversation ID from two user IDs
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Get messages for a conversation
messageSchema.statics.getConversationMessages = function(conversationId, options = {}) {
  const { limit = 50, skip = 0, before } = options;
  
  let query = { 
    conversationId,
    isDeleted: false
  };
  
  if (before) {
    query.createdAt = { $lt: before };
  }
  
  return this.find(query)
    .populate('sender', 'username displayName avatar isVerified')
    .populate('recipient', 'username displayName avatar isVerified')
    .populate('sharedContent.product', 'name images currentPrice brand')
    .populate('sharedContent.post', 'content media author')
    .populate('replyTo', 'content sender messageType')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Get user conversations with last message
messageSchema.statics.getUserConversations = async function(userId, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  // Get all conversations for the user
  const conversations = await this.aggregate([
    {
      $match: {
        $or: [{ sender: mongoose.Types.ObjectId(userId) }, { recipient: mongoose.Types.ObjectId(userId) }],
        isDeleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$sender', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$status', 'delivered'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.sender',
        foreignField: '_id',
        as: 'lastMessage.senderInfo'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.recipient',
        foreignField: '_id',
        as: 'lastMessage.recipientInfo'
      }
    }
  ]);
  
  return conversations;
};

// Mark messages as read
messageSchema.statics.markAsRead = async function(conversationId, userId) {
  return this.updateMany(
    {
      conversationId,
      recipient: userId,
      status: { $in: ['sent', 'delivered'] }
    },
    {
      status: 'read',
      readAt: new Date()
    }
  );
};

// Mark messages as delivered
messageSchema.statics.markAsDelivered = async function(conversationId, userId) {
  return this.updateMany(
    {
      conversationId,
      recipient: userId,
      status: 'sent'
    },
    {
      status: 'delivered',
      deliveredAt: new Date()
    }
  );
};

// Add reaction to message
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji,
    createdAt: new Date()
  });
  
  return this.save();
};

// Remove reaction from message
messageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(r => 
    !(r.user.toString() === userId.toString() && r.emoji === emoji)
  );
  
  return this.save();
};

// Edit message
messageSchema.methods.editMessage = function(newContent) {
  this.originalContent = this.originalContent || this.content;
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  
  return this.save();
};

// Soft delete message
messageSchema.methods.deleteMessage = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  
  return this.save();
};

module.exports = mongoose.model('Message', messageSchema);