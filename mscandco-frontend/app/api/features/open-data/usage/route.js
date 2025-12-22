import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's API keys
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!apiKeys || apiKeys.length === 0) {
      // Return empty stats if no API keys
      return NextResponse.json({
        stats: {
          requests_this_month: 0,
          remaining_requests: 10000,
          successful_requests: 0,
          total_requests: 0,
          avg_response_time: 0,
          daily_usage: [],
          top_endpoints: []
        }
      });
    }

    const keyIds = apiKeys.map(k => k.id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get usage data from database
    const { data: usageData, error } = await supabase
      .from('api_usage_logs')
      .select('*')
      .in('api_key_id', keyIds)
      .gte('created_at', startOfMonth.toISOString())
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching usage:', error);
      // Return empty stats on error
      return NextResponse.json({
        stats: {
          requests_this_month: 0,
          remaining_requests: 10000,
          successful_requests: 0,
          total_requests: 0,
          avg_response_time: 0,
          daily_usage: [],
          top_endpoints: []
        }
      });
    }

    const usage = usageData || [];
    const totalRequests = usage.length;
    const successfulRequests = usage.filter(r => r.status_code >= 200 && r.status_code < 300).length;
    
    // Calculate average response time
    const avgResponseTime = usage.length > 0
      ? Math.round(usage.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / usage.length)
      : 0;

    // Get user's tier to calculate remaining requests
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('open_data_tier')
      .eq('id', user.id)
      .single();

    const tier = profile?.open_data_tier || 'free';
    const tierLimits = {
      free: 10000,
      research: 100000,
      commercial: 1000000
    };
    const monthlyLimit = tierLimits[tier] || 10000;
    const remainingRequests = Math.max(0, monthlyLimit - totalRequests);

    // Group by date for daily usage chart
    const dailyUsageMap = {};
    usage.forEach(record => {
      const date = new Date(record.created_at).toISOString().split('T')[0];
      if (!dailyUsageMap[date]) {
        dailyUsageMap[date] = 0;
      }
      dailyUsageMap[date]++;
    });

    const dailyUsage = Object.entries(dailyUsageMap)
      .map(([date, requests]) => ({ date, requests }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get top endpoints
    const endpointMap = {};
    usage.forEach(record => {
      const endpoint = record.endpoint_path || 'unknown';
      if (!endpointMap[endpoint]) {
        endpointMap[endpoint] = 0;
      }
      endpointMap[endpoint]++;
    });

    const topEndpoints = Object.entries(endpointMap)
      .map(([path, requests]) => ({ path, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        requests_this_month: totalRequests,
        remaining_requests: remainingRequests,
        successful_requests: successfulRequests,
        total_requests: totalRequests,
        avg_response_time: avgResponseTime,
        daily_usage,
        top_endpoints
      }
    });
  } catch (error) {
    console.error('Error in usage stats:', error);
    return NextResponse.json({
      stats: {
        requests_this_month: 0,
        remaining_requests: 10000,
        successful_requests: 0,
        total_requests: 0,
        avg_response_time: 0,
        daily_usage: [],
        top_endpoints: []
      }
    });
  }
}

