import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // For now, hardcode Henry Taylor's ID for testing
    const artist_id = '0a060de5-1c94-4060-a1c2-860224fc348d';

    console.log('Loading wallet data for artist:', artist_id);

    // Calculate wallet summary directly from earnings_log table
    const { data: allEarnings, error: earningsError } = await supabase
      .from('earnings_log')
      .select('*')
      .eq('artist_id', artist_id);

    if (earningsError) {
      console.error('Error loading earnings:', earningsError);
      return res.status(500).json({ error: 'Failed to load earnings data' });
    }

    // Calculate balances
    const walletSummary = {
      available_balance: allEarnings?.filter(e => e.status === 'paid').reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
      pending_balance: allEarnings?.filter(e => e.status === 'pending').reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
      held_balance: allEarnings?.filter(e => e.status === 'held').reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
      total_earned: allEarnings?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
      total_entries: allEarnings?.length || 0,
      last_updated: new Date().toISOString()
    };

    // Filter pending entries
    const pendingEntries = allEarnings?.filter(e => ['pending', 'processing'].includes(e.status)) || [];
    
    // Get recent history (all entries, latest first)
    const recentHistory = allEarnings?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20) || [];

    const wallet = {
      artist_id,
      available_balance: walletSummary?.available_balance || 0,
      pending_balance: walletSummary?.pending_balance || 0,
      held_balance: walletSummary?.held_balance || 0,
      total_earned: walletSummary?.total_earned || 0,
      currency: 'GBP',
      minimum_payout: 50,
      last_updated: walletSummary?.last_updated || new Date().toISOString()
    };

    console.log('Wallet summary loaded:', {
      available: wallet.available_balance,
      pending: wallet.pending_balance,
      total: wallet.total_earned,
      entriesCount: pendingEntries?.length || 0
    });

    return res.status(200).json({
      success: true,
      wallet,
      pending_entries: pendingEntries || [],
      recent_history: recentHistory || []
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return res.status(500).json({ error: error.message });
  }
}
