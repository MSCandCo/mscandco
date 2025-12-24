import { inngest } from '../inngest-client'
import { captureException } from '@/lib/monitoring/sentry'
import { trackServerEvent } from '@/lib/analytics/posthog-server'
import { query } from '@/lib/db/postgres'

/**
 * Subscription Renewal Job
 * Handles automatic subscription renewals
 */
export const subscriptionRenewalJob = inngest.createFunction(
  {
    id: 'subscription-renewal',
    name: 'Subscription Renewal',
    retries: 3,
  },
  { event: 'subscription/renew' },
  async ({ event, step }) => {
    const { userId, subscriptionId } = event.data


    try {
      // Step 1: Fetch subscription details
      const subscription = await step.run('fetch-subscription', async () => {
        const result = await query(
          'SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2',
          [subscriptionId, userId]
        )
        return result.rows[0]
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      // Step 2: Check wallet balance
      const walletBalance = await step.run('check-wallet', async () => {
        const result = await query(
          'SELECT balance FROM wallet_balance WHERE user_id = $1',
          [userId]
        )
        return result.rows[0]?.balance || 0
      })

      // Step 3: Process payment
      const paymentResult = await step.run('process-payment', async () => {
        const amount = subscription.amount

        if (walletBalance >= amount) {
          // Deduct from wallet
          await query(
            'UPDATE wallet_balance SET balance = balance - $1 WHERE user_id = $2',
            [amount, userId]
          )

          // Log transaction
          await query(
            `INSERT INTO earnings_log (user_id, amount, type, description, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [userId, -amount, 'subscription', `Subscription renewal: ${subscription.plan_name}`]
          )

          return { success: true, source: 'wallet' }
        } else {
          // Insufficient funds - send notification
          return { success: false, reason: 'insufficient_funds' }
        }
      })

      // Step 4: Update subscription status
      if (paymentResult.success) {
        await step.run('update-subscription', async () => {
          const nextBillingDate = new Date()
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

          await query(
            `UPDATE subscriptions
             SET status = 'active', next_billing_date = $1, updated_at = NOW()
             WHERE id = $2`,
            [nextBillingDate, subscriptionId]
          )

        })

        // Step 5: Track analytics
        await step.run('track-success', async () => {
          await trackServerEvent(userId, 'subscription_renewed', {
            subscription_id: subscriptionId,
            amount: subscription.amount,
            source: paymentResult.source,
          })
        })
      } else {
        // Step 6: Handle insufficient funds
        await step.run('handle-insufficient-funds', async () => {
          await query(
            `UPDATE subscriptions
             SET status = 'payment_failed', updated_at = NOW()
             WHERE id = $1`,
            [subscriptionId]
          )


          await trackServerEvent(userId, 'subscription_renewal_failed', {
            subscription_id: subscriptionId,
            reason: 'insufficient_funds',
          })
        })
      }

      return { success: paymentResult.success }
    } catch (error) {
      console.error('❌ Subscription renewal failed:', error)
      
      captureException(error, {
        tags: { job: 'subscription-renewal' },
        extra: { userId, subscriptionId },
      })

      throw error
    }
  }
)

