import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    let userInfo;
    try {
      userInfo = jwt.decode(token);
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = userInfo?.sub;
    const userEmail = userInfo?.email?.toLowerCase() || '';

    if (!userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

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
