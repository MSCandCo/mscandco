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
    console.log('📥 Exporting wallet data...');

    // Get all wallets
    const { data: wallets, error: walletsError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, artist_name, display_name, label_name, role, wallet_balance, wallet_currency')
      .in('role', ['artist', 'label_admin'])
      .order('wallet_balance', { ascending: false, nullsFirst: false });

    if (walletsError) {
      throw walletsError;
    }

    // Get all transactions
    const { data: transactions, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (txError) {
      throw txError;
    }

    // Create CSV content
    let csv = 'User ID,Name,Email,Role,Balance,Currency,Total Transactions\n';

    // Count transactions per user
    const txCountMap = {};
    transactions?.forEach(tx => {
      txCountMap[tx.user_id] = (txCountMap[tx.user_id] || 0) + 1;
    });

    wallets.forEach(wallet => {
      const name = wallet.artist_name ||
                   wallet.label_name ||
                   wallet.display_name ||
                   `${wallet.first_name || ''} ${wallet.last_name || ''}`.trim();

      csv += `${wallet.id},"${name}","${wallet.email}",${wallet.role},${wallet.wallet_balance || 0},${wallet.wallet_currency || 'GBP'},${txCountMap[wallet.id] || 0}\n`;
    });

    // Add summary section
    csv += '\n\nTransactions Export\n';
    csv += 'Transaction ID,User Email,Type,Amount,Currency,Description,Status,Created At\n';

    transactions.forEach(tx => {
      const userWallet = wallets.find(w => w.id === tx.user_id);
      const userEmail = userWallet?.email || 'Unknown';

      csv += `${tx.id},"${userEmail}",${tx.type},${tx.amount},${tx.currency || 'GBP'},"${(tx.description || '').replace(/"/g, '""')}",${tx.status || 'completed'},${tx.created_at}\n`;
    });

    console.log('✅ Export generated successfully');

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=wallet-report-${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('❌ Error exporting wallet data:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requirePermission('*:*:*')(handler);
