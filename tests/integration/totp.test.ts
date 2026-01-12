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

describe('TOTP Integration Tests', () => {
  let token: string;

  beforeEach(async () => {
    // Register a user and get token
    const response = await request(app).post('/api/auth/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123',
    });

    token = response.body.token;
  });

  describe('POST /api/totp/setup', () => {
    it('should setup TOTP and return secret, QR code, and backup codes', async () => {
      const response = await request(app)
        .post('/api/totp/setup')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.secret).toBeDefined();
      expect(response.body.qrCode).toBeDefined();
      expect(response.body.qrCode).toMatch(/^data:image\/png;base64,/);
      expect(response.body.backupCodes).toBeDefined();
      expect(response.body.backupCodes.length).toBe(10);
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/totp/setup');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/totp/verify', () => {
    let secret: string;

    beforeEach(async () => {
      const setupResponse = await request(app)
        .post('/api/totp/setup')
        .set('Authorization', `Bearer ${token}`);

      secret = setupResponse.body.secret;
    });

    it('should verify a valid TOTP code', async () => {
      const { authenticator } = require('otplib');
      const totpCode = authenticator.generate(secret);

      const response = await request(app)
        .post('/api/totp/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ totpCode });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject an invalid TOTP code', async () => {
      const response = await request(app)
        .post('/api/totp/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ totpCode: '000000' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/totp/enable', () => {
    let secret: string;

    beforeEach(async () => {
      const setupResponse = await request(app)
        .post('/api/totp/setup')
        .set('Authorization', `Bearer ${token}`);

      secret = setupResponse.body.secret;
    });

    it('should enable TOTP with valid code', async () => {
      const { authenticator } = require('otplib');
      const totpCode = authenticator.generate(secret);

      const response = await request(app)
        .post('/api/totp/enable')
        .set('Authorization', `Bearer ${token}`)
        .send({ totpCode });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject enabling with invalid code', async () => {
      const response = await request(app)
        .post('/api/totp/enable')
        .set('Authorization', `Bearer ${token}`)
        .send({ totpCode: '000000' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/totp/status', () => {
    it('should return disabled status initially', async () => {
      const response = await request(app)
        .get('/api/totp/status')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.enabled).toBe(false);
      expect(response.body.enabledAt).toBeNull();
    });

    it('should return enabled status after enabling', async () => {
      // Setup and enable TOTP
      const setupResponse = await request(app)
        .post('/api/totp/setup')
        .set('Authorization', `Bearer ${token}`);

      const secret = setupResponse.body.secret;
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

      // Check status
      const response = await request(app)
        .get('/api/totp/status')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.enabled).toBe(true);
      expect(response.body.enabledAt).toBeDefined();
    });
  });

  describe('POST /api/totp/disable', () => {
    beforeEach(async () => {
      // Setup and enable TOTP
      const setupResponse = await request(app)
        .post('/api/totp/setup')
        .set('Authorization', `Bearer ${token}`);

      const secret = setupResponse.body.secret;
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

    it('should disable TOTP with correct password', async () => {
      const response = await request(app)
        .post('/api/totp/disable')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'TestPassword123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject disable with incorrect password', async () => {
      const response = await request(app)
        .post('/api/totp/disable')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'WrongPassword123' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/totp/backup-codes', () => {
    beforeEach(async () => {
      // Setup and enable TOTP
      const setupResponse = await request(app)
        .post('/api/totp/setup')
        .set('Authorization', `Bearer ${token}`);

      const secret = setupResponse.body.secret;
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

    it('should regenerate backup codes with correct password', async () => {
      const response = await request(app)
        .post('/api/totp/backup-codes')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'TestPassword123' });

      expect(response.status).toBe(200);
      expect(response.body.backupCodes).toBeDefined();
      expect(response.body.backupCodes.length).toBe(10);
    });

    it('should reject with incorrect password', async () => {
      const response = await request(app)
        .post('/api/totp/backup-codes')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'WrongPassword123' });

      expect(response.status).toBe(401);
    });
  });
});

