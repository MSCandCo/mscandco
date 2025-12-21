import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin-client'

/**
 * GET /api/admin/master-roster
 * Get master roster of all contributors (artists, label admins, etc.)
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

    // Get all user profiles with role information
    const supabaseAdmin = getSupabaseAdmin()
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, first_name, last_name, artist_name, role, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (profileError) {
      console.error('Error fetching profiles:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch master roster', message: profileError.message },
        { status: 500 }
      )
    }

    // Get auth users to check email confirmation
    const { data: authResult } = await supabaseAdmin.auth.admin.listUsers()
    const authUsers = authResult?.users || []
    const authUsersMap = new Map(authUsers.map(u => [u.id, u]))

    // Combine profiles with auth data
    const contributors = (profiles || []).map(profile => {
      const authUser = authUsersMap.get(profile.id)
      const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.artist_name || 'No Name'
      const companyName = profile.artist_name || profile.company_name || 'N/A'
      
      return {
        id: profile.id,
        full_name: fullName,
        email: profile.email,
        artist_name: profile.artist_name,
        company_name: companyName,
        role: profile.role || 'artist',
        source: authUser?.app_metadata?.provider || 'email',
        source_user_id: null, // Can be enhanced later
        email_confirmed: authUser?.email_confirmed_at ? true : false,
        joined_date: profile.created_at,
        last_updated: profile.updated_at || profile.created_at
      }
    })

    // Calculate summary
    const summary = {
      total: contributors.length,
      by_role: contributors.reduce((acc, c) => {
        acc[c.role] = (acc[c.role] || 0) + 1
        return acc
      }, {}),
      confirmed: contributors.filter(c => c.email_confirmed).length,
      unconfirmed: contributors.filter(c => !c.email_confirmed).length
    }

    return NextResponse.json({
      success: true,
      contributors,
      summary
    })

  } catch (error) {
    console.error('Error in master-roster GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

