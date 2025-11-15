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

    // Fetch all open data stats in parallel
    const [metricsResult, datasetsResult, apiKeysResult, requestsResult, keyUsersResult] = await Promise.all([
      supabaseAdmin.from('open_data_metrics').select('*', { count: 'exact', head: true }).eq('is_public', true),
      supabaseAdmin.from('research_datasets').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabaseAdmin.from('open_data_api_keys').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('dataset_access_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('open_data_api_keys').select('user_id', { distinct: true })
    ]);

    // Handle errors gracefully
    const metrics = metricsResult.error && metricsResult.error.code !== '42P01' ? 0 : (metricsResult.count || 0);
    const datasets = datasetsResult.error && datasetsResult.error.code !== '42P01' ? 0 : (datasetsResult.count || 0);
    const apiKeys = apiKeysResult.error && apiKeysResult.error.code !== '42P01' ? 0 : (apiKeysResult.count || 0);
    const requests = requestsResult.error && requestsResult.error.code !== '42P01' ? 0 : (requestsResult.count || 0);
    const keyUsers = keyUsersResult.error && keyUsersResult.error.code !== '42P01' ? [] : (keyUsersResult.data || []);

    // Get unique user IDs
    const uniqueUserIds = new Set(keyUsers.map(k => k.user_id).filter(Boolean));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalMetrics: metrics,
          datasets,
          apiKeys,
          requests,
          researchers: uniqueUserIds.size
        }
      }
    });

  } catch (error) {
    console.error('Error in open data API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

