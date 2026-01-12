import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../types';

/**
 * Error handling middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      message: 'Validation error',
      errors: (err as any).errors,
    });
    return;
  }

  // Default error response
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}

/**
 * Validation result middleware
 * Checks for validation errors and returns them
 */
export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMap: Record<string, string[]> = {};
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        const field = error.path;
        if (!errorMap[field]) {
          errorMap[field] = [];
        }
        errorMap[field].push(error.msg);
      }
    });

    res.status(400).json({
      message: 'Validation failed',
      errors: errorMap,
    });
    return;
  }
  next();
}

