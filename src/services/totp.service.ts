import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import bcrypt from 'bcrypt';
import { TotpSecretModel } from '../models/totp-secret.model';
import { encrypt, decrypt } from '../utils/encryption.util';
import { UserModel } from '../models/user.model';

const TOTP_ISSUER = process.env.TOTP_ISSUER || 'OpenHome';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

// In-memory store for temporary secrets and backup codes during setup
// In production, use Redis or similar
const tempSecrets = new Map<number, string>();
const tempBackupCodes = new Map<number, string[]>();

/**
 * TOTP Service for generating and verifying TOTP codes
 */
export class TotpService {
  /**
   * Generate a new TOTP secret
   */
  static generateSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Generate QR code data URL for TOTP setup
   */
  static async generateQRCode(secret: string, username: string, email: string): Promise<string> {
    const otpauth = authenticator.keyuri(username, TOTP_ISSUER, secret);
    const qrCode = await QRCode.toDataURL(otpauth);
    return qrCode;
  }

  /**
   * Verify TOTP code
   * @param token - TOTP code to verify
   * @param secret - TOTP secret (plain text)
   * @param window - Time window for clock drift (default: 1, meaning ±1 time step)
   */
  static verify(token: string, secret: string, window: number = 1): boolean {
    try {
      return authenticator.verify({
        token,
        secret,
        window: [window, window], // [backward, forward] windows
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Start TOTP setup process
   * Generates secret, QR code, and backup codes
   */
  static async setup(userId: number): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate secret
    const secret = this.generateSecret();

    // Generate QR code
    const qrCode = await this.generateQRCode(secret, user.username, user.email);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store secret and backup codes temporarily (will be encrypted and saved after verification)
    tempSecrets.set(userId, secret);
    tempBackupCodes.set(userId, backupCodes);

    return {
      secret,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Verify TOTP code during setup
   */
  static async verifySetup(userId: number, totpCode: string): Promise<boolean> {
    const tempSecret = tempSecrets.get(userId);
    if (!tempSecret) {
      throw new Error('No TOTP setup in progress. Please start setup first.');
    }

    const isValid = this.verify(totpCode, tempSecret);
    return isValid;
  }

  /**
   * Enable TOTP for user
   * Encrypts and stores the secret, hashes backup codes
   */
  static async enable(userId: number, totpCode: string): Promise<void> {
    const tempSecret = tempSecrets.get(userId);
    const tempCodes = tempBackupCodes.get(userId);

    if (!tempSecret || !tempCodes) {
      throw new Error('No TOTP setup in progress. Please start setup first.');
    }

    // Verify the code one more time
    const isValid = this.verify(totpCode, tempSecret);
    if (!isValid) {
      throw new Error('Invalid TOTP code');
    }

    // Encrypt secret
    const encryptedSecret = encrypt(tempSecret);

    // Hash backup codes
    const hashedBackupCodes = await this.hashBackupCodes(tempCodes);

    // Check if TOTP secret already exists
    const existing = TotpSecretModel.findByUserId(userId);
    if (existing) {
      // Update existing record
      TotpSecretModel.update(userId, encryptedSecret, JSON.stringify(hashedBackupCodes));
      TotpSecretModel.enable(userId);
    } else {
      // Create new record
      TotpSecretModel.create(userId, encryptedSecret, JSON.stringify(hashedBackupCodes));
      TotpSecretModel.enable(userId);
    }

    // Clear temporary data
    tempSecrets.delete(userId);
    tempBackupCodes.delete(userId);
  }

  /**
   * Verify TOTP code for login
   * Also checks backup codes
   */
  static async verifyLogin(userId: number, code: string): Promise<boolean> {
    const totpSecret = TotpSecretModel.findByUserId(userId);
    if (!totpSecret || !totpSecret.enabled) {
      throw new Error('TOTP is not enabled for this user');
    }

    // Decrypt secret
    const secret = decrypt(totpSecret.secret_encrypted);

    // Try TOTP code first
    const isValidTotp = this.verify(code, secret);
    if (isValidTotp) {
      return true;
    }

    // Try backup codes
    if (totpSecret.backup_codes_hashed) {
      const backupCodes = JSON.parse(totpSecret.backup_codes_hashed) as string[];
      for (let i = 0; i < backupCodes.length; i++) {
        const isValidBackup = await bcrypt.compare(code, backupCodes[i]);
        if (isValidBackup) {
          // Remove used backup code
          backupCodes.splice(i, 1);
          TotpSecretModel.updateBackupCodes(
            userId,
            JSON.stringify(backupCodes.length > 0 ? backupCodes : null)
          );
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Disable TOTP for user
   */
  static disable(userId: number): void {
    TotpSecretModel.disable(userId);
    tempSecrets.delete(userId);
    tempBackupCodes.delete(userId);
  }

  /**
   * Get TOTP status
   */
  static getStatus(userId: number): { enabled: boolean; enabledAt: string | null } {
    const totpSecret = TotpSecretModel.findByUserId(userId);
    return {
      enabled: totpSecret?.enabled === true,
      enabledAt: totpSecret?.enabled_at || null,
    };
  }

  /**
   * Regenerate backup codes
   */
  static async regenerateBackupCodes(userId: number): Promise<string[]> {
    const totpSecret = TotpSecretModel.findByUserId(userId);
    if (!totpSecret || !totpSecret.enabled) {
      throw new Error('TOTP is not enabled for this user');
    }

    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

    TotpSecretModel.updateBackupCodes(userId, JSON.stringify(hashedBackupCodes));

    return backupCodes;
  }

  /**
   * Generate backup codes (10 codes, 8 characters each)
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < 10; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(code);
    }

    return codes;
  }

  /**
   * Hash backup codes with bcrypt
   */
  private static async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map((code) => bcrypt.hash(code, BCRYPT_ROUNDS)));
  }
}

