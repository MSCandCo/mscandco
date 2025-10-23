/**
 * API: List All Users (App Router)
 * GET /api/admin/users/list
 *
 * EXACT COPY from staging but using App Router session
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
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

    // Get all user profiles with role information
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, first_name, last_name, role, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (profileError) {
      console.error('Error fetching user profiles:', profileError)
      throw profileError
    }

    // Get auth users to check email confirmation status
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
      // Continue without auth status if this fails
    }

    // Create a Map for O(1) lookup instead of O(n) find
    const authUsersMap = new Map()
    if (authData?.users) {
      authData.users.forEach(authUser => {
        authUsersMap.set(authUser.id, authUser)
      })
    }

    // Map profiles with auth status - O(n) instead of O(n²)
    const users = profiles.map(profile => {
      const authUser = authUsersMap.get(profile.id)

      // User is active if email is confirmed AND not banned
      const isActive = authUser?.email_confirmed_at && !authUser?.banned_until

      return {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
        role: profile.role || 'artist',
        status: isActive ? 'active' : 'pending',
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        last_sign_in: authUser?.last_sign_in_at || null
      }
    })

    return NextResponse.json({
      success: true,
      users,
      total: users.length
    })

  } catch (error) {
    console.error('Error in users/list:', error)
    return NextResponse.json({
      error: 'Failed to fetch users',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
