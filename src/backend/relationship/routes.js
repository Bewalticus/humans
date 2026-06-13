// Relationship Routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../auth/middleware');
const {
  getRelationships,
  getRelationship,
  updateRelationship
} = require('./controller');

const setupRelationshipRoutes = () => {
  router.use(authenticate);
  
  router.get('/:humanId', getRelationships);
  router.get('/:humanId/:otherHumanId', getRelationship);
  router.put('/:humanId/:otherHumanId', updateRelationship);
  
  return router;
};

module.exports = {
  setupRelationshipRoutes
};