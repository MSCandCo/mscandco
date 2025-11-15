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

    // Fetch all accessibility data in parallel
    const [contentResult, requestsResult, interpretersResult, complianceResult] = await Promise.all([
      supabaseAdmin.from('accessibility_content').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('accessibility_requests').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('sign_language_interpreters').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('accessibility_compliance').select('*').order('created_at', { ascending: false })
    ]);

    // Get unique IDs for joins
    const releaseIds = new Set();
    const userIds = new Set();

    [contentResult.data, requestsResult.data, complianceResult.data].forEach(data => {
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
        .select('id, title, artist_name, release_date')
        .in('id', Array.from(releaseIds));

      if (releases) {
        releases.forEach(r => { releasesData[r.id] = r; });
      }
    }

    if (userIds.size > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('user_profiles')
        .select('id, artist_name, first_name, last_name, email')
        .in('id', Array.from(userIds));

      if (profiles) {
        profiles.forEach(p => { userProfilesData[p.id] = p; });
      }
    }

    // Combine data
    const content = (contentResult.data || []).map(item => ({
      ...item,
      releases: releasesData[item.release_id] || null,
      user_profiles: userProfilesData[item.user_id] || null
    }));

    const requests = (requestsResult.data || []).map(item => ({
      ...item,
      releases: releasesData[item.release_id] || null,
      user_profiles: userProfilesData[item.user_id] || null
    }));

    const interpreters = interpretersResult.data || [];
    const compliance = (complianceResult.data || []).map(item => ({
      ...item,
      releases: releasesData[item.release_id] || null,
      user_profiles: userProfilesData[item.user_id] || null
    }));

    return NextResponse.json({
      success: true,
      data: {
        content,
        requests,
        interpreters,
        compliance
      }
    });

  } catch (error) {
    console.error('Error in accessibility API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

