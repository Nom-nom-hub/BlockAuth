const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { authenticateToken } = require('../middleware/auth');

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  const { displayName, email } = req.body;
  
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields if provided
    if (displayName) user.displayName = displayName;
    if (email) user.email = email;
    
    await user.save();
    
    return res.json({ 
      message: 'Profile updated successfully',
      user: {
        displayName: user.displayName,
        email: user.email,
        did: user.did
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user by DID (public endpoint)
router.get('/by-did/:did', async (req, res) => {
  const { did } = req.params;
  
  try {
    const user = await User.findOne({ did }).select('did publicKey displayName createdAt');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(user);
  } catch (error) {
    console.error('Get user by DID error:', error);
    return res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
