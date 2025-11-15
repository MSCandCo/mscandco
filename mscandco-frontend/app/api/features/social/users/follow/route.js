import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/features/social/users/follow
 * Follow a user
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
    const { user_id: followingId } = body;

    if (!followingId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Can't follow yourself
    if (followingId === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: targetUser, error: userError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', followingId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create follow relationship (upsert to handle already following)
    const { data: follow, error: followError } = await supabase
      .from('user_followers')
      .upsert({
        follower_id: user.id,
        following_id: followingId,
        status: 'active',
        followed_at: new Date().toISOString()
      }, {
        onConflict: 'follower_id,following_id'
      })
      .select()
      .single();

    if (followError) {
      console.error('Error following user:', followError);
      return NextResponse.json(
        { error: 'Failed to follow user', details: followError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully followed user',
      follow
    });

  } catch (error) {
    console.error('Follow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/features/social/users/follow
 * Unfollow a user
 */
export async function DELETE(request) {
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
    const { user_id: followingId } = body;

    if (!followingId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Delete follow relationship
    const { error: unfollowError } = await supabase
      .from('user_followers')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId);

    if (unfollowError) {
      console.error('Error unfollowing user:', unfollowError);
      return NextResponse.json(
        { error: 'Failed to unfollow user', details: unfollowError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unfollowed user'
    });

  } catch (error) {
    console.error('Unfollow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/features/social/users/follow
 * Get followers and following for current user or specified user
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

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('user_id') || user.id;
    const type = searchParams.get('type'); // 'followers' | 'following'
    const limit = parseInt(searchParams.get('limit')) || 50;

    let followers = [];
    let following = [];

    if (!type || type === 'followers') {
      // Get followers
      const { data: followerData, error: followersError } = await supabase
        .from('user_followers')
        .select(`
          follower_id,
          followed_at,
          status,
          user_profiles!user_followers_follower_id_fkey (
            user_id,
            artist_name,
            display_name,
            profile_picture_url,
            role
          )
        `)
        .eq('following_id', targetUserId)
        .eq('status', 'active')
        .order('followed_at', { ascending: false })
        .limit(limit);

      if (followersError) {
        console.error('Error fetching followers:', followersError);
      } else {
        followers = followerData || [];
      }
    }

    if (!type || type === 'following') {
      // Get following
      const { data: followingData, error: followingError } = await supabase
        .from('user_followers')
        .select(`
          following_id,
          followed_at,
          status,
          user_profiles!user_followers_following_id_fkey (
            user_id,
            artist_name,
            display_name,
            profile_picture_url,
            role
          )
        `)
        .eq('follower_id', targetUserId)
        .eq('status', 'active')
        .order('followed_at', { ascending: false })
        .limit(limit);

      if (followingError) {
        console.error('Error fetching following:', followingError);
      } else {
        following = followingData || [];
      }
    }

    return NextResponse.json({
      success: true,
      followers,
      following,
      follower_count: followers.length,
      following_count: following.length
    });

  } catch (error) {
    console.error('Get followers/following API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
