// Conversation Unit Tests
const request = require('supertest');
const { app } = require('../../src/backend/index');
const { query } = require('../../src/backend/database');
const bcrypt = require('bcrypt');

let token;
let userId;
let conversationId;

beforeAll(async () => {
  // Create test user
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  const userResult = await query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
    ['testuser', 'test@example.com', hashedPassword]
  );
  userId = userResult.rows[0].id;

  // Login to get token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'testpassword'
    });
  token = loginResponse.body.token;
});

afterAll(async () => {
  // Clean up
  await query('DELETE FROM users WHERE email = $1', ['test@example.com']);
});

describe('Conversation API', () => {
  describe('POST /api/conversations', () => {
    it('should create a new conversation', async () => {
      const response = await request(app)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          topic: 'Test Conversation',
          context: 'Testing the API',
          participantIds: []
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      conversationId = response.body.id;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/conversations')
        .send({
          topic: 'Unauthorized',
          context: 'Should fail',
          participantIds: []
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/conversations', () => {
    it('should list user conversations', async () => {
      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/conversations');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/conversations/:id', () => {
    it('should get conversation details', async () => {
      const response = await request(app)
        .get(`/api/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.topic).toBe('Test Conversation');
    });

    it('should return 404 for non-existent conversation', async () => {
      const response = await request(app)
        .get('/api/conversations/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/conversations/:id/messages', () => {
    it('should send a message', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Hello, this is a test message'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .send({
          content: 'Unauthorized message'
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/conversations/:id/messages', () => {
    it('should get conversation messages', async () => {
      const response = await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/conversations/${conversationId}/messages`);

      expect(response.statusCode).toBe(401);
    });
  });
});