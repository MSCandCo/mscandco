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
    dataset_id,
    researcher_name,
    institution_name,
    research_purpose,
    intended_use,
    ethics_approval_url
  } = body;

  // Validate required fields
  if (!dataset_id || !researcher_name || !institution_name || !research_purpose) {
    return NextResponse.json(
      { error: 'Missing required fields: dataset_id, researcher_name, institution_name, research_purpose' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('dataset_access_requests')
    .insert([{
      user_id: user.id,
      dataset_id,
      researcher_name,
      institution_name,
      research_purpose,
      intended_use,
      ethics_approval_url,
      request_status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    access_request: data,
    message: 'Dataset access request submitted successfully'
  });
}

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('dataset_access_requests')
    .select('*, research_datasets(dataset_name)')
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
