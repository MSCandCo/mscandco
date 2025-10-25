import { NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { invalidate } from '@/lib/cache/redis'

/**
 * Cleanup Old Data Cron Job
 * Runs every Sunday at 2 AM
 * Cleans up old notifications, logs, and cached data
 */
export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🧹 Running data cleanup...')

    const results = {}

    // Delete old read notifications (older than 30 days)
    const notificationsResult = await query(
      `DELETE FROM notifications
       WHERE read = true
       AND created_at < NOW() - INTERVAL '30 days'`
    )
    results.notifications_deleted = notificationsResult.rowCount

    // Delete old session logs (older than 90 days)
    const logsResult = await query(
      `DELETE FROM session_logs
       WHERE created_at < NOW() - INTERVAL '90 days'`
    )
    results.logs_deleted = logsResult.rowCount

    // Clear old cache entries
    await invalidate('*')
    results.cache_cleared = true

    console.log('✅ Cleanup completed:', results)

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Cleanup cron failed:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

