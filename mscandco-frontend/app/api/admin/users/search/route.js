/**
 * API: Search Users (App Router)
 * GET /api/admin/users/search?q=searchterm
 */

import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    // Lazy load Supabase clients to avoid build-time errors
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    
    // Check authentication
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    // Get service role client for admin operations
    const supabaseAdmin = await createServiceRoleClient()
    
    // Use service role to search users
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, first_name, last_name, role')
      .or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .limit(50)

    if (error) {
      console.error('❌ User search error:', error)
      return NextResponse.json({
        error: 'Internal server error',
        details: error.message
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('q') || ''

    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({
        success: true,
        users: []
      })
    }

    const formattedUsers = users.map(user => {
      const name = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.first_name || user.last_name
      
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
