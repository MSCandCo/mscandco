/**
 * API: Update User Status (App Router)
 * POST /api/admin/users/[userId]/update-status
 * 
 * Updates user status by modifying email_confirmed_at and banned_until
 */

import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
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

