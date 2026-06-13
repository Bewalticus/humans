// Human Routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../auth/middleware');
const {
  getHumans,
  getHuman,
  createHuman,
  updateHuman,
  deleteHuman
} = require('./controller');

const setupHumanRoutes = () => {
  router.use(authenticate);
  
  router.get('/', getHumans);
  router.post('/', createHuman);
  router.get('/:id', getHuman);
  router.put('/:id', updateHuman);
  router.delete('/:id', deleteHuman);
  
  return router;
};

module.exports = {
  setupHumanRoutes
};