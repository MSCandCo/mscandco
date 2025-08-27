import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' })
    }

    // Decode the JWT token (same as other working APIs)
    let userInfo
    try {
      userInfo = jwt.decode(token)
    } catch (jwtError) {
      console.error('JWT decode failed:', jwtError)
      return res.status(401).json({ error: 'Invalid token' })
    }

    const userId = userInfo?.sub
    const userEmail = userInfo?.email?.toLowerCase() || ''

    if (!userId) {
      return res.status(401).json({ error: 'Invalid user token' })
    }

    console.log('🔍 Subscription Status API - User:', { userId, userEmail })

    // Get user's most recent active subscription
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('tier, status, created_at, current_period_end, billing_cycle, amount, currency')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
    
    const subscription = subscriptions?.[0]

    if (subError && subError.code !== 'PGRST116') {
      console.error('Subscription query error:', subError)
      // Don't throw error, just return no subscription
    }

    if (!subscription) {
      console.log('📋 No active subscription found for user:', userId)
      return res.json({
        success: true,
        data: {
          status: 'none',
          planName: 'No Subscription',
          hasSubscription: false,
          isPro: false,
          isStarter: false
        }
      })
    }

    // Map tier names to display names
    const planNames = {
      'artist_starter': 'Artist Starter',
      'artist_pro': 'Artist Pro',
      'label_starter': 'Label Starter', 
      'label_pro': 'Label Pro',
      'distribution_partner': 'Distribution Partner',
      'company_admin': 'Company Admin',
      'super_admin': 'Super Admin'
    }

    const isPro = subscription.tier.includes('pro')
    const isStarter = subscription.tier.includes('starter')

    console.log('💳 Active subscription found:', {
      tier: subscription.tier,
      status: subscription.status,
      isPro,
      isStarter
    })

    res.json({
      success: true,
      data: {
        status: subscription.status,
        planName: planNames[subscription.tier] || subscription.tier,
        planId: subscription.tier,
        tier: subscription.tier,
        hasSubscription: true,
        isPro,
        isStarter,
        billingCycle: subscription.billing_cycle,
        amount: subscription.amount,
        currency: subscription.currency,
        createdAt: subscription.created_at,
        expiresAt: subscription.current_period_end
      }
    })

  } catch (error) {
    console.error('Subscription status API error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch subscription status',
      details: error.message 
    })
  }
}
