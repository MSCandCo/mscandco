/**
 * Admin API: Touring Statistics
 * GET /api/admin/touring/stats - Get comprehensive touring statistics
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
    //                      userPermissions?.some(p => ['touring:admin:read', 'touring:admin:manage', 
    //                                                  'touring:analytics:read'].includes(p.permission_key));

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Touring admin access required' },
        { status: 403 }
      );
    }

    // Get comprehensive statistics
    const [
      totalToursResult,
      activeToursResult,
      completedToursResult,
      planningToursResult,
      cancelledToursResult,
      totalBudgetResult,
      toursByTypeResult,
      toursByStatusResult,
      recentToursResult
    ] = await Promise.all([
      // Total tours
      supabaseAdmin.from('tours').select('id', { count: 'exact', head: true }),
      
      // Active tours
      supabaseAdmin.from('tours').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      
      // Completed tours
      supabaseAdmin.from('tours').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      
      // Planning tours
      supabaseAdmin.from('tours').select('id', { count: 'exact', head: true }).eq('status', 'planning'),
      
      // Cancelled tours
      supabaseAdmin.from('tours').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
      
      // Total budget (sum)
      supabaseAdmin.from('tours').select('budget').not('budget', 'is', null),
      
      // Tours by type
      supabaseAdmin.from('tours').select('tour_type').not('tour_type', 'is', null),
      
      // Tours by status
      supabaseAdmin.from('tours').select('status'),
      
      // Recent tours (last 30 days)
      supabaseAdmin.from('tours')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    // Calculate total budget
    const totalBudget = (totalBudgetResult.data || []).reduce((sum, tour) => {
      return sum + (parseFloat(tour.budget) || 0);
    }, 0);

    // Count tours by type
    const toursByType = {};
    (toursByTypeResult.data || []).forEach(tour => {
      const type = tour.tour_type || 'other';
      toursByType[type] = (toursByType[type] || 0) + 1;
    });

    // Count tours by status
    const toursByStatus = {};
    (toursByStatusResult.data || []).forEach(tour => {
      const status = tour.status || 'unknown';
      toursByStatus[status] = (toursByStatus[status] || 0) + 1;
    });

    // Get unique users with tours
    const { data: uniqueUsers, error: usersError } = await supabaseAdmin
      .from('tours')
      .select('user_id')
      .not('user_id', 'is', null);

    const uniqueUserCount = new Set((uniqueUsers || []).map(u => u.user_id)).size;

    // Get tour dates statistics if table exists
    let totalDates = 0;
    let upcomingDates = 0;
    try {
      const datesCount = await supabaseAdmin
        .from('tour_dates')
        .select('id', { count: 'exact', head: true });
      totalDates = datesCount.count || 0;

      const upcomingDatesCount = await supabaseAdmin
        .from('tour_dates')
        .select('id', { count: 'exact', head: true })
        .gte('date', new Date().toISOString());
      upcomingDates = upcomingDatesCount.count || 0;
    } catch (error) {
      console.log('Tour dates table may not exist:', error.message);
    }

    return NextResponse.json({
      success: true,
      stats: {
        overview: {
          totalTours: totalToursResult.count || 0,
          activeTours: activeToursResult.count || 0,
          completedTours: completedToursResult.count || 0,
          planningTours: planningToursResult.count || 0,
          cancelledTours: cancelledToursResult.count || 0,
          uniqueUsers: uniqueUserCount,
          totalBudget: totalBudget,
          recentTours: recentToursResult.count || 0
        },
        dates: {
          totalDates,
          upcomingDates,
          pastDates: totalDates - upcomingDates
        },
        breakdown: {
          byType: toursByType,
          byStatus: toursByStatus
        }
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in admin touring stats GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

