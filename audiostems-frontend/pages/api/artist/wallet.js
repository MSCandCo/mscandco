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

    // Get or create wallet
    let { data: wallet, error } = await supabase
      .from('artist_wallet')
      .select('*')
      .eq('artist_id', artist_id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create wallet if doesn't exist
      const { data: newWallet } = await supabase
        .from('artist_wallet')
        .insert({ artist_id })
        .select()
        .single();
      wallet = newWallet;
    }

    // Get pending entries breakdown
    const { data: pendingEntries } = await supabase
      .from('earnings_entries')
      .select('*, releases(title)')
      .eq('artist_id', artist_id)
      .in('status', ['pending', 'processing'])
      .order('expected_payment_date', { ascending: true });

    return res.status(200).json({
      success: true,
      wallet,
      pending_entries: pendingEntries || []
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default requireAuth(handler);
