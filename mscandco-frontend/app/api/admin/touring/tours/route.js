/**
 * Admin API: Touring Tours Management
 * GET /api/admin/touring/tours - Get all tours with filtering, pagination, and search
 * POST /api/admin/touring/tours - Create tour (admin override)
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET - Fetch all tours with admin controls
 */
export async function GET(request) {
  try {
    // Lazy load Supabase clients
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Check admin permissions - permission-based access
    const supabaseAdmin = await createServiceRoleClient();
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Permission-based access: Check role first, then check permissions
    let hasPermission = profile?.role === 'super_admin' || profile?.role === 'company_admin';
    
    // If not super_admin or company_admin, check for touring permissions
    if (!hasPermission) {
      // Check role-based permissions
      const { data: rolePermissions } = await supabaseAdmin
        .from('role_permissions')
        .select(`
          permissions!role_permissions_permission_id_fkey (
            name
          )
        `)
        .eq('role_id', (await supabaseAdmin.from('roles').select('id').eq('name', profile?.role || '').single()).data?.id);
      
      const permissionNames = (rolePermissions || []).map(rp => rp.permissions?.name).filter(Boolean);
      hasPermission = permissionNames.some(p => ['touring:admin:read', 'touring:admin:manage'].includes(p));
      
      // Also check user-specific permissions
      if (!hasPermission) {
        const { data: userPermissions } = await supabaseAdmin
          .from('user_permissions')
          .select(`
            permissions!user_permissions_permission_id_fkey (
              name
            )
          `)
          .eq('user_id', session.user.id)
          .eq('granted', true)
          .is('revoked_at', null);
        
        const userPermissionNames = (userPermissions || []).map(up => up.permissions?.name).filter(Boolean);
        hasPermission = userPermissionNames.some(p => ['touring:admin:read', 'touring:admin:manage'].includes(p));
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Touring admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const userId = searchParams.get('userId');
    const tourType = searchParams.get('tourType');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query - fetch tours first, then enrich with user data
    let query = supabaseAdmin
      .from('tours')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (tourType) {
      query = query.eq('tour_type', tourType);
    }

    // Search filter (name, artist_name, description)
    if (search) {
      query = query.or(`name.ilike.%${search}%,artist_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: tours, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching tours:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tours', details: error.message },
        { status: 500 }
      );
    }

    // Fetch user profiles for all unique user_ids
    const userIds = [...new Set((tours || []).map(tour => tour.user_id).filter(Boolean))];
    let userProfilesMap = {};
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('user_profiles')
        .select('id, artist_name, email, first_name, last_name')
        .in('id', userIds);
      
      if (profiles) {
        userProfilesMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }
    }

    // Format response with user profile data
    const formattedTours = (tours || []).map(tour => {
      const userProfile = userProfilesMap[tour.user_id];
      return {
        ...tour,
        artist_name: userProfile?.artist_name || tour.artist_name || userProfile?.email || 'Unknown',
        artist_email: userProfile?.email || null,
        artist_id: userProfile?.id || tour.user_id || null
      };
    });

    return NextResponse.json({
      success: true,
      tours: formattedTours,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in admin tours GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create tour (admin override)
 */
export async function POST(request) {
  try {
    // Lazy load Supabase clients
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Check admin permissions - permission-based access
    const supabaseAdmin = await createServiceRoleClient();
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Permission-based access: Check role first, then check permissions
    let hasPermission = profile?.role === 'super_admin' || profile?.role === 'company_admin';
    
    // If not super_admin or company_admin, check for touring permissions
    if (!hasPermission) {
      // Check role-based permissions
      const { data: rolePermissions } = await supabaseAdmin
        .from('role_permissions')
        .select(`
          permissions!role_permissions_permission_id_fkey (
            name
          )
        `)
        .eq('role_id', (await supabaseAdmin.from('roles').select('id').eq('name', profile?.role || '').single()).data?.id);
      
      const permissionNames = (rolePermissions || []).map(rp => rp.permissions?.name).filter(Boolean);
      hasPermission = permissionNames.some(p => ['touring:admin:read', 'touring:admin:manage'].includes(p));
      
      // Also check user-specific permissions
      if (!hasPermission) {
        const { data: userPermissions } = await supabaseAdmin
          .from('user_permissions')
          .select(`
            permissions!user_permissions_permission_id_fkey (
              name
            )
          `)
          .eq('user_id', session.user.id)
          .eq('granted', true)
          .is('revoked_at', null);
        
        const userPermissionNames = (userPermissions || []).map(up => up.permissions?.name).filter(Boolean);
        hasPermission = userPermissionNames.some(p => ['touring:admin:read', 'touring:admin:manage'].includes(p));
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Touring admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, name, artist_name, start_date, end_date, description, budget, currency, tour_type, status } = body;

    if (!userId || !name || !artist_name) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, artist_name' },
        { status: 400 }
      );
    }

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
        currency: currency || 'GBP',
        tour_type: tour_type || null,
        status: status || 'planning'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating tour:', error);
      return NextResponse.json(
        { error: 'Failed to create tour', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tour
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Unexpected error in admin tours POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

