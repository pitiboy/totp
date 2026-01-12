import jwt from 'jsonwebtoken';
import { JwtUserPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * JWT Service for token generation and verification
 */
export class JwtService {
  /**
   * Generate JWT token for user
   */
  static generateToken(userId: number, username: string, email: string): string {
    const payload: JwtUserPayload = {
      userId,
      username,
      email,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): JwtUserPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Generate temporary token key for 2FA flow
   * This is a short-lived token that allows the user to complete 2FA
   */
  static generateTokenKey(userId: number, username: string): string {
    const payload = {
      userId,
      username,
      type: '2fa-token-key',
    };

    // Token key expires in 5 minutes
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '5m',
    });
  }

  /**
   * Verify token key from 2FA flow
   */
  static verifyTokenKey(tokenKey: string): { userId: number; username: string } {
    try {
      const decoded = jwt.verify(tokenKey, JWT_SECRET) as {
        userId: number;
        username: string;
        type: string;
      };

      if (decoded.type !== '2fa-token-key') {
        throw new Error('Invalid token key type');
      }

      return {
        userId: decoded.userId,
        username: decoded.username,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token key');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token key expired');
      }
      throw new Error('Token key verification failed');
    }
  }
}

