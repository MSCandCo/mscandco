import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { access_level = 'free' } = body;

  // Generate unique API key
  const apiKey = `msc_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

  // Set rate limits based on access level
  const rateLimits = {
    free: { hourly: 100, monthly: 10000 },
    basic: { hourly: 500, monthly: 50000 },
    pro: { hourly: 2000, monthly: 200000 },
    enterprise: { hourly: 10000, monthly: 1000000 }
  };

  const limits = rateLimits[access_level] || rateLimits.free;

  const { data, error } = await supabase
    .from('open_data_api_keys')
    .insert([{
      user_id: user.id,
      api_key: apiKey,
      access_level,
      rate_limit_per_hour: limits.hourly,
      monthly_request_quota: limits.monthly,
      is_active: true
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    api_key: data,
    message: 'API key generated successfully'
  });
}

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('open_data_api_keys')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    api_keys: data,
    count: data.length
  });
}
