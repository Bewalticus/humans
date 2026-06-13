// Auth Middleware
const jwt = require('jsonwebtoken');
const logger = require('../logger');

const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    
    logger.debug('User authenticated', { userId: decoded.userId });
    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  authenticate
};