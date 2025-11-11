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
    verification_id,
    release_id,
    original_work_title,
    original_artist,
    clearance_type,
    license_holder,
    license_contact_email,
    license_agreement_url,
    percentage_used,
    notes
  } = body;

  // Validate required fields
  if (!release_id || !original_work_title || !clearance_type) {
    return NextResponse.json(
      { error: 'Missing required fields: release_id, original_work_title, clearance_type' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('copyright_clearances')
    .insert([{
      user_id: user.id,
      verification_id,
      release_id,
      original_work_title,
      original_artist,
      clearance_type,
      license_holder,
      license_contact_email,
      license_agreement_url,
      percentage_used,
      notes,
      clearance_status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    clearance: data,
    message: 'Clearance submitted successfully'
  });
}
