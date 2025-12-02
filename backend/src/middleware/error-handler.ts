import { Request, Response, NextFunction } from 'express';

/**
 * AppError - Custom error class for operational errors
 * Distinguishes between operational errors (safe to expose) and programming errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default to 500 Internal Server Error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle AppError (operational errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Handle Prisma errors
  else if (err.constructor.name.includes('Prisma')) {
    statusCode = 400;
    message = 'Database operation failed';
    isOperational = true;

    // Handle specific Prisma errors
    if (err.message.includes('Unique constraint')) {
      statusCode = 409;
      message = 'Resource already exists';
    } else if (err.message.includes('Foreign key constraint')) {
      statusCode = 400;
      message = 'Invalid reference';
    } else if (err.message.includes('Record to update not found')) {
      statusCode = 404;
      message = 'Resource not found';
    }
  }

  // Handle validation errors (Zod, express-validator, etc)
  else if (err.name === 'ValidationError' || err.message.includes('validation')) {
    statusCode = 400;
    message = err.message || 'Validation failed';
    isOperational = true;
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
    isOperational = true;
  }

  // Log error (in production, use structured logging service)
  const logLevel = isOperational ? 'warn' : 'error';
  console[logLevel](`[${statusCode}] ${message}`, {
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Don't expose stack traces in production
  const response: any = {
    status: 'error',
    message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    response.error = err.message;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found Handler
 * Catches requests to non-existent routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
}

/**
 * Async handler wrapper
 * Catches errors in async route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Common error factory functions
 */
export const Errors = {
  NotFound: (resource: string = 'Resource') =>
    new AppError(`${resource} not found`, 404),

  BadRequest: (message: string = 'Bad request') =>
    new AppError(message, 400),

  Unauthorized: (message: string = 'Unauthorized') =>
    new AppError(message, 401),

  Forbidden: (message: string = 'Forbidden') =>
    new AppError(message, 403),

  Conflict: (message: string = 'Resource already exists') =>
    new AppError(message, 409),

  TooManyRequests: (message: string = 'Too many requests') =>
    new AppError(message, 429),

  InternalServerError: (message: string = 'Internal server error') =>
    new AppError(message, 500, false),
};
