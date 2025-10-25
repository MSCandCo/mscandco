import { NextResponse } from 'next/server'
import { triggerRenewalJob } from '@/lib/jobs/inngest-client'
import { query } from '@/lib/db/postgres'

/**
 * Subscription Renewals Cron Job
 * Runs every 6 hours
 * Processes subscription renewals that are due
 */
export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('💳 Running subscription renewals check...')

    // Get subscriptions due for renewal
    const result = await query(
      `SELECT id, user_id, plan_name, amount
       FROM subscriptions
       WHERE status = 'active'
       AND next_billing_date <= NOW()
       ORDER BY next_billing_date ASC`
    )

    const subscriptions = result.rows

    if (subscriptions.length === 0) {
      console.log('✅ No subscriptions due for renewal')
      return NextResponse.json({
        success: true,
        message: 'No subscriptions due for renewal',
        timestamp: new Date().toISOString(),
      })
    }

    // Trigger renewal job for each subscription
    const jobs = subscriptions.map(sub => 
      triggerRenewalJob(sub.user_id, sub.id)
    )

    await Promise.all(jobs)

    console.log(`✅ Triggered renewal for ${subscriptions.length} subscriptions`)

    return NextResponse.json({
      success: true,
      message: `Triggered renewal for ${subscriptions.length} subscriptions`,
      subscriptions: subscriptions.map(s => ({
        id: s.id,
        plan: s.plan_name,
        amount: s.amount,
      })),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Subscription renewals cron failed:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

