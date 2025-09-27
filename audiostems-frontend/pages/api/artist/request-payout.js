import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      artist_id,
      amount,
      payout_method = 'bank_transfer',
      bank_details = {},
      notes
    } = req.body;

    // Validation
    if (!artist_id || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: artist_id, amount' 
      });
    }

    const payoutAmount = parseFloat(amount);
    const minimumPayout = 50; // £50 minimum

    if (payoutAmount < minimumPayout) {
      return res.status(400).json({ 
        error: `Minimum payout amount is £${minimumPayout}` 
      });
    }

    console.log(`💰 Processing payout request: £${payoutAmount} for artist ${artist_id}`);

    // Check artist's available balance
    const { data: earnings, error: earningsError } = await supabase
      .from('earnings_log')
      .select('amount, status')
      .eq('artist_id', artist_id);

    if (earningsError) {
      console.error('Error checking balance:', earningsError);
      return res.status(500).json({ 
        error: 'Failed to check available balance',
        details: earningsError 
      });
    }

    const availableBalance = earnings
      .filter(entry => entry.status === 'paid')
      .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

    if (payoutAmount > availableBalance) {
      return res.status(400).json({ 
        error: `Insufficient balance. Available: £${availableBalance.toFixed(2)}`,
        available_balance: availableBalance
      });
    }

    // Create payout history table entry if it doesn't exist
    const { error: tableError } = await supabase.rpc('create_payout_history_if_not_exists');
    
    // Insert payout request (even if table creation failed, try to insert)
    const { data: payoutRequest, error: payoutError } = await supabase
      .from('payout_history')
      .insert({
        artist_id,
        amount: payoutAmount,
        currency: 'GBP',
        payout_method,
        bank_details: bank_details || {},
        status: 'pending',
        requested_at: new Date().toISOString(),
        notes: notes || null
      })
      .select()
      .single();

    // If table doesn't exist, create a simple log entry in earnings_log for now
    if (payoutError) {
      console.log('Payout history table not found, creating earnings log entry for tracking...');
      
      const { data: logEntry, error: logError } = await supabase
        .from('earnings_log')
        .insert({
          artist_id,
          earning_type: 'payout_request',
          amount: -payoutAmount, // Negative to indicate outgoing
          currency: 'GBP',
          platform: 'Payout Request',
          territory: 'System',
          status: 'pending',
          notes: `Payout request for £${payoutAmount} via ${payout_method}. ${notes || ''}`.trim(),
          created_at: new Date().toISOString(),
          created_by: artist_id
        })
        .select()
        .single();

      if (logError) {
        console.error('Error creating payout log entry:', logError);
        return res.status(500).json({ 
          error: 'Failed to create payout request',
          details: logError 
        });
      }

      console.log('✅ Payout request logged successfully:', logEntry.id);

      return res.status(200).json({
        success: true,
        message: 'Payout request submitted successfully',
        request: {
          id: logEntry.id,
          amount: payoutAmount,
          status: 'pending',
          requested_at: logEntry.created_at,
          method: payout_method
        }
      });
    }

    console.log('✅ Payout request created successfully:', payoutRequest.id);

    // TODO: Send notification to admin (email, in-app notification, etc.)
    // For now, we'll log it
    console.log(`📧 ADMIN NOTIFICATION: New payout request from artist ${artist_id} for £${payoutAmount}`);

    return res.status(200).json({
      success: true,
      message: 'Payout request submitted successfully',
      request: payoutRequest
    });

  } catch (error) {
    console.error('Error in payout request API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}