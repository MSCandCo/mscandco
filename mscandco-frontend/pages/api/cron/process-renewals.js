/**
 * Subscription Auto-Renewal Cron Job
 * 
 * This endpoint should be called daily by a cron service (e.g., Vercel Cron, GitHub Actions, or external cron)
 * It processes all subscriptions that are due for renewal and attempts to charge from wallet
 * 
 * Security: Protected by cron secret key
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Security: Verify cron secret
  const cronSecret = req.headers['x-cron-secret'] || req.query.secret
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('🔄 Starting subscription renewal process...')

  try {
    const now = new Date()
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      insufficient_funds: 0,
      errors: []
    }

    // Find all subscriptions that need renewal (current_period_end has passed)
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        tier,
        amount,
        currency,
        billing_cycle,
        current_period_end,
        auto_renew,
        status
      `)
      .eq('status', 'active')
      .eq('auto_renew', true)
      .lt('current_period_end', now.toISOString())

    if (fetchError) {
      console.error('❌ Error fetching subscriptions:', fetchError)
      return res.status(500).json({ error: 'Failed to fetch subscriptions' })
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('✅ No subscriptions due for renewal')
      return res.json({ 
        success: true, 
        message: 'No subscriptions due for renewal',
        results
      })
    }

    console.log(`📋 Found ${subscriptions.length} subscriptions due for renewal`)

    // Process each subscription
    for (const subscription of subscriptions) {
      results.processed++
      
      try {
        console.log(`\n🔄 Processing subscription ${subscription.id} for user ${subscription.user_id}`)
        
        // Get user's wallet balance from earnings_log
        const { data: earningsData, error: earningsError } = await supabase
          .from('earnings_log')
          .select('amount, status')
          .eq('user_id', subscription.user_id)
          .eq('status', 'paid')

        if (earningsError) {
          console.error(`❌ Error fetching wallet balance:`, earningsError)
          results.errors.push({
            subscription_id: subscription.id,
            error: 'Failed to fetch wallet balance'
          })
          results.failed++
          continue
        }

        // Calculate wallet balance
        const walletBalance = earningsData?.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0) || 0
        const subscriptionCost = parseFloat(subscription.amount)

        console.log(`💰 Wallet balance: £${walletBalance.toFixed(2)}, Required: £${subscriptionCost.toFixed(2)}`)

        // Check if sufficient funds
        if (walletBalance < subscriptionCost) {
          console.log(`⚠️ Insufficient funds for subscription ${subscription.id}`)
          
          // Update subscription status to show insufficient funds
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              renewal_failure_reason: 'Insufficient wallet balance',
              renewal_failure_count: supabase.raw('COALESCE(renewal_failure_count, 0) + 1'),
              last_renewal_attempt: now.toISOString(),
              insufficient_funds_notified: false, // Will trigger notification
              updated_at: now.toISOString()
            })
            .eq('id', subscription.id)

          // Create notification for user
          await supabase
            .from('notifications')
            .insert({
              user_id: subscription.user_id,
              type: 'subscription_renewal_failed',
              title: 'Subscription Renewal Failed',
              message: `Your subscription renewal failed due to insufficient wallet balance. Please add £${(subscriptionCost - walletBalance).toFixed(2)} to your wallet to continue your subscription.`,
              read: false,
              created_at: now.toISOString()
            })

          results.insufficient_funds++
          continue
        }

        // Sufficient funds - process renewal
        console.log(`✅ Processing renewal for subscription ${subscription.id}`)

        // Deduct from wallet (create negative entry in earnings_log)
        const { error: deductError } = await supabase
          .from('earnings_log')
          .insert({
            user_id: subscription.user_id,
            amount: -subscriptionCost,
            currency: subscription.currency,
            earning_type: 'subscription_renewal',
            status: 'paid',
            description: `Auto-renewal: ${subscription.tier} (${subscription.billing_cycle})`,
            metadata: {
              subscription_id: subscription.id,
              tier: subscription.tier,
              billing_cycle: subscription.billing_cycle,
              auto_renewal: true
            },
            created_at: now.toISOString()
          })

        if (deductError) {
          console.error(`❌ Error deducting from wallet:`, deductError)
          results.errors.push({
            subscription_id: subscription.id,
            error: 'Failed to deduct from wallet'
          })
          results.failed++
          continue
        }

        // Calculate new period
        const newPeriodStart = new Date(subscription.current_period_end)
        const newPeriodEnd = new Date(newPeriodStart)
        
        if (subscription.billing_cycle === 'yearly') {
          newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1)
        } else {
          newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1)
        }

        // Update subscription with new period
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            current_period_start: newPeriodStart.toISOString(),
            current_period_end: newPeriodEnd.toISOString(),
            last_renewal_attempt: now.toISOString(),
            renewal_failure_count: 0,
            renewal_failure_reason: null,
            insufficient_funds_notified: false,
            status: 'active',
            updated_at: now.toISOString()
          })
          .eq('id', subscription.id)

        if (updateError) {
          console.error(`❌ Error updating subscription:`, updateError)
          results.errors.push({
            subscription_id: subscription.id,
            error: 'Failed to update subscription'
          })
          results.failed++
          continue
        }

        // Create success notification
        await supabase
          .from('notifications')
          .insert({
            user_id: subscription.user_id,
            type: 'subscription_renewed',
            title: 'Subscription Renewed',
            message: `Your ${subscription.tier} subscription has been automatically renewed for £${subscriptionCost.toFixed(2)}. Next renewal: ${newPeriodEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
            read: false,
            created_at: now.toISOString()
          })

        console.log(`✅ Successfully renewed subscription ${subscription.id}`)
        results.successful++

      } catch (error) {
        console.error(`❌ Error processing subscription ${subscription.id}:`, error)
        results.errors.push({
          subscription_id: subscription.id,
          error: error.message
        })
        results.failed++
      }
    }

    console.log('\n📊 Renewal process complete:', results)

    return res.json({
      success: true,
      message: 'Renewal process completed',
      results
    })

  } catch (error) {
    console.error('❌ Fatal error in renewal process:', error)
    return res.status(500).json({ 
      error: 'Renewal process failed',
      details: error.message 
    })
  }
}

