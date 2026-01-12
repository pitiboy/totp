import { Response } from 'express';
import { AuthRequest, LoginRequest, RegisterRequest, Login2FARequest } from '../types';
import { AuthService } from '../services/auth.service';
import { JwtService } from '../services/jwt.service';
import { TotpService } from '../services/totp.service';
import { UserModel } from '../models/user.model';

/**
 * Authentication Controller
 */
export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: AuthRequest<{}, {}, RegisterRequest>, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      const user = await AuthService.register(username, email, password);

      const token = JwtService.generateToken(user.id, user.username, user.email);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({ message: error.message });
          return;
        }
      }
      res.status(500).json({ message: 'Registration failed' });
    }
  }

  /**
   * Login user
   * Returns JWT token directly if TOTP is not enabled
   * Returns tokenKey if TOTP is enabled (requires 2FA)
   */
  static async login(req: AuthRequest<{}, {}, LoginRequest>, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const user = await AuthService.login(username, password);

      // Check if TOTP is enabled
      const hasTotp = AuthService.hasTotpEnabled(user.id);

      if (hasTotp) {
        // Generate token key for 2FA flow
        const tokenKey = JwtService.generateTokenKey(user.id, user.username);

        res.json({
          tokenKey,
          requiresTotp: true,
        });
      } else {
        // Generate JWT token directly
        const token = JwtService.generateToken(user.id, user.username, user.email);

        res.json({
          token,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid credentials') {
          res.status(401).json({ message: error.message });
          return;
        }
      }
      res.status(500).json({ message: 'Login failed' });
    }
  }

  /**
   * Complete 2FA login
   * Verifies TOTP code and returns JWT token
   */
  static async login2FA(req: AuthRequest<{}, {}, Login2FARequest>, res: Response): Promise<void> {
    try {
      const { tokenKey, totpCode } = req.body;

      // Verify token key
      const { userId } = JwtService.verifyTokenKey(tokenKey);

      // Verify TOTP code
      const isValid = await TotpService.verifyLogin(userId, totpCode);

      if (!isValid) {
        res.status(401).json({ message: 'Invalid TOTP code' });
        return;
      }

      // Get user by ID
      const user = UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Generate JWT token
      const token = JwtService.generateToken(user.id, user.username, user.email);

      res.json({
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid') || error.message.includes('expired')) {
          res.status(401).json({ message: error.message });
          return;
        }
        if (error.message === 'TOTP is not enabled for this user') {
          res.status(400).json({ message: error.message });
          return;
        }
      }
      res.status(500).json({ message: '2FA verification failed' });
    }
  }
}

