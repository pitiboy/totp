import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model';
import { TotpSecretModel } from '../models/totp-secret.model';
import { User } from '../types';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

/**
 * Authentication Service
 */
export class AuthService {
  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register a new user
   */
  static async register(
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    // Check if username already exists
    const existingUserByUsername = UserModel.findByUsername(username);
    if (existingUserByUsername) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    const existingUserByEmail = UserModel.findByEmail(email);
    if (existingUserByEmail) {
      throw new Error('Email already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = UserModel.create(username, email, passwordHash);
    return user;
  }

  /**
   * Authenticate user with username and password
   */
  static async login(username: string, password: string): Promise<User> {
    const user = UserModel.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await this.verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }

  /**
   * Verify password for sensitive operations
   */
  static async verifyUserPassword(userId: number, password: string): Promise<boolean> {
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.verifyPassword(password, user.password_hash);
  }

  /**
   * Check if user has TOTP enabled
   */
  static hasTotpEnabled(userId: number): boolean {
    const totpSecret = TotpSecretModel.findByUserId(userId);
    return !!totpSecret?.enabled; // Convert SQLite integer (0/1) to boolean
  }
}

