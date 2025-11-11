import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all credit transactions
    const { data: transactions, error } = await supabase
      .from('artwork_credits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate total credits
    const totalCredits = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

    // Get user subscription tier
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    // Monthly credit allocations
    const monthlyCredits = {
      free: 1,
      pro: 10,
      mpp_partner: 50,
      investment_partner: -1, // unlimited
    };

    const monthlyAllocation = monthlyCredits[profile?.subscription_tier || 'free'];

    return NextResponse.json({
      credits_available: totalCredits,
      transactions,
      monthly_allocation: monthlyAllocation === -1 ? 'unlimited' : monthlyAllocation,
      subscription_tier: profile?.subscription_tier || 'free',
    });

  } catch (error) {
    console.error('Get credits error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, source } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Add credits (for purchases, bonuses, etc.)
    const { data, error } = await supabase
      .from('artwork_credits')
      .insert({
        user_id: user.id,
        credits: amount, // This will be calculated from sum
        source: source || 'purchased',
        amount: amount,
        description: `Added ${amount} credits via ${source || 'purchase'}`,
      })
      .select()
      .single();

    if (error) throw error;

    // Get new total
    const { data: allCredits } = await supabase
      .from('artwork_credits')
      .select('amount')
      .eq('user_id', user.id);

    const totalCredits = allCredits?.reduce((sum, c) => sum + c.amount, 0) || 0;

    return NextResponse.json({
      success: true,
      credits_added: amount,
      credits_total: totalCredits,
    });

  } catch (error) {
    console.error('Add credits error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
