/**
 * Comprehensive Testing Utilities
 * Helpers for unit, integration, and E2E testing
 */

/**
 * Mock Supabase client for testing
 */
export function createMockSupabaseClient(overrides = {}) {
  const mockData = {
    user_profiles: [],
    releases: [],
    analytics: [],
    ...overrides.data
  };

  const mockClient = {
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: async () => ({
            data: mockData[table]?.find(item => item[column] === value) || null,
            error: null
          }),
          limit: (limit) => ({
            order: (column, options) => ({
              then: async (resolve) => resolve({
                data: mockData[table]?.slice(0, limit) || [],
                error: null
              })
            }),
            then: async (resolve) => resolve({
              data: mockData[table]?.slice(0, limit) || [],
              error: null
            })
          }),
          then: async (resolve) => resolve({
            data: mockData[table]?.filter(item => item[column] === value) || [],
            error: null
          })
        }),
        limit: (limit) => ({
          order: (column, options) => ({
            then: async (resolve) => resolve({
              data: mockData[table]?.slice(0, limit) || [],
              error: null
            })
          }),
          then: async (resolve) => resolve({
            data: mockData[table]?.slice(0, limit) || [],
            error: null
          })
        }),
        order: (column, options) => ({
          limit: (limit) => ({
            then: async (resolve) => resolve({
              data: mockData[table]?.slice(0, limit) || [],
              error: null
            })
          }),
          then: async (resolve) => resolve({
            data: mockData[table] || [],
            error: null
          })
        }),
        then: async (resolve) => resolve({
          data: mockData[table] || [],
          error: null
        })
      }),
      insert: (data) => ({
        select: () => ({
          single: async () => ({
            data: Array.isArray(data) ? data[0] : data,
            error: null
          }),
          then: async (resolve) => resolve({
            data: Array.isArray(data) ? data : [data],
            error: null
          })
        }),
        then: async (resolve) => resolve({
          data: Array.isArray(data) ? data : [data],
          error: null
        })
      }),
      update: (data) => ({
        eq: (column, value) => ({
          select: () => ({
            single: async () => ({
              data: { ...data, [column]: value },
              error: null
            })
          }),
          then: async (resolve) => resolve({
            data: { ...data, [column]: value },
            error: null
          })
        })
      }),
      delete: () => ({
        eq: (column, value) => ({
          then: async (resolve) => resolve({
            data: null,
            error: null
          })
        })
      })
    }),
    auth: {
      getUser: async () => ({
        data: { user: overrides.user || null },
        error: null
      }),
      signIn: async () => ({
        data: { user: overrides.user || { id: 'test-user' } },
        error: null
      }),
      signOut: async () => ({
        error: null
      })
    },
    ...overrides
  };

  return mockClient;
}

/**
 * Mock Next.js request/response for API testing
 */
export function createMockRequest(options = {}) {
  return {
    method: options.method || 'GET',
    url: options.url || '/api/test',
    query: options.query || {},
    body: options.body || {},
    headers: options.headers || {},
    cookies: options.cookies || {},
    user: options.user || null,
    ip: options.ip || '127.0.0.1',
    ...options
  };
}

export function createMockResponse() {
  const res = {
    status: function(code) {
      res.statusCode = code;
      return res;
    },
    json: function(data) {
      res.data = data;
      return res;
    },
    send: function(data) {
      res.data = data;
      return res;
    },
    setHeader: function(key, value) {
      res.headers[key] = value;
      return res;
    },
    statusCode: 200,
    data: null,
    headers: {}
  };

  return res;
}

/**
 * Wait for condition helper
 */
