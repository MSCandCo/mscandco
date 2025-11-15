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

    // Fetch all copyright data in parallel
    const [verificationsResult, clearancesResult, dmcaResult, registrationsResult, monitoringResult] = await Promise.all([
      supabaseAdmin.from('copyright_verifications').select('*').order('created_at', { ascending: false }).limit(500),
      supabaseAdmin.from('copyright_clearances').select('*').order('created_at', { ascending: false }).limit(500),
      supabaseAdmin.from('dmca_takedowns').select('*').order('created_at', { ascending: false }).limit(500),
      supabaseAdmin.from('copyright_registrations').select('*').order('created_at', { ascending: false }).limit(500),
      supabaseAdmin.from('copyright_monitoring').select('*').order('created_at', { ascending: false }).limit(500)
    ]);

    // Get unique IDs for joins
    const releaseIds = new Set();
    const userIds = new Set();

    [verificationsResult.data, clearancesResult.data, dmcaResult.data, registrationsResult.data, monitoringResult.data].forEach(data => {
      (data || []).forEach(item => {
        if (item.release_id) releaseIds.add(item.release_id);
        if (item.user_id) userIds.add(item.user_id);
      });
    });

    // Fetch releases and user profiles
    let releasesData = {};
    let userProfilesData = {};

    if (releaseIds.size > 0) {
      const { data: releases } = await supabaseAdmin
        .from('releases')
        .select('id, title, artist_name, status')
        .in('id', Array.from(releaseIds));

      if (releases) {
        releases.forEach(r => { releasesData[r.id] = r; });
      }
    }

    if (userIds.size > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('user_profiles')
        .select('id, first_name, last_name, artist_name, email')
        .in('id', Array.from(userIds));

      if (profiles) {
        profiles.forEach(p => { userProfilesData[p.id] = p; });
      }
    }

    // Combine data
    const verifications = (verificationsResult.data || []).map(item => ({
      ...item,
      releases: releasesData[item.release_id] || null,
      user_profiles: userProfilesData[item.user_id] || null
    }));

    const clearances = (clearancesResult.data || []).map(item => ({
      ...item,
      releases: releasesData[item.release_id] || null,
      user_profiles: userProfilesData[item.user_id] || null
    }));

    const dmcaTakedowns = (dmcaResult.data || []).map(item => ({
      ...item,
      releases: releasesData[item.release_id] || null,
      user_profiles: userProfilesData[item.user_id] || null
    }));

    const registrations = (registrationsResult.data || []).map(item => ({
      ...item,
      releases: releasesData[item.release_id] || null,
      user_profiles: userProfilesData[item.user_id] || null
    }));

    const monitoring = (monitoringResult.data || []).map(item => ({
      ...item,
      releases: releasesData[item.release_id] || null,
      user_profiles: userProfilesData[item.user_id] || null
    }));

    return NextResponse.json({
      success: true,
      data: {
        verifications,
        clearances,
        dmcaTakedowns,
        registrations,
        monitoring
      }
    });

  } catch (error) {
    console.error('Error in copyright API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

