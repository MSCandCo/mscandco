import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/admin/settings/change-password
 * Change user password (requires current password)
 */
export async function POST(request) {
  try {
    // Lazy load Supabase clients to avoid build-time errors
    const { createClient } = await import('@/lib/supabase/server');
    
    // Authenticate user
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'currentPassword and newPassword are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Invalid password', message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword
    })

    if (verifyError) {
      return NextResponse.json(
        { error: 'Invalid current password', message: 'The current password you entered is incorrect' },
        { status: 401 }
      )
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password', message: updateError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Password updated for user: ${session.user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Error in change-password POST:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
