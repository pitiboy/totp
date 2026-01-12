import { body, ValidationChain } from 'express-validator';

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Username validation regex (alphanumeric, underscore, hyphen, 3-20 chars)
 */
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

/**
 * TOTP code validation regex (6 digits)
 */
const TOTP_CODE_REGEX = /^\d{6}$/;

/**
 * Password strength validation
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

/**
 * Validate TOTP code format
 */
export function isValidTotpCode(code: string): boolean {
  return TOTP_CODE_REGEX.test(code);
}

/**
 * Express validation chains
 */
export const registerValidation: ValidationChain[] = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(USERNAME_REGEX)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value) => {
      if (!isStrongPassword(value)) {
        throw new Error(
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        );
      }
      return true;
    }),
];

export const loginValidation: ValidationChain[] = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const login2FAValidation: ValidationChain[] = [
  body('tokenKey').trim().notEmpty().withMessage('Token key is required'),
  body('totpCode')
    .trim()
    .notEmpty()
    .withMessage('TOTP code is required')
    .matches(TOTP_CODE_REGEX)
    .withMessage('TOTP code must be 6 digits'),
];

export const totpVerifyValidation: ValidationChain[] = [
  body('totpCode')
    .trim()
    .notEmpty()
    .withMessage('TOTP code is required')
    .matches(TOTP_CODE_REGEX)
    .withMessage('TOTP code must be 6 digits'),
];

export const totpEnableValidation: ValidationChain[] = [
  body('totpCode')
    .trim()
    .notEmpty()
    .withMessage('TOTP code is required')
    .matches(TOTP_CODE_REGEX)
    .withMessage('TOTP code must be 6 digits'),
];

export const totpDisableValidation: ValidationChain[] = [
  body('password').notEmpty().withMessage('Password is required'),
];

export const backupCodesValidation: ValidationChain[] = [
  body('password').notEmpty().withMessage('Password is required'),
];

