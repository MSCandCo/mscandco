/**
 * Comprehensive Logging System
 * Structured logging with multiple transports and log levels
 */

import * as Sentry from '@sentry/nextjs';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Log levels
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

const LogLevelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

/**
 * Log categories
 */
export const LogCategory = {
  API: 'api',
  AUTH: 'auth',
  DATABASE: 'database',
  PAYMENT: 'payment',
  APOLLO: 'apollo',
  ANALYTICS: 'analytics',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  SYSTEM: 'system',
};

/**
 * Logger class
 */
class Logger {
  constructor() {
    this.minLevel = process.env.LOG_LEVEL
      ? LogLevel[process.env.LOG_LEVEL.toUpperCase()]
      : (process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG);

    this.logs = [];
    this.maxLogs = 1000;
  }

  /**
   * Format log entry
   */
  formatLog(level, category, message, data = null, error = null) {
    return {
      timestamp: new Date().toISOString(),
      level: LogLevelNames[level],
      category,
      message,
      data,
      error: error ? {
        message: error.message,
        stack: error.stack,
        code: error.code,
      } : null,
      env: process.env.NODE_ENV,
      pid: process.pid,
    };
  }

  /**
   * Write log entry
   */
  async write(level, category, message, data = null, error = null) {
    // Skip if below minimum level
    if (level < this.minLevel) return;

    const log = this.formatLog(level, category, message, data, error);

    // Console output
    this.logToConsole(log);

    // Store in memory
    this.logs.push(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Store in Redis for production
    if (redis && process.env.NODE_ENV === 'production') {
      try {
        await redis.lpush('logs', JSON.stringify(log));
        await redis.ltrim('logs', 0, 9999); // Keep last 10,000 logs
      } catch (err) {
        console.error('[Logger] Redis error:', err);
      }
    }

    // Send to Sentry for errors
    if (level >= LogLevel.ERROR && process.env.NODE_ENV === 'production') {
      Sentry.captureException(error || new Error(message), {
        level: level === LogLevel.FATAL ? 'fatal' : 'error',
        tags: {
          category,
        },
        extra: {
          data,
        },
      });
    }
  }

  /**
   * Console output with colors
   */
  logToConsole(log) {
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[35m', // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[log.level] || reset;

    const prefix = `${color}[${log.timestamp}] [${log.level}] [${log.category}]${reset}`;

    console.log(prefix, log.message);

    if (log.data) {
      console.log('  Data:', log.data);
    }

    if (log.error) {
      console.error('  Error:', log.error.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('  Stack:', log.error.stack);
      }
    }
  }

  /**
   * Debug level
   */
  debug(category, message, data = null) {
    return this.write(LogLevel.DEBUG, category, message, data);
  }

  /**
   * Info level
   */
  info(category, message, data = null) {
    return this.write(LogLevel.INFO, category, message, data);
  }

  /**
   * Warning level
   */
  warn(category, message, data = null) {
    return this.write(LogLevel.WARN, category, message, data);
  }

  /**
   * Error level
   */
  error(category, message, error = null, data = null) {
    return this.write(LogLevel.ERROR, category, message, data, error);
  }

  /**
   * Fatal level
   */
  fatal(category, message, error = null, data = null) {
    return this.write(LogLevel.FATAL, category, message, data, error);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit = 100, level = null, category = null) {
    let filtered = this.logs;

    if (level !== null) {
      filtered = filtered.filter(log => LogLevel[log.level] >= level);
    }

    if (category) {
      filtered = filtered.filter(log => log.category === category);
    }

    return filtered.slice(-limit);
  }

  /**
   * Get logs from Redis
   */
  async getLogsFromRedis(limit = 100) {
    if (!redis) return [];

    try {
      const logs = await redis.lrange('logs', 0, limit - 1);
      return logs.map(log => JSON.parse(log));
    } catch (error) {
      console.error('[Logger] Failed to fetch logs from Redis:', error);
      return [];
    }
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * API request logger
   */
  logRequest(req, duration = null) {
    this.info(LogCategory.API, `${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      query: req.query,
      userId: req.user?.id,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      duration: duration ? `${duration}ms` : null,
    });
  }

  /**
   * API response logger
   */
  logResponse(req, res, duration) {
    const level = res.statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;

    this.write(level, LogCategory.API, `${req.method} ${req.url} - ${res.statusCode}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    });
  }

  /**
   * Database query logger
   */
  logQuery(table, operation, duration, error = null) {
    if (error) {
      this.error(LogCategory.DATABASE, `Query failed: ${table}.${operation}`, error, {
        table,
        operation,
        duration: `${duration}ms`,
      });
    } else if (duration > 1000) {
      this.warn(LogCategory.DATABASE, `Slow query: ${table}.${operation}`, {
        table,
        operation,
        duration: `${duration}ms`,
      });
    } else {
      this.debug(LogCategory.DATABASE, `Query: ${table}.${operation}`, {
        table,
        operation,
        duration: `${duration}ms`,
      });
    }
  }

  /**
   * Authentication logger
   */
  logAuth(action, userId, success, details = null) {
    const level = success ? LogLevel.INFO : LogLevel.WARN;

    this.write(level, LogCategory.AUTH, `${action}: ${success ? 'success' : 'failed'}`, {
      action,
      userId,
      success,
      ...details,
    });
  }

  /**
   * Payment logger
   */
  logPayment(action, userId, amount, currency, success, details = null) {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;

    this.write(level, LogCategory.PAYMENT, `Payment ${action}: ${success ? 'success' : 'failed'}`, {
      action,
      userId,
      amount,
      currency,
      success,
      ...details,
    });
  }

  /**
   * Performance logger
   */
  logPerformance(operation, duration, metadata = null) {
    const level = duration > 5000 ? LogLevel.WARN : LogLevel.DEBUG;

    this.write(level, LogCategory.PERFORMANCE, `${operation} took ${duration}ms`, {
      operation,
      duration: `${duration}ms`,
      ...metadata,
    });
  }

  /**
   * Security logger
   */
  logSecurity(event, severity, details) {
    const levelMap = {
      low: LogLevel.INFO,
      medium: LogLevel.WARN,
      high: LogLevel.ERROR,
      critical: LogLevel.FATAL,
    };

    this.write(levelMap[severity] || LogLevel.WARN, LogCategory.SECURITY, event, {
      severity,
      ...details,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (category, message, data) => logger.debug(category, message, data),
  info: (category, message, data) => logger.info(category, message, data),
  warn: (category, message, data) => logger.warn(category, message, data),
  error: (category, message, error, data) => logger.error(category, message, error, data),
  fatal: (category, message, error, data) => logger.fatal(category, message, error, data),

  // Specialized loggers
  request: (req, duration) => logger.logRequest(req, duration),
  response: (req, res, duration) => logger.logResponse(req, res, duration),
  query: (table, operation, duration, error) => logger.logQuery(table, operation, duration, error),
  auth: (action, userId, success, details) => logger.logAuth(action, userId, success, details),
  payment: (action, userId, amount, currency, success, details) =>
    logger.logPayment(action, userId, amount, currency, success, details),
  performance: (operation, duration, metadata) => logger.logPerformance(operation, duration, metadata),
  security: (event, severity, details) => logger.logSecurity(event, severity, details),
};

export default logger;
