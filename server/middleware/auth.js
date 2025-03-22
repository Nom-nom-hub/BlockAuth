const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET environment variable not set!');
  process.exit(1); // Fail securely in production
}

// Verify token and attach user to request
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Verify token
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    
    // Check if token is about to expire (within 1 hour)
    const tokenExp = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const refreshThreshold = 60 * 60 * 1000; // 1 hour
    
    if (tokenExp - now < refreshThreshold) {
      // Set header to indicate token should be refreshed
      res.set('X-Token-Refresh', 'true');
    }
    
    // Attach user to request
    req.user = decoded;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired', 
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token', 
        code: 'INVALID_TOKEN'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed', 
      code: 'AUTH_ERROR'
    });
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }
    
    next();
  };
};

// Refresh token rotation implementation
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token required',
        code: 'MISSING_TOKEN'
      });
    }
    
    // Verify refresh token
    const decoded = await promisify(jwt.verify)(
      refreshToken, 
      process.env.REFRESH_TOKEN_SECRET
    );
    
    // Find user and check if refresh token is valid
    const user = await User.findById(decoded.id);
    
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Remove used refresh token (rotation)
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    
    // Generate new tokens
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    
    // Save new refresh token
    user.refreshTokens.push(newRefreshToken);
    await user.save();
    
    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    // Error handling
  }
};

module.exports = { auth, requireRole, refreshToken };