export async function waitFor(condition, options = {}) {
  const { timeout = 5000, interval = 100 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for condition');
}

/**
 * Test data generators
 */
export const generateTestData = {
  user: (overrides = {}) => ({
    id: 'test-user-' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    name: 'Test User',
    role: 'artist',
    created_at: new Date().toISOString(),
    ...overrides
  }),

  release: (overrides = {}) => ({
    id: 'test-release-' + Math.random().toString(36).substr(2, 9),
    user_id: 'test-user',
    title: 'Test Release',
    artist_name: 'Test Artist',
    release_date: new Date().toISOString(),
    status: 'published',
    ...overrides
  }),

  analytics: (overrides = {}) => ({
    id: 'test-analytics-' + Math.random().toString(36).substr(2, 9),
    user_id: 'test-user',
    date: new Date().toISOString(),
    streams: Math.floor(Math.random() * 10000),
    listeners: Math.floor(Math.random() * 1000),
    revenue: Math.random() * 100,
    ...overrides
  }),

  apiResponse: (data, overrides = {}) => ({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...overrides
  }),

  apiError: (message, overrides = {}) => ({
    success: false,
    error: {
      type: 'INTERNAL_SERVER_ERROR',
      message,
      timestamp: new Date().toISOString()
    },
    ...overrides
  })
};

/**
 * Performance testing helper
 */
export async function measurePerformance(fn, iterations = 100) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const sorted = times.sort((a, b) => a - b);

  return {
    iterations,
    avg: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

/**
 * Database test helpers
 */
export const dbTestHelpers = {
  async cleanTable(supabase, table) {
    await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  },

  async seedTable(supabase, table, data) {
    const { error } = await supabase.from(table).insert(data);
    if (error) throw error;
  },

  async resetSequence(supabase, table) {
    // PostgreSQL specific - reset auto-increment
    await supabase.rpc('reset_sequence', { table_name: table });
  }
};

/**
 * API test helpers
 */
export const apiTestHelpers = {
  async testEndpoint(url, options = {}) {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    return {
      status: response.status,
      data: await response.json(),
      headers: Object.fromEntries(response.headers.entries())
    };
  },

  assertSuccessResponse(response) {
    if (!response.data.success) {
      throw new Error(`API request failed: ${JSON.stringify(response.data)}`);
    }
  },

  assertErrorResponse(response, expectedType) {
    if (response.data.success) {
      throw new Error('Expected error response but got success');
    }
    if (expectedType && response.data.error.type !== expectedType) {
      throw new Error(`Expected error type ${expectedType} but got ${response.data.error.type}`);
    }
  }
};

/**
 * Component test helpers (for React Testing Library)
 */
export const componentTestHelpers = {
  async waitForElement(container, selector, options = {}) {
    return waitFor(
      () => container.querySelector(selector) !== null,
      options
    );
  },

  async waitForText(container, text, options = {}) {
    return waitFor(
      () => container.textContent.includes(text),
      options
    );
  },

  simulateAsyncOperation(delay = 100) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }
};

/**
 * Mock external services
 */
export const mockServices = {
  openai: {
    chat: {
      completions: {
        create: async (options) => ({
          choices: [{
            message: {
              content: JSON.stringify({
                name: 'mock_tool',
                description: 'Mock tool description',
                capabilities: ['mock'],
                useCases: ['testing']
              })
            }
          }]
        })
      }
    }
  },

  stripe: {
    customers: {
      create: async (data) => ({ id: 'cus_mock', ...data })
    },
    subscriptions: {
      create: async (data) => ({ id: 'sub_mock', ...data })
    },
    charges: {
      create: async (data) => ({ id: 'ch_mock', ...data })
    }
  }
};

/**
 * Test assertion helpers
 */
export const assertions = {
  assertExists(value, message = 'Value should exist') {
    if (!value) throw new Error(message);
  },

  assertEqual(actual, expected, message = 'Values should be equal') {
    if (actual !== expected) {
      throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
  },

  assertDeepEqual(actual, expected, message = 'Objects should be deeply equal') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
  },

  assertThrows(fn, expectedError, message = 'Function should throw error') {
    try {
      fn();
      throw new Error(message);
    } catch (error) {
      if (expectedError && !(error instanceof expectedError)) {
        throw new Error(`${message}\nExpected: ${expectedError.name}\nActual: ${error.constructor.name}`);
      }
    }
  },

  async assertThrowsAsync(fn, expectedError, message = 'Async function should throw error') {
    try {
      await fn();
      throw new Error(message);
    } catch (error) {
      if (expectedError && !(error instanceof expectedError)) {
        throw new Error(`${message}\nExpected: ${expectedError.name}\nActual: ${error.constructor.name}`);
      }
    }
  }
};
