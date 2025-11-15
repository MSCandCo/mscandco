import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/features/social/posts
 * Get all social media posts for the authenticated user
 * Single source of truth for social posts data
 */
export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // draft, scheduled, posted, failed
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Build query
    let query = supabase
      .from('social_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      console.error('Error fetching social posts:', postsError);
      return NextResponse.json(
        { error: 'Failed to fetch social posts', details: postsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      posts: posts || []
    });

  } catch (error) {
    console.error('Social posts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/features/social/posts
 * Create a new social media post
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      content,
      platforms,
      scheduled_for,
      post_immediately,
      release_id,
      metadata
    } = body;

    // Validation
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform is required' },
        { status: 400 }
      );
    }

    // Verify user has connections for the selected platforms
    const { data: connections, error: connectionsError } = await supabase
      .from('social_connections')
      .select('platform')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('platform', platforms);

    if (connectionsError) {
      console.error('Error checking connections:', connectionsError);
      return NextResponse.json(
        { error: 'Failed to verify platform connections' },
        { status: 500 }
      );
    }

    const connectedPlatforms = connections.map(c => c.platform);
    const missingPlatforms = platforms.filter(p => !connectedPlatforms.includes(p));

    if (missingPlatforms.length > 0) {
      return NextResponse.json(
        {
          error: 'Not connected to all selected platforms',
          missing_platforms: missingPlatforms
        },
        { status: 400 }
      );
    }

    // Determine status
    let status = 'draft';
    if (post_immediately) {
      status = 'scheduled'; // Will be processed immediately by background job
    } else if (scheduled_for) {
      status = 'scheduled';
    }

    // Create the post
    const { data: post, error: createError } = await supabase
      .from('social_posts')
      .insert({
        user_id: user.id,
        content,
        platforms,
        status,
        scheduled_for: scheduled_for || (post_immediately ? new Date().toISOString() : null),
        post_immediately: post_immediately || false,
        release_id: release_id || null,
        metadata: metadata || {},
        platform_post_ids: {},
        engagement_stats: {},
        retry_count: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating social post:', createError);
      return NextResponse.json(
        { error: 'Failed to create social post', details: createError.message },
        { status: 500 }
      );
    }

    // If posting immediately, trigger the posting process
    // (In production, this would queue a background job)
    if (post_immediately) {
      // TODO: Implement background job queue for actual posting
      console.log('Post queued for immediate posting:', post.id);
    }

    return NextResponse.json({
      success: true,
      post,
      message: post_immediately
        ? 'Post queued for immediate publishing'
        : scheduled_for
        ? 'Post scheduled successfully'
        : 'Post saved as draft'
    });

  } catch (error) {
    console.error('Social posts POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
