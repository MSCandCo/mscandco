import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { requireAuth } from '@/lib/rbac/middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { orderId, paymentData } = req.body

    if (!orderId || !paymentData) {
      return res.status(400).json({ error: 'Order ID and payment data are required' })
    }

    console.log('🔄 Processing subscription payment:', { orderId, metadata: paymentData.metadata })

    // Extract subscription details from payment metadata
    const { planId, billing, userId } = paymentData.metadata || {}

    if (!planId || !userId) {
      console.warn('⚠️ Missing subscription details in payment metadata')
      return res.json({ 
        success: false, 
        error: 'Missing subscription details in payment metadata' 
      })
    }

    // Map plan IDs to tier names (matching database schema)
    const planTierMap = {
      'artist-starter': 'artist_starter',
      'artist-pro': 'artist_pro',
      'label-starter': 'label_starter',
      'label-pro': 'label_pro'
    }

    const tier = planTierMap[planId] || planId.replace('-', '_')
    const billingCycle = billing || 'monthly'
    
    // Calculate subscription period
    const startDate = new Date()
    const endDate = new Date()
    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    // Create or update subscription in database
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    let subscriptionResult

    if (existingSubscription) {
      // Update existing subscription
      subscriptionResult = await supabase
        .from('subscriptions')
        .update({
          tier,
          status: 'active',
          billing_cycle: billingCycle,
          started_at: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          amount: paymentData.amount / 100, // Convert from pence
          currency: paymentData.currency,
          revolut_subscription_id: orderId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
    } else {
      // Create new subscription
      subscriptionResult = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier,
          status: 'active',
          billing_cycle: billingCycle,
          started_at: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          amount: paymentData.amount / 100, // Convert from pence
          currency: paymentData.currency,
          revolut_subscription_id: orderId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
    }

    if (subscriptionResult.error) {
      console.error('Subscription database error:', subscriptionResult.error)
      throw new Error(subscriptionResult.error.message)
    }

    console.log('✅ Subscription processed successfully:', {
      userId,
      tier,
      status: 'active',
      billingCycle,
      amount: paymentData.amount / 100,
      currency: paymentData.currency
    })

    res.json({
      success: true,
      data: {
        subscription: subscriptionResult.data[0],
        message: 'Subscription activated successfully'
      }
    })

  } catch (error) {
    console.error('Subscription processing error:', error)
    res.status(500).json({ 
      error: 'Failed to process subscription',
      details: error.message
    })
  }
}

export default requireAuth()(handler);
