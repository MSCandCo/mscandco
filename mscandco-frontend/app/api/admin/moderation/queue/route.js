import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withApiRateLimit } from '@/lib/with-rate-limit'

/**
 * GET /api/admin/moderation/queue
 * Get moderation queue with filtering
 *
 * Query params:
 * - status: pending, flagged, approved, rejected (default: pending,flagged)
 * - contentType: release, profile, comment, image, other
 * - priority: low, normal, high, urgent
 * - limit: number of results (default: 50)
 * - offset: pagination offset (default: 0)
 */
export const GET = withApiRateLimit(async (request) => {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin or content moderator
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['SuperAdmin', 'Admin', 'ContentModerator'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')?.split(',') || ['pending', 'flagged']
  const contentType = searchParams.get('contentType')
  const priority = searchParams.get('priority')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  // Build query
  let query = supabase
    .from('content_moderation')
    .select(`
      *,
      user:user_profiles!content_moderation_user_id_fkey(id, name, email),
      reviewer:user_profiles!content_moderation_reviewed_by_fkey(id, name, email)
    `, { count: 'exact' })
    .in('status', status)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (contentType) {
    query = query.eq('content_type', contentType)
  }

  if (priority) {
    query = query.eq('priority', priority)
  }

  const { data: queue, error, count } = await query

  if (error) {
    console.error('Error fetching moderation queue:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enrich with content details
  const enrichedQueue = await Promise.all(queue.map(async (item) => {
    let contentDetails = null

    if (item.content_type === 'release') {
      const { data: release } = await supabase
        .from('releases')
        .select('id, title, artist_name, release_type, artwork_url, status')
        .eq('id', item.content_id)
        .single()

      contentDetails = release
    }

    return {
      ...item,
      content_details: contentDetails
    }
  }))

  return NextResponse.json({
    success: true,
    data: enrichedQueue,
    pagination: {
      total: count,
      limit,
      offset,
      hasMore: (offset + limit) < count
    }
  })
})
