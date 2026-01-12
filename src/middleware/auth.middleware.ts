import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service';
import { UserModel } from '../models/user.model';
import { AuthRequest } from '../types';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = JwtService.verifyToken(token);

    // Verify user still exists
    const user = UserModel.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        res.status(401).json({ message: 'Token expired' });
        return;
      }
      if (error.message === 'Invalid token') {
        res.status(401).json({ message: 'Invalid token' });
        return;
      }
    }
    res.status(401).json({ message: 'Authentication failed' });
  }
}

