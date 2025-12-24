/**
 * Admin API: Touring Analytics
 * GET /api/admin/touring/analytics - Get comprehensive touring analytics and insights
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

    // Check admin permissions - touring analytics access
    const supabaseAdmin = await createServiceRoleClient();
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Permission-based access: super_admin, company_admin, or users with touring permissions
    // In the future, touring admins can be granted touring:analytics:read or touring:admin:manage permissions
    const hasPermission = profile?.role === 'super_admin' || profile?.role === 'company_admin';
    
    // Future: Add permission checking here for custom touring admin roles
    // const { data: userPermissions } = await supabaseAdmin
    //   .from('user_permissions')
    //   .select('permission_key')
    //   .eq('user_id', session.user.id)
    //   .eq('is_active', true);
    // const hasPermission = profile?.role === 'super_admin' || 
    //                      profile?.role === 'company_admin' ||
    //                      userPermissions?.some(p => ['touring:analytics:read', 'touring:admin:read', 
    //                                                  'touring:admin:manage'].includes(p.permission_key));

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Touring analytics access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();

    // Get comprehensive tour analytics
    const { data: allTours, error: toursError } = await supabaseAdmin
      .from('tours')
      .select(`
        id,
        name,
        user_id,
        tour_type,
        status,
        budget,
        currency,
        start_date,
        end_date,
        created_at,
        updated_at,
        user_profiles!tours_user_id_fkey (
          id,
          artist_name,
          email
        )
      `)
      .gte('created_at', startDate);

    if (toursError) {
      console.error('❌ Error fetching tours:', toursError);
      return NextResponse.json(
        { error: 'Failed to fetch tours', details: toursError.message },
        { status: 500 }
      );
    }

    // Calculate analytics metrics
    const totalTours = allTours?.length || 0;
    const activeTours = allTours?.filter(t => t.status === 'active').length || 0;
    const completedTours = allTours?.filter(t => t.status === 'completed').length || 0;
    const planningTours = allTours?.filter(t => t.status === 'planning').length || 0;

    // Tours by type
    const toursByType = {};
    allTours?.forEach(tour => {
      const type = tour.tour_type || 'other';
      toursByType[type] = (toursByType[type] || 0) + 1;
    });

    // Tours by status over time
    const toursOverTime = {};
    allTours?.forEach(tour => {
      if (tour.created_at) {
        const date = new Date(tour.created_at).toISOString().substring(0, 10); // YYYY-MM-DD
        if (!toursOverTime[date]) {
          toursOverTime[date] = { total: 0, active: 0, completed: 0, planning: 0, cancelled: 0 };
        }
        toursOverTime[date].total += 1;
        toursOverTime[date][tour.status || 'planning'] = (toursOverTime[date][tour.status || 'planning'] || 0) + 1;
      }
    });

    // User activity
    const userActivity = {};
    allTours?.forEach(tour => {
      const userId = tour.user_id;
      if (!userActivity[userId]) {
        userActivity[userId] = {
          userId,
          artistName: tour.user_profiles?.artist_name || tour.user_profiles?.email || 'Unknown',
          tourCount: 0,
          totalBudget: 0,
          lastTourDate: null
        };
      }
      userActivity[userId].tourCount += 1;
      userActivity[userId].totalBudget += parseFloat(tour.budget) || 0;
      if (!userActivity[userId].lastTourDate || tour.created_at > userActivity[userId].lastTourDate) {
        userActivity[userId].lastTourDate = tour.created_at;
      }
    });

    // Get tour dates analytics if available
    let totalDates = 0;
    let upcomingDates = 0;
    let pastDates = 0;
    try {
      const tourIds = allTours?.map(t => t.id) || [];
      if (tourIds.length > 0) {
        const { count: datesCount } = await supabaseAdmin
          .from('tour_dates')
          .select('*', { count: 'exact', head: true })
          .in('tour_id', tourIds);
        totalDates = datesCount || 0;

        const { count: upcomingCount } = await supabaseAdmin
          .from('tour_dates')
          .select('*', { count: 'exact', head: true })
          .in('tour_id', tourIds)
          .gte('date', new Date().toISOString());
        upcomingDates = upcomingCount || 0;
        pastDates = totalDates - upcomingDates;
      }
    } catch (error) {
      console.log('Tour dates table may not exist:', error.message);
    }

    // Calculate conversion rates and trends
    const completionRate = totalTours > 0 ? (completedTours / totalTours) * 100 : 0;
    const averageToursPerUser = Object.keys(userActivity).length > 0 
      ? totalTours / Object.keys(userActivity).length 
      : 0;

    // Get top performers
    const topPerformers = Object.values(userActivity)
      .sort((a, b) => b.tourCount - a.tourCount)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalTours,
          activeTours,
          completedTours,
          planningTours,
          totalDates,
          upcomingDates,
          pastDates,
          completionRate: parseFloat(completionRate.toFixed(2)),
          averageToursPerUser: parseFloat(averageToursPerUser.toFixed(2)),
          uniqueUsers: Object.keys(userActivity).length
        },
        breakdown: {
          byType: toursByType,
          overTime: Object.entries(toursOverTime)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date))
        },
        userActivity: Object.values(userActivity),
        topPerformers,
        trends: {
          growthRate: 0, // Can be calculated by comparing periods
          averageCompletionTime: 0, // Can be calculated from start_date to end_date for completed tours
          mostPopularType: Object.entries(toursByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
        }
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in touring analytics GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

