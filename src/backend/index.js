// Humans Backend - Main Entry Point
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const { setupAuthRoutes } = require('./auth/routes');
const { setupConversationRoutes } = require('./conversation/routes');
const { setupHumanRoutes } = require('./human/routes');
const { setupRelationshipRoutes } = require('./relationship/routes');
const { initializeWebSocket } = require('./websocket');
const { connectDatabase } = require('./database');
const { connectRedis } = require('./redis');
const logger = require('./logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connections
connectDatabase();
connectRedis();

// Routes
app.use('/api/auth', setupAuthRoutes());
app.use('/api/conversations', setupConversationRoutes());
app.use('/api/humans', setupHumanRoutes());
app.use('/api/relationships', setupRelationshipRoutes());

// WebSocket initialization
initializeWebSocket(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`WebSocket server initialized`);
});

module.exports = { app, server };