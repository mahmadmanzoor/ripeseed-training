import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import { prisma } from './setup';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Routes', () => {
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(Number(response.body.user.walletBalance)).toBe(1000);
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        email: `duplicate-${Date.now()}@example.com`,
        password: 'password123'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for short password', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /login', () => {
    let testEmail: string;
    
    beforeEach(async () => {
      // Create a test user with unique email
      testEmail = `login-${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: 'password123'
        });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: testEmail,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: testEmail,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid email or password');
    });

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid email or password');
    });
  });

  describe('GET /me', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create a test user and get token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `me-${Date.now()}@example.com`,
          password: 'password123'
        });

      authToken = registerResponse.body.token;
      userId = registerResponse.body.user.id;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(userId);
      expect(Number(response.body.user.walletBalance)).toBe(1000);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
