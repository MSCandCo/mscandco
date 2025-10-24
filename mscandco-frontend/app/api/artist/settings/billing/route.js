import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user;

    // Get billing data from subscriptions table
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError);
    }

    // Get billing history from earnings_log
    const { data: billingHistory, error: historyError } = await supabase
      .from('earnings_log')
      .select('*')
      .eq('user_id', user.id)
      .in('earning_type', ['subscription_payment', 'subscription_renewal'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Error fetching billing history:', historyError);
    }

    const formattedHistory = (billingHistory || []).map(item => ({
      date: new Date(item.created_at).toLocaleDateString(),
      description: item.description || item.earning_type,
      amount: Math.abs(item.amount),
      status: item.status,
      currency: item.currency
    }));

    return NextResponse.json({
      success: true,
      data: {
        currentPlan: subscription ? {
          name: subscription.tier,
          amount: subscription.amount,
          billing: subscription.billing_cycle,
          status: subscription.status
        } : null,
        paymentMethod: null, // TODO: Implement payment method storage
        billingHistory: formattedHistory
      }
    });
  } catch (error) {
    console.error('Error in billing API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

