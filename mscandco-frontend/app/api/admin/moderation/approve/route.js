import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withApiRateLimit } from '@/lib/with-rate-limit'

/**
 * POST /api/admin/moderation/approve
 * Approve moderated content
 *
 * Body:
 * {
 *   moderationId: UUID,
 *   notes: string (optional)
 * }
 */
export const POST = withApiRateLimit(async (request) => {
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

  // Parse request body
  const body = await request.json()
  const { moderationId, notes } = body

  if (!moderationId) {
    return NextResponse.json({ error: 'moderationId is required' }, { status: 400 })
  }

  // Call the approve_content function
  const { data, error } = await supabase.rpc('approve_content', {
    p_moderation_id: moderationId,
    p_reviewer_id: user.id,
    p_notes: notes || null
  })

  if (error) {
    console.error('Error approving content:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data.success) {
    return NextResponse.json({ error: data.error }, { status: 400 })
  }

  // Get updated moderation record
  const { data: moderation } = await supabase
    .from('content_moderation')
    .select(`
      *,
      user:user_profiles!content_moderation_user_id_fkey(id, name, email),
      reviewer:user_profiles!content_moderation_reviewed_by_fkey(id, name, email)
    `)
    .eq('id', moderationId)
    .single()

  return NextResponse.json({
    success: true,
    data: moderation,
    message: 'Content approved successfully'
  })
})
