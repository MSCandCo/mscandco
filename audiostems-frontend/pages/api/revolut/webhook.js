import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Plan prices for subscription processing
const PLAN_PRICES = {
  'artist-starter': { monthly: 9.99, yearly: 99.99 },
  'artist-pro': { monthly: 29.99, yearly: 299.99 },
  'label-starter': { monthly: 29.99, yearly: 299.99 },
  'label-pro': { monthly: 49.99, yearly: 499.99 }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🔔 Revolut webhook received')

    // Verify webhook signature (important for security)
    const signature = req.headers['revolut-signature']
    const timestamp = req.headers['revolut-request-timestamp']
    
    if (!signature || !timestamp) {
      console.error('❌ Missing required webhook headers')
      return res.status(400).json({ error: 'Missing required headers' })
    }

    // Verify the webhook is from Revolut
    const payload = JSON.stringify(req.body)
    const webhookSecret = process.env.REVOLUT_WEBHOOK_SECRET

    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${timestamp}.${payload}`)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature')
        return res.status(401).json({ error: 'Invalid signature' })
      }
    } else {
      console.warn('⚠️ No webhook secret configured - skipping signature verification')
    }

    const { event, data } = req.body

    console.log('📨 Webhook event:', event, 'Order ID:', data?.id)

    // Handle different webhook events
    switch (event) {
      case 'ORDER_PAYMENT_COMPLETED':
        await handlePaymentCompleted(data)
        break
      case 'ORDER_PAYMENT_FAILED':
        await handlePaymentFailed(data)
        break
      case 'ORDER_COMPLETED':
        await handlePaymentCompleted(data)
        break
      default:
        console.log('ℹ️ Unhandled webhook event:', event)
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

async function handlePaymentCompleted(orderData) {
  try {
    console.log('✅ Processing completed payment:', orderData.id)
    
    const { merchant_order_ext_ref, amount, currency, metadata } = orderData
    
    // Extract user ID from order reference
    const userId = merchant_order_ext_ref.split('-')[2] // Format: subscription-timestamp-userId
    
    if (!userId) {
      console.error('❌ Could not extract user ID from order reference:', merchant_order_ext_ref)
      return
    }

    console.log('💰 Payment details:', {
      userId,
      amount: amount / 100,
      currency,
      metadata
    })

    // Update wallet balance
    const { error: walletError } = await supabase
      .from('wallets')
      .upsert({
        user_id: userId,
        balance: supabase.raw('COALESCE(balance, 0) + ?', [amount / 100]),
        currency: currency || 'GBP',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (walletError) {
      console.error('❌ Wallet update error:', walletError)
    } else {
      console.log('✅ Wallet updated for user:', userId)
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'topup',
        amount: amount / 100,
        description: 'Wallet top-up via Revolut',
        status: 'completed',
        revolut_order_id: orderData.id,
        currency: currency || 'GBP',
        created_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('❌ Transaction record error:', transactionError)
    } else {
      console.log('✅ Transaction recorded for user:', userId)
    }

    // If there's subscription metadata, process it
    if (metadata?.planId) {
      await processSubscriptionAfterTopUp(userId, metadata, orderData)
    }

    console.log(`🎉 Payment completed for user ${userId}: ${currency}${amount / 100}`)
  } catch (error) {
    console.error('❌ Error handling payment completion:', error)
  }
}

async function handlePaymentFailed(orderData) {
  try {
    console.log('❌ Processing failed payment:', orderData.id)
    
    const { merchant_order_ext_ref } = orderData
    const userId = merchant_order_ext_ref.split('-')[2]
    
    if (userId) {
      // Record failed transaction
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          type: 'topup',
          amount: 0,
          description: 'Failed wallet top-up via Revolut',
          status: 'failed',
          revolut_order_id: orderData.id,
          created_at: new Date().toISOString()
        })
      
      console.log('📝 Failed payment recorded for user:', userId)
    }
  } catch (error) {
    console.error('❌ Error handling payment failure:', error)
  }
}

async function processSubscriptionAfterTopUp(userId, metadata, orderData) {
  try {
    const { planId, billing } = metadata
    const planPrice = PLAN_PRICES[planId]?.[billing]
    
    if (!planPrice) {
      console.warn('⚠️ Invalid plan or billing cycle:', { planId, billing })
      return
    }

    console.log('🔄 Processing subscription:', { userId, planId, billing, planPrice })

    // Check wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (!wallet || wallet.balance < planPrice) {
      console.error('❌ Insufficient wallet balance for subscription')
      return
    }

    // Deduct subscription amount from wallet
    const { error: deductError } = await supabase
      .from('wallets')
      .update({
        balance: supabase.raw('balance - ?', [planPrice]),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (deductError) {
      console.error('❌ Error deducting subscription amount:', deductError)
      return
    }

    // Map plan IDs to tier names (matching database schema)
    const planTierMap = {
      'artist-starter': 'artist_starter',
      'artist-pro': 'artist_pro',
      'label-starter': 'label_starter',
      'label-pro': 'label_pro'
    }

    const tier = planTierMap[planId] || planId.replace('-', '_')
    
    // Calculate subscription period
    const startDate = new Date()
    const endDate = new Date()
    if (billing === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    // Create/update subscription record
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        tier,
        status: 'active',
        billing_cycle: billing,
        started_at: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
        amount: planPrice,
        currency: orderData.currency || 'GBP',
        revolut_subscription_id: orderData.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (subscriptionError) {
      console.error('❌ Subscription creation error:', subscriptionError)
      return
    }

    // Record subscription transaction
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'subscription',
        amount: -planPrice,
        description: `${planId} subscription (${billing})`,
        status: 'completed',
        currency: orderData.currency || 'GBP',
        created_at: new Date().toISOString()
      })

    console.log('🎉 Subscription activated:', { userId, tier, billing, planPrice })
  } catch (error) {
    console.error('❌ Error processing subscription:', error)
  }
}
