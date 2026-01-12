import db from '../config/database';
import { TotpSecret } from '../types';

/**
 * TOTP Secret model for database operations
 */
export class TotpSecretModel {
  /**
   * Create a new TOTP secret record
   */
  static create(
    userId: number,
    secretEncrypted: string,
    backupCodesHashed: string | null = null
  ): TotpSecret {
    const stmt = db.prepare(
      'INSERT INTO totp_secrets (user_id, secret_encrypted, backup_codes_hashed) VALUES (?, ?, ?) RETURNING *'
    );
    return stmt.get(userId, secretEncrypted, backupCodesHashed) as TotpSecret;
  }

  /**
   * Find TOTP secret by user ID
   */
  static findByUserId(userId: number): TotpSecret | undefined {
    const stmt = db.prepare('SELECT * FROM totp_secrets WHERE user_id = ?');
    return stmt.get(userId) as TotpSecret | undefined;
  }

  /**
   * Update TOTP secret
   */
  static update(
    userId: number,
    secretEncrypted: string,
    backupCodesHashed: string | null
  ): void {
    const stmt = db.prepare(
      'UPDATE totp_secrets SET secret_encrypted = ?, backup_codes_hashed = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    );
    stmt.run(secretEncrypted, backupCodesHashed, userId);
  }

  /**
   * Enable TOTP for user
   */
  static enable(userId: number): void {
    const stmt = db.prepare(
      'UPDATE totp_secrets SET enabled = 1, enabled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    );
    stmt.run(userId);
  }

  /**
   * Disable TOTP for user
   */
  static disable(userId: number): void {
    const stmt = db.prepare(
      'UPDATE totp_secrets SET enabled = 0, enabled_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    );
    stmt.run(userId);
  }

  /**
   * Update backup codes
   */
  static updateBackupCodes(userId: number, backupCodesHashed: string): void {
    const stmt = db.prepare(
      'UPDATE totp_secrets SET backup_codes_hashed = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    );
    stmt.run(backupCodesHashed, userId);
  }

  /**
   * Delete TOTP secret (for cleanup)
   */
  static delete(userId: number): void {
    const stmt = db.prepare('DELETE FROM totp_secrets WHERE user_id = ?');
    stmt.run(userId);
  }
}

