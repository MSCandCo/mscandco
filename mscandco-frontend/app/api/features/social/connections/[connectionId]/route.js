import { NextResponse } from 'next/server';

/**
 * DELETE /api/features/social/connections/[connectionId]
 * Delete/disconnect a social media connection
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    const { connectionId } = params;

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    // Delete the connection (RLS ensures user can only delete their own)
    const { error: deleteError } = await supabase
      .from('social_connections')
      .delete()
      .eq('id', connectionId)
      .eq('user_id', user.id); // Double-check ownership

    if (deleteError) {
      console.error('Error deleting social connection:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete social connection', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Social connection deleted successfully'
    });

  } catch (error) {
    console.error('Social connection DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/features/social/connections/[connectionId]
 * Update a social media connection (e.g., refresh token)
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

    const { connectionId } = params;
    const body = await request.json();

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    // Only allow updating specific fields
    const allowedUpdates = {
      access_token: body.access_token,
      refresh_token: body.refresh_token,
      token_expires_at: body.token_expires_at,
      is_active: body.is_active,
      last_used_at: body.last_used_at || new Date().toISOString(),
      metadata: body.metadata
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key =>
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    // Update the connection
    const { data: connection, error: updateError } = await supabase
      .from('social_connections')
      .update(allowedUpdates)
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating social connection:', updateError);
      return NextResponse.json(
        { error: 'Failed to update social connection', details: updateError.message },
        { status: 500 }
      );
    }

    // Return sanitized connection
    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        platform: connection.platform,
        username: connection.username,
        is_active: connection.is_active,
        last_used_at: connection.last_used_at
      }
    });

  } catch (error) {
    console.error('Social connection PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
