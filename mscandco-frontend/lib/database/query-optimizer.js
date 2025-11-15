/**
 * Database Query Optimizer
 * Provides optimized query patterns and caching strategies
 */

import { createClient } from '@supabase/supabase-js';
import { LRUCache } from 'lru-cache';

// Query cache with 1-hour TTL and max 500 items
const queryCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
  updateAgeOnGet: true,
  updateAgeOnHas: false,
});

/**
 * Create a cache key from query parameters
 */
function createCacheKey(table, query) {
  return `${table}:${JSON.stringify(query)}`;
}

/**
 * Optimized query executor with automatic caching
 */
export async function executeOptimizedQuery(supabase, table, queryBuilder, options = {}) {
  const {
    cache = true,
    cacheTTL = 60000, // 1 minute default
    select = '*',
    filters = {},
    orderBy = null,
    limit = null,
    offset = null,
  } = options;

  // Build cache key
  const cacheKey = cache ? createCacheKey(table, { select, filters, orderBy, limit, offset }) : null;

  // Check cache
  if (cache && cacheKey) {
    const cached = queryCache.get(cacheKey);
    if (cached) {
      return { data: cached, error: null, cached: true };
    }
  }

  // Build query
  let query = supabase.from(table).select(select);

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && value.operator) {
        // Support for advanced operators: { operator: 'gte', value: 10 }
        query = query[value.operator](key, value.value);
      } else {
        query = query.eq(key, value);
      }
    }
  });

  // Apply ordering
  if (orderBy) {
    const { column, ascending = true } = orderBy;
    query = query.order(column, { ascending });
  }

  // Apply pagination
  if (limit) query = query.limit(limit);
  if (offset) query = query.range(offset, offset + (limit || 10) - 1);

  // Execute query
  const { data, error } = await query;

  // Cache result if successful
  if (cache && !error && data && cacheKey) {
    queryCache.set(cacheKey, data, { ttl: cacheTTL });
  }

  return { data, error, cached: false };
}

/**
 * Batch fetch multiple related records efficiently
 */
export async function batchFetch(supabase, queries) {
  const promises = queries.map(({ table, options }) =>
    executeOptimizedQuery(supabase, table, null, options)
  );

  const results = await Promise.all(promises);

  return results.reduce((acc, result, index) => {
    acc[queries[index].key || index] = result;
    return acc;
  }, {});
}

/**
 * Invalidate cache for a specific table
 */
export function invalidateCache(table) {
  const keys = Array.from(queryCache.keys());
  keys.forEach(key => {
    if (key.startsWith(`${table}:`)) {
      queryCache.delete(key);
    }
  });
}

/**
 * Clear entire cache
 */
export function clearCache() {
  queryCache.clear();
}

/**
 * Optimized user profile fetch with related data
 */
export async function fetchUserWithRelations(supabase, userId) {
  return batchFetch(supabase, [
    {
      key: 'profile',
      table: 'user_profiles',
      options: {
        filters: { id: userId },
        cache: true,
        cacheTTL: 300000, // 5 minutes
      }
    },
    {
      key: 'releases',
      table: 'releases',
      options: {
        filters: { user_id: userId },
        orderBy: { column: 'created_at', ascending: false },
        limit: 10,
        cache: true,
        cacheTTL: 60000, // 1 minute
      }
    },
    {
      key: 'analytics',
      table: 'analytics',
      options: {
        filters: { user_id: userId },
        orderBy: { column: 'date', ascending: false },
        limit: 30,
        cache: true,
        cacheTTL: 120000, // 2 minutes
      }
    }
  ]);
}

/**
 * Optimized pagination helper
 */
export function createPaginationQuery(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  return {
    limit: pageSize,
    offset,
    range: [offset, offset + pageSize - 1]
  };
}

/**
 * Query performance monitor
 */
export class QueryMonitor {
  constructor() {
    this.queries = [];
    this.slowQueryThreshold = 1000; // 1 second
  }

  track(table, duration, cached) {
    const query = {
      table,
      duration,
      cached,
      timestamp: new Date().toISOString(),
    };

    this.queries.push(query);

    // Keep only last 100 queries
    if (this.queries.length > 100) {
      this.queries.shift();
    }

    // Log slow queries
    if (duration > this.slowQueryThreshold && !cached) {
      console.warn(`[QueryMonitor] Slow query detected: ${table} took ${duration}ms`);
    }
  }

  getStats() {
    const total = this.queries.length;
    const cached = this.queries.filter(q => q.cached).length;
    const avgDuration = this.queries.reduce((sum, q) => sum + q.duration, 0) / total;
    const slowQueries = this.queries.filter(q => q.duration > this.slowQueryThreshold);

    return {
      total,
      cached,
      cacheHitRate: ((cached / total) * 100).toFixed(2) + '%',
      avgDuration: Math.round(avgDuration) + 'ms',
      slowQueries: slowQueries.length,
      slowQueryDetails: slowQueries.map(q => ({
        table: q.table,
        duration: q.duration + 'ms',
        timestamp: q.timestamp
      }))
    };
  }
}

export const queryMonitor = new QueryMonitor();
