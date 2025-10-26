const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  selectedVariant: {
    size: { type: String },
    color: { type: String },
    style: { type: String },
    sku: { type: String }
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: String,
    enum: ['user', 'recommendation', 'social_share', 'wishlist'],
    default: 'user'
  },
  notes: {
    type: String,
    maxlength: 200
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  // Cart Owner
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Cart Items
  items: [cartItemSchema],
  
  // Cart Status
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted', 'saved'],
    default: 'active'
  },
  
  // Pricing Information
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    cost: { type: Number, default: 0 },
    method: { type: String },
    estimatedDays: { type: Number }
  },
  discounts: [{
    code: { type: String },
    amount: { type: Number },
    type: { type: String, enum: ['percentage', 'fixed'] },
    description: { type: String }
  }],
  totalDiscount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  
  // Cart Metadata
  session: {
    sessionId: { type: String },
    deviceInfo: {
      userAgent: { type: String },
      platform: { type: String },
      isMobile: { type: Boolean }
    },
    location: {
      country: { type: String },
      region: { type: String },
      city: { type: String }
    }
  },
  
  // Social Features
  isShared: { type: Boolean, default: false },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sharedAt: { type: Date, default: Date.now },
    permissions: {
      canView: { type: Boolean, default: true },
      canEdit: { type: Boolean, default: false },
      canPurchase: { type: Boolean, default: false }
    }
  }],
  visibility: {
    type: String,
    enum: ['private', 'friends', 'public'],
    default: 'private'
  },
  
  // Analytics
  analytics: {
    totalViews: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // in minutes
    bounceRate: { type: Number, default: 0 },
    conversionEvents: [{
      event: { type: String }, // 'item_added', 'item_removed', 'checkout_started', etc.
      timestamp: { type: Date, default: Date.now },
      metadata: { type: mongoose.Schema.Types.Mixed }
    }]
  },
  
  // Saved for later
  savedItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    savedAt: { type: Date, default: Date.now },
    notes: { type: String }
  }],
  
  // Cart expiration
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  
  // Checkout information
  checkout: {
    isStarted: { type: Boolean, default: false },
    startedAt: { type: Date },
    completedAt: { type: Date },
    orderId: { type: String },
    paymentMethod: { type: String },
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
cartSchema.index({ user: 1, status: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
cartSchema.index({ 'items.product': 1 });
cartSchema.index({ createdAt: -1 });

// Virtual for total item count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for unique item count
cartSchema.virtual('uniqueItems').get(function() {
  return this.items.length;
});

// Virtual for is empty
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Calculate total discount
  this.totalDiscount = this.discounts.reduce((total, discount) => {
    if (discount.type === 'percentage') {
      return total + (this.subtotal * discount.amount / 100);
    } else {
      return total + discount.amount;
    }
  }, 0);
  
  // Calculate total
  this.total = this.subtotal - this.totalDiscount + this.tax + this.shipping.cost;
  
  next();
});

// Add item to cart
cartSchema.methods.addItem = function(productId, quantity = 1, options = {}) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedVariant) === JSON.stringify(options.selectedVariant || {})
  );
  
  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      price: options.price,
      selectedVariant: options.selectedVariant || {},
      addedBy: options.addedBy || 'user',
      notes: options.notes
    });
  }
  
  // Track analytics event
  this.analytics.conversionEvents.push({
    event: 'item_added',
    metadata: { productId, quantity, ...options }
  });
  
  return this.save();
};

// Remove item from cart
cartSchema.methods.removeItem = function(productId, variant = {}) {
  this.items = this.items.filter(item => 
    !(item.product.toString() === productId.toString() &&
      JSON.stringify(item.selectedVariant) === JSON.stringify(variant))
  );
  
  // Track analytics event
  this.analytics.conversionEvents.push({
    event: 'item_removed',
    metadata: { productId, variant }
  });
  
  return this.save();
};

// Update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity, variant = {}) {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
  );
  
  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId, variant);
    } else {
      item.quantity = quantity;
    }
  }
  
  return this.save();
};

// Clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.discounts = [];
  
  // Track analytics event
  this.analytics.conversionEvents.push({
    event: 'cart_cleared'
  });
  
  return this.save();
};

// Apply discount
cartSchema.methods.applyDiscount = function(discountCode, amount, type, description) {
  // Remove existing discount with same code
  this.discounts = this.discounts.filter(d => d.code !== discountCode);
  
  // Add new discount
  this.discounts.push({
    code: discountCode,
    amount,
    type,
    description
  });
  
  return this.save();
};

// Remove discount
cartSchema.methods.removeDiscount = function(discountCode) {
  this.discounts = this.discounts.filter(d => d.code !== discountCode);
  return this.save();
};

// Share cart with user
cartSchema.methods.shareWith = function(userId, permissions = {}) {
  // Remove existing share with same user
  this.sharedWith = this.sharedWith.filter(share => 
    share.user.toString() !== userId.toString()
  );
  
  // Add new share
  this.sharedWith.push({
    user: userId,
    permissions: {
      canView: permissions.canView !== false,
      canEdit: permissions.canEdit || false,
      canPurchase: permissions.canPurchase || false
    }
  });
  
  this.isShared = true;
  return this.save();
};

// Unshare cart with user
cartSchema.methods.unshareWith = function(userId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.user.toString() !== userId.toString()
  );
  
  if (this.sharedWith.length === 0) {
    this.isShared = false;
  }
  
  return this.save();
};

// Start checkout
cartSchema.methods.startCheckout = function() {
  this.checkout.isStarted = true;
  this.checkout.startedAt = new Date();
  this.status = 'active';
  
  // Track analytics event
  this.analytics.conversionEvents.push({
    event: 'checkout_started'
  });
  
  return this.save();
};

// Complete checkout
cartSchema.methods.completeCheckout = function(orderId, paymentMethod) {
  this.checkout.completedAt = new Date();
  this.checkout.orderId = orderId;
  this.checkout.paymentMethod = paymentMethod;
  this.status = 'converted';
  
  // Track analytics event
  this.analytics.conversionEvents.push({
    event: 'checkout_completed',
    metadata: { orderId, paymentMethod }
  });
  
  return this.save();
};

// Mark as abandoned
cartSchema.methods.markAsAbandoned = function() {
  this.status = 'abandoned';
  
  // Track analytics event
  this.analytics.conversionEvents.push({
    event: 'cart_abandoned'
  });
  
  return this.save();
};

// Save item for later
cartSchema.methods.saveItemForLater = function(productId, variant = {}) {
  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
  );
  
  if (itemIndex > -1) {
    const item = this.items[itemIndex];
    this.savedItems.push({
      product: item.product,
      notes: item.notes
    });
    
    this.items.splice(itemIndex, 1);
  }
  
  return this.save();
};

// Move saved item back to cart
cartSchema.methods.moveSavedItemToCart = function(productId, quantity = 1) {
  const savedItemIndex = this.savedItems.findIndex(item => 
    item.product.toString() === productId.toString()
  );
  
  if (savedItemIndex > -1) {
    const savedItem = this.savedItems[savedItemIndex];
    
    // Add to cart (will need product price from database)
    // This would typically be handled in the route with product lookup
    
    this.savedItems.splice(savedItemIndex, 1);
  }
  
  return this.save();
};

// Get cart by user
cartSchema.statics.getActiveCart = function(userId) {
  return this.findOne({ 
    user: userId, 
    status: 'active' 
  }).populate('items.product', 'name images currentPrice brand availability');
};

// Get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId, sessionId) {
  let cart = await this.getActiveCart(userId);
  
  if (!cart) {
    cart = new this({
      user: userId,
      session: { sessionId }
    });
    await cart.save();
  }
  
  return cart;
};

// Get abandoned carts
cartSchema.statics.getAbandonedCarts = function(daysAgo = 1) {
  const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: 'active',
    updatedAt: { $lt: cutoffDate },
    'items.0': { $exists: true } // Has at least one item
  }).populate('user', 'username email displayName');
};

module.exports = mongoose.model('Cart', cartSchema);