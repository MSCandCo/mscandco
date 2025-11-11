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
    carbon_tracking_id,
    offset_provider,
    offset_amount_kg,
    offset_cost_amount,
    offset_project_name,
    offset_project_type,
    offset_project_location
  } = body;

  // Validate required fields
  if (!offset_amount_kg || !offset_provider) {
    return NextResponse.json(
      { error: 'Missing required fields: offset_amount_kg, offset_provider' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('carbon_offset_transactions')
    .insert([{
      user_id: user.id,
      carbon_tracking_id,
      offset_provider,
      offset_amount_kg,
      offset_cost_amount,
      offset_cost_currency: 'GBP',
      offset_project_name,
      offset_project_type,
      offset_project_location,
      transaction_status: 'completed',
      verification_standard: 'Gold Standard',
      transaction_date: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Update carbon tracking record if provided
  if (carbon_tracking_id) {
    const { data: trackingData } = await supabase
      .from('carbon_footprint_tracking')
      .select('offset_purchased_kg')
      .eq('id', carbon_tracking_id)
      .single();

    if (trackingData) {
      const newOffsetTotal = (trackingData.offset_purchased_kg || 0) + offset_amount_kg;

      await supabase
        .from('carbon_footprint_tracking')
        .update({
          offset_purchased_kg: newOffsetTotal,
          updated_at: new Date().toISOString()
        })
        .eq('id', carbon_tracking_id);
    }
  }

  return NextResponse.json({
    success: true,
    transaction: data,
    message: 'Carbon offset purchased successfully'
  });
}
