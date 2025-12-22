import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS

/**
 * PUT /api/releases/[id]
 * Update a release
 */
export async function PUT(request, { params }) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { id } = params
    
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    console.log('Release update API called:', { id, userId })

    // Get the release to verify ownership
    const { data: release, error: fetchError } = await supabase
      .from('releases')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !release) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    if (release.artist_id !== userId) {
      console.error('Authorization failed:', { releaseArtistId: release.artist_id, userId })
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Get request body
    const body = await request.json()

    // Update the release
    const { data, error } = await supabase
      .from('releases')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Release updated successfully:', data)
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error updating release:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

