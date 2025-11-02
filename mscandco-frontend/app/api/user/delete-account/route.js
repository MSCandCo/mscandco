import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DELETE /api/user/delete-account
 *
 * Permanently deletes a user account and all associated data
 *
 * GDPR Compliance: Users have the right to delete their data
 *
 * Security:
 * - Requires authentication
 * - User can only delete their own account
 * - Requires confirmation via password
 * - Logs deletion for audit trail
 *
 * What gets deleted:
 * - User profile from user_profiles table
 * - Auth account from auth.users
 * - Associated data (cascading deletes via FK constraints)
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

    // Delete user profile first (will cascade to related data)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Error deleting user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to delete profile data', details: profileError.message },
        { status: 500 }
      )
    }

    // Delete the auth user account
    // Note: This requires admin privileges, so we use the auth admin API
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)

      // If auth deletion fails but profile was deleted, log critical error
      console.error('⚠️ CRITICAL: Profile deleted but auth account remains for user:', user.id)

      return NextResponse.json(
        { error: 'Failed to delete account', details: deleteError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Account successfully deleted: ${user.id} (${user.email})`)

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
