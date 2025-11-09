import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { userId } = await request.json()

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

    // Check if user is qualified or invited
    if (!['qualified', 'invited'].includes(user.mpp_qualification_status)) {
      return Response.json({ error: 'User not qualified for free MPP' }, { status: 403 })
    }

    // Update to mpp_earned or mpp_invited tier
    const newTier = user.mpp_qualification_status === 'qualified' ? 'mpp_earned' : 'mpp_invited'

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        tier: newTier,
        commission_rate: 10.00,
        last_tier_change_at: new Date().toISOString(),
        mpp_activated_at: new Date().toISOString(),
        apollo_query_limit: 500
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error activating MPP:', updateError)
      return Response.json({ error: 'Failed to activate MPP' }, { status: 500 })
    }

    return Response.json({
      success: true,
      message: 'MPP Partner status activated successfully!',
      newTier
    })
  } catch (error) {
    console.error('Activate MPP error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
