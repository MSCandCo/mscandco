import { NextResponse } from 'next/server'
import { triggerAnalyticsJob } from '@/lib/jobs/inngest-client'
import { query } from '@/lib/db/postgres'

/**
 * Daily Analytics Cron Job
 * Runs at midnight every day
 * Aggregates analytics data for all users
 */
export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📊 Running daily analytics aggregation...')

    // Get all active users
    const result = await query(
      `SELECT id FROM user_profiles WHERE role IN ('artist', 'label_admin')`
    )

    const users = result.rows

    // Trigger analytics job for each user
    const jobs = users.map(user => 
      triggerAnalyticsJob(user.id, 'daily')
    )

    await Promise.all(jobs)

    console.log(`✅ Triggered analytics aggregation for ${users.length} users`)

    return NextResponse.json({
      success: true,
      message: `Triggered analytics for ${users.length} users`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Daily analytics cron failed:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

