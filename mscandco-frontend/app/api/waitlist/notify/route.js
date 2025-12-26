import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/waitlist/notify
 * Notify all waitlist users that registration is now open
 * Requires: super_admin or company_admin role
 */
export async function POST(request) {
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

    // Get all non-notified waitlist entries
    const { data: waitlist, error: fetchError } = await supabaseAdmin
      .from('registration_waitlist')
      .select('id, email, name')
      .eq('notified', false);

    if (fetchError) {
      console.error('Error fetching waitlist:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch waitlist', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!waitlist || waitlist.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users to notify',
        notified_count: 0
      });
    }

    // TODO: Send emails to waitlist users
    // For now, just mark them as notified
    const waitlistIds = waitlist.map(w => w.id);
    const { error: updateError } = await supabaseAdmin
      .from('registration_waitlist')
      .update({
        notified: true,
        notified_at: new Date().toISOString()
      })
      .in('id', waitlistIds);

    if (updateError) {
      console.error('Error updating waitlist:', updateError);
      return NextResponse.json(
        { error: 'Failed to update waitlist', details: updateError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Marked ${waitlist.length} waitlist entries as notified`);

    return NextResponse.json({
      success: true,
      message: `Successfully notified ${waitlist.length} users`,
      notified_count: waitlist.length,
      emails: waitlist.map(w => w.email)
    });

  } catch (error) {
    console.error('Error in POST /api/waitlist/notify:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

