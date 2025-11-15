import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/features/social/posts/[postId]
 * Get a specific social media post
 */
export async function GET(request, { params }) {
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

    const { postId } = params;

    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single();

    if (postError) {
      console.error('Error fetching social post:', postError);
      return NextResponse.json(
        { error: 'Post not found', details: postError.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post
    });

  } catch (error) {
    console.error('Social post GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/features/social/posts/[postId]
 * Update a social media post
 */
export async function PATCH(request, { params }) {
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

    const { postId } = params;
    const body = await request.json();

    // Only allow updating specific fields
    const allowedUpdates = {
      content: body.content,
      platforms: body.platforms,
      scheduled_for: body.scheduled_for,
      status: body.status,
      metadata: body.metadata
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key =>
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    // Don't allow updating posted posts
    const { data: existingPost, error: fetchError } = await supabase
      .from('social_posts')
      .select('status')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingPost.status === 'posted') {
      return NextResponse.json(
        { error: 'Cannot edit a post that has already been published' },
        { status: 400 }
      );
    }

    // Update the post
    const { data: post, error: updateError } = await supabase
      .from('social_posts')
      .update(allowedUpdates)
      .eq('id', postId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating social post:', updateError);
      return NextResponse.json(
        { error: 'Failed to update social post', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post
    });

  } catch (error) {
    console.error('Social post PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/features/social/posts/[postId]
 * Delete a social media post
 */
export async function DELETE(request, { params }) {
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

    const { postId } = params;

    // Delete the post (RLS ensures user can only delete their own)
    const { error: deleteError } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting social post:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete social post', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Social post deleted successfully'
    });

  } catch (error) {
    console.error('Social post DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
