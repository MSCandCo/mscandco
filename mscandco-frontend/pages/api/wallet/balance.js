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
    // req.user and req.userRole are automatically attached by middleware
    const userId = req.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ 
        error: 'Failed to fetch wallet balance',
        details: profileError.message 
      });
    }

    const walletBalance = profile?.wallet_balance || 0;

    const { data: transactions, error: transactionsError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (transactionsError) {
      console.error('Error fetching wallet transactions:', transactionsError);
    }

    console.log('Wallet balance fetched:', {
      userEmail,
      balance: walletBalance,
      transactionCount: transactions?.length || 0
    });

    res.json({
      success: true,
      walletBalance: parseFloat(walletBalance),
      currency: 'GBP',
      transactions: (transactions || []).map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: parseFloat(tx.amount),
        description: tx.description,
        orderReference: tx.order_reference,
        createdAt: tx.created_at
      }))
    });

  } catch (error) {
    console.error('Wallet balance fetch failed:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet balance', 
      details: error.message 
    });
  }
}

// Protect with earnings:read:own permission
export default requirePermission('earnings:view:own')(handler);
