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
      user_id,
      type = 'all',
      page = 1,
      per_page = 50
    } = req.query;

    console.log('💳 Fetching wallet transactions...');

    // Build query
    let query = supabase
      .from('wallet_transactions')
      .select(`
        *,
        user:user_id (
          id,
          email,
          first_name,
          last_name,
          artist_name,
          display_name,
          label_name,
          role
        )
      `, { count: 'exact' });

    // Filter by user if specified
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    // Filter by transaction type
    if (type !== 'all') {
      if (type === 'credit') {
        query = query.in('type', ['credit', 'topup', 'earning', 'refund']);
      } else if (type === 'debit') {
        query = query.in('type', ['debit', 'subscription_payment', 'payout', 'fee']);
      } else if (type === 'subscription') {
        query = query.eq('type', 'subscription_payment');
      } else if (type === 'topup') {
        query = query.eq('type', 'topup');
      } else if (type === 'earning') {
        query = query.eq('type', 'earning');
      }
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(per_page);
    query = query.range(offset, offset + parseInt(per_page) - 1);

    // Order by most recent first
    query = query.order('created_at', { ascending: false });

    const { data: transactions, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching transactions:', error);
      return res.status(500).json({
        error: 'Failed to fetch transactions',
        details: error.message
      });
    }

    // Enrich transaction data
    const enrichedTransactions = transactions.map(tx => {
      const userName = tx.user?.artist_name ||
                       tx.user?.label_name ||
                       tx.user?.display_name ||
                       `${tx.user?.first_name || ''} ${tx.user?.last_name || ''}`.trim() ||
                       'Unknown';

      return {
        id: tx.id,
        user_id: tx.user_id,
        user_name: userName,
        user_email: tx.user?.email || 'Unknown',
        user_role: tx.user?.role || 'Unknown',
        type: tx.type,
        amount: parseFloat(tx.amount) || 0,
        currency: tx.currency || 'GBP',
        description: tx.description,
        reference_id: tx.reference_id,
        reference_type: tx.reference_type,
        status: tx.status || 'completed',
        created_at: tx.created_at,
        processed_at: tx.processed_at
      };
    });

    console.log(`✅ Found ${transactions.length} transactions`);

    return res.status(200).json({
      success: true,
      transactions: enrichedTransactions,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: count,
        total_pages: Math.ceil(count / parseInt(per_page))
      }
    });

  } catch (error) {
    console.error('❌ Error in transactions API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requirePermission('*:*:*')(handler);
