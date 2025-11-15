/**
 * Performance Monitoring System
 * Track and analyze application performance metrics
 */

import { logger, LogCategory } from '../logger/index.js';

/**
 * Performance Monitor class
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.timers = new Map();
  }

  /**
   * Start timing an operation
   */
  start(operationId) {
    this.timers.set(operationId, {
      startTime: performance.now(),
      startMemory: process.memoryUsage(),
    });
  }

  /**
   * End timing an operation
   */
  end(operationId, metadata = {}) {
    const timer = this.timers.get(operationId);

    if (!timer) {
      logger.warn(LogCategory.PERFORMANCE, `Timer not found for operation: ${operationId}`);
      return null;
    }

    const duration = performance.now() - timer.startTime;
    const endMemory = process.memoryUsage();

    const metric = {
      operationId,
      duration,
      durationMs: Math.round(duration),
      memory: {
        heapUsedDelta: endMemory.heapUsed - timer.startMemory.heapUsed,
        heapTotalDelta: endMemory.heapTotal - timer.startMemory.heapTotal,
        externalDelta: endMemory.external - timer.startMemory.external,
      },
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    // Store metric
    if (!this.metrics.has(operationId)) {
      this.metrics.set(operationId, []);
    }

    const metrics = this.metrics.get(operationId);
    metrics.push(metric);

    // Keep only last 100 metrics per operation
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Clean up timer
    this.timers.delete(operationId);

    // Log performance
    logger.logPerformance(operationId, metric.durationMs, metadata);

    return metric;
  }

  /**
   * Measure async operation
   */
  async measure(operationId, operation, metadata = {}) {
    this.start(operationId);

    try {
      const result = await operation();
      this.end(operationId, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.end(operationId, { ...metadata, success: false, error: error.message });
      throw error;
    }
  }

  /**
   * Get metrics for an operation
   */
  getMetrics(operationId) {
    return this.metrics.get(operationId) || [];
  }

  /**
   * Get statistics for an operation
   */
  getStats(operationId) {
    const metrics = this.getMetrics(operationId);

    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration);
    const sorted = [...durations].sort((a, b) => a - b);

    return {
      operationId,
      count: metrics.length,
      avg: Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length),
      min: Math.round(Math.min(...durations)),
      max: Math.round(Math.max(...durations)),
      p50: Math.round(sorted[Math.floor(sorted.length * 0.5)]),
      p95: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
      p99: Math.round(sorted[Math.floor(sorted.length * 0.99)]),
      lastExecuted: metrics[metrics.length - 1].timestamp,
    };
  }

  /**
   * Get all statistics
   */
  getAllStats() {
    const stats = {};

    for (const operationId of this.metrics.keys()) {
      stats[operationId] = this.getStats(operationId);
    }

    return stats;
  }

  /**
   * Clear metrics
   */
  clear(operationId = null) {
    if (operationId) {
      this.metrics.delete(operationId);
    } else {
      this.metrics.clear();
    }
  }
}

// Export singleton
export const perfMonitor = new PerformanceMonitor();

/**
 * API Route Performance Wrapper
 */
export function withPerformanceMonitoring(handler, operationName) {
  return async (req, res) => {
    const operationId = `${operationName || req.url}:${req.method}`;

    perfMonitor.start(operationId);

    try {
      const result = await handler(req, res);

      perfMonitor.end(operationId, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
      });

      return result;
    } catch (error) {
      perfMonitor.end(operationId, {
        method: req.method,
        url: req.url,
        error: error.message,
      });

      throw error;
    }
  };
}

/**
 * Database Query Performance Tracker
 */
export class QueryPerformanceTracker {
  constructor() {
    this.queries = new Map();
  }

