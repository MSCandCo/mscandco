/**
 * Admin API: Touring Users Activity
 * GET /api/admin/touring/users - Get users with touring activity
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    // Get all users who have tours
    let usersQuery = supabaseAdmin
      .from('user_profiles')
      .select(`
        id,
        artist_name,
        email,
        first_name,
        last_name,
        role,
        created_at
      `);

    if (search) {
      usersQuery = usersQuery.or(`artist_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error: usersError } = await usersQuery.range(offset, offset + limit - 1);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      );
    }

    // Get tour counts and stats for each user
    const usersWithStats = await Promise.all((users || []).map(async (user) => {
      // Get tour counts
      const { count: totalTours } = await supabaseAdmin
        .from('tours')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: activeTours } = await supabaseAdmin
        .from('tours')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      const { count: completedTours } = await supabaseAdmin
        .from('tours')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // Get total budget
      const { data: userTours } = await supabaseAdmin
        .from('tours')
        .select('budget')
        .eq('user_id', user.id)
        .not('budget', 'is', null);

      const totalBudget = (userTours || []).reduce((sum, tour) => {
        return sum + (parseFloat(tour.budget) || 0);
      }, 0);

      // Get latest tour
      const { data: latestTour } = await supabaseAdmin
        .from('tours')
        .select('created_at, name, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        ...user,
        touringStats: {
          totalTours: totalTours || 0,
          activeTours: activeTours || 0,
          completedTours: completedTours || 0,
          totalBudget: totalBudget,
          latestTour: latestTour || null
        }
      };
    }));

    // Get total count for pagination
    const { count: totalUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: totalUsers || 0,
        totalPages: Math.ceil((totalUsers || 0) / limit)
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in admin touring users GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

