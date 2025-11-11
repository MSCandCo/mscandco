import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { clearance_status, admin_notes } = body;

  if (!clearance_status) {
    return NextResponse.json(
      { error: 'Missing required field: clearance_status' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('copyright_clearances')
    .update({
      clearance_status,
      admin_notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    clearance: data,
    message: 'Clearance updated successfully'
  });
}
