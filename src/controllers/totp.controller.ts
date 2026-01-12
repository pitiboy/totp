import { Response } from 'express';
import { AuthRequest, TotpVerifyRequest, TotpEnableRequest, TotpDisableRequest, BackupCodesRequest } from '../types';
import { TotpService } from '../services/totp.service';
import { AuthService } from '../services/auth.service';

/**
 * TOTP Controller
 */
export class TotpController {
  /**
   * Start TOTP setup
   * Generates secret, QR code, and backup codes
   */
  static async setup(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const { secret, qrCode, backupCodes } = await TotpService.setup(req.user.id);

      res.json({
        secret,
        qrCode,
        backupCodes,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'TOTP setup failed' });
    }
  }

  /**
   * Verify TOTP code during setup
   */
  static async verify(req: AuthRequest<{}, {}, TotpVerifyRequest>, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const { totpCode } = req.body;

      const isValid = await TotpService.verifySetup(req.user.id, totpCode);

      if (!isValid) {
        res.status(400).json({ message: 'Invalid TOTP code', success: false });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message, success: false });
        return;
      }
      res.status(500).json({ message: 'TOTP verification failed', success: false });
    }
  }

  /**
   * Enable TOTP
   * Requires verified TOTP code from setup
   */
  static async enable(req: AuthRequest<{}, {}, TotpEnableRequest>, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const { totpCode } = req.body;

      // Enable TOTP (backup codes are stored temporarily from setup)
      await TotpService.enable(req.user.id, totpCode);

      res.json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message, success: false });
        return;
      }
      res.status(500).json({ message: 'Failed to enable TOTP', success: false });
    }
  }

  /**
   * Disable TOTP
   * Requires password confirmation
   */
  static async disable(req: AuthRequest<{}, {}, TotpDisableRequest>, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const { password } = req.body;

      // Verify password
      const isValid = await AuthService.verifyUserPassword(req.user.id, password);
      if (!isValid) {
        res.status(400).json({ message: 'Invalid password', success: false });
        return;
      }

      // Disable TOTP
      TotpService.disable(req.user.id);

      res.json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message, success: false });
        return;
      }
      res.status(500).json({ message: 'Failed to disable TOTP', success: false });
    }
  }

  /**
   * Get TOTP status
   */
  static async status(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const status = TotpService.getStatus(req.user.id);

      res.json(status);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get TOTP status' });
    }
  }

  /**
   * Regenerate backup codes
   * Requires password confirmation
   */
  static async regenerateBackupCodes(
    req: AuthRequest<{}, {}, BackupCodesRequest>,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const { password } = req.body;

      // Verify password
      const isValid = await AuthService.verifyUserPassword(req.user.id, password);
      if (!isValid) {
        res.status(400).json({ message: 'Invalid password' });
        return;
      }

      // Regenerate backup codes
      const backupCodes = await TotpService.regenerateBackupCodes(req.user.id);

      res.json({ backupCodes });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to regenerate backup codes' });
    }
  }
}

