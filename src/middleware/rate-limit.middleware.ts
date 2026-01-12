import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for TOTP verification endpoints
 * Max 5 attempts per 15 minutes
 */
export const totpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    message: 'Too many TOTP verification attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

