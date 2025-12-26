import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/settings/registration
 * Get registration enabled/disabled status
 */
export async function GET(request) {
  try {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabaseAdmin = await createServiceRoleClient();

    // Get registration setting
    const { data: setting, error } = await supabaseAdmin
      .from('platform_settings')
      .select('key, value, updated_at')
      .eq('key', 'registration_enabled')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching registration setting:', error);
      return NextResponse.json(
        { error: 'Failed to fetch registration setting', details: error.message },
        { status: 500 }
      );
    }

    // Default to enabled if setting doesn't exist
    const registrationEnabled = setting?.value === true || setting?.value === 'true' || !setting;

    return NextResponse.json({
      success: true,
      registration_enabled: registrationEnabled,
      updated_at: setting?.updated_at || null
    });

  } catch (error) {
    console.error('Error in GET /api/admin/settings/registration:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings/registration
 * Update registration enabled/disabled status
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

    const { registration_enabled } = await request.json();

    if (typeof registration_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request', message: 'registration_enabled must be a boolean' },
        { status: 400 }
      );
    }

    // Upsert the setting
    const { data, error } = await supabaseAdmin
      .from('platform_settings')
      .upsert({
        key: 'registration_enabled',
        value: registration_enabled,
        description: 'Controls whether new user registration is enabled',
        updated_by: session.user.id,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating registration setting:', error);
      return NextResponse.json(
        { error: 'Failed to update registration setting', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Registration ${registration_enabled ? 'enabled' : 'disabled'} by ${session.user.id}`);

    return NextResponse.json({
      success: true,
      registration_enabled: registration_enabled,
      updated_at: data.updated_at
    });

  } catch (error) {
    console.error('Error in POST /api/admin/settings/registration:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

