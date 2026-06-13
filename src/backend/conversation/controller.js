// Conversation Controller
const { query } = require('../database');
const { getRedis } = require('../redis');
const logger = require('../logger');

const getConversations = async (req, res) => {
  try {
    const conversations = await query(
      `SELECT c.id, c.topic, c.created_at, c.updated_at
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       WHERE cp.user_id = $1
       ORDER BY c.updated_at DESC`,
      [req.user.userId]
    );

    res.json(conversations.rows);
  } catch (error) {
    logger.error('Get conversations error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getConversation = async (req, res) => {
  try {
    const conversation = await query(
      `SELECT c.id, c.topic, c.context, c.created_at, c.updated_at
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       WHERE c.id = $1 AND cp.user_id = $2`,
      [req.params.id, req.user.userId]
    );

    if (conversation.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation.rows[0]);
  } catch (error) {
    logger.error('Get conversation error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createConversation = async (req, res) => {
  try {
    const { topic, context, participantIds } = req.body;

    const result = await query(
      'INSERT INTO conversations (topic, context) VALUES ($1, $2) RETURNING id',
      [topic, context]
    );

    const conversationId = result.rows[0].id;

    // Add participants
    const participants = [req.user.userId, ...participantIds];
    for (const userId of participants) {
      await query(
        'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2)',
        [conversationId, userId]
      );
    }

    logger.info('Conversation created', { conversationId, userId: req.user.userId });
    
    res.status(201).json({ id: conversationId, topic, context });
  } catch (error) {
    logger.error('Create conversation error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const conversationId = req.params.id;

    const result = await query(
      `INSERT INTO messages 
       (conversation_id, sender_id, sender_type, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [conversationId, req.user.userId, 'user', content]
    );

    const message = result.rows[0];

    // Update conversation updated_at
    await query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);

    // Publish to Redis for real-time delivery
    const redis = getRedis();
    await redis.publish(`conversation:${conversationId}`, JSON.stringify({
      type: 'message',
      data: { id: message.id, conversationId, senderId: req.user.userId, content, timestamp: message.created_at }
    }));

    logger.debug('Message sent', { messageId: message.id, conversationId });
    
    res.status(201).json({ id: message.id, ...message });
  } catch (error) {
    logger.error('Send message error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await query(
      `SELECT m.id, m.sender_id, m.sender_type, m.content, m.created_at
       FROM messages m
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
      [req.params.id, req.query.limit || 50, req.query.offset || 0]
    );

    res.json(messages.rows);
  } catch (error) {
    logger.error('Get messages error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  getMessages
};