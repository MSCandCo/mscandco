import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS

/**
 * GET /api/labeladmin/wallet-simple
 * Fetch simplified label admin wallet balance (their share from shared_earnings)
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const labelAdminId = user.id
    console.log('💰 Fetching label admin wallet balance:', labelAdminId)

    // Get all affiliations for this label admin
    const { data: affiliations, error: affiliationsError } = await supabase
      .from('label_artist_affiliations')
      .select('id')
      .eq('label_admin_id', labelAdminId)
      .eq('status', 'active')

    if (affiliationsError) {
      console.error('❌ Error fetching affiliations:', affiliationsError)
      return NextResponse.json({
        success: true,
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0
      })
    }

    if (!affiliations || affiliations.length === 0) {
      console.log('ℹ️ No affiliations found for label admin')
      return NextResponse.json({
        success: true,
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0
      })
    }

    const affiliationIds = affiliations.map(a => a.id)

    // Get sum of label_amount from shared_earnings
    const { data: earnings, error } = await supabase
      .from('shared_earnings')
      .select('label_amount')
      .in('affiliation_id', affiliationIds)

    if (error) {
      console.error('❌ Error fetching shared earnings:', error)
      return NextResponse.json({
        success: true,
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0
      })
    }

    // Calculate total earnings (label admin's share)
    const totalEarned = earnings?.reduce((sum, e) => sum + (e.label_amount || 0), 0) || 0

    console.log(`✅ Label admin wallet: ${totalEarned.toFixed(2)}`)

    return NextResponse.json({
      success: true,
      wallet: {
        available_balance: totalEarned, // All earnings are available (no payout system yet)
        pending_balance: 0, // TODO: Add status tracking to shared_earnings
        total_earned: totalEarned
      }
    })

  } catch (error) {
    console.error('❌ Label admin wallet API error:', error)
    return NextResponse.json(
      {
        success: true, // Return success with 0 balance instead of error
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0
      }
    )
  }
}
