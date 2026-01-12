import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || './totp-poc.db';
const db = new Database(dbPath);

/**
 * Initialize database schema
 */
export function initializeDatabase(): void {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create users table
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

  // Create totp_secrets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS totp_secrets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      secret_encrypted TEXT NOT NULL,
      backup_codes_hashed TEXT,
      enabled BOOLEAN DEFAULT 0,
      enabled_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create index on user_id for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_totp_secrets_user_id ON totp_secrets(user_id);
  `);
}

export default db;

