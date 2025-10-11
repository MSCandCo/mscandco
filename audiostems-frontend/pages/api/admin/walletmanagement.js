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
    const {
      role = 'all',
      search = '',
      page = 1,
      per_page = 20
    } = req.query;

    console.log('💼 Fetching user wallets...');

    // Build query
    let query = supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        artist_name,
        display_name,
        label_name,
        role,
        wallet_balance,
        wallet_currency,
        created_at
      `, { count: 'exact' });

    // Filter by role
    if (role === 'artist') {
      query = query.eq('role', 'artist');
    } else if (role === 'label_admin') {
      query = query.eq('role', 'label_admin');
    } else {
      // All external users (artists and label admins)
      query = query.in('role', ['artist', 'label_admin']);
    }

    // Search by name or email
    if (search) {
      query = query.or(`email.ilike.%${search}%,artist_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,display_name.ilike.%${search}%,label_name.ilike.%${search}%`);
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(per_page);
    query = query.range(offset, offset + parseInt(per_page) - 1);

    // Order by balance descending
    query = query.order('wallet_balance', { ascending: false, nullsFirst: false });

    const { data: wallets, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching wallets:', error);
      return res.status(500).json({
        error: 'Failed to fetch wallets',
        details: error.message
      });
    }

    // Get transaction counts for each wallet
    const walletIds = wallets.map(w => w.id);
    const { data: txCounts } = await supabase
      .from('wallet_transactions')
      .select('user_id')
      .in('user_id', walletIds);

    // Count transactions per user
    const txCountMap = {};
    txCounts?.forEach(tx => {
      txCountMap[tx.user_id] = (txCountMap[tx.user_id] || 0) + 1;
    });

    // Enrich wallet data
    const enrichedWallets = wallets.map(wallet => {
      const name = wallet.artist_name ||
                   wallet.label_name ||
                   wallet.display_name ||
                   `${wallet.first_name || ''} ${wallet.last_name || ''}`.trim() ||
                   wallet.email;

      return {
        id: wallet.id,
        name,
        email: wallet.email,
        role: wallet.role,
        balance: parseFloat(wallet.wallet_balance) || 0,
        currency: wallet.wallet_currency || 'GBP',
        transaction_count: txCountMap[wallet.id] || 0,
        created_at: wallet.created_at
      };
    });

    console.log(`✅ Found ${wallets.length} wallets`);

    return res.status(200).json({
      success: true,
      wallets: enrichedWallets,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: count,
        total_pages: Math.ceil(count / parseInt(per_page))
      }
    });

  } catch (error) {
    console.error('❌ Error in wallets API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requirePermission('*:*:*')(handler);
