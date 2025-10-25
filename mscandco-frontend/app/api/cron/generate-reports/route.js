import { NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { trackServerEvent } from '@/lib/analytics/posthog-server'

/**
 * Generate Reports Cron Job
 * Runs every Monday at 1 AM
 * Generates weekly reports for all users
 */
export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📈 Generating weekly reports...')

    // Get all active users
    const usersResult = await query(
      `SELECT id, email, role FROM user_profiles WHERE role IN ('artist', 'label_admin')`
    )

    const users = usersResult.rows

    const reports = []

    for (const user of users) {
      try {
        // Generate report for user
        const report = await generateUserReport(user.id, user.role)
        
        reports.push({
          user_id: user.id,
          email: user.email,
          report,
        })

        // Track event
        await trackServerEvent(user.id, 'weekly_report_generated', {
          role: user.role,
          report_date: new Date().toISOString(),
        })

        console.log(`✅ Generated report for user: ${user.email}`)
      } catch (error) {
        console.error(`❌ Failed to generate report for user: ${user.email}`, error)
      }
    }

    console.log(`✅ Generated ${reports.length} reports`)

    return NextResponse.json({
      success: true,
      message: `Generated ${reports.length} reports`,
      reports_count: reports.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Generate reports cron failed:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Generate report for a user
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Object>} Report data
 */
async function generateUserReport(userId, role) {
  const report = {
    period: 'weekly',
    generated_at: new Date().toISOString(),
  }

  // Get earnings for the week
  const earningsResult = await query(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM earnings_log
     WHERE user_id = $1
     AND created_at >= NOW() - INTERVAL '7 days'
     AND amount > 0`,
    [userId]
  )
  report.earnings = parseFloat(earningsResult.rows[0]?.total || 0)

  // Get release stats
  if (role === 'artist') {
    const releasesResult = await query(
      `SELECT COUNT(*) as count
       FROM releases
       WHERE artist_id = $1
       AND status = 'live'`,
      [userId]
    )
    report.live_releases = parseInt(releasesResult.rows[0]?.count || 0)
  }

  // Get analytics stats (placeholder)
  report.streams = 0
  report.downloads = 0

  return report
}

