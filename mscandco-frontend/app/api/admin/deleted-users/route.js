import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/deleted-users
 *
 * Admin endpoint to view deleted users and their financial data
 * Requires: manage_users permission
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
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has manage_users permission
    const { data: hasPermission, error: permError } = await supabase.rpc(
      'check_user_permission',
      {
        user_id: user.id,
        permission_name: 'manage_users'
      }
    )

    if (permError || !hasPermission) {
      console.error('Permission check failed:', permError)
      return NextResponse.json(
        { error: 'Forbidden: Requires manage_users permission' },
        { status: 403 }
      )
    }

    // Get deleted users with earnings data using the view
    const { data: deletedUsers, error: fetchError } = await supabase
      .from('deleted_users_with_earnings')
      .select('*')
      .order('deleted_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching deleted users:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch deleted users' },
        { status: 500 }
      )
    }

    console.log(`📋 Fetched ${deletedUsers?.length || 0} deleted users for admin: ${user.email}`)

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
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    const { data: hasPermission } = await supabase.rpc(
      'check_user_permission',
      {
        user_id: user.id,
        permission_name: 'manage_users'
      }
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden: Requires manage_users permission' },
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
    const { error: restoreError } = await supabase
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

    // Log the restoration
    await supabase.rpc('log_security_event', {
      p_user_id: user_id,
      p_event_type: 'account_restored',
      p_event_category: 'account',
      p_severity: 'warning',
      p_success: true,
      p_details: JSON.stringify({
        restored_by: user.id,
        restored_by_email: user.email
      })
    })

    console.log(`✅ User ${user_id} restored by admin: ${user.email}`)

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
