import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/user/subscription-status
 * Fetch user subscription status and details
 */
export async function GET(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    console.log('💳 Fetching subscription status for user:', userId)

    // Fetch active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error fetching subscription:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscription', details: error.message },
        { status: 500 }
      )
    }

    // If no active subscription found
    if (!subscription) {
      console.log('ℹ️ No active subscription found for user')
      return NextResponse.json({
        success: true,
        hasSubscription: false,
        subscription: null,
        tier: 'free',
        status: 'inactive',
        features: {
          maxReleases: 0,
          maxCollaborators: 0,
          advancedAnalytics: false,
          prioritySupport: false
        }
      })
    }

    // Map tier to features
    const tierFeatures = {
      'artist_starter': {
        maxReleases: 5,
        maxCollaborators: 2,
        advancedAnalytics: false,
        prioritySupport: false
      },
      'artist_pro': {
        maxReleases: 999,
        maxCollaborators: 10,
        advancedAnalytics: true,
        prioritySupport: true
      },
      'label_starter': {
        maxReleases: 20,
        maxCollaborators: 5,
        advancedAnalytics: true,
        prioritySupport: false
      },
      'label_pro': {
        maxReleases: 999,
        maxCollaborators: 999,
        advancedAnalytics: true,
        prioritySupport: true
      }
    }

    const features = tierFeatures[subscription.tier] || tierFeatures['artist_starter']

    // Check if subscription is expiring soon (within 7 days)
    const expiresAt = new Date(subscription.current_period_end)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
    const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0

    console.log(`✅ Active subscription found: ${subscription.tier}`)

    return NextResponse.json({
      success: true,
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        billingCycle: subscription.billing_cycle,
        amount: subscription.amount,
        currency: subscription.currency,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        createdAt: subscription.created_at
      },
      tier: subscription.tier,
      status: subscription.status,
      features,
      expiresAt: subscription.current_period_end,
      daysUntilExpiry,
      isExpiringSoon
    })

  } catch (error) {
    console.error('❌ Subscription status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

