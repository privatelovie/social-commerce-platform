const express = require('express');
const { auth } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

// Get user's active cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.getActiveCart(req.user.userId);
    
    if (!cart) {
      // Create empty cart
      const newCart = new Cart({
        user: req.user.userId,
        session: { sessionId: req.sessionID }
      });
      await newCart.save();
      return res.json({ cart: newCart });
    }
    
    res.json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      error: 'Server error retrieving cart'
    });
  }
});

// Add item to cart
router.post('/items', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, selectedVariant, notes } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        error: 'Product ID is required'
      });
    }
    
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }
    
    // Check availability
    if (product.availability === 'out_of_stock') {
      return res.status(400).json({
        error: 'Product is out of stock'
      });
    }
    
    // Get or create cart
    const cart = await Cart.getOrCreateCart(req.user.userId, req.sessionID);
    
    // Add item to cart
    await cart.addItem(productId, quantity, {
      price: product.currentPrice,
      selectedVariant,
      notes,
      addedBy: 'user'
    });
    
    // Populate cart with product details
    await cart.populate('items.product', 'name images currentPrice brand availability');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user:${req.user.userId}`).emit('cart_updated', {
      action: 'item_added',
      cart: cart.toObject(),
      product: product.toObject()
    });
    
    res.status(201).json({
      message: 'Item added to cart successfully',
      cart: cart.toObject()
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      error: 'Server error adding item to cart'
    });
  }
});

// Update item quantity in cart
router.put('/items/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, selectedVariant } = req.body;
    
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        error: 'Valid quantity is required'
      });
    }
    
    const cart = await Cart.getActiveCart(req.user.userId);
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found'
      });
    }
    
    // Update item quantity
    await cart.updateItemQuantity(productId, quantity, selectedVariant);
    
    // Populate cart with product details
    await cart.populate('items.product', 'name images currentPrice brand availability');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user:${req.user.userId}`).emit('cart_updated', {
      action: 'quantity_updated',
      cart: cart.toObject(),
      productId,
      quantity
    });
    
    res.json({
      message: 'Item quantity updated successfully',
      cart: cart.toObject()
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      error: 'Server error updating cart item'
    });
  }
});

// Remove item from cart
router.delete('/items/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { selectedVariant } = req.body;
    
    const cart = await Cart.getActiveCart(req.user.userId);
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found'
      });
    }
    
    // Remove item from cart
    await cart.removeItem(productId, selectedVariant);
    
    // Populate cart with product details
    await cart.populate('items.product', 'name images currentPrice brand availability');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user:${req.user.userId}`).emit('cart_updated', {
      action: 'item_removed',
      cart: cart.toObject(),
      productId
    });
    
    res.json({
      message: 'Item removed from cart successfully',
      cart: cart.toObject()
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      error: 'Server error removing item from cart'
    });
  }
});

// Clear entire cart
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.getActiveCart(req.user.userId);
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found'
      });
    }
    
    // Clear cart
    await cart.clearCart();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user:${req.user.userId}`).emit('cart_updated', {
      action: 'cart_cleared',
      cart: cart.toObject()
    });
    
    res.json({
      message: 'Cart cleared successfully',
      cart: cart.toObject()
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      error: 'Server error clearing cart'
    });
  }
});

// Apply discount code
router.post('/discounts', auth, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        error: 'Discount code is required'
      });
    }
    
    const cart = await Cart.getActiveCart(req.user.userId);
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found'
      });
    }
    
    // Mock discount validation (in real app, validate against discount service)
    const discountCodes = {
      'SAVE10': { amount: 10, type: 'percentage', description: '10% off your order' },
      'FREESHIP': { amount: 5, type: 'fixed', description: 'Free shipping' },
      'WELCOME20': { amount: 20, type: 'percentage', description: '20% off for new customers' }
    };
    
    const discount = discountCodes[code.toUpperCase()];
    if (!discount) {
      return res.status(400).json({
        error: 'Invalid discount code'
      });
    }
    
    // Apply discount
    await cart.applyDiscount(code.toUpperCase(), discount.amount, discount.type, discount.description);
    
    // Populate cart with product details
    await cart.populate('items.product', 'name images currentPrice brand availability');
    
    res.json({
      message: 'Discount applied successfully',
      cart: cart.toObject(),
      discount
    });
  } catch (error) {
    console.error('Apply discount error:', error);
    res.status(500).json({
      error: 'Server error applying discount'
    });
  }
});

// Remove discount code
router.delete('/discounts/:code', auth, async (req, res) => {
  try {
    const { code } = req.params;
    
    const cart = await Cart.getActiveCart(req.user.userId);
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found'
      });
    }
    
    // Remove discount
    await cart.removeDiscount(code);
    
    // Populate cart with product details
    await cart.populate('items.product', 'name images currentPrice brand availability');
    
    res.json({
      message: 'Discount removed successfully',
      cart: cart.toObject()
    });
  } catch (error) {
    console.error('Remove discount error:', error);
    res.status(500).json({
      error: 'Server error removing discount'
    });
  }
});

