import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withApiRateLimit } from '@/lib/with-rate-limit'

/**
 * GET /api/admin/moderation/stats
 * Get moderation statistics and performance metrics
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

  // Get queue summary
  const { data: queueSummary, error: queueError } = await supabase
    .from('moderation_queue_summary')
    .select('*')

  if (queueError) {
    console.error('Error fetching queue summary:', queueError)
  }

  // Get moderator performance
  const { data: moderatorPerformance, error: perfError } = await supabase
    .from('moderator_performance')
    .select('*')
    .order('reviews_completed', { ascending: false })
    .limit(10)

  if (perfError) {
    console.error('Error fetching moderator performance:', perfError)
  }

  // Get overall stats
  const { count: totalPending } = await supabase
    .from('content_moderation')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'flagged'])

  const { count: totalApproved } = await supabase
    .from('content_moderation')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: totalRejected } = await supabase
    .from('content_moderation')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected')

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('recent_moderation_activity')
    .select('*')
    .limit(20)

  // Calculate average review time for last 24 hours
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const { data: recentReviews } = await supabase
    .from('content_moderation')
    .select('created_at, reviewed_at')
    .not('reviewed_at', 'is', null)
    .gte('reviewed_at', yesterday.toISOString())

  let avgReviewTimeSeconds = 0
  if (recentReviews && recentReviews.length > 0) {
    const totalSeconds = recentReviews.reduce((sum, review) => {
      const createdAt = new Date(review.created_at)
      const reviewedAt = new Date(review.reviewed_at)
      return sum + (reviewedAt - createdAt) / 1000
    }, 0)
    avgReviewTimeSeconds = totalSeconds / recentReviews.length
  }

  return NextResponse.json({
    success: true,
    data: {
      overview: {
        total_pending: totalPending || 0,
        total_approved: totalApproved || 0,
        total_rejected: totalRejected || 0,
        avg_review_time_seconds: Math.round(avgReviewTimeSeconds)
      },
      queue_summary: queueSummary || [],
      moderator_performance: moderatorPerformance || [],
      recent_activity: recentActivity || []
    }
  })
})
