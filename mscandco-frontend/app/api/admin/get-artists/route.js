/**
 * API: Get Artists (App Router)
 * GET /api/admin/get-artists - Fetch artists and label admins
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
    // Check authentication using App Router server client
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    console.log('📊 Fetching artists and label admins for earnings management')

    // Get all auth users
    const { data: authResult } = await supabaseAdmin.auth.admin.listUsers()
    const authUsers = authResult?.users || []

    // Get all user profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, first_name, last_name, email, artist_name')

    if (profileError) {
      console.error('Error fetching profiles:', profileError)
      return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: 500 })
    }

    // Combine auth users with profiles and filter for artists and label admins
    const usersWithRoles = authUsers.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id)
      const role = authUser.user_metadata?.role || 'artist' // Default to artist

      return {
        id: authUser.id,
        email: authUser.email,
        role: role,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        artist_name: profile?.artist_name || '',
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at
      }
    })

    // Filter to only include artists and label admins
    const artistsAndLabelAdmins = usersWithRoles.filter(user =>
      ['artist', 'label_admin', 'labeladmin'].includes(user.role)
    )

    console.log(`📊 Found ${artistsAndLabelAdmins.length} artists/label admins out of ${authUsers.length} total users`)

    return NextResponse.json({
      success: true,
      users: artistsAndLabelAdmins,
      total: artistsAndLabelAdmins.length,
      breakdown: {
        artists: artistsAndLabelAdmins.filter(u => u.role === 'artist').length,
        labelAdmins: artistsAndLabelAdmins.filter(u => ['label_admin', 'labeladmin'].includes(u.role)).length
      }
    })

  } catch (error) {
    console.error('❌ Get artists API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
