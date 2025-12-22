import { NextResponse } from 'next/server';

/**
 * GET /api/features/social/users/search
 * Search for users on the platform
 * Single source of truth for user search
 *
 * Query parameters:
 * - q: Search query (searches artist_name, display_name, name, email)
 * - limit: Max results (default 20)
 * - role: Filter by role (artist, label, etc.)
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit')) || 20;
    const role = searchParams.get('role');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Build search query
    // Search in artist_name, display_name, and email (case-insensitive)
    let dbQuery = supabase
      .from('user_profiles')
      .select(`
        user_id,
        artist_name,
        display_name,
        email,
        role,
        profile_picture_url,
        bio,
        created_at
      `)
      .or(`artist_name.ilike.%${query}%,display_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit)
      .order('artist_name', { ascending: true });

    // Add role filter if specified
    if (role) {
      dbQuery = dbQuery.eq('role', role);
    }

    const { data: users, error: searchError } = await dbQuery;

    if (searchError) {
      console.error('Error searching users:', searchError);
      return NextResponse.json(
        { error: 'Failed to search users', details: searchError.message },
        { status: 500 }
      );
    }

    // For each user, check if current user is following them
    const userIds = users.map(u => u.user_id);

    const { data: followStatuses, error: followError } = await supabase
      .from('user_followers')
      .select('following_id, status')
      .eq('follower_id', user.id)
      .in('following_id', userIds);

    if (followError) {
      console.error('Error checking follow status:', followError);
    }

    // Create a map of follow statuses
    const followStatusMap = {};
    if (followStatuses) {
      followStatuses.forEach(fs => {
        followStatusMap[fs.following_id] = fs.status;
      });
    }

    // Enrich users with follow status and follower counts
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        // Get follower count
        const { count: followerCount } = await supabase
          .from('user_followers')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', u.user_id)
          .eq('status', 'active');

        // Get following count
        const { count: followingCount } = await supabase
          .from('user_followers')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', u.user_id)
          .eq('status', 'active');

        return {
          ...u,
          is_following: followStatusMap[u.user_id] === 'active',
          follow_status: followStatusMap[u.user_id] || null,
          follower_count: followerCount || 0,
          following_count: followingCount || 0,
          is_current_user: u.user_id === user.id
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      query,
      count: enrichedUsers.length
    });

  } catch (error) {
    console.error('User search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
