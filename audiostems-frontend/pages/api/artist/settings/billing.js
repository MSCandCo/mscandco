import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Get billing data from subscriptions table
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Subscription error:', subError);
      }

      // Get wallet transactions for billing history
      const { data: transactions, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'subscription')
        .order('created_at', { ascending: false })
        .limit(10);

      if (txError) {
        console.error('Transaction error:', txError);
      }

      const billingHistory = (transactions || []).map(tx => ({
        date: new Date(tx.created_at).toLocaleDateString(),
        description: tx.description,
        amount: Math.abs(parseFloat(tx.amount)),
        status: tx.status === 'completed' ? 'paid' : tx.status
      }));

      return res.status(200).json({
        success: true,
        data: {
          currentPlan: subscription ? {
            name: subscription.tier.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            amount: parseFloat(subscription.amount),
            billing: subscription.billing_cycle
          } : null,
          paymentMethod: null, // TODO: Implement payment method storage
          billingHistory
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in billing API:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
