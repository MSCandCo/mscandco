import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const api_key_id = searchParams.get('api_key_id');
  const period = searchParams.get('period') || '30days';

  // Calculate date range
  const now = new Date();
  const startDate = new Date();

  if (period === '24hours') {
    startDate.setHours(startDate.getHours() - 24);
  } else if (period === '7days') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === '30days') {
    startDate.setDate(startDate.getDate() - 30);
  } else {
    startDate.setDate(startDate.getDate() - 30);
  }

  let query = supabase
    .from('api_usage_tracking')
    .select('*')
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });

  if (api_key_id) {
    query = query.eq('api_key_id', api_key_id);
  } else {
    // Get all user's API keys
    const { data: apiKeys } = await supabase
      .from('open_data_api_keys')
      .select('id')
      .eq('user_id', user.id);

    if (apiKeys && apiKeys.length > 0) {
      const keyIds = apiKeys.map(k => k.id);
      query = query.in('api_key_id', keyIds);
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Calculate summary statistics
  const totalRequests = data.length;
  const successfulRequests = data.filter(r => r.response_status_code === 200).length;
  const failedRequests = totalRequests - successfulRequests;
  const avgResponseTime = data.reduce((acc, r) => acc + (r.response_time_ms || 0), 0) / (totalRequests || 1);

  // Group by endpoint
  const endpointStats = data.reduce((acc, record) => {
    const endpoint = record.endpoint_path || 'unknown';
    if (!acc[endpoint]) {
      acc[endpoint] = { count: 0, errors: 0 };
    }
    acc[endpoint].count++;
    if (record.response_status_code !== 200) {
      acc[endpoint].errors++;
    }
    return acc;
  }, {});

  return NextResponse.json({
    success: true,
    summary: {
      total_requests: totalRequests,
      successful_requests: successfulRequests,
      failed_requests: failedRequests,
      avg_response_time_ms: Math.round(avgResponseTime),
      period
    },
    endpoint_stats: endpointStats,
    recent_requests: data.slice(0, 50)
  });
}
