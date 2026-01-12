import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import {
  registerValidation,
  loginValidation,
  login2FAValidation,
} from '../utils/validation.util';
import { validateRequest } from '../middleware/error.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', registerValidation, validateRequest, AuthController.register);

/**
 * POST /api/auth/login
 * Login user (returns token or tokenKey if TOTP enabled)
 */
router.post('/login', loginValidation, validateRequest, AuthController.login);

/**
 * POST /api/auth/login-2fa
 * Complete 2FA login with TOTP code
 */
router.post('/login-2fa', login2FAValidation, validateRequest, AuthController.login2FA);

export default router;

