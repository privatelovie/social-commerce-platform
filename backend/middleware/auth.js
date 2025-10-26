const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'No authorization header provided'
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Invalid authorization format. Expected "Bearer <token>"'
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and check if still active
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          error: 'Token is invalid - user not found'
        });
      }

      if (user.status !== 'active') {
        return res.status(401).json({
          error: 'Account is not active'
        });
      }

      // Update last active timestamp
      user.lastActiveAt = new Date();
      await user.save();

      // Add user info to request
      req.user = {
        userId: decoded.userId,
        username: user.username,
        email: user.email,
        isAdmin: user.role === 'admin',
        isModerator: ['admin', 'moderator'].includes(user.role)
      };

      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token has expired'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token'
        });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Server error during authentication'
    });
  }
};

// Optional auth - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user || user.status !== 'active') {
        req.user = null;
        return next();
      }

      // Update last active timestamp
      user.lastActiveAt = new Date();
      await user.save();

      req.user = {
        userId: decoded.userId,
        username: user.username,
        email: user.email,
        isAdmin: user.role === 'admin',
        isModerator: ['admin', 'moderator'].includes(user.role)
      };

      next();
    } catch (jwtError) {
      req.user = null;
      next();
    }
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Admin only middleware
const adminOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: 'Admin access required'
    });
  }

  next();
};

// Moderator or admin middleware
const moderatorOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  if (!req.user.isModerator) {
    return res.status(403).json({
      error: 'Moderator access required'
    });
  }

  next();
};

module.exports = {
  auth,
  optionalAuth,
  adminOnly,
  moderatorOnly
};