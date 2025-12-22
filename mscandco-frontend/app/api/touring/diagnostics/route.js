/**
 * Touring Platform - Diagnostics API
 * Check database configuration and table existence
 */

import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      authentication: {
        authenticated: false,
        userId: null,
        error: null
      },
      database: {
        toursTableExists: false,
        canQuery: false,
        error: null,
        rlsEnabled: null
      }
    };

    // Check authentication
    try {
      const serverSupabase = await createServerClient();
      const { data: { user }, error: userError } = await serverSupabase.auth.getUser();
      
      if (userError) {
        diagnostics.authentication.error = userError.message;
      } else if (user) {
        diagnostics.authentication.authenticated = true;
        diagnostics.authentication.userId = user.id;
      } else {
        diagnostics.authentication.error = 'No user found';
      }
    } catch (authError) {
      diagnostics.authentication.error = authError.message;
    }

    // Check database
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      diagnostics.database.error = 'Missing environment variables';
      return NextResponse.json(diagnostics);
    }

    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Try to query the tours table
      const { data, error } = await supabaseAdmin
        .from('tours')
        .select('id')
        .limit(1);

      if (error) {
        diagnostics.database.error = error.message;
        diagnostics.database.errorCode = error.code;
        
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          diagnostics.database.toursTableExists = false;
          diagnostics.database.error = 'Table "tours" does not exist. Please run the database migration.';
        } else if (error.code === '42501' || error.message?.includes('permission denied')) {
          diagnostics.database.rlsEnabled = true;
          diagnostics.database.error = 'Permission denied - RLS may be blocking access';
        }
      } else {
        diagnostics.database.toursTableExists = true;
        diagnostics.database.canQuery = true;
      }

      // Check RLS status
      try {
        const { data: rlsData, error: rlsError } = await (getSupabaseAdmin()).rpc('check_rls_enabled', {
          table_name: 'tours'
        }).catch(() => {
          // If RPC doesn't exist, try direct query
          return supabaseAdmin
            .from('pg_tables')
            .select('*')
            .eq('tablename', 'tours')
            .limit(1);
        });
        
        // RLS check is optional - don't fail if it doesn't work
      } catch (rlsCheckError) {
        // Ignore RLS check errors
      }

    } catch (dbError) {
      diagnostics.database.error = dbError.message;
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Diagnostics failed',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

