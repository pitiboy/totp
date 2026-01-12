import { Router } from 'express';
import { TotpController } from '../controllers/totp.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  totpVerifyValidation,
  totpEnableValidation,
  totpDisableValidation,
  backupCodesValidation,
} from '../utils/validation.util';
import { validateRequest } from '../middleware/error.middleware';
import { totpRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// All TOTP routes require authentication
router.use(authenticate);

/**
 * POST /api/totp/setup
 * Start TOTP setup (generates secret, QR code, backup codes)
 */
router.post('/setup', TotpController.setup);

/**
 * POST /api/totp/verify
 * Verify TOTP code during setup
 */
router.post(
  '/verify',
  totpVerifyValidation,
  validateRequest,
  totpRateLimiter,
  TotpController.verify
);

/**
 * POST /api/totp/enable
 * Enable TOTP (requires verified code from setup)
 */
router.post(
  '/enable',
  totpEnableValidation,
  validateRequest,
  totpRateLimiter,
  TotpController.enable
);

/**
 * POST /api/totp/disable
 * Disable TOTP (requires password confirmation)
 */
router.post(
  '/disable',
  totpDisableValidation,
  validateRequest,
  TotpController.disable
);

/**
 * GET /api/totp/status
 * Get TOTP status
 */
router.get('/status', TotpController.status);

/**
 * POST /api/totp/backup-codes
 * Regenerate backup codes (requires password)
 */
router.post(
  '/backup-codes',
  backupCodesValidation,
  validateRequest,
  TotpController.regenerateBackupCodes
);

export default router;

