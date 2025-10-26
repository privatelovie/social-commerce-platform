const express = require('express');
const { auth } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

const router = express.Router();

// Get user conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const conversations = await Message.getUserConversations(req.user.userId, {
      limit: parseInt(limit),
      skip
    });
    
    res.json({
      conversations,
      hasMore: conversations.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      error: 'Server error retrieving conversations'
    });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    const skip = (page - 1) * limit;
    
    // Verify user is part of this conversation
    const [userId1, userId2] = conversationId.split('_');
    if (!userId1 || !userId2 || 
        (userId1 !== req.user.userId && userId2 !== req.user.userId)) {
      return res.status(403).json({
        error: 'Access denied to this conversation'
      });
    }
    
    const messages = await Message.getConversationMessages(conversationId, {
      limit: parseInt(limit),
      skip,
      before: before ? new Date(before) : undefined
    });
    
    // Mark messages as read
    await Message.markAsRead(conversationId, req.user.userId);
    
    // Emit real-time update for message status
    const io = req.app.get('io');
    io.to(`user:${userId1 === req.user.userId ? userId2 : userId1}`).emit('messages_read', {
      conversationId,
      readBy: req.user.userId
    });
    
    res.json({
      messages,
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'Server error retrieving messages'
    });
  }
});

// Send a message
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, content, messageType = 'text', replyTo, sharedContent } = req.body;
    
    if (!recipientId || !content) {
      return res.status(400).json({
        error: 'Recipient and content are required'
      });
    }
    
    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        error: 'Recipient not found'
      });
    }
    
    // Generate conversation ID
    const conversationId = Message.generateConversationId(req.user.userId, recipientId);
    
    // Create message
    const message = new Message({
      sender: req.user.userId,
      recipient: recipientId,
      conversationId,
      content,
      messageType,
      replyTo,
      sharedContent
    });
    
    await message.save();
    
    // Populate sender and recipient info
    await message.populate([
      { path: 'sender', select: 'username displayName avatar isVerified' },
      { path: 'recipient', select: 'username displayName avatar isVerified' },
      { path: 'sharedContent.product', select: 'name images currentPrice brand' },
      { path: 'replyTo', select: 'content sender messageType' }
    ]);
    
    // Emit real-time message
    const io = req.app.get('io');
    io.to(`user:${recipientId}`).emit('new_message', {
      message,
      conversationId
    });
    
    // Mark as delivered if recipient is online
    // This would be enhanced with actual online status tracking
    setTimeout(async () => {
      await Message.markAsDelivered(conversationId, recipientId);
      io.to(`user:${req.user.userId}`).emit('message_delivered', {
        messageId: message._id,
        conversationId
      });
    }, 1000);
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Server error sending message'
    });
  }
});

// Share cart with user
router.post('/share-cart', auth, async (req, res) => {
  try {
    const { recipientId, cartId, message: customMessage } = req.body;
    
    if (!recipientId) {
      return res.status(400).json({
        error: 'Recipient is required'
      });
    }
    
    // Get user's cart
    const cart = cartId 
      ? await Cart.findOne({ _id: cartId, user: req.user.userId })
      : await Cart.getActiveCart(req.user.userId);
    
    if (!cart || cart.isEmpty) {
      return res.status(400).json({
        error: 'No cart found or cart is empty'
      });
    }
    
    // Populate cart items
    await cart.populate('items.product', 'name images currentPrice brand');
    
    // Create cart sharing message
    const conversationId = Message.generateConversationId(req.user.userId, recipientId);
    
    const message = new Message({
      sender: req.user.userId,
      recipient: recipientId,
      conversationId,
      content: customMessage || `Check out my cart! 🛒 ${cart.totalItems} items for $${cart.total.toFixed(2)}`,
      messageType: 'cart',
      sharedContent: {
        cart: {
          items: cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.price * item.quantity
          })),
          totalAmount: cart.total,
          currency: cart.currency
        }
      }
    });
    
    await message.save();
    
    // Populate message data
    await message.populate([
      { path: 'sender', select: 'username displayName avatar isVerified' },
      { path: 'recipient', select: 'username displayName avatar isVerified' },
      { path: 'sharedContent.cart.items.product', select: 'name images currentPrice brand' }
    ]);
    
    // Share cart with recipient
    await cart.shareWith(recipientId, { canView: true });
    
    // Emit real-time message
    const io = req.app.get('io');
    io.to(`user:${recipientId}`).emit('cart_shared', {
      message,
      cart: cart.toObject()
    });
    
    res.status(201).json({
      message: 'Cart shared successfully',
      data: message
    });
  } catch (error) {
    console.error('Share cart error:', error);
    res.status(500).json({
      error: 'Server error sharing cart'
    });
  }
});

