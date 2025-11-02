import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/user/delete-account
 *
 * Soft deletes a user account while preserving financial records
 *
 * GDPR Compliance: Users have the right to delete their data
 * Financial Compliance: Earnings records preserved for audit/claims
 *
 * Security:
 * - Requires authentication
 * - User can only delete their own account
 * - Requires password verification
 * - Requires explicit "DELETE MY ACCOUNT" text confirmation
 * - Logs deletion for audit trail
 *
 * What happens:
 * - User marked as deleted in user_profiles (deleted_at timestamp)
 * - Complete audit record created in deleted_users_audit table
 * - Financial snapshot preserved (wallet balance, earnings)
 * - Auth account removed from auth.users
 * - User cannot log in again
 * - Admins can still see financial records for claims/disputes
 *
 * What is preserved:
 * - earnings_log records (for financial audit trail)
 * - Final wallet balance and pending earnings
 * - User metadata in deleted_users_audit table
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

    // Get request body
    const body = await request.json()
    const { password, confirmation } = body

    // Require explicit confirmation
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Please type "DELETE MY ACCOUNT" to confirm' },
        { status: 400 }
      )
    }

    // Verify password before deletion
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to delete your account' },
        { status: 400 }
      )
    }

    // Verify password by attempting to sign in
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    })

    if (passwordError) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    // Log the deletion attempt for audit
    console.log(`🗑️ Account deletion requested by user: ${user.id} (${user.email})`)

    // Use soft delete function to preserve financial records
    const { data: softDeleteResult, error: softDeleteError } = await supabase.rpc(
      'soft_delete_user_account',
      {
        p_user_id: user.id,
        p_deletion_reason: 'User requested account deletion',
        p_deleted_by: user.id,
        p_deletion_method: 'self'
      }
    )

    if (softDeleteError) {
      console.error('Error soft deleting user account:', softDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete account', details: softDeleteError.message },
        { status: 500 }
      )
    }

    // Delete the auth user account (but profile data is preserved in deleted_users_audit)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account', details: deleteError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Account successfully soft deleted: ${user.id} (${user.email})`)
    console.log(`   Final wallet balance: £${softDeleteResult?.wallet_balance || 0}`)
    console.log(`   Pending earnings: £${softDeleteResult?.pending_earnings || 0}`)

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Your account has been permanently deleted'
    })

  } catch (error) {
    console.error('Error in delete account API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    )
  }
}
