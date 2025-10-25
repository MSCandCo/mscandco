import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * POST /api/wallet/pay-subscription
 * Pay for subscription using wallet balance
 */
export async function POST(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const userEmail = user.email?.toLowerCase() || ''
    
    const body = await request.json()
    const { planId, billing = 'monthly' } = body

    if (!planId) {
      return NextResponse.json({
        error: 'Missing required field: planId'
      }, { status: 400 })
    }

    const planPricing = {
      'artist-starter': { monthly: 9.99, yearly: 119.88 },
      'artist-pro': { monthly: 19.99, yearly: 239.88 },
      'label-starter': { monthly: 29.99, yearly: 359.88 },
      'label-pro': { monthly: 49.99, yearly: 599.88 }
    }

    if (!planPricing[planId]) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    const planCost = planPricing[planId][billing]
    const planName = planId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())

    console.log('Wallet subscription payment:', {
      userEmail,
      planId,
      billing,
      cost: planCost
    })

    // Calculate current balance from earnings_log
    const { data: balanceData } = await supabase
      .from('earnings_log')
      .select('amount')
      .eq('artist_id', userId)
      .neq('status', 'cancelled')

    const currentBalance = balanceData?.reduce((sum, entry) => sum + parseFloat(entry.amount), 0) || 0

    if (currentBalance < planCost) {
      return NextResponse.json({
        error: 'Insufficient wallet balance',
        required: planCost,
        available: currentBalance,
        shortfall: planCost - currentBalance
      }, { status: 400 })
    }

    // Create NEGATIVE entry in earnings_log for subscription payment (debit)
    const { data: earningsEntry, error: earningsError } = await supabase
      .from('earnings_log')
      .insert({
        artist_id: userId,
        amount: -planCost,
        currency: 'GBP',
        earning_type: 'subscription_payment',
        platform: 'Wallet',
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
        notes: `Subscription payment: ${planName} (${billing})`,
        created_at: new Date().toISOString(),
        created_by: userId
      })
      .select()
      .single()

    if (earningsError) {
      console.error('Error creating earnings entry:', earningsError)
      return NextResponse.json({ 
        error: 'Failed to deduct from wallet',
        details: earningsError.message 
      }, { status: 500 })
    }

    const newBalance = currentBalance - planCost

    // Also log in wallet_transactions for backward compatibility
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'commission',
        amount: -planCost,
        currency: 'GBP',
        description: `Subscription payment: ${planName} (${billing})`,
        balance_before: currentBalance,
        balance_after: newBalance,
        source_type: 'subscription',
        platform: 'wallet',
        processed: true,
        processed_at: new Date().toISOString(),
        processed_by_user_id: userId,
        metadata: {
          plan_id: planId,
          billing_cycle: billing,
          subscription_payment: true
        },
        notes: `Wallet payment for ${planName} subscription`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    const tierMapping = {
      'artist-starter': 'artist_starter',
      'artist-pro': 'artist_pro',
      'label-starter': 'label_starter',
      'label-pro': 'label_pro'
    }

    const tier = tierMapping[planId] || planId

    const now = new Date()
    const periodEnd = new Date(now)
    
    if (billing === 'yearly') {
      periodEnd.setFullYear(now.getFullYear() + 1)
    } else {
      periodEnd.setMonth(now.getMonth() + 1)
    }

    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', checkError)
      return NextResponse.json({ 
        error: 'Failed to check existing subscription',
        details: checkError.message 
      }, { status: 500 })
    }

    let subscriptionResult

    if (existingSubscription) {
      const { data: updatedSub, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          tier,
          billing_cycle: billing,
          amount: planCost,
          currency: 'GBP',
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json({ 
          error: 'Failed to update subscription',
          details: updateError.message 
        }, { status: 500 })
      }

      subscriptionResult = { ...updatedSub, action: 'updated' }
    } else {
      const { data: newSub, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier,
          status: 'active',
          billing_cycle: billing,
          amount: planCost,
          currency: 'GBP',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating subscription:', insertError)
        return NextResponse.json({ 
          error: 'Failed to create subscription',
          details: insertError.message 
        }, { status: 500 })
      }

      subscriptionResult = { ...newSub, action: 'created' }
    }

    console.log('Wallet subscription payment successful:', {
      userEmail,
      planName,
      cost: planCost,
      previousBalance: currentBalance,
      newBalance,
      subscriptionAction: subscriptionResult.action
    })

    return NextResponse.json({
      success: true,
      message: `Subscription ${subscriptionResult.action} successfully using wallet balance`,
      subscription: {
        id: subscriptionResult.id,
        tier: subscriptionResult.tier,
        planName,
        billing,
        amount: planCost,
        currency: 'GBP',
        status: 'active',
        expiresAt: subscriptionResult.current_period_end,
        action: subscriptionResult.action
      },
      wallet: {
        previousBalance: currentBalance,
        newBalance,
        amountDeducted: planCost
      }
    })

  } catch (error) {
    console.error('Wallet subscription payment failed:', error)
    return NextResponse.json({ 
      error: 'Wallet subscription payment failed', 
      details: error.message
    }, { status: 500 })
  }
}

