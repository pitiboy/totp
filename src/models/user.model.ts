import db from '../config/database';
import { User } from '../types';

/**
 * User model for database operations
 */
export class UserModel {
  /**
   * Create a new user
   */
  static create(username: string, email: string, passwordHash: string): User {
    const stmt = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?) RETURNING *'
    );
    return stmt.get(username, email, passwordHash) as User;
  }

  /**
   * Find user by username
   */
  static findByUsername(username: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) as User | undefined;
  }

  /**
   * Find user by email
   */
  static findByEmail(email: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  }

  /**
   * Find user by ID
   */
  static findById(id: number): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  /**
   * Update user's updated_at timestamp
   */
  static updateTimestamp(id: number): void {
    const stmt = db.prepare('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  }
}

