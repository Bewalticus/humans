// Auth Routes
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser } = require('./controller');
const { authenticate } = require('./middleware');

const setupAuthRoutes = () => {
  router.post('/register', registerUser);
  router.post('/login', loginUser);
  router.get('/me', authenticate, getCurrentUser);
  
  return router;
};

module.exports = {
  setupAuthRoutes
};