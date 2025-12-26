import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/waitlist
 * Add email to registration waitlist
 */
export async function POST(request) {
  try {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabaseAdmin = await createServiceRoleClient();

    const { email, name, role } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Check if email already exists in waitlist
    const { data: existing } = await supabaseAdmin
      .from('registration_waitlist')
      .select('id, email, joined_at')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'You are already on the waitlist',
        already_exists: true
      });
    }

    // Insert into waitlist
    const { data, error } = await supabaseAdmin
      .from('registration_waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        name: name || null,
        role: role || 'artist',
        notified: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to waitlist:', error);
      return NextResponse.json(
        { error: 'Failed to add to waitlist', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Added ${email} to waitlist`);

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist',
      data: {
        id: data.id,
        email: data.email,
        joined_at: data.joined_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/waitlist:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/waitlist
 * List waitlist entries (admin only)
 */
export async function GET(request) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    
    // Check authentication
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const supabaseAdmin = await createServiceRoleClient();
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !['super_admin', 'company_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const notified = searchParams.get('notified'); // 'true' or 'false'
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabaseAdmin
      .from('registration_waitlist')
      .select('*', { count: 'exact' })
      .order('joined_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (notified !== null) {
      query = query.eq('notified', notified === 'true');
    }

    const { data: waitlist, error, count } = await query;

    if (error) {
      console.error('Error fetching waitlist:', error);
      return NextResponse.json(
        { error: 'Failed to fetch waitlist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      waitlist: waitlist || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error in GET /api/waitlist:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

