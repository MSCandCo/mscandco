import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Fetching wallet management statistics...');

    // Get all user wallets with balances
    const { data: wallets, error: walletsError } = await supabase
      .from('user_profiles')
      .select('id, wallet_balance, wallet_currency, role')
      .in('role', ['artist', 'label_admin'])
      .not('wallet_balance', 'is', null);

    if (walletsError) {
      console.error('❌ Error fetching wallets:', walletsError);
      return res.status(500).json({ error: 'Failed to fetch wallets' });
    }

    // Calculate total platform balance (convert to GBP if needed)
    const totalBalance = wallets.reduce((sum, w) => {
      const balance = parseFloat(w.wallet_balance) || 0;
      // TODO: Add currency conversion if needed
      return sum + balance;
    }, 0);

    // Get monthly transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: monthlyTx, error: monthlyTxError } = await supabase
      .from('wallet_transactions')
      .select('amount, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (monthlyTxError) {
      console.error('❌ Error fetching monthly transactions:', monthlyTxError);
    }

    const monthlyTransactions = monthlyTx?.length || 0;
    const monthlyVolume = monthlyTx?.reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount) || 0), 0) || 0;

    // Get subscription revenue this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { data: subTx, error: subTxError } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('type', 'subscription_payment')
      .gte('created_at', firstDayOfMonth.toISOString());

    const subscriptionRevenue = subTx?.reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount) || 0), 0) || 0;

    // Get active users (users with transactions in last 30 days)
    const { data: activeUsersTx } = await supabase
      .from('wallet_transactions')
      .select('user_id')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const uniqueActiveUsers = new Set(activeUsersTx?.map(tx => tx.user_id) || []);
    const activeUsers = uniqueActiveUsers.size;

    console.log('✅ Statistics calculated successfully');

    return res.status(200).json({
      success: true,
      stats: {
        total_balance: totalBalance,
        total_wallets: wallets.length,
        monthly_transactions: monthlyTransactions,
        monthly_volume: monthlyVolume,
        subscription_revenue: subscriptionRevenue,
        active_users: activeUsers
      }
    });

  } catch (error) {
    console.error('❌ Error in wallet stats API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requirePermission('*:*:*')(handler);
