import request from 'supertest';
import app from '../../src/app';
import db from '../../src/config/database';
import { initializeDatabase } from '../../src/config/database';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
process.env.DB_PATH = ':memory:';
process.env.TOTP_ISSUER = 'TestIssuer';
process.env.BCRYPT_ROUNDS = '10';

beforeAll(() => {
  initializeDatabase();
});

afterEach(() => {
  // Clean up test data
  db.exec('DELETE FROM totp_secrets');
  db.exec('DELETE FROM users');
});

afterAll(() => {
  db.close();
});

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123',
      });

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'invalid-email',
        password: 'TestPassword123',
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject duplicate username', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test1@example.com',
        password: 'TestPassword123',
      });

      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test2@example.com',
        password: 'TestPassword123',
      });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123',
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'TestPassword123',
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.requiresTotp).toBeUndefined();
    });

    it('should return tokenKey if TOTP is enabled', async () => {
      // First, setup and enable TOTP
      const registerResponse = await request(app).post('/api/auth/register').send({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'TestPassword123',
      });

      const token = registerResponse.body.token;

      // Setup TOTP
      const setupResponse = await request(app)
        .post('/api/totp/setup')
        .set('Authorization', `Bearer ${token}`);

      const { authenticator } = require('otplib');
      const tempSecret = setupResponse.body.secret;
      const totpCode = authenticator.generate(tempSecret);

      // Verify and enable
      await request(app)
        .post('/api/totp/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ totpCode });

      await request(app)
        .post('/api/totp/enable')
        .set('Authorization', `Bearer ${token}`)
        .send({ totpCode });

      // Now login
      const loginResponse = await request(app).post('/api/auth/login').send({
        username: 'testuser2',
        password: 'TestPassword123',
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.tokenKey).toBeDefined();
      expect(loginResponse.body.requiresTotp).toBe(true);
    });

    it('should reject login with incorrect credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'WrongPassword123',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/login-2fa', () => {
    let token: string;
    let secret: string;

    beforeEach(async () => {
      // Register and setup TOTP
      const registerResponse = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123',
      });

      token = registerResponse.body.token;

      const setupResponse = await request(app)
        .post('/api/totp/setup')
        .set('Authorization', `Bearer ${token}`);

      secret = setupResponse.body.secret;

      const { authenticator } = require('otplib');
      const totpCode = authenticator.generate(secret);

      await request(app)
        .post('/api/totp/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ totpCode });

      await request(app)
        .post('/api/totp/enable')
        .set('Authorization', `Bearer ${token}`)
        .send({ totpCode });
    });

    it('should complete 2FA login with valid TOTP code', async () => {
      // Login to get tokenKey
      const loginResponse = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'TestPassword123',
      });

      const tokenKey = loginResponse.body.tokenKey;

      // Generate TOTP code
      const { authenticator } = require('otplib');
      const totpCode = authenticator.generate(secret);

      // Complete 2FA login
      const response = await request(app).post('/api/auth/login-2fa').send({
        tokenKey,
        totpCode,
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    it('should reject 2FA login with invalid TOTP code', async () => {
      const loginResponse = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'TestPassword123',
      });

      const tokenKey = loginResponse.body.tokenKey;

      const response = await request(app).post('/api/auth/login-2fa').send({
        tokenKey,
        totpCode: '000000',
      });

      expect(response.status).toBe(401);
    });
  });
});

