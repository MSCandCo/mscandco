/**
 * API: Update User Status (App Router)
 * POST /api/admin/users/[userId]/update-status
 * 
 * Updates user status by modifying email_confirmed_at and banned_until
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
async function getSupabaseAdmin() {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();
}
export async function POST(request, { params }) {
  try {
    // Check if user is authenticated using Supabase server client
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    const { userId } = await params
    
    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json({
        error: 'Invalid request body',
        message: 'Request body must be valid JSON',
        details: process.env.NODE_ENV === 'development' ? parseError.message : undefined
      }, { status: 400 })
    }
    
    const { status } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!status || !['active', 'inactive', 'pending', 'suspended'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status',
        message: 'Status must be one of: active, inactive, pending, suspended'
      }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (checkError || !existingUser) {
      return NextResponse.json({
        error: 'User not found',
        details: process.env.NODE_ENV === 'development' ? checkError?.message : undefined
      }, { status: 404 })
    }

    // Get current auth user to check current status
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (authError) {
      console.error('Error fetching auth user:', authError)
      return NextResponse.json({
        error: 'Failed to fetch user',
        details: process.env.NODE_ENV === 'development' ? authError.message : undefined
      }, { status: 500 })
    }

    // Prepare update based on status
    // Status is determined by: isActive = email_confirmed_at && !banned_until
    // So: active = confirmed && not banned, inactive/pending = not confirmed or banned
    let updatedAuthUser = null
    let updateError = null

    switch (status) {
      case 'active':
        // Activate: unban user and confirm email
        try {
          // Prepare update object
          const activeUpdate = {}
          
          // Unban if banned (set ban_duration to 'none' or remove ban)
          if (authUser.user.banned_until) {
            // Try ban_duration: 'none' first, if that doesn't work, we'll try removing it
            activeUpdate.ban_duration = 'none'
          }
          
          // Confirm email if not already confirmed
          if (!authUser.user.email_confirmed_at) {
            activeUpdate.email_confirm = true
          }
          
          // Apply updates if any
          if (Object.keys(activeUpdate).length > 0) {
            const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, activeUpdate)
            if (error) {
              // If ban_duration: 'none' fails, try alternative approach
              if (error.message?.includes('ban_duration') && authUser.user.banned_until) {
                console.log('ban_duration: none failed, trying alternative unban method')
                // Try updating with email_confirm only, then get user to check ban status
                const { data: emailData, error: emailError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                  email_confirm: true
                })
                if (emailError) {
                  updatedAuthUser = emailData
                  updateError = emailError
                } else {
                  // Get updated user - ban might still be there but email is confirmed
                  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
                  updatedAuthUser = userData
                }
              } else {
                updatedAuthUser = data
                updateError = error
              }
            } else {
              updatedAuthUser = data
            }
          } else {
            // No updates needed, just get current user
            const { data } = await supabaseAdmin.auth.admin.getUserById(userId)
            updatedAuthUser = data
          }
        } catch (err) {
          console.error('Exception in active case:', err)
          updateError = err
        }
        break
      case 'inactive':
        // Deactivate: Ban user for 1 hour to prevent login
        console.log('🔄 Deactivating user:', userId, existingUser.email)
        
        // Try the simplest approach first - ban_duration as string
        const { data: inactiveData, error: inactiveError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { ban_duration: '1h' }
        )
        
        console.log('📋 Deactivate result:', { 
          success: !inactiveError, 
          error: inactiveError?.message,
          user: inactiveData?.user?.email,
          banned_until: inactiveData?.user?.banned_until
        })
        
        updatedAuthUser = inactiveData
        updateError = inactiveError
        
        // If that fails, log the error for debugging
        if (inactiveError) {
          console.error('❌ Failed to deactivate user:', inactiveError)
          console.error('Error details:', JSON.stringify(inactiveError, null, 2))
        }
        break
      case 'suspended':
        // Suspend: ban user (30 days)
        const suspendUntil = new Date()
        suspendUntil.setDate(suspendUntil.getDate() + 30)
        
        try {
          const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            ban_duration: '30d'
          })
          if (error && error.message?.includes('ban_duration')) {
            throw new Error('ban_duration not supported')
          }
          updatedAuthUser = data
          updateError = error
        } catch (err) {
          const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            app_metadata: {
              ...(authUser.user.app_metadata || {}),
              banned_until: suspendUntil.toISOString()
            }
          })
          updatedAuthUser = data
          updateError = error
          if (!error) {
            const { data: verifyData } = await supabaseAdmin.auth.admin.getUserById(userId)
            updatedAuthUser = verifyData
          }
        }
        break
      case 'pending':
        // Pending: same as inactive - ban for 1 hour
        const pendingUntil = new Date()
        pendingUntil.setHours(pendingUntil.getHours() + 1)
        
        try {
          const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            ban_duration: '1h'
          })
          if (error && error.message?.includes('ban_duration')) {
            throw new Error('ban_duration not supported')
          }
          updatedAuthUser = data
          updateError = error
        } catch (err) {
          const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            app_metadata: {
              ...(authUser.user.app_metadata || {}),
              banned_until: pendingUntil.toISOString()
            }
          })
          updatedAuthUser = data
          updateError = error
          if (!error) {
            const { data: verifyData } = await supabaseAdmin.auth.admin.getUserById(userId)
            updatedAuthUser = verifyData
          }
        }
        break
    }

    if (updateError) {
      console.error('Error updating user status:', updateError)
      return NextResponse.json({
        error: 'Failed to update user status',
        details: process.env.NODE_ENV === 'development' ? updateError.message : 'Database update failed',
        code: updateError.code
      }, { status: 500 })
    }

    // Ensure we have an updated user object
    if (!updatedAuthUser || !updatedAuthUser.user) {
      console.error('Failed to get updated user after status change')
      return NextResponse.json({
        error: 'Failed to update user status',
        details: 'Could not retrieve updated user information',
        message: 'User status update may have succeeded but verification failed'
      }, { status: 500 })
    }

    // Update user_profiles updated_at timestamp
    await supabaseAdmin
      .from('user_profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)

    console.log(`Successfully updated user ${existingUser.email} status to ${status}`)

    // Determine actual status from updated user (matching list API logic)
    const isActive = updatedAuthUser.user.email_confirmed_at && !updatedAuthUser.user.banned_until
    
    // Map to requested status if it matches, otherwise determine from auth state
    let actualStatus = status
    if (status === 'inactive' || status === 'pending') {
      // For inactive/pending, check if user is actually banned
      actualStatus = updatedAuthUser.user.banned_until ? (status === 'suspended' ? 'suspended' : 'inactive') : 'pending'
    } else if (status === 'active') {
      actualStatus = isActive ? 'active' : 'pending'
    }

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        id: updatedAuthUser.user.id,
        email: updatedAuthUser.user.email,
        status: actualStatus,
        email_confirmed_at: updatedAuthUser.user.email_confirmed_at,
        banned_until: updatedAuthUser.user.banned_until
      }
    })

  } catch (error) {
    console.error('Error in update-status:', error)
    return NextResponse.json({
      error: 'Failed to update user status',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    }, { status: 500 })
  }
}

