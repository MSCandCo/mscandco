import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/public/registration-status
 * Public endpoint to check if registration is enabled
 * No authentication required
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
      // Default to enabled on error to avoid blocking users
      return NextResponse.json({
        registration_enabled: true
      });
    }

    // Default to enabled if setting doesn't exist
    if (!setting) {
      return NextResponse.json({
        registration_enabled: true
      });
    }

    // Check value - handle both boolean and string representations
    // JSONB values might be stored as boolean true/false or as string "true"/"false"
    const value = setting.value;
    const registrationEnabled = value === true || 
                               value === 'true' || 
                               String(value).toLowerCase() === 'true';

    console.log('Registration status check:', { value, registrationEnabled, type: typeof value });

    return NextResponse.json({
      registration_enabled: registrationEnabled
    });

  } catch (error) {
    console.error('Error in GET /api/public/registration-status:', error);
    // Default to enabled on error to avoid blocking users
    return NextResponse.json({
      registration_enabled: true
    });
  }
}

