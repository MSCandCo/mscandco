import { TIER_CONFIG } from '@/lib/pricing/tierLimits'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { userId, tier, billingPeriod, amount } = await request.json()

    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser || authUser.id !== userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate tier
    if (!['pro', 'mpp'].includes(tier)) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Create Revolut payment link
    // In production, this would call Revolut API to create a payment order
    // For now, we'll simulate the flow

    const revolutApiUrl = process.env.REVOLUT_API_URL || 'https://sandbox-merchant.revolut.com/api/1.0'
    const revolutApiKey = process.env.REVOLUT_API_KEY

    if (!revolutApiKey) {
      console.error('REVOLUT_API_KEY not configured')
      return Response.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    // Create payment order
    const paymentData = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'GBP',
      description: `MSC & Co - ${tier === 'pro' ? 'MSC Pro' : 'MPP Partner'} Subscription (${billingPeriod})`,
      customer_email: authUser.email,
      metadata: {
        user_id: userId,
        tier: tier,
        billing_period: billingPeriod,
        subscription_type: 'new'
      },
      settlement_currency: 'GBP',
      capture_mode: 'AUTOMATIC'
    }

    try {
      const response = await fetch(`${revolutApiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${revolutApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Revolut API error:', errorData)
        throw new Error(errorData.message || 'Failed to create payment order')
      }

      const orderData = await response.json()

      // Store pending subscription in database
      await supabase
        .from('user_profiles')
        .update({
          revolut_pending_order_id: orderData.id,
          revolut_pending_tier: tier,
          revolut_pending_period: billingPeriod
        })
        .eq('id', userId)

      // Return payment URL
      return Response.json({
        success: true,
        paymentUrl: orderData.checkout_url || orderData.public_id, // Revolut returns checkout URL
        orderId: orderData.id
      })
    } catch (revolutError) {
      console.error('Revolut payment creation error:', revolutError)

      // Fallback: Return a manual payment instruction page
      return Response.json({
        success: true,
        paymentUrl: `/billing/payment-pending?tier=${tier}&period=${billingPeriod}&amount=${amount}`,
        manual: true
      })
    }
  } catch (error) {
    console.error('Create subscription error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
