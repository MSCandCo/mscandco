/**
 * API Key Authentication Middleware for MSC & Co Public API
 * 
 * Validates API keys, checks rate limits, and logs usage.
 * Use this in public API routes to authenticate external requests.
 */

import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Get Supabase client (lazy loaded)
 */
async function getSupabaseClient() {
  const { createServiceRoleClient } = await import('@/lib/supabase/server');
  return await createServiceRoleClient();
}

/**
 * Authenticate an API request using Bearer token
 * 
 * @param {Request} request - Next.js request object
 * @returns {Object} { authorized: boolean, userId: string, keyId: string, error: string }
 */
export async function authenticateAPIRequest(request) {
  try {
    // Lazy load Supabase client
    const supabase = await getSupabaseClient();
    
    // Extract API key from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authorized: false,
        error: 'Missing or invalid Authorization header. Use: Bearer msc_live_...',
      };
    }

    const apiKey = authHeader.substring(7); // Remove "Bearer "

    // Validate key format
    if (!apiKey.startsWith('msc_live_') && !apiKey.startsWith('msc_test_')) {
      return {
        authorized: false,
        error: 'Invalid API key format',
      };
    }

    // Hash the key to look it up
    const keyHash = createHash('sha256').update(apiKey).digest('hex');

    // Validate the API key and get associated user
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, user_id, scopes, rate_limit_per_hour, is_active, expires_at, total_requests')
      .eq('key_hash', keyHash)
      .single();

    if (keyError || !keyData) {
      return {
        authorized: false,
        error: 'Invalid API key',
      };
    }

    // Check if key is active
    if (!keyData.is_active) {
      return {
        authorized: false,
        error: 'API key is deactivated',
      };
    }

    // Check if key is expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return {
        authorized: false,
        error: 'API key has expired',
      };
    }

    // Check rate limit
    const { data: rateLimitData } = await supabase.rpc('check_rate_limit', {
      key_id_input: keyData.id,
      limit_per_hour: keyData.rate_limit_per_hour,
    });

    if (rateLimitData !== null && rateLimitData <= 0) {
      return {
        authorized: false,
        error: `Rate limit exceeded. Limit: ${keyData.rate_limit_per_hour} requests/hour`,
        rateLimitRemaining: 0,
      };
    }

    // Log API usage (async, don't wait)
    logAPIUsage(request, keyData.id).catch(err => 
      console.error('Failed to log API usage:', err)
    );

    // Update last used timestamp and increment request count (async)
    updateKeyUsage(keyData.id).catch(err => 
      console.error('Failed to update key usage:', err)
    );

    // Note: rateLimitData may be the count or null, handle both cases
    const rateLimitRemaining = rateLimitData !== null ? (keyData.rate_limit_per_hour - (rateLimitData || 0)) : keyData.rate_limit_per_hour;

    return {
      authorized: true,
      userId: keyData.user_id,
      keyId: keyData.id,
      scopes: keyData.scopes,
      rateLimitRemaining: rateLimitRemaining,
    };
  } catch (error) {
    console.error('API authentication error:', error);
    return {
      authorized: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * Log API usage for analytics and rate limiting
 */
async function logAPIUsage(request, keyId) {
  const supabase = await getSupabaseClient();
  const url = new URL(request.url);
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  await supabase.from('api_key_usage').insert({
    api_key_id: keyId,
    endpoint: url.pathname,
    method: request.method,
    ip_address: ip,
    user_agent: userAgent,
  });
}

/**
 * Update API key's last used timestamp and request count
 */
async function updateKeyUsage(keyId) {
  const supabase = await getSupabaseClient();
  await supabase
    .from('api_keys')
    .update({
      last_used_at: new Date().toISOString(),
      total_requests: supabase.raw('total_requests + 1'),
    })
    .eq('id', keyId);
}

/**
 * Middleware wrapper for API routes
 * Use this to protect your API endpoints
 * 
 * Example usage:
 * 
 * import { withAPIAuth } from '@/lib/api-auth';
 * 
 * export const GET = withAPIAuth(async (request, { userId }) => {
 *   // Your protected endpoint logic here
 *   return NextResponse.json({ success: true, userId });
 * });
 */
export function withAPIAuth(handler, options = {}) {
  const { requiredScopes = ['read'] } = options;

  return async (request, context) => {
    // Authenticate the request
    const auth = await authenticateAPIRequest(request);

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Remaining': auth.rateLimitRemaining?.toString() || '0',
          },
        }
      );
    }

    // Check if the API key has required scopes
    const hasRequiredScopes = requiredScopes.every(scope => 
      auth.scopes?.includes(scope)
    );

    if (!hasRequiredScopes) {
      return NextResponse.json(
        { error: `Insufficient permissions. Required scopes: ${requiredScopes.join(', ')}` },
        { status: 403 }
      );
    }

    // Add auth info to context and call the handler
    const response = await handler(request, {
      ...context,
      userId: auth.userId,
      keyId: auth.keyId,
      scopes: auth.scopes,
    });

    // Add rate limit headers to response
    if (response instanceof NextResponse) {
      response.headers.set('X-RateLimit-Remaining', auth.rateLimitRemaining?.toString() || '0');
    }

    return response;
  };
}

/**
 * Check if request has specific scope
 */
export function hasScope(scopes, requiredScope) {
  return scopes?.includes(requiredScope) || scopes?.includes('admin');
}

