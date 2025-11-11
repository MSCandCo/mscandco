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
  const {
    release_id,
    interpreter_id,
    service_type,
    requested_languages,
    deadline_date,
    budget_amount,
    special_requirements
  } = body;

  // Validate required fields
  if (!release_id || !service_type) {
    return NextResponse.json(
      { error: 'Missing required fields: release_id, service_type' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('accessibility_requests')
    .insert([{
      user_id: user.id,
      release_id,
      interpreter_id,
      service_type,
      requested_languages,
      deadline_date,
      budget_amount,
      budget_currency: 'GBP',
      special_requirements,
      request_status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    request: data,
    message: 'Professional service request submitted successfully'
  });
}

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('accessibility_requests')
    .select('*, sign_language_interpreters(*), releases(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    requests: data,
    count: data.length
  });
}
