import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user from session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's role and wallet status
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, wallet_balance, wallet_enabled, negative_balance_allowed, wallet_credit_limit')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (req.method === 'GET') {
      // Get wallet transactions
      const { limit = 50, offset = 0, type } = req.query;

      let query = supabase
        .from('wallet_transactions')
        .select(`
          *,
          release:releases(project_name, artist_name, release_title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type) {
        query = query.eq('transaction_type', type);
      }

      const { data: transactions, error: fetchError } = await query;

      if (fetchError) {
        return res.status(400).json({ error: fetchError.message });
      }

      // Get current wallet balance
      const currentBalance = userProfile.wallet_balance || 0;

      return res.status(200).json({
        transactions,
        currentBalance,
        walletEnabled: userProfile.wallet_enabled,
        negativeBalanceAllowed: userProfile.negative_balance_allowed,
        creditLimit: userProfile.wallet_credit_limit || 0
      });

    } else if (req.method === 'POST') {
      // Create wallet transaction
      const {
        transactionType,
        amount,
        sourceType,
        sourceReferenceId,
        releaseId,
        revenuePeriodStart,
        revenuePeriodEnd,
        platform,
        notes
      } = req.body;

      // Validate required fields
      if (!transactionType || !amount) {
        return res.status(400).json({ error: 'Missing required fields: transactionType and amount' });
      }

      // Check if user can create transactions (usually done by system or admins)
      if (!['company_admin', 'super_admin', 'distribution_partner'].includes(userProfile.role)) {
        return res.status(403).json({ error: 'Not authorized to create wallet transactions' });
      }

      const currentBalance = userProfile.wallet_balance || 0;
      const newBalance = currentBalance + parseFloat(amount);

      // Check if transaction would exceed negative balance limits
      if (newBalance < 0 && !userProfile.negative_balance_allowed) {
        return res.status(400).json({ error: 'Transaction would result in negative balance' });
      }

      if (newBalance < 0 && Math.abs(newBalance) > (userProfile.wallet_credit_limit || 0)) {
        return res.status(400).json({ error: 'Transaction would exceed credit limit' });
      }

      // Create transaction record
      const transactionData = {
        user_id: user.id,
        transaction_type: transactionType,
        amount: parseFloat(amount),
        balance_before: currentBalance,
        balance_after: newBalance,
        source_type: sourceType,
        source_reference_id: sourceReferenceId,
        release_id: releaseId,
        revenue_period_start: revenuePeriodStart,
        revenue_period_end: revenuePeriodEnd,
        platform: platform,
        notes: notes,
        processed: true,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const { data: newTransaction, error: createError } = await supabase
        .from('wallet_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (createError) {
        return res.status(400).json({ error: createError.message });
      }

      // Update user's wallet balance
      const { error: balanceUpdateError } = await supabase
        .from('user_profiles')
        .update({ 
          wallet_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (balanceUpdateError) {
        // Rollback transaction if balance update fails
        await supabase
          .from('wallet_transactions')
          .delete()
          .eq('id', newTransaction.id);
        
        return res.status(400).json({ error: 'Failed to update wallet balance' });
      }

      return res.status(201).json({
        message: 'Wallet transaction created successfully',
        transaction: newTransaction,
        newBalance: newBalance
      });
    }

  } catch (error) {
    console.error('Error in wallet transactions API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
