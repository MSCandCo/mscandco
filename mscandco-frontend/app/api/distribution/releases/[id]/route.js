import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS for distribution partner access

/**
 * PATCH /api/distribution/releases/[id]
 * Update release metadata (for distribution admin)
 */
export async function PATCH(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    console.log(`📝 Updating release metadata for release ${id}:`, body)

    // Get the release to verify it exists
    const { data: release, error: fetchError } = await supabase
      .from('releases')
      .select('id, status')
      .eq('id', id)
      .single()

    if (fetchError || !release) {
      console.error('❌ Release not found:', fetchError)
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    // Prepare update data - only include fields that are provided
    const updateData = {
      updated_at: new Date().toISOString()
    }

    // Allow updating these fields
    const allowedFields = [
      'title',
      'artist_name',
      'release_type',
      'genre',
      'subgenre',
      'release_date',
      'upc',
      'isrc',
      'catalog_number',
      'copyright_holder'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field] || null
      }
    })

    // Update the release
    const { data, error } = await supabase
      .from('releases')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating release:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Release ${id} updated successfully`)

    return NextResponse.json({
      success: true,
      release: data
    })

  } catch (error) {
    console.error('❌ Distribution release update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
