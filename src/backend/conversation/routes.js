// Conversation Routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../auth/middleware');
const {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  getMessages
} = require('./controller');

const setupConversationRoutes = () => {
  router.use(authenticate);
  
  router.get('/', getConversations);
  router.post('/', createConversation);
  router.get('/:id', getConversation);
  router.post('/:id/messages', sendMessage);
  router.get('/:id/messages', getMessages);
  
  return router;
};

module.exports = {
  setupConversationRoutes
};