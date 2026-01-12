import { TotpService } from '../../src/services/totp.service';
import { encrypt, decrypt } from '../../src/utils/encryption.util';

// Mock environment variables
process.env.ENCRYPTION_KEY = '12345678901234567890123456789012'; // 32 chars
process.env.TOTP_ISSUER = 'TestIssuer';
process.env.BCRYPT_ROUNDS = '10';

describe('TotpService', () => {
  describe('generateSecret', () => {
    it('should generate a valid secret', () => {
      const secret = TotpService.generateSecret();
      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThan(0);
    });

    it('should generate different secrets each time', () => {
      const secret1 = TotpService.generateSecret();
      const secret2 = TotpService.generateSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('generateQRCode', () => {
    it('should generate a QR code data URL', async () => {
      const secret = TotpService.generateSecret();
      const qrCode = await TotpService.generateQRCode(secret, 'testuser', 'test@example.com');
      expect(qrCode).toBeDefined();
      expect(qrCode).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('verify', () => {
    it('should verify a valid TOTP code', async () => {
      const secret = TotpService.generateSecret();
      // Generate a code using the secret
      const { authenticator } = require('otplib');
      const token = authenticator.generate(secret);

      const isValid = TotpService.verify(token, secret);
      expect(isValid).toBe(true);
    });

    it('should reject an invalid TOTP code', () => {
      const secret = TotpService.generateSecret();
      const invalidCode = '000000';

      const isValid = TotpService.verify(invalidCode, secret);
      expect(isValid).toBe(false);
    });
  });

  describe('setup', () => {
    it('should generate secret, QR code, and backup codes', async () => {
      const userId = 1;
      const result = await TotpService.setup(userId);

      expect(result.secret).toBeDefined();
      expect(result.qrCode).toBeDefined();
      expect(result.backupCodes).toBeDefined();
      expect(result.backupCodes.length).toBe(10);
      result.backupCodes.forEach((code) => {
        expect(code.length).toBe(8);
        expect(code).toMatch(/^[A-Z0-9]+$/);
      });
    });
  });

  describe('verifySetup', () => {
    it('should verify a TOTP code during setup', async () => {
      const userId = 1;
      const setupResult = await TotpService.setup(userId);
      const secret = setupResult.secret;

      const { authenticator } = require('otplib');
      const token = authenticator.generate(secret);

      const isValid = await TotpService.verifySetup(userId, token);
      expect(isValid).toBe(true);
    });

    it('should reject invalid TOTP code during setup', async () => {
      const userId = 2;
      await TotpService.setup(userId);

      const isValid = await TotpService.verifySetup(userId, '000000');
      expect(isValid).toBe(false);
    });
  });
});

describe('Encryption Utils', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a secret', () => {
      const originalSecret = 'TEST_SECRET_123456';
      const encrypted = encrypt(originalSecret);
      const decrypted = decrypt(encrypted);

      expect(encrypted).not.toBe(originalSecret);
      expect(decrypted).toBe(originalSecret);
    });

    it('should produce different encrypted values for the same input', () => {
      const secret = 'TEST_SECRET';
      const encrypted1 = encrypt(secret);
      const encrypted2 = encrypt(secret);

      // Should be different due to random IV
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      expect(decrypt(encrypted1)).toBe(secret);
      expect(decrypt(encrypted2)).toBe(secret);
    });
  });
});

