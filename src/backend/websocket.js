// WebSocket Server
const logger = require('./logger');

const initializeWebSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`New WebSocket connection: ${socket.id}`);

    // Handle conversation messages
    socket.on('conversation:message', (data) => {
      logger.debug('Received conversation message', { data });
      // Broadcast to conversation participants
      io.to(data.conversationId).emit('conversation:message', data);
    });

    // Handle joining conversation rooms
    socket.on('conversation:join', (conversationId) => {
      socket.join(conversationId);
      logger.debug(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationId);
      logger.debug(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`WebSocket disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('WebSocket error', { socketId: socket.id, error: error.message });
    });
  });

  logger.info('WebSocket server initialized');
};

module.exports = {
  initializeWebSocket
};