import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/settings/registration/debug
 * Debug endpoint to check what's actually stored in the database
 */
export async function GET(request) {
  try {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabaseAdmin = await createServiceRoleClient();

    // Get registration setting with raw SQL-like query
    const { data: setting, error } = await supabaseAdmin
      .from('platform_settings')
      .select('*')
      .eq('key', 'registration_enabled')
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({
        error: error.message,
        code: error.code
      }, { status: 500 });
    }

    if (!setting) {
      return NextResponse.json({
        exists: false,
        message: 'No registration_enabled setting found in database'
      });
    }

    // Get raw value details
    const rawValue = setting.value;
    const valueType = typeof rawValue;
    const valueString = String(rawValue);
    const valueJSON = JSON.stringify(rawValue);

    // Normalize
    let normalized = false;
    if (rawValue === true || rawValue === 'true') {
      normalized = true;
    } else if (rawValue === false || rawValue === 'false') {
      normalized = false;
    } else {
      const strValue = String(rawValue).toLowerCase().trim();
      normalized = strValue === 'true' || strValue === '1';
    }

    return NextResponse.json({
      exists: true,
      setting: {
        id: setting.id,
        key: setting.key,
        description: setting.description,
        updated_at: setting.updated_at,
        updated_by: setting.updated_by
      },
      value: {
        raw: rawValue,
        type: valueType,
        string: valueString,
        json: valueJSON,
        normalized: normalized,
        isBoolean: typeof rawValue === 'boolean',
        isString: typeof rawValue === 'string',
        isNumber: typeof rawValue === 'number'
      },
      interpretation: {
        registrationEnabled: normalized,
        message: normalized ? 'Registration is ENABLED' : 'Registration is DISABLED'
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

