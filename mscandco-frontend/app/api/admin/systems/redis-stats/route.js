import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/permissions'
import { getRedis } from '@/lib/cache/redis'

/**
 * GET /api/admin/systems/redis-stats
 * Get Upstash Redis statistics
 */
export async function GET(request) {
  try {
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await userHasPermission(user.id, 'systems:performance:access')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const redis = getRedis()

    if (!redis) {
      return NextResponse.json({
        configured: false,
        message: 'Upstash Redis not configured. Please add environment variables.',
        setup_url: 'https://upstash.com'
      })
    }

    try {
      // Test Redis connection
      await redis.ping()

      // Get database size (approximate)
      const dbSize = await redis.dbsize()

      return NextResponse.json({
        configured: true,
        status: 'connected',
        database_size: dbSize,
        url: process.env.UPSTASH_REDIS_REST_URL,
        dashboard_url: 'https://console.upstash.com',
      })
    } catch (redisError) {
      console.error('❌ Redis connection error:', redisError)
      
      return NextResponse.json({
        configured: true,
        status: 'error',
        error: 'Failed to connect to Redis',
        details: redisError.message,
        dashboard_url: 'https://console.upstash.com',
      })
    }
  } catch (error) {
    console.error('❌ Redis stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