// Save item for later
router.post('/save-for-later', auth, async (req, res) => {
  try {
    const { productId, selectedVariant } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        error: 'Product ID is required'
      });
    }
    
    const cart = await Cart.getActiveCart(req.user.userId);
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found'
      });
    }
    
    // Save item for later
    await cart.saveItemForLater(productId, selectedVariant);
    
    // Populate cart with product details
    await cart.populate([
      { path: 'items.product', select: 'name images currentPrice brand availability' },
      { path: 'savedItems.product', select: 'name images currentPrice brand availability' }
    ]);
    
    res.json({
      message: 'Item saved for later successfully',
      cart: cart.toObject()
    });
  } catch (error) {
    console.error('Save for later error:', error);
    res.status(500).json({
      error: 'Server error saving item for later'
    });
  }
});

// Move saved item back to cart
router.post('/move-to-cart', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        error: 'Product ID is required'
      });
    }
    
    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }
    
    const cart = await Cart.getActiveCart(req.user.userId);
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found'
      });
    }
    
    // Add item back to cart
    await cart.addItem(productId, quantity, {
      price: product.currentPrice,
      addedBy: 'saved_item'
    });
    
    // Remove from saved items
    await cart.moveSavedItemToCart(productId, quantity);
    
    // Populate cart with product details
    await cart.populate([
      { path: 'items.product', select: 'name images currentPrice brand availability' },
      { path: 'savedItems.product', select: 'name images currentPrice brand availability' }
    ]);
    
    res.json({
      message: 'Item moved to cart successfully',
      cart: cart.toObject()
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      error: 'Server error moving item to cart'
    });
  }
});

// Start checkout process
router.post('/checkout', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    const cart = await Cart.getActiveCart(req.user.userId);
    if (!cart || cart.isEmpty) {
      return res.status(400).json({
        error: 'Cart is empty or not found'
      });
    }
    
    // Start checkout
    await cart.startCheckout();
    
    // Update shipping address if provided
    if (shippingAddress) {
      cart.checkout.shippingAddress = shippingAddress;
      await cart.save();
    }
    
    // Calculate tax and shipping (mock implementation)
    const taxRate = 0.08; // 8% tax
    cart.tax = cart.subtotal * taxRate;
    cart.shipping.cost = cart.subtotal >= 50 ? 0 : 9.99; // Free shipping over $50
    cart.shipping.method = cart.shipping.cost === 0 ? 'Free Standard Shipping' : 'Standard Shipping';
    cart.shipping.estimatedDays = 3;
    
    await cart.save();
    
    // Populate cart with product details
    await cart.populate('items.product', 'name images currentPrice brand availability');
    
    res.json({
      message: 'Checkout started successfully',
      cart: cart.toObject(),
      checkoutUrl: `/checkout/${cart._id}` // Mock checkout URL
    });
  } catch (error) {
    console.error('Start checkout error:', error);
    res.status(500).json({
      error: 'Server error starting checkout'
    });
  }
});

// Share cart with another user
router.post('/share', auth, async (req, res) => {
  try {
    const { userId, permissions = {} } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }
    
    // Verify target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    const cart = await Cart.getActiveCart(req.user.userId);
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found'
      });
    }
    
    // Share cart
    await cart.shareWith(userId, permissions);
    
    // Populate cart with product details
    await cart.populate([
      { path: 'items.product', select: 'name images currentPrice brand availability' },
      { path: 'sharedWith.user', select: 'username displayName avatar' }
    ]);
    
    // Emit real-time notification to shared user
    const io = req.app.get('io');
    io.to(`user:${userId}`).emit('cart_shared_with_you', {
      cart: cart.toObject(),
      sharedBy: {
        id: req.user.userId,
        username: req.user.username,
        displayName: req.user.displayName
      }
    });
    
    res.json({
      message: 'Cart shared successfully',
      cart: cart.toObject()
    });
  } catch (error) {
    console.error('Share cart error:', error);
    res.status(500).json({
      error: 'Server error sharing cart'
    });
  }
});

// Get shared carts (carts shared with current user)
router.get('/shared', auth, async (req, res) => {
  try {
    const carts = await Cart.find({
      'sharedWith.user': req.user.userId,
      status: 'active'
    })
    .populate('user', 'username displayName avatar')
    .populate('items.product', 'name images currentPrice brand availability')
    .populate('sharedWith.user', 'username displayName avatar')
    .sort({ updatedAt: -1 });
    
    res.json({
      carts,
      total: carts.length
    });
  } catch (error) {
    console.error('Get shared carts error:', error);
    res.status(500).json({
      error: 'Server error retrieving shared carts'
    });
  }
});

// Get cart analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const cart = await Cart.getActiveCart(req.user.userId);
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found'
      });
    }
    
    // Get abandoned carts for comparison
    const abandonedCarts = await Cart.getAbandonedCarts(7); // Last 7 days
    
    const analytics = {
      current: {
        totalItems: cart.totalItems,
        uniqueItems: cart.uniqueItems,
        subtotal: cart.subtotal,
        total: cart.total,
        conversionEvents: cart.analytics.conversionEvents,
        timeInCart: cart.analytics.timeSpent
      },
      historical: {
        abandonedCartsCount: abandonedCarts.length,
        averageCartValue: abandonedCarts.reduce((sum, c) => sum + c.total, 0) / abandonedCarts.length || 0,
        mostAddedProducts: [], // Would be calculated from analytics
        peakShoppingTimes: [] // Would be calculated from session data
      }
    };
    
    res.json({ analytics });
  } catch (error) {
    console.error('Get cart analytics error:', error);
    res.status(500).json({
      error: 'Server error retrieving cart analytics'
    });
  }
});

module.exports = router;