  track(table, operation, duration, cached = false) {
    const key = `${table}:${operation}`;

    if (!this.queries.has(key)) {
      this.queries.set(key, {
        table,
        operation,
        executions: [],
      });
    }

    const query = this.queries.get(key);
    query.executions.push({
      duration,
      cached,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 executions
    if (query.executions.length > 100) {
      query.executions.shift();
    }

    // Log slow queries
    if (duration > 1000 && !cached) {
      logger.warn(LogCategory.PERFORMANCE, `Slow query detected: ${key} took ${duration}ms`);
    }
  }

  getStats(table = null, operation = null) {
    const stats = [];

    for (const [key, query] of this.queries.entries()) {
      if (table && query.table !== table) continue;
      if (operation && query.operation !== operation) continue;

      const durations = query.executions.map(e => e.duration);
      const cached = query.executions.filter(e => e.cached).length;

      if (durations.length === 0) continue;

      const sorted = [...durations].sort((a, b) => a - b);

      stats.push({
        table: query.table,
        operation: query.operation,
        count: durations.length,
        cached,
        cacheHitRate: ((cached / durations.length) * 100).toFixed(2) + '%',
        avg: Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length),
        min: Math.round(Math.min(...durations)),
        max: Math.round(Math.max(...durations)),
        p95: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
      });
    }

    return stats;
  }

  getSlowestQueries(limit = 10) {
    const allStats = this.getStats();
    return allStats
      .sort((a, b) => b.avg - a.avg)
      .slice(0, limit);
  }
}

export const queryPerfTracker = new QueryPerformanceTracker();

/**
 * Component Performance Tracker (for client-side)
 */
export class ComponentPerformanceTracker {
  constructor() {
    this.renders = new Map();
  }

  trackRender(componentName, duration, metadata = {}) {
    if (!this.renders.has(componentName)) {
      this.renders.set(componentName, []);
    }

    const renders = this.renders.get(componentName);
    renders.push({
      duration,
      timestamp: new Date().toISOString(),
      ...metadata,
    });

    // Keep only last 50 renders
    if (renders.length > 50) {
      renders.shift();
    }

    // Log slow renders
    if (duration > 100) {
      logger.warn(LogCategory.PERFORMANCE, `Slow component render: ${componentName} took ${duration}ms`);
    }
  }

  getStats(componentName = null) {
    const stats = [];

    for (const [name, renders] of this.renders.entries()) {
      if (componentName && name !== componentName) continue;

      const durations = renders.map(r => r.duration);

      if (durations.length === 0) continue;

      const sorted = [...durations].sort((a, b) => a - b);

      stats.push({
        component: name,
        renders: durations.length,
        avg: Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length),
        min: Math.round(Math.min(...durations)),
        max: Math.round(Math.max(...durations)),
        p95: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
      });
    }

    return stats;
  }

  getSlowestComponents(limit = 10) {
    const allStats = this.getStats();
    return allStats
      .sort((a, b) => b.avg - a.avg)
      .slice(0, limit);
  }
}

export const componentPerfTracker = new ComponentPerformanceTracker();

/**
 * Memory Usage Tracker
 */
export class MemoryTracker {
  constructor() {
    this.snapshots = [];
    this.maxSnapshots = 100;
  }

  snapshot(label = 'default') {
    const usage = process.memoryUsage();

    this.snapshots.push({
      label,
      timestamp: new Date().toISOString(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      arrayBuffers: usage.arrayBuffers,
    });

    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    // Warn if memory usage is high
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    if (heapUsedMB > 500) {
      logger.warn(LogCategory.PERFORMANCE, `High memory usage: ${Math.round(heapUsedMB)}MB`);
    }

    return usage;
  }

  getSnapshots(label = null) {
    if (label) {
      return this.snapshots.filter(s => s.label === label);
    }
    return this.snapshots;
  }

  getCurrentUsage() {
    const usage = process.memoryUsage();

    return {
      heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
      externalMB: Math.round(usage.external / 1024 / 1024),
      rssMB: Math.round(usage.rss / 1024 / 1024),
      heapUsagePercent: ((usage.heapUsed / usage.heapTotal) * 100).toFixed(2) + '%',
    };
  }

  getMemoryTrend() {
    if (this.snapshots.length < 2) {
      return null;
    }

    const recent = this.snapshots.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];

    const heapGrowth = last.heapUsed - first.heapUsed;
    const heapGrowthMB = heapGrowth / 1024 / 1024;

    return {
      timeSpan: new Date(last.timestamp) - new Date(first.timestamp),
      heapGrowthMB: Math.round(heapGrowthMB),
      trend: heapGrowth > 0 ? 'increasing' : heapGrowth < 0 ? 'decreasing' : 'stable',
    };
  }
}

export const memoryTracker = new MemoryTracker();

// Auto-snapshot every 5 minutes in production
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    memoryTracker.snapshot('auto');
  }, 5 * 60 * 1000);
}
