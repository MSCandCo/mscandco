import { createClient } from '@supabase/supabase-js';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Get authenticated user from session
    let user = null;

    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data: { user: tokenUser }, error } = await supabaseClient.auth.getUser(token);
      if (!error && tokenUser) {
        user = tokenUser;
      }
    }

    // Fall back to cookie-based session
    if (!user) {
      const supabaseSession = createPagesServerClient({ req, res });
      const { data: { session }, error } = await supabaseSession.auth.getSession();

      if (error || !session?.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      user = session.user;
    }

    const artist_id = user.id;

    console.log('Loading wallet data for artist:', artist_id);

    // Fetch earnings_log (single source of truth)
    const { data: allEarnings, error: earningsError } = await supabase
      .from('earnings_log')
      .select('*')
      .eq('artist_id', artist_id);

    if (earningsError) {
      console.error('Error loading earnings:', earningsError);
      return res.status(500).json({ error: 'Failed to load earnings data' });
    }

    // Calculate balances from earnings_log (includes splits, automated earnings, top-ups, and deductions)
    const activeEarnings = allEarnings?.filter(e => e.status !== 'cancelled') || [];
    
    // Available balance includes ALL paid entries (positive AND negative)
    const available_balance = activeEarnings
      ?.filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
    
    const pending_balance = activeEarnings
      ?.filter(e => e.status === 'pending' && e.amount > 0)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
    
    const held_balance = activeEarnings
      ?.filter(e => e.status === 'held' && e.amount > 0)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
    
    const total_earned = activeEarnings
      ?.filter(e => e.amount > 0)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

    // Filter pending entries (only positive amounts - actual earnings waiting to be paid, exclude cancelled)
    const pendingEntries = activeEarnings?.filter(e => ['pending', 'processing'].includes(e.status) && e.amount > 0) || [];
    
    // Get recent history (already filtered to exclude cancelled entries, latest first)
    const recentHistory = activeEarnings?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20) || [];

    const wallet = {
      artist_id,
      available_balance: available_balance,
      pending_balance: pending_balance,
      held_balance: held_balance,
      total_earned: total_earned,
      currency: 'GBP',
      minimum_payout: 50,
      last_updated: new Date().toISOString()
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
