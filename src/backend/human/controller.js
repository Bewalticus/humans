// Human Controller
const { query } = require('../database');
const logger = require('../logger');

const getHumans = async (req, res) => {
  try {
    const humans = await query(
      `SELECT h.id, h.name, h.persona_id, h.status, h.created_at, h.last_interaction
       FROM humans h
       WHERE h.user_id = $1 OR h.status = 'public'
       ORDER BY h.last_interaction DESC`,
      [req.user.userId]
    );

    res.json(humans.rows);
  } catch (error) {
    logger.error('Get humans error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getHuman = async (req, res) => {
  try {
    const human = await query(
      `SELECT h.id, h.name, h.persona_id, h.core_personality, h.state, h.status
       FROM humans h
       WHERE h.id = $1 AND (h.user_id = $2 OR h.status = 'public')`,
      [req.params.id, req.user.userId]
    );

    if (human.rows.length === 0) {
      return res.status(404).json({ error: 'Human not found' });
    }

    res.json(human.rows[0]);
  } catch (error) {
    logger.error('Get human error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createHuman = async (req, res) => {
  try {
    const { name, personaId, corePersonality, status = 'private' } = req.body;

    const result = await query(
      `INSERT INTO humans 
       (name, persona_id, user_id, core_personality, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, persona_id, status, created_at`,
      [name, personaId, req.user.userId, corePersonality, status]
    );

    const human = result.rows[0];
    logger.info('Human created', { humanId: human.id, userId: req.user.userId });
    
    res.status(201).json(human);
  } catch (error) {
    logger.error('Create human error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateHuman = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, corePersonality, status } = req.body;

    const result = await query(
      `UPDATE humans
       SET name = $1, core_personality = $2, status = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, name, persona_id, status`,
      [name, corePersonality, status, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Human not found or not authorized' });
    }

    const human = result.rows[0];
    logger.info('Human updated', { humanId: human.id, userId: req.user.userId });
    
    res.json(human);
  } catch (error) {
    logger.error('Update human error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteHuman = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM humans WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Human not found or not authorized' });
    }

    logger.info('Human deleted', { humanId: req.params.id, userId: req.user.userId });
    
    res.status(204).send();
  } catch (error) {
    logger.error('Delete human error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getHumans,
  getHuman,
  createHuman,
  updateHuman,
  deleteHuman
};