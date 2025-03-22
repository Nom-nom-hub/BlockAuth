// Add traditional authentication support
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // In production, fetch user from database and verify password
  // This is a simplified example
  const user = users.get(email);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // In production, use proper password comparison
  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
  
  return res.json({ token });
});

// Add account linking functionality
router.post('/link-wallet', authenticateToken, async (req, res) => {
  const { did } = req.body;
  const userId = req.user.id;
  
  // Link wallet to existing account
  // In production, update user in database
  
  return res.json({ message: 'Wallet linked successfully' });
});