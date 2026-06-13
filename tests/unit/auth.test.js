// Auth Unit Tests
const request = require('supertest');
const { app } = require('../../src/backend/index');
const { query } = require('../../src/backend/database');
const bcrypt = require('bcrypt');

describe('Auth API', () => {
  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      ['testuser', 'test@example.com', hashedPassword]
    );
  });

  afterAll(async () => {
    // Clean up
    await query('DELETE FROM users WHERE email = $1', ['test@example.com']);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'newpassword'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('newuser');
      expect(response.body.email).toBe('new@example.com');
    });

    it('should return 400 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicate',
          email: 'test@example.com',
          password: 'password'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Email already in use');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        });
      token = loginResponse.body.token;
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });
  });
});