/**
 * Touring Platform - Tours API
 * CRUD operations for tours
 */

import { NextResponse } from 'next/server';

// Helper function to get admin client (initialized fresh each time to avoid stale connections)
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    }
  );
}

/**
 * GET - Fetch tours for authenticated user
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json(
        { error: 'Server configuration error', details: 'Missing Supabase URL' },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { error: 'Server configuration error', details: 'Missing service role key' },
        { status: 500 }
      );
    }

    // Authenticate user first
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError) {
      console.error('❌ Auth error:', userError);
      return NextResponse.json(
        { error: 'Authentication failed', details: userError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('❌ No user found in session');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No authenticated user found' },
        { status: 401 }
      );
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server');


    const supabaseAdmin = await createServiceRoleClient();
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client initialization failed');
      return NextResponse.json(
        { error: 'Server configuration error', details: 'Supabase admin client not initialized. Check environment variables.' },
        { status: 500 }
      );
    }

    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    console.log('🎸 Fetching tours for user:', userId);
    console.log('🎸 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('🎸 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
    
    // Check if tours table exists by attempting a simple query
    let query = supabaseAdmin
      .from('tours')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: tours, error } = await query;
    
    if (error) {
      console.error('❌ Database error fetching tours:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      console.error('❌ Error hint:', error.hint);
      
      // Check if table doesn't exist
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Database table not found', 
            details: 'The tours table has not been created. Please run the database migration.',
            code: 'TABLE_NOT_FOUND'
          },
          { status: 500 }
        );
      }
      
      // Check if RLS is blocking
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        return NextResponse.json(
          { 
            error: 'Permission denied', 
            details: 'Row Level Security policies may be blocking access. Please check RLS policies.',
            code: 'PERMISSION_DENIED'
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Database error', 
          details: error.message,
          code: error.code || 'UNKNOWN_ERROR'
        },
        { status: 500 }
      );
    }
    
    console.log(`✅ Found ${tours?.length || 0} tours for user ${userId}`);
    
    return NextResponse.json({
      success: true,
      tours: tours || [],
      count: tours?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Unexpected error fetching tours:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tours', 
        details: error.message || 'Unknown error occurred',
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new tour
 */
export async function POST(request) {
  try {
    // Authenticate user first
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server');


    const supabaseAdmin = await createServiceRoleClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error', details: 'Supabase admin client not initialized. Check environment variables.' },
        { status: 500 }
      );
    }

    const userId = user.id;
    const body = await request.json();
    const { name, artist_name, start_date, end_date, description, budget, currency, tour_type } = body;
    
    if (!name || !artist_name) {
      return NextResponse.json(
        { error: 'Missing required fields: name, artist_name' },
        { status: 400 }
      );
    }
    
    console.log('🎸 Creating tour for user:', userId, 'name:', name);
    
    const { data: tour, error } = await supabaseAdmin
      .from('tours')
      .insert({
        user_id: userId,
        name,
        artist_name,
        start_date: start_date || null,
        end_date: end_date || null,
        description: description || null,
        budget: budget || null,
        currency: currency || 'USD',
        tour_type: tour_type || null,
        status: 'planning'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Database error creating tour:', error);
      throw error;
    }
    
    console.log('✅ Tour created successfully:', tour.id);
    
    return NextResponse.json({
      success: true,
      tour
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating tour:', error);
    return NextResponse.json(
      { error: 'Failed to create tour', details: error.message },
      { status: 500 }
    );
  }
}