// Share product with user
router.post('/share-product', auth, async (req, res) => {
  try {
    const { recipientId, productId, message: customMessage } = req.body;
    
    if (!recipientId || !productId) {
      return res.status(400).json({
        error: 'Recipient and product are required'
      });
    }
    
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }
    
    // Create product sharing message
    const conversationId = Message.generateConversationId(req.user.userId, recipientId);
    
    const message = new Message({
      sender: req.user.userId,
      recipient: recipientId,
      conversationId,
      content: customMessage || `Check out this product! 🔥 ${product.name}`,
      messageType: 'product',
      sharedContent: {
        product: productId
      }
    });
    
    await message.save();
    
    // Populate message data
    await message.populate([
      { path: 'sender', select: 'username displayName avatar isVerified' },
      { path: 'recipient', select: 'username displayName avatar isVerified' },
      { path: 'sharedContent.product', select: 'name images currentPrice brand description' }
    ]);
    
    // Emit real-time message
    const io = req.app.get('io');
    io.to(`user:${recipientId}`).emit('product_shared', {
      message,
      product: product.toObject()
    });
    
    res.status(201).json({
      message: 'Product shared successfully',
      data: message
    });
  } catch (error) {
    console.error('Share product error:', error);
    res.status(500).json({
      error: 'Server error sharing product'
    });
  }
});

// Add reaction to message
router.post('/:messageId/reactions', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({
        error: 'Emoji is required'
      });
    }
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Message not found'
      });
    }
    
    // Check if user is part of the conversation
    if (message.sender.toString() !== req.user.userId && 
        message.recipient.toString() !== req.user.userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }
    
    // Toggle reaction
    const hasReacted = message.hasUserReacted(req.user.userId, emoji);
    if (hasReacted) {
      await message.removeReaction(req.user.userId, emoji);
    } else {
      await message.addReaction(req.user.userId, emoji);
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    const otherUserId = message.sender.toString() === req.user.userId 
      ? message.recipient.toString() 
      : message.sender.toString();
      
    io.to(`user:${otherUserId}`).emit('message_reaction', {
      messageId,
      emoji,
      userId: req.user.userId,
      action: hasReacted ? 'removed' : 'added',
      reactionCounts: message.reactionCounts
    });
    
    res.json({
      message: hasReacted ? 'Reaction removed' : 'Reaction added',
      reactionCounts: message.reactionCounts
    });
  } catch (error) {
    console.error('Message reaction error:', error);
    res.status(500).json({
      error: 'Server error updating reaction'
    });
  }
});

// Edit message
router.put('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: 'Content is required'
      });
    }
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Message not found'
      });
    }
    
    // Only sender can edit their own messages
    if (message.sender.toString() !== req.user.userId) {
      return res.status(403).json({
        error: 'You can only edit your own messages'
      });
    }
    
    // Edit message
    await message.editMessage(content);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user:${message.recipient}`).emit('message_edited', {
      messageId,
      newContent: content,
      editedAt: message.editedAt
    });
    
    res.json({
      message: 'Message edited successfully',
      data: {
        content: message.content,
        isEdited: message.isEdited,
        editedAt: message.editedAt
      }
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      error: 'Server error editing message'
    });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Message not found'
      });
    }
    
    // Only sender can delete their own messages
    if (message.sender.toString() !== req.user.userId) {
      return res.status(403).json({
        error: 'You can only delete your own messages'
      });
    }
    
    // Soft delete message
    await message.deleteMessage(req.user.userId);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user:${message.recipient}`).emit('message_deleted', {
      messageId,
      deletedAt: message.deletedAt
    });
    
    res.json({
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      error: 'Server error deleting message'
    });
  }
});

// Search messages
router.get('/search', auth, async (req, res) => {
  try {
    const { q: query, conversationId, limit = 20, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }
    
    const skip = (page - 1) * limit;
    let searchFilter = {
      $or: [
        { sender: req.user.userId },
        { recipient: req.user.userId }
      ],
      content: { $regex: query, $options: 'i' },
      isDeleted: false
    };
    
    if (conversationId) {
      searchFilter.conversationId = conversationId;
    }
    
    const messages = await Message.find(searchFilter)
      .populate('sender', 'username displayName avatar')
      .populate('recipient', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    res.json({
      messages,
      query,
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      error: 'Server error searching messages'
    });
  }
});

module.exports = router;