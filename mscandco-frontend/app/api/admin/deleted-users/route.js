import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
async function getSupabaseAdmin() {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();
}
/**
 * GET /api/admin/deleted-users
 *
 * Admin endpoint to view deleted users and their financial data
 * Requires: Admin role (super_admin, company_admin, or label_admin)
 *
 * Returns deleted users with:
 * - User profile data
 * - Final wallet balance
 * - Total earnings
 * - Pending earnings
 * - Deletion details
 */
export async function GET(request) {
  try {
    // Authenticate user
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is admin using service role
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin', 'label_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get deleted users with earnings data
    // First, get all user_profiles that are deleted
    const { data: deletedProfiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, first_name, last_name, artist_name, role, deleted_at, deletion_reason')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching deleted profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch deleted users', message: profilesError.message },
        { status: 500 }
      )
    }

    // If no deleted users, return empty array
    if (!deletedProfiles || deletedProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      })
    }

    // Get earnings data for deleted users
    const userIds = deletedProfiles.map(p => p.id)
    const { data: earningsData, error: earningsError } = await supabaseAdmin
      .from('earnings_log')
      .select('artist_id, amount, status')
      .in('artist_id', userIds)

    // Calculate totals per user
    const earningsByUser = {}
    if (earningsData) {
      earningsData.forEach(earning => {
        if (!earningsByUser[earning.artist_id]) {
          earningsByUser[earning.artist_id] = {
            total: 0,
            pending: 0
          }
        }
        earningsByUser[earning.artist_id].total += earning.amount || 0
        if (earning.status === 'pending') {
          earningsByUser[earning.artist_id].pending += earning.amount || 0
        }
      })
    }

    // Get wallet balances
    const { data: walletData, error: walletError } = await supabaseAdmin
      .from('earnings_log')
      .select('artist_id, available_balance')
      .in('artist_id', userIds)
      .order('created_at', { ascending: false })

    const walletByUser = {}
    if (walletData) {
      walletData.forEach(w => {
        if (!walletByUser[w.artist_id]) {
          walletByUser[w.artist_id] = w.available_balance || 0
        }
      })
    }

    // Combine all data
    const deletedUsers = deletedProfiles.map(profile => ({
      user_id: profile.id,
      email: profile.email,
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
      artist_name: profile.artist_name,
      role_name: profile.role,
      deleted_at: profile.deleted_at,
      deletion_reason: profile.deletion_reason,
      final_wallet_balance: walletByUser[profile.id] || 0,
      total_earnings: earningsByUser[profile.id]?.total || 0,
      pending_earnings: earningsByUser[profile.id]?.pending || 0
    }))

    console.log(`📋 Fetched ${deletedUsers?.length || 0} deleted users for admin: ${session.user.email}`)

    return NextResponse.json({
      success: true,
      data: deletedUsers || [],
      count: deletedUsers?.length || 0
    })

  } catch (error) {
    console.error('Error in deleted users API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/deleted-users/restore
 *
 * Restore a soft-deleted user (mark as not deleted)
 * Requires: manage_users permission
 */
export async function POST(request) {
  try {
    // Authenticate user
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is admin using service role
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin', 'label_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Restore the user (unmark as deleted)
    const { error: restoreError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        deleted_at: null,
        deletion_reason: null
      })
      .eq('id', user_id)

    if (restoreError) {
      console.error('Error restoring user:', restoreError)
      return NextResponse.json(
        { error: 'Failed to restore user' },
        { status: 500 }
      )
    }

    // Log the restoration (if function exists)
    try {
      await supabaseAdmin.rpc('log_security_event', {
        p_user_id: user_id,
        p_event_type: 'account_restored',
        p_event_category: 'account',
        p_severity: 'warning',
        p_success: true,
        p_details: JSON.stringify({
          restored_by: session.user.id,
          restored_by_email: session.user.email
        })
      })
    } catch (logError) {
      // Silently fail if logging function doesn't exist
      console.log('Security event logging not available')
    }

    console.log(`✅ User ${user_id} restored by admin: ${session.user.email}`)

    return NextResponse.json({
      success: true,
      message: 'User restored successfully'
    })

  } catch (error) {
    console.error('Error in restore user API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
