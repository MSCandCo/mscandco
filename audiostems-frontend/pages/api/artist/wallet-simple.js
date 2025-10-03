import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // req.user and req.userRole are automatically attached by middleware
    const artist_id = req.user.id;

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
    // Calculate wallet balances (exclude cancelled entries)
    const activeEarnings = allEarnings?.filter(e => e.status !== 'cancelled') || [];
    
    const walletSummary = {
      available_balance: activeEarnings?.filter(e => e.status === 'paid' && e.amount > 0).reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
      pending_balance: activeEarnings?.filter(e => e.status === 'pending' && e.amount > 0).reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
      held_balance: activeEarnings?.filter(e => e.status === 'held' && e.amount > 0).reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
      total_earned: activeEarnings?.filter(e => e.amount > 0).reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
      total_entries: activeEarnings?.length || 0,
      last_updated: new Date().toISOString()
    };

    // Filter pending entries (only positive amounts - actual earnings waiting to be paid, exclude cancelled)
    const pendingEntries = activeEarnings?.filter(e => ['pending', 'processing'].includes(e.status) && e.amount > 0) || [];
    
    // Get recent history (already filtered to exclude cancelled entries, latest first)
    const recentHistory = activeEarnings?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20) || [];

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

export default requireAuth(handler);
