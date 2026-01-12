import { AuthService } from '../../src/services/auth.service';
import { UserModel } from '../../src/models/user.model';
import db from '../../src/config/database';

// Mock environment variables
process.env.BCRYPT_ROUNDS = '10';

// Initialize test database
beforeAll(() => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

afterEach(() => {
  // Clean up test data
  db.exec('DELETE FROM users');
});

afterAll(() => {
  db.close();
});

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123';
      const hash = await AuthService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await AuthService.hashPassword(password);
      const hash2 = await AuthService.hashPassword(password);

      // Bcrypt includes salt, so hashes should be different
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'TestPassword123';
      const hash = await AuthService.hashPassword(password);

      const isValid = await AuthService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword123';
      const hash = await AuthService.hashPassword(password);

      const isValid = await AuthService.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const user = await AuthService.register('testuser', 'test@example.com', 'TestPassword123');

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe('TestPassword123');
    });

    it('should throw error if username already exists', async () => {
      await AuthService.register('testuser', 'test1@example.com', 'TestPassword123');

      await expect(
        AuthService.register('testuser', 'test2@example.com', 'TestPassword123')
      ).rejects.toThrow('Username already exists');
    });

    it('should throw error if email already exists', async () => {
      await AuthService.register('testuser1', 'test@example.com', 'TestPassword123');

      await expect(
        AuthService.register('testuser2', 'test@example.com', 'TestPassword123')
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      await AuthService.register('testuser', 'test@example.com', 'TestPassword123');

      const user = await AuthService.login('testuser', 'TestPassword123');

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });

    it('should throw error with incorrect username', async () => {
      await AuthService.register('testuser', 'test@example.com', 'TestPassword123');

      await expect(AuthService.login('wronguser', 'TestPassword123')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error with incorrect password', async () => {
      await AuthService.register('testuser', 'test@example.com', 'TestPassword123');

      await expect(AuthService.login('testuser', 'WrongPassword123')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });
});

