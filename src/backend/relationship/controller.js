// Relationship Controller
const { query } = require('../database');
const logger = require('../logger');

const getRelationships = async (req, res) => {
  try {
    const relationships = await query(
      `SELECT r.id, r.human1_id, r.human2_id, r.type, r.strength, r.created_at
       FROM relationships r
       WHERE r.human1_id = $1 OR r.human2_id = $1
       ORDER BY r.strength DESC`,
      [req.params.humanId]
    );

    res.json(relationships.rows);
  } catch (error) {
    logger.error('Get relationships error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRelationship = async (req, res) => {
  try {
    const relationship = await query(
      `SELECT r.id, r.human1_id, r.human2_id, r.type, r.strength, r.history, r.created_at
       FROM relationships r
       WHERE (r.human1_id = $1 AND r.human2_id = $2)
       OR (r.human1_id = $2 AND r.human2_id = $1)`,
      [req.params.humanId, req.params.otherHumanId]
    );

    if (relationship.rows.length === 0) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    res.json(relationship.rows[0]);
  } catch (error) {
    logger.error('Get relationship error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateRelationship = async (req, res) => {
  try {
    const { type, strength, interaction } = req.body;
    const { humanId, otherHumanId } = req.params;

    // Check if relationship exists
    const existing = await query(
      `SELECT id FROM relationships
       WHERE (human1_id = $1 AND human2_id = $2)
       OR (human1_id = $2 AND human2_id = $1)`,
      [humanId, otherHumanId]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing relationship
      result = await query(
        `UPDATE relationships
         SET type = $1, strength = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id, human1_id, human2_id, type, strength`,
        [type, strength, existing.rows[0].id]
      );
    } else {
      // Create new relationship
      result = await query(
        `INSERT INTO relationships
         (human1_id, human2_id, type, strength)
         VALUES ($1, $2, $3, $4)
         RETURNING id, human1_id, human2_id, type, strength`,
        [humanId, otherHumanId, type, strength]
      );
    }

    // Add interaction to history if provided
    if (interaction && result.rows.length > 0) {
      await query(
        `INSERT INTO interactions
         (relationship_id, type, outcome, timestamp)
         VALUES ($1, $2, $3, NOW())`,
        [result.rows[0].id, interaction.type, interaction.outcome]
      );
    }

    const relationship = result.rows[0];
    logger.info('Relationship updated', { relationshipId: relationship.id });
    
    res.json(relationship);
  } catch (error) {
    logger.error('Update relationship error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getRelationships,
  getRelationship,
  updateRelationship
};