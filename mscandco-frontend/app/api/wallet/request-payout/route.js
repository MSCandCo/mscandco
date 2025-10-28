import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/wallet/request-payout
 * Request a payout from wallet balance
 * 
 * IMPORTANT: This does NOT automatically withdraw money!
 * It creates a payout REQUEST that must be manually processed by admin.
 */
export async function POST(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, bank_details, notes } = await request.json();

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be greater than 0.' },
        { status: 400 }
      );
    }

    if (!bank_details || !bank_details.account_name || !bank_details.account_number || !bank_details.sort_code) {
      return NextResponse.json(
        { error: 'Bank details required: account_name, account_number, sort_code' },
        { status: 400 }
      );
    }

    // Check current balance
    const { data: earnings } = await supabase
      .from('earnings_log')
      .select('amount, status')
      .eq('artist_id', user.id)
      .eq('status', 'paid');

    const currentBalance = earnings?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

    if (currentBalance < amount) {
      return NextResponse.json({
        error: 'Insufficient balance',
        available: currentBalance,
        requested: amount,
        shortfall: amount - currentBalance
      }, { status: 400 });
    }

    // Create payout request (NOT automatic withdrawal!)
    const { data: payoutRequest, error: payoutError } = await supabase
      .from('payout_requests')
      .insert({
        user_id: user.id,
        amount: amount,
        currency: 'GBP',
        bank_details: bank_details,
        status: 'pending',
        requested_at: new Date().toISOString(),
        notes: notes || null,
      })
      .select()
      .single();

    if (payoutError) {
      console.error('Error creating payout request:', payoutError);
      return NextResponse.json(
        { error: 'Failed to create payout request', details: payoutError.message },
        { status: 500 }
      );
    }

    // Create a notification for admin
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'payout_requested',
        title: 'Payout Request Submitted',
        message: `Your payout request for £${amount.toFixed(2)} has been submitted and is pending approval.`,
        link: '/artist/earnings',
        read: false,
      });

    return NextResponse.json({
      success: true,
      message: 'Payout request submitted successfully. It will be processed within 3-5 business days.',
      payout_request: {
        id: payoutRequest.id,
        amount: payoutRequest.amount,
        status: payoutRequest.status,
        requested_at: payoutRequest.requested_at,
      },
    });

  } catch (error) {
    console.error('Payout request error:', error);
    return NextResponse.json(
      { error: 'Failed to process payout request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet/request-payout
 * Get user's payout requests
 */
export async function GET(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: payoutRequests, error } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching payout requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payout requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payout_requests: payoutRequests || [],
    });

  } catch (error) {
    console.error('Fetch payout requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout requests' },
      { status: 500 }
    );
  }
}

