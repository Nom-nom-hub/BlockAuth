const express = require('express');
const crypto = require('crypto');
const { Web3 } = require('web3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const router = express.Router();
const { sendEmail } = require('./utils/email');
const rateLimit = require('express-rate-limit');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET environment variable not set!');
  process.exit(1); // Fail securely in production
}

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { 
    error: 'Too many login attempts, please try again later',
    code: 'RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Store for challenges (in production, use Redis or similar)
const challenges = new Map();

// Generate secure random token
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Connect to Ethereum network
const web3 = new Web3(process.env.ETHEREUM_RPC_URL);

// Traditional login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Check if account is locked
    if (user.accountLocked) {
      const lockExpiry = new Date(user.lockExpiresAt);
      if (lockExpiry > new Date()) {
        return res.status(429).json({
          error: 'Account temporarily locked due to too many failed attempts',
          code: 'ACCOUNT_LOCKED',
          unlockTime: lockExpiry
        });
      } else {
        // Reset lock if expired
        user.accountLocked = false;
        user.failedLoginAttempts = 0;
        await user.save();
      }
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.accountLocked = true;
        user.lockExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      
      await user.save();
      
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Check if MFA is enabled
    if (user.mfaEnabled) {
      // Generate MFA token
      const mfaToken = generateToken();
      user.mfaToken = mfaToken;
      user.mfaTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();
      
      // Send MFA code via email
      await sendEmail({
        to: user.email,
        subject: 'Your authentication code',
        text: `Your verification code is: ${mfaToken.substring(0, 6)}`
      });
      
      return res.status(200).json({
        message: 'MFA code sent to your email',
        requiresMfa: true,
        userId: user._id
      });
    }
    
    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Set secure cookie in production
    if (NODE_ENV === 'production') {
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
});

// Verify MFA code
router.post('/verify-mfa', async (req, res) => {
  try {
    const { userId, mfaCode } = req.body;
    
    if (!userId || !mfaCode) {
      return res.status(400).json({ 
        error: 'User ID and MFA code are required',
        code: 'MISSING_PARAMETERS'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if MFA token is valid and not expired
    if (!user.mfaToken || 
        user.mfaTokenExpires < Date.now() || 
        user.mfaToken.substring(0, 6) !== mfaCode) {
      return res.status(401).json({ 
        error: 'Invalid or expired MFA code',
        code: 'INVALID_MFA'
      });
    }
    
    // Clear MFA token
    user.mfaToken = undefined;
    user.mfaTokenExpires = undefined;
    user.failedLoginAttempts = 0;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Set secure cookie in production
    if (NODE_ENV === 'production') {
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
});

// Generate a random challenge for login
router.post('/challenge', async (req, res) => {
  const { did } = req.body;
  if (!did) return res.status(400).json({ error: 'DID is required' });
  
  const challenge = crypto.randomBytes(32).toString('hex');
  challenges.set(did, { challenge, timestamp: Date.now() });
  
  res.json({ challenge });
});

// Verify signature and authenticate user
router.post('/verify', async (req, res) => {
  const { did, signature } = req.body;
  
  if (!did) return res.status(400).json({ error: 'DID parameter is required' });
  if (!signature) return res.status(400).json({ error: 'Signature parameter is required' });
  
  const challengeData = challenges.get(did);
  if (!challengeData) return res.status(400).json({ error: 'No challenge found for this DID' });
  
  // Check if challenge is expired (5 minutes)
  if (Date.now() - challengeData.timestamp > 5 * 60 * 1000) {
    challenges.delete(did);
    return res.status(400).json({ 
      error: 'Challenge expired', 
      message: 'Please request a new challenge and try again' 
    });
  }
  
  try {
    // Find or create user with this DID
    let user = await User.findOne({ did });
    
    if (!user) {
      // Extract public key from signature
      const recoveredAddress = web3.eth.accounts.recover(challengeData.challenge, signature);
      
      // Create new user
      user = new User({
        did,
        publicKey: recoveredAddress.toLowerCase(),
        authMethod: 'wallet'
      });
      
      await user.save();
    } else {
      // Verify signature
      const recoveredAddress = web3.eth.accounts.recover(challengeData.challenge, signature);
      const isValid = recoveredAddress.toLowerCase() === user.publicKey.toLowerCase();
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, did: user.did },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    challenges.delete(did);
    return res.json({ token, user: { did: user.did, email: user.email } });
  } catch (error) {
    console.error('Verification error:', error);
    // More specific error handling
    if (error.message.includes('recovery')) {
      return res.status(400).json({ error: 'Invalid signature format' });
    }
    return res.status(500).json({ 
      error: 'Verification failed',
      message: 'Server encountered an error processing your request'
    });
  }
});

// Traditional email/password login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user || user.authMethod !== 'traditional') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.json({ 
      token, 
      user: { 
        email: user.email, 
        did: user.did 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Traditional registration
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      authMethod: 'traditional'
    });
    
    await user.save();
    
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Link wallet to traditional account
router.post('/link-wallet', async (req, res) => {
  const { token, did, signature, challenge } = req.body;
  
  if (!token || !did || !signature || !challenge) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify signature
    const recoveredAddress = web3.eth.accounts.recover(challenge, signature);
    
    // Update user with DID and public key
    user.did = did;
    user.publicKey = recoveredAddress.toLowerCase();
    
    await user.save();
    
    return res.json({ message: 'Wallet linked successfully' });
  } catch (error) {
    console.error('Link wallet error:', error);
    return res.status(500).json({ error: 'Failed to link wallet' });
  }
});

// MFA Implementation
router.post('/enable-mfa', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Generate MFA secret
    const secret = speakeasy.generateSecret({ name: `AuthApp:${user.email}` });
    user.mfaSecret = secret.base32;
    user.mfaEnabled = false; // Not enabled until verified
    await user.save();
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    
    res.status(200).json({
      secret: secret.base32,
      qrCode
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({ error: 'Failed to setup MFA' });
  }
});

// Verify and enable MFA
router.post('/verify-mfa-setup', auth, async (req, res) => {
  // Implementation details
});

module.exports = router;
