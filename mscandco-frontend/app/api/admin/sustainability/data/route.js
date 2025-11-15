import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    
    // Authenticate user first
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service role client to bypass RLS
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get() { return undefined; },
          set() {},
          remove() {},
        },
      }
    );

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'all';

    // Calculate date range
    const getDateRange = (range) => {
      const now = new Date();
      const ranges = {
        today: {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0],
          end: null
        },
        week: {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: null
        },
        month: {
          start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
          end: null
        },
        quarter: {
          start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString().split('T')[0],
          end: null
        },
        year: {
          start: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
          end: null
        },
        all: { start: null, end: null }
      };
      return ranges[range] || ranges.all;
    };

    const dateRange = getDateRange(timeRange);

    // Fetch carbon tracking data
    let carbonQuery = supabaseAdmin
      .from('carbon_footprint_tracking')
      .select('*')
      .order('created_at', { ascending: false });

    if (dateRange.start) {
      carbonQuery = carbonQuery.gte('calculation_period_start', dateRange.start);
    }
    if (dateRange.end) {
      carbonQuery = carbonQuery.lte('calculation_period_end', dateRange.end);
    }

    const { data: carbonDataRaw, error: carbonError } = await carbonQuery;

    let carbonDataRawSafe = [];
    if (carbonError) {
      if (carbonError.code === '42P01' || carbonError.message?.includes('does not exist')) {
        // Table doesn't exist - return empty data
        carbonDataRawSafe = [];
      } else {
        console.error('Carbon tracking error:', carbonError);
        carbonDataRawSafe = [];
      }
    } else {
      carbonDataRawSafe = carbonDataRaw || [];
    }

    // Fetch releases and user profiles
    const releaseIds = [...new Set(carbonDataRawSafe.map(c => c.release_id).filter(Boolean))];
    const userIds = [...new Set(carbonDataRawSafe.map(c => c.user_id).filter(Boolean))];

    let releasesData = {};
    let userProfilesData = {};

    if (releaseIds.length > 0) {
      const { data: releases, error: releasesError } = await supabaseAdmin
        .from('releases')
        .select('id, title, artist_name, release_date')
        .in('id', releaseIds);

      if (!releasesError && releases) {
        releases.forEach(r => {
          releasesData[r.id] = r;
        });
      }
    }

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, artist_name, first_name, last_name, email')
        .in('id', userIds);

      if (!profilesError && profiles) {
        profiles.forEach(p => {
          userProfilesData[p.id] = p;
        });
      }
    }

    // Combine carbon data
    const carbonData = carbonDataRawSafe.map(item => ({
      ...item,
      releases: releasesData[item.release_id] || null,
      user_profiles: userProfilesData[item.user_id] || null
    }));

    // Fetch offset transactions
    let offsetsData = [];
    try {
      const { data: offsets, error: offsetsError } = await supabaseAdmin
        .from('carbon_offset_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (offsetsError) {
        if (offsetsError.code === '42P01' || offsetsError.message?.includes('does not exist')) {
          offsetsData = [];
        } else {
          console.error('Offset transactions error:', offsetsError);
          offsetsData = [];
        }
      } else {
        offsetsData = offsets || [];
      }
    } catch (err) {
      console.error('Error fetching offsets:', err);
      offsetsData = [];
    }

    // Fetch sustainability profiles
    let profilesData = [];
    try {
      const { data: profilesRaw, error: profilesError } = await supabaseAdmin
        .from('sustainability_profiles')
        .select('*')
        .order('total_carbon_kg', { ascending: false });

      if (profilesError) {
        if (profilesError.code === '42P01' || profilesError.message?.includes('does not exist')) {
          profilesData = [];
        } else {
          console.error('Sustainability profiles error:', profilesError);
          profilesData = [];
        }
      } else if (profilesRaw) {
      // Fetch user profiles for sustainability profiles
      const profileUserIds = [...new Set(profilesRaw.map(p => p.user_id).filter(Boolean))];
      let profileUserData = {};

      if (profileUserIds.length > 0) {
        const { data: profileUsers, error: profileUsersError } = await supabaseAdmin
          .from('user_profiles')
          .select('id, artist_name, first_name, last_name, email')
          .in('id', profileUserIds);

        if (!profileUsersError && profileUsers) {
          profileUsers.forEach(u => {
            profileUserData[u.id] = u;
          });
        }
      }

        profilesData = profilesRaw.map(profile => ({
          ...profile,
          user_profiles: profileUserData[profile.user_id] || null
        }));
      }
    } catch (err) {
      console.error('Error fetching sustainability profiles:', err);
      profilesData = [];
    }

    // Fetch achievements
    let achievementsData = [];
    try {
      const { data: achievements, error: achievementsError } = await supabaseAdmin
        .from('sustainability_achievements')
        .select('*')
        .order('earned_at', { ascending: false })
        .limit(50);

      if (achievementsError) {
        if (achievementsError.code === '42P01' || achievementsError.message?.includes('does not exist')) {
          achievementsData = [];
        } else {
          console.error('Achievements error:', achievementsError);
          achievementsData = [];
        }
      } else {
        achievementsData = achievements || [];
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
      achievementsData = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        carbonData,
        offsets: offsetsData,
        sustainabilityProfiles: profilesData,
        achievements: achievementsData
      }
    });

  } catch (error) {
    console.error('Error in sustainability API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

