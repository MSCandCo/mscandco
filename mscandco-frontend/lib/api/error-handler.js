/**
 * Comprehensive API Error Handler
 * Standardized error handling, logging, and response formatting
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Standard API error types
 */
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  DATABASE: 'DATABASE_ERROR',
  EXTERNAL_API: 'EXTERNAL_API_ERROR',
  INTERNAL: 'INTERNAL_SERVER_ERROR',
};

/**
 * HTTP status codes for error types
 */
const ErrorStatusCodes = {
  [ErrorTypes.VALIDATION]: 400,
  [ErrorTypes.AUTHENTICATION]: 401,
  [ErrorTypes.AUTHORIZATION]: 403,
  [ErrorTypes.NOT_FOUND]: 404,
  [ErrorTypes.CONFLICT]: 409,
  [ErrorTypes.RATE_LIMIT]: 429,
  [ErrorTypes.DATABASE]: 500,
  [ErrorTypes.EXTERNAL_API]: 502,
  [ErrorTypes.INTERNAL]: 500,
};

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(type, message, details = null, statusCode = null) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.details = details;
    this.statusCode = statusCode || ErrorStatusCodes[type] || 500;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Format error response
 */
export function formatErrorResponse(error) {
  // Handle APIError instances
  if (error instanceof APIError) {
    return {
      success: false,
      error: {
        type: error.type,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp,
      },
      statusCode: error.statusCode,
    };
  }

  // Handle Supabase errors
  if (error.code && error.message) {
    return {
      success: false,
      error: {
        type: ErrorTypes.DATABASE,
        message: 'Database operation failed',
        details: {
          code: error.code,
          hint: error.hint,
          message: error.message,
        },
        timestamp: new Date().toISOString(),
      },
      statusCode: 500,
    };
  }

  // Handle generic errors
  return {
    success: false,
    error: {
      type: ErrorTypes.INTERNAL,
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message,
      details: process.env.NODE_ENV === 'production' ? null : {
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
    },
    statusCode: 500,
  };
}

/**
 * Send error response
 */
export function sendErrorResponse(res, error) {
  const response = formatErrorResponse(error);

  // Log error to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: {
        errorType: response.error.type,
      },
      extra: {
        details: response.error.details,
      },
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', {
      type: response.error.type,
      message: response.error.message,
      details: response.error.details,
      stack: error.stack,
    });
  }

  return res.status(response.statusCode).json(response);
}

/**
 * Success response formatter
 */
export function sendSuccessResponse(res, data, meta = null, statusCode = 200) {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

/**
 * API route wrapper with error handling
 */
export function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  };
}

/**
 * Validate request body
 */
export function validateRequestBody(body, schema) {
  const errors = [];

  Object.entries(schema).forEach(([field, rules]) => {
    const value = body[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field} is required`,
        rule: 'required',
      });
      return;
    }

    // Skip other validations if not required and empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      return;
    }

    // Type check
    if (rules.type && typeof value !== rules.type) {
      errors.push({
        field,
        message: `${field} must be of type ${rules.type}`,
        rule: 'type',
      });
    }

    // Min length
    if (rules.minLength && value.length < rules.minLength) {
      errors.push({
        field,
        message: `${field} must be at least ${rules.minLength} characters`,
        rule: 'minLength',
      });
    }

    // Max length
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push({
        field,
        message: `${field} must not exceed ${rules.maxLength} characters`,
        rule: 'maxLength',
      });
    }

    // Pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push({
        field,
        message: rules.patternMessage || `${field} format is invalid`,
        rule: 'pattern',
      });
    }

    // Min value
    if (rules.min !== undefined && value < rules.min) {
      errors.push({
        field,
        message: `${field} must be at least ${rules.min}`,
        rule: 'min',
      });
    }

    // Max value
    if (rules.max !== undefined && value > rules.max) {
      errors.push({
        field,
        message: `${field} must not exceed ${rules.max}`,
        rule: 'max',
      });
    }

    // Enum
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push({
        field,
        message: `${field} must be one of: ${rules.enum.join(', ')}`,
        rule: 'enum',
      });
    }

    // Custom validator
    if (rules.validator && !rules.validator(value)) {
      errors.push({
        field,
        message: rules.validatorMessage || `${field} validation failed`,
        rule: 'custom',
      });
    }
  });

  if (errors.length > 0) {
    throw new APIError(
      ErrorTypes.VALIDATION,
      'Request validation failed',
      { errors }
    );
  }

  return true;
}

/**
 * Method validation middleware
 */
export function validateMethod(req, allowedMethods) {
  const methods = Array.isArray(allowedMethods) ? allowedMethods : [allowedMethods];

  if (!methods.includes(req.method)) {
    throw new APIError(
      ErrorTypes.VALIDATION,
      `Method ${req.method} not allowed. Allowed methods: ${methods.join(', ')}`,
      { allowedMethods: methods }
    );
  }
}

/**
 * Try-catch wrapper for async operations
 */
export async function tryCatch(operation, errorMessage) {
  try {
    return await operation();
  } catch (error) {
    throw new APIError(
      ErrorTypes.INTERNAL,
      errorMessage || 'Operation failed',
      { originalError: error.message }
    );
  }
}

/**
 * Database error handler
 */
export function handleDatabaseError(error, operation) {
  console.error(`[Database Error] ${operation}:`, error);

  if (error.code === '23505') {
    throw new APIError(
      ErrorTypes.CONFLICT,
      'A record with this data already exists',
      { code: error.code, constraint: error.constraint }
    );
  }

  if (error.code === '23503') {
    throw new APIError(
      ErrorTypes.VALIDATION,
      'Referenced record does not exist',
      { code: error.code, constraint: error.constraint }
    );
  }

  throw new APIError(
    ErrorTypes.DATABASE,
    `Database ${operation} failed`,
    { code: error.code, message: error.message }
  );
}

/**
 * Log API request
 */
export function logRequest(req) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${req.method} ${req.url}`, {
      query: req.query,
      body: req.body ? Object.keys(req.body) : null,
    });
  }
}
