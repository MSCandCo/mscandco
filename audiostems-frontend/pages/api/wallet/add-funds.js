// Wallet Add Funds - COMPLETE REBUILD - REAL DATA ONLY
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware

    const { amount, currency = 'GBP' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (amount < 1) {
      return res.status(400).json({ error: 'Minimum funding amount is £1.00' });
    }

    if (amount > 1000) {
      return res.status(400).json({ error: 'Maximum funding amount is £1,000.00' });
    }

    console.log('💰 Adding funds to wallet:', { userId: user.id, amount, currency });

    // Get current wallet balance from wallet_transactions
    const { data: transactions, error: transError } = await supabase
      .from('wallet_transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    if (transError) {
      console.error('❌ Error loading wallet transactions:', transError);
      return res.status(500).json({ error: 'Failed to load wallet balance' });
    }

    // Calculate current balance from transactions
    const currentBalance = (transactions || []).reduce((balance, transaction) => {
      if (transaction.type === 'credit' || transaction.type === 'revenue') {
        return balance + parseFloat(transaction.amount);
      } else if (transaction.type === 'debit' || transaction.type === 'payout' || transaction.type === 'subscription') {
        return balance - parseFloat(transaction.amount);
      }
      return balance;
    }, 0);

    // Create new wallet transaction (credit)
    const { data: newTransaction, error: insertError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'credit',
        amount: parseFloat(amount),
        currency: currency,
        description: `Wallet top-up via Revolut - ${currency}${amount}`,
        reference_type: 'revolut_payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating wallet transaction:', insertError);
      return res.status(500).json({ error: 'Failed to process wallet transaction' });
    }

    const newBalance = currentBalance + parseFloat(amount);

    console.log('✅ Wallet funds added successfully:', {
      transactionId: newTransaction.id,
      oldBalance: currentBalance,
      newBalance: newBalance
    });

    return res.status(200).json({
      success: true,
      transaction: newTransaction,
      old_balance: currentBalance,
      new_balance: newBalance,
      amount_added: parseFloat(amount),
      currency: currency,
      message: `Successfully added ${currency === 'GBP' ? '£' : currency}${amount} to your wallet`
    });

  } catch (error) {
    console.error('❌ Add wallet funds error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Protect with wallet:update:own permission (for adding funds to wallet)
export default requirePermission('wallet:update:own')(handler);
