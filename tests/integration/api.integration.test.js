// API Integration Tests
const request = require('supertest');
const { app } = require('../../src/backend/index');
const { query } = require('../../src/backend/database');
const bcrypt = require('bcrypt');

describe('API Integration Tests', () => {
  let token;
  let userId;
  let humanId;
  let conversationId;

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const userResult = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      ['integrationuser', 'integration@example.com', hashedPassword]
    );
    userId = userResult.rows[0].id;

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'integration@example.com',
        password: 'testpassword'
      });
    token = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up
    await query('DELETE FROM users WHERE email = $1', ['integration@example.com']);
  });

  describe('Complete User Flow', () => {
    it('should complete the full user journey', async () => {
      // 1. Create a human
      const humanResponse = await request(app)
        .post('/api/humans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Human',
          personaId: 'persona-123',
          corePersonality: {
            traits: ['friendly', 'curious'],
            background: 'Software engineer from San Francisco',
            expertise: ['programming', 'AI'],
            communicationStyle: 'casual'
          },
          status: 'active'
        });

      expect(humanResponse.statusCode).toBe(201);
      humanId = humanResponse.body.id;

      // 2. Create a conversation with the human
      const conversationResponse = await request(app)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          topic: 'Integration Test',
          context: 'Testing the complete flow',
          participantIds: [humanId]
        });

      expect(conversationResponse.statusCode).toBe(201);
      conversationId = conversationResponse.body.id;

      // 3. Send a message to the conversation
      const messageResponse = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Hello, this is an integration test message'
        });

      expect(messageResponse.statusCode).toBe(201);

      // 4. Get the conversation messages
      const messagesResponse = await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`);

      expect(messagesResponse.statusCode).toBe(200);
      expect(messagesResponse.body.length).toBeGreaterThan(0);

      // 5. Get user's conversations
      const conversationsResponse = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${token}`);

      expect(conversationsResponse.statusCode).toBe(200);
      expect(conversationsResponse.body.length).toBeGreaterThan(0);

      // 6. Get user's humans
      const humansResponse = await request(app)
        .get('/api/humans')
        .set('Authorization', `Bearer ${token}`);

      expect(humansResponse.statusCode).toBe(200);
      expect(humansResponse.body.length).toBeGreaterThan(0);

      // 7. Update the human
      const updateResponse = await request(app)
        .put(`/api/humans/${humanId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Test Human',
          corePersonality: {
            traits: ['friendly', 'curious', 'helpful'],
            background: 'Senior software engineer from San Francisco',
            expertise: ['programming', 'AI', 'distributed systems'],
            communicationStyle: 'casual'
          },
          status: 'active'
        });

      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.body.name).toBe('Updated Test Human');

      // 8. Get current user info
      const userResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(userResponse.statusCode).toBe(200);
      expect(userResponse.body.email).toBe('integration@example.com');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
    });

    it('should handle invalid authentication', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.statusCode).toBe(401);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'missingemail',
          password: 'password'
          // Missing email
        });

      expect(response.statusCode).toBe(400);
    });
  });
});