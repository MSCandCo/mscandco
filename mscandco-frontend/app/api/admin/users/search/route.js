/**
 * API: Search Users (App Router)
 * GET /api/admin/users/search?q=searchterm
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
    // Check authentication
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        users: []
      })
    }

    console.log('🔍 Searching users with query:', query)

    // Search users by email, first_name, last_name, artist_name, or label_name
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, first_name, last_name, artist_name, label_name, display_name, role')
      .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,artist_name.ilike.%${query}%,label_name.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(50)

    if (error) {
      console.error('❌ Error searching users:', error)
      return NextResponse.json({
        error: 'Failed to search users',
        details: error.message
      }, { status: 500 })
    }

    // Format results
    const formattedUsers = users.map(user => {
      let name = user.display_name

      if (!name) {
        if (user.artist_name) {
          name = user.artist_name
        } else if (user.label_name) {
          name = user.label_name
        } else {
          name = `${user.first_name || ''} ${user.last_name || ''}`.trim()
        }
      }

      return {
        id: user.id,
        email: user.email,
        name: name || user.email,
        role: user.role
      }
    })

    console.log(`✅ Found ${formattedUsers.length} users`)

    return NextResponse.json({
      success: true,
      users: formattedUsers
    })

  } catch (error) {
    console.error('❌ User search error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
