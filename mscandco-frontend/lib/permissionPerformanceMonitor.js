/**
 * Permission System Performance Monitor
 *
 * Tracks and reports performance metrics for permission checks:
 * - Server-side permission check duration
 * - Database query performance
 * - Cache hit rates (if caching is added)
 * - Permission check frequency
 */

class PermissionPerformanceMonitor {
  constructor() {
    this.metrics = {
      checks: [],
      totalChecks: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      avgDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
    };

    this.enabled = process.env.NEXT_PUBLIC_ENABLE_PERMISSION_MONITORING === 'true';
    this.maxStoredChecks = 100; // Keep last 100 checks in memory
  }

  /**
   * Record a permission check
   */
  recordCheck({
    userId,
    permission,
    duration,
    success,
    cached = false,
    error = null,
    timestamp = new Date().toISOString()
  }) {
    if (!this.enabled) return;

    this.metrics.totalChecks++;

    if (cached) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    if (error) {
      this.metrics.errors++;
    }

    // Update duration stats
    if (duration) {
      this.metrics.maxDuration = Math.max(this.metrics.maxDuration, duration);
      this.metrics.minDuration = Math.min(this.metrics.minDuration, duration);

      // Calculate rolling average
      const totalDuration = this.metrics.avgDuration * (this.metrics.totalChecks - 1) + duration;
      this.metrics.avgDuration = totalDuration / this.metrics.totalChecks;
    }

    // Store check details (keep only last N checks)
    const checkRecord = {
      timestamp,
      userId,
      permission,
      duration,
      success,
      cached,
      error: error ? error.message : null,
    };

    this.metrics.checks.push(checkRecord);

    // Keep only last N checks
    if (this.metrics.checks.length > this.maxStoredChecks) {
      this.metrics.checks.shift();
    }

    // Log slow checks
    if (duration > 1000) {
        permission,
        duration: `${duration}ms`,
        userId,
      });
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.totalChecks > 0
        ? (this.metrics.cacheHits / this.metrics.totalChecks * 100).toFixed(2) + '%'
        : '0%',
      errorRate: this.metrics.totalChecks > 0
        ? (this.metrics.errors / this.metrics.totalChecks * 100).toFixed(2) + '%'
        : '0%',
    };
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const metrics = this.getMetrics();

    return {
      totalChecks: metrics.totalChecks,
      avgDuration: Math.round(metrics.avgDuration) + 'ms',
      maxDuration: metrics.maxDuration === 0 ? 'N/A' : metrics.maxDuration + 'ms',
      minDuration: metrics.minDuration === Infinity ? 'N/A' : metrics.minDuration + 'ms',
      cacheHitRate: metrics.cacheHitRate,
      errorRate: metrics.errorRate,
      recentChecks: this.metrics.checks.slice(-10), // Last 10 checks
    };
  }

  /**
   * Get slow permission checks (> threshold ms)
   */
  getSlowChecks(thresholdMs = 500) {
    return this.metrics.checks.filter(check => check.duration > thresholdMs);
  }

  /**
   * Get checks by user
   */
  getChecksByUser(userId) {
    return this.metrics.checks.filter(check => check.userId === userId);
  }

  /**
   * Get checks by permission
   */
  getChecksByPermission(permission) {
    return this.metrics.checks.filter(check => check.permission === permission);
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      checks: [],
      totalChecks: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      avgDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
    };
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics() {
    return JSON.stringify(this.getMetrics(), null, 2);
  }

  /**
   * Log current metrics to console
   */
  logMetrics() {
    if (!this.enabled) {
      return;
    }


    const summary = this.getSummary();


    summary.recentChecks.forEach((check, i) => {
      const status = check.success ? '✅' : '❌';
      const cached = check.cached ? '💾' : '🔍';
    });

    const slowChecks = this.getSlowChecks();
    if (slowChecks.length > 0) {
      slowChecks.slice(0, 5).forEach((check, i) => {
      });
    }

  }
}

// Singleton instance
const permissionMonitor = new PermissionPerformanceMonitor();

// Helper function to wrap permission checks with monitoring
export function monitorPermissionCheck(permissionCheckFn) {
  return async (...args) => {
    const startTime = Date.now();
    let result;
    let error = null;

    try {
      result = await permissionCheckFn(...args);
      return result;
    } catch (err) {
      error = err;
      throw err;
    } finally {
      const duration = Date.now() - startTime;

      // Extract permission info from args (customize based on your function signature)
      const permission = args[1] || 'unknown';
      const userId = result?.user?.id || 'unknown';

      permissionMonitor.recordCheck({
        userId,
        permission,
        duration,
        success: !error,
        error,
      });
    }
  };
}

export default permissionMonitor;
