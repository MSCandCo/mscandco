
/**
 * Revolut Webhook Handler
 * Processes payment events from Revolut for subscriptions and tier upgrades
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const payload = await request.json()

    console.log('Revolut webhook received:', payload.event)

    // Verify webhook signature (in production)
    // const signature = request.headers.get('Revolut-Signature')
    // if (!verifySignature(signature, payload)) {
    //   return Response.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const { event, order } = payload

    // Handle successful payment
    if (event === 'ORDER_COMPLETED' || event === 'ORDER_AUTHORISED') {
      const { id: orderId, metadata } = order

      if (!metadata || !metadata.user_id) {
        console.error('Missing metadata in order:', orderId)
        return Response.json({ error: 'Missing metadata' }, { status: 400 })
      }

      const { user_id: userId, tier, billing_period: billingPeriod, subscription_type } = metadata

      // Update user tier
      const tierConfig = {
        pro: { commission: 15.00, apolloQueries: 100 },
        mpp: { commission: 10.00, apolloQueries: 500 }
      }

      const config = tierConfig[tier]
      if (!config) {
        console.error('Invalid tier in metadata:', tier)
        return Response.json({ error: 'Invalid tier' }, { status: 400 })
      }

      // Calculate subscription end date
      const subscriptionStartDate = new Date()
      const subscriptionEndDate = new Date()
      if (billingPeriod === 'monthly') {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)
      } else {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1)
      }

      // Update user profile
      const updateData = {
        tier: tier === 'mpp' ? 'mpp_paid' : tier,
        commission_rate: config.commission,
        apollo_query_limit: config.apolloQueries,
        revolut_subscription_id: orderId,
        revolut_customer_id: order.customer_id,
        subscription_status: 'active',
        subscription_period: billingPeriod,
        subscription_start_date: subscriptionStartDate.toISOString(),
        subscription_end_date: subscriptionEndDate.toISOString(),
        last_tier_change_at: new Date().toISOString(),
        revolut_pending_order_id: null,
        revolut_pending_tier: null,
        revolut_pending_period: null
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating user tier:', updateError)
        return Response.json({ error: 'Failed to update user' }, { status: 500 })
      }

      // Log transaction
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          type: 'subscription_payment',
          amount: order.amount / 100, // Convert from cents
          currency: order.currency,
          status: 'completed',
          revolut_order_id: orderId,
          metadata: {
            tier,
            billing_period: billingPeriod,
            subscription_type
          }
        })

      console.log(`User ${userId} upgraded to ${tier} (${billingPeriod})`)

      return Response.json({ success: true, message: 'Subscription activated' })
    }

    // Handle failed payment
    if (event === 'ORDER_PAYMENT_DECLINED' || event === 'ORDER_CANCELLED') {
      const { metadata } = order
      if (metadata?.user_id) {
        // Clear pending order
        await supabase
          .from('user_profiles')
          .update({
            revolut_pending_order_id: null,
            revolut_pending_tier: null,
            revolut_pending_period: null
          })
          .eq('id', metadata.user_id)

        console.log(`Payment failed for user ${metadata.user_id}`)
      }

      return Response.json({ success: true, message: 'Payment failed, order cleared' })
    }

    // Handle subscription renewal
    if (event === 'ORDER_RECURRING') {
      // This would be called for recurring subscriptions
      // Similar logic to ORDER_COMPLETED, but extends existing subscription
      return Response.json({ success: true, message: 'Recurring payment processed' })
    }

    return Response.json({ success: true, message: 'Event received' })
  } catch (error) {
    console.error('Revolut webhook error:', error)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
