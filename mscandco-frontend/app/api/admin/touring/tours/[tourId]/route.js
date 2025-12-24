/**
 * Admin API: Single Tour Management
 * GET /api/admin/touring/tours/[tourId] - Get tour details
 * PUT /api/admin/touring/tours/[tourId] - Update tour
 * DELETE /api/admin/touring/tours/[tourId] - Delete tour
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET - Get single tour details with admin access
 */
export async function GET(request, { params }) {
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

    // Permission-based access: super_admin, company_admin, or users with touring permissions
    // In the future, touring admins can be granted touring:admin:read or touring:admin:manage permissions
    const hasPermission = profile?.role === 'super_admin' || profile?.role === 'company_admin';
    
    // Future: Add permission checking here for custom touring admin roles
    // const { data: userPermissions } = await supabaseAdmin
    //   .from('user_permissions')
    //   .select('permission_key')
    //   .eq('user_id', session.user.id)
    //   .eq('is_active', true);
    // const hasPermission = profile?.role === 'super_admin' || 
    //                      profile?.role === 'company_admin' ||
    //                      userPermissions?.some(p => ['touring:admin:read', 'touring:admin:manage'].includes(p.permission_key));

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Touring admin access required' },
        { status: 403 }
      );
    }

    const { tourId } = await params;

    // Get tour with user profile
    const { data: tour, error } = await supabaseAdmin
      .from('tours')
      .select(`
        *,
        user_profiles!tours_user_id_fkey (
          id,
          artist_name,
          email,
          first_name,
          last_name,
          role
        )
      `)
      .eq('id', tourId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Tour not found' },
          { status: 404 }
        );
      }
      console.error('❌ Error fetching tour:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tour', details: error.message },
        { status: 500 }
      );
    }

    // Get tour dates if table exists
    let dates = [];
    try {
      const { data: tourDates } = await supabaseAdmin
        .from('tour_dates')
        .select('*')
        .eq('tour_id', tourId)
        .order('date', { ascending: true });
      dates = tourDates || [];
    } catch (error) {
      console.log('Tour dates may not exist:', error.message);
    }

    return NextResponse.json({
      success: true,
      tour: {
        ...tour,
        artist_name: tour.user_profiles?.artist_name || tour.user_profiles?.email || 'Unknown',
        artist_email: tour.user_profiles?.email || null,
        dates
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in admin tour GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update tour (admin override)
 */
export async function PUT(request, { params }) {
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

    // Permission-based access: super_admin, company_admin, or users with touring permissions
    // In the future, touring admins can be granted touring:admin:read or touring:admin:manage permissions
    const hasPermission = profile?.role === 'super_admin' || profile?.role === 'company_admin';
    
    // Future: Add permission checking here for custom touring admin roles
    // const { data: userPermissions } = await supabaseAdmin
    //   .from('user_permissions')
    //   .select('permission_key')
    //   .eq('user_id', session.user.id)
    //   .eq('is_active', true);
    // const hasPermission = profile?.role === 'super_admin' || 
    //                      profile?.role === 'company_admin' ||
    //                      userPermissions?.some(p => ['touring:admin:read', 'touring:admin:manage'].includes(p.permission_key));

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Touring admin access required' },
        { status: 403 }
      );
    }

    const { tourId } = await params;
    const body = await request.json();
    const { name, artist_name, start_date, end_date, description, budget, currency, tour_type, status } = body;

    // Build update object
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (artist_name !== undefined) updates.artist_name = artist_name;
    if (start_date !== undefined) updates.start_date = start_date || null;
    if (end_date !== undefined) updates.end_date = end_date || null;
    if (description !== undefined) updates.description = description || null;
    if (budget !== undefined) updates.budget = budget || null;
    if (currency !== undefined) updates.currency = currency;
    if (tour_type !== undefined) updates.tour_type = tour_type || null;
    if (status !== undefined) updates.status = status;

    updates.updated_at = new Date().toISOString();

    const { data: tour, error } = await supabaseAdmin
      .from('tours')
      .update(updates)
      .eq('id', tourId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating tour:', error);
      return NextResponse.json(
        { error: 'Failed to update tour', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tour
    });

  } catch (error) {
    console.error('❌ Unexpected error in admin tour PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete tour (admin override)
 */
export async function DELETE(request, { params }) {
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

    // Permission-based access: super_admin, company_admin, or users with touring permissions
    // In the future, touring admins can be granted touring:admin:read or touring:admin:manage permissions
    const hasPermission = profile?.role === 'super_admin' || profile?.role === 'company_admin';
    
    // Future: Add permission checking here for custom touring admin roles
    // const { data: userPermissions } = await supabaseAdmin
    //   .from('user_permissions')
    //   .select('permission_key')
    //   .eq('user_id', session.user.id)
    //   .eq('is_active', true);
    // const hasPermission = profile?.role === 'super_admin' || 
    //                      profile?.role === 'company_admin' ||
    //                      userPermissions?.some(p => ['touring:admin:read', 'touring:admin:manage'].includes(p.permission_key));

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Touring admin access required' },
        { status: 403 }
      );
    }

    const { tourId } = await params;

    // Delete tour (cascade should handle related records)
    const { error } = await supabaseAdmin
      .from('tours')
      .delete()
      .eq('id', tourId);

    if (error) {
      console.error('❌ Error deleting tour:', error);
      return NextResponse.json(
        { error: 'Failed to delete tour', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tour deleted successfully'
    });

  } catch (error) {
    console.error('❌ Unexpected error in admin tour DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

