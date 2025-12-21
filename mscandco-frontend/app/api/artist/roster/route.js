import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = require('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}
/**
 * GET /api/artist/roster
 * Fetch artist roster (contributors)
 */
export async function GET(request) {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const artistId = session.user.id
    console.log('👥 Fetching roster for artist:', artistId)

    // Fetch contributors from roster table
    const { data: roster, error } = await supabaseAdmin
      .from('roster')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching roster:', error)
      // Return empty array if table doesn't exist or has no data
      return NextResponse.json([])
    }

    return NextResponse.json(roster || [])

  } catch (error) {
    console.error('Error in roster GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/artist/roster
 * Add a new contributor to roster
 */
export async function POST(request) {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const artistId = session.user.id
    const body = await request.json()

    const { data: newContributor, error } = await supabaseAdmin
      .from('roster')
      .insert({
        artist_id: artistId,
        ...body,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating contributor:', error)
      return NextResponse.json(
        { error: 'Failed to add contributor', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      contributor: newContributor
    })

  } catch (error) {
    console.error('Error in roster POST:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/artist/roster
 * Update a contributor
 */
export async function PUT(request) {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const artistId = session.user.id
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Contributor ID is required' },
        { status: 400 }
      )
    }

    const { data: updatedContributor, error } = await supabaseAdmin
      .from('roster')
      .update(updates)
      .eq('id', id)
      .eq('artist_id', artistId)
      .select()
      .single()

    if (error) {
      console.error('Error updating contributor:', error)
      return NextResponse.json(
        { error: 'Failed to update contributor', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      contributor: updatedContributor
    })

  } catch (error) {
    console.error('Error in roster PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/artist/roster
 * Delete a contributor
 */
export async function DELETE(request) {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const artistId = session.user.id
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Contributor ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('roster')
      .delete()
      .eq('id', id)
      .eq('artist_id', artistId)

    if (error) {
      console.error('Error deleting contributor:', error)
      return NextResponse.json(
        { error: 'Failed to delete contributor', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contributor deleted successfully'
    })

  } catch (error) {
    console.error('Error in roster DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

