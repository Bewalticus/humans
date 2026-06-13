// Auth Controller
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../database');
const logger = require('../logger');

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    logger.info('User registered successfully', { userId: user.id });
    
    res.status(201).json(user);
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    logger.info('User logged in successfully', { userId: user.id });
    
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await query('SELECT id, username, email FROM users WHERE id = $1', [req.user.userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (error) {
    logger.error('Get current user error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};