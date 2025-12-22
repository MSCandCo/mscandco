import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS

/**
 * DELETE /api/releases/delete?id=xxx
 * Delete a release
 */
export async function DELETE(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    
    // Get release ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Release ID is required' }, { status: 400 })
    }

    console.log('🗑️ Deleting release:', id)

    // Get the release to verify ownership
    const { data: release, error: fetchError } = await supabase
      .from('releases')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    if (release.artist_id !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this release' }, { status: 403 })
    }

    // Only allow deleting drafts and submitted releases
    if (!['draft', 'submitted'].includes(release.status)) {
      return NextResponse.json({ error: 'Can only delete draft or submitted releases' }, { status: 400 })
    }

    // Delete the release
    const { error: deleteError } = await supabase
      .from('releases')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ Database delete error:', deleteError)
      return NextResponse.json({
        error: 'Failed to delete release',
        details: deleteError.message
      }, { status: 500 })
    }

    console.log('✅ Release deleted successfully:', id)

    return NextResponse.json({
      success: true,
      message: 'Release deleted successfully'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

