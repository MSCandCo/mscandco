/**
 * Admin API: Touring Finance
 * GET /api/admin/touring/finance - Get comprehensive touring financial data
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

    // Check admin permissions - touring finance access
    const supabaseAdmin = await createServiceRoleClient();
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Permission-based access: super_admin, company_admin, or users with touring permissions
    // In the future, touring admins can be granted touring:finance:read or touring:admin:manage permissions
    const hasPermission = profile?.role === 'super_admin' || profile?.role === 'company_admin';
    
    // Future: Add permission checking here for custom touring admin roles
    // const { data: userPermissions } = await supabaseAdmin
    //   .from('user_permissions')
    //   .select('permission_key')
    //   .eq('user_id', session.user.id)
    //   .eq('is_active', true);
    // const hasPermission = profile?.role === 'super_admin' || 
    //                      profile?.role === 'company_admin' ||
    //                      userPermissions?.some(p => ['touring:finance:read', 'touring:finance:manage', 
    //                                                  'touring:admin:read', 'touring:admin:manage'].includes(p.permission_key));

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Touring finance access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tourId = searchParams.get('tourId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get all tours for financial analysis
    let toursQuery = supabaseAdmin
      .from('tours')
      .select('id, name, user_id, budget, currency, status, start_date, end_date, created_at');

    if (userId) {
      toursQuery = toursQuery.eq('user_id', userId);
    }
    if (tourId) {
      toursQuery = toursQuery.eq('id', tourId);
    }
    if (startDate) {
      toursQuery = toursQuery.gte('created_at', startDate);
    }
    if (endDate) {
      toursQuery = toursQuery.lte('created_at', endDate);
    }

    const { data: tours, error: toursError } = await toursQuery;

    if (toursError) {
      console.error('❌ Error fetching tours:', toursError);
      return NextResponse.json(
        { error: 'Failed to fetch tours', details: toursError.message },
        { status: 500 }
      );
    }

    // Fetch user profiles separately
    const userIds = [...new Set((tours || []).map(tour => tour.user_id).filter(Boolean))];
    let userProfilesMap = {};
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('user_profiles')
        .select('id, artist_name, email')
        .in('id', userIds);
      
      if (profiles) {
        userProfilesMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }
    }

    // Calculate financial metrics
    const totalBudget = (tours || []).reduce((sum, tour) => {
      return sum + (parseFloat(tour.budget) || 0);
    }, 0);

    const budgetsByStatus = {};
    const budgetsByCurrency = {};
    const budgetsByUser = {};

    (tours || []).forEach(tour => {
      const budget = parseFloat(tour.budget) || 0;
      const status = tour.status || 'unknown';
      const currency = tour.currency || 'GBP';
      const userId = tour.user_id;

      budgetsByStatus[status] = (budgetsByStatus[status] || 0) + budget;
      budgetsByCurrency[currency] = (budgetsByCurrency[currency] || 0) + budget;
      budgetsByUser[userId] = (budgetsByUser[userId] || 0) + budget;
    });

    // Get tour dates financial data if available
    let totalExpenses = 0;
    let totalRevenue = 0;
    try {
      const tourIds = (tours || []).map(t => t.id);
      if (tourIds.length > 0) {
        // Try to get expenses from tour_dates or expenses tables
        const { data: expenses } = await supabaseAdmin
          .from('tour_expenses')
          .select('amount, currency, tour_id')
          .in('tour_id', tourIds);

        totalExpenses = (expenses || []).reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

        const { data: revenue } = await supabaseAdmin
          .from('tour_revenue')
          .select('amount, currency, tour_id')
          .in('tour_id', tourIds);

        totalRevenue = (revenue || []).reduce((sum, rev) => sum + (parseFloat(rev.amount) || 0), 0);
      }
    } catch (error) {
      console.log('Tour expenses/revenue tables may not exist:', error.message);
    }

    // Get financial summary by month
    const monthlyData = {};
    (tours || []).forEach(tour => {
      if (tour.created_at) {
        const month = new Date(tour.created_at).toISOString().substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = { budget: 0, count: 0 };
        }
        monthlyData[month].budget += parseFloat(tour.budget) || 0;
        monthlyData[month].count += 1;
      }
    });

    return NextResponse.json({
      success: true,
      finance: {
        overview: {
          totalBudget,
          totalExpenses,
          totalRevenue,
          netProfit: totalRevenue - totalExpenses,
          totalTours: tours?.length || 0,
          averageBudgetPerTour: tours?.length > 0 ? totalBudget / tours.length : 0
        },
        breakdown: {
          byStatus: budgetsByStatus,
          byCurrency: budgetsByCurrency,
          byUser: Object.entries(budgetsByUser).map(([userId, budget]) => {
            const userProfile = userProfilesMap[userId];
            return {
              userId,
              artistName: userProfile?.artist_name || userProfile?.email || 'Unknown',
              totalBudget: budget,
              tourCount: tours?.filter(t => t.user_id === userId).length || 0
            };
          }),
          monthly: Object.entries(monthlyData).map(([month, data]) => ({
            month,
            budget: data.budget,
            tourCount: data.count
          })).sort((a, b) => a.month.localeCompare(b.month))
        },
        tours: (tours || []).map(tour => {
          const userProfile = userProfilesMap[tour.user_id];
          return {
            id: tour.id,
            name: tour.name,
            artistName: userProfile?.artist_name || tour.artist_name || userProfile?.email || 'Unknown',
            budget: parseFloat(tour.budget) || 0,
            currency: tour.currency || 'GBP',
            status: tour.status,
            startDate: tour.start_date,
            endDate: tour.end_date
          };
        })
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in touring finance GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

