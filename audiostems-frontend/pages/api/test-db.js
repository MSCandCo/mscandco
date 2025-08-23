import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Get user from Supabase session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Test 1: Check if subscriptions table exists and has data
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);

    // Test 2: Check if wallet_transactions table exists
    const { data: walletTransactions, error: walletError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    // Test 3: Try to get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return res.status(200).json({
      user_id: user.id,
      user_email: user.email,
      tests: {
        subscriptions: {
          error: subError?.message || null,
          data: subscriptions,
          count: subscriptions?.length || 0
        },
        wallet_transactions: {
          error: walletError?.message || null,
          data: walletTransactions,
          count: walletTransactions?.length || 0
        },
        user_profiles: {
          error: profileError?.message || null,
          data: profile,
          exists: !!profile
        }
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return res.status(500).json({ 
      error: 'Database test failed',
      details: error.message 
    });
  }
}
