import { NextResponse } from 'next/server';

/**
 * GET /api/features/social/connections
 * Get all social media connections for the authenticated user
 * Single source of truth for social connections data
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

    // Fetch all active social connections for the user
    const { data: connections, error: connectionsError } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id)
      .order('connected_at', { ascending: false });

    if (connectionsError) {
      console.error('Error fetching social connections:', connectionsError);
      return NextResponse.json(
        { error: 'Failed to fetch social connections', details: connectionsError.message },
        { status: 500 }
      );
    }

    // Remove sensitive data before sending to client
    const sanitizedConnections = connections.map(conn => ({
      id: conn.id,
      platform: conn.platform,
      platform_user_id: conn.platform_user_id,
      username: conn.username,
      is_active: conn.is_active,
      connected_at: conn.connected_at,
      expires_at: conn.expires_at,
      last_used_at: conn.last_used_at,
      scopes: conn.scopes,
      metadata: conn.metadata
      // Note: access_token and refresh_token are intentionally excluded
    }));

    return NextResponse.json({
      success: true,
      connections: sanitizedConnections
    });

  } catch (error) {
    console.error('Social connections API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/features/social/connections
 * Create a new social media connection
 * This is typically called after OAuth callback
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
      platform,
      platform_user_id,
      username,
      access_token,
      refresh_token,
      token_expires_at,
      scopes,
      metadata
    } = body;

    if (!platform || !access_token) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, access_token' },
        { status: 400 }
      );
    }

    // Upsert connection (update if exists, insert if not)
    const { data: connection, error: upsertError } = await supabase
      .from('social_connections')
      .upsert({
        user_id: user.id,
        platform,
        platform_user_id,
        username,
        access_token,
        refresh_token,
        token_expires_at,
        scopes,
        is_active: true,
        metadata: metadata || {},
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,platform'
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error creating social connection:', upsertError);
      return NextResponse.json(
        { error: 'Failed to create social connection', details: upsertError.message },
        { status: 500 }
      );
    }

    // Return sanitized connection
    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        platform: connection.platform,
        platform_user_id: connection.platform_user_id,
        username: connection.username,
        is_active: connection.is_active,
        connected_at: connection.connected_at,
        expires_at: connection.expires_at
      }
    });

  } catch (error) {
    console.error('Social connections POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
