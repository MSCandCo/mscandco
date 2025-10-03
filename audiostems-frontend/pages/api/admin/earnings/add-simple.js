import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// req.user and req.userRole are automatically attached by middleware
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      artist_id,
      earning_type,
      amount,
      currency = 'GBP',
      platform,
      territory,
      status = 'pending',
      payment_date,
      period_start,
      period_end,
      notes
    } = req.body;

    // Validation
    if (!artist_id || !earning_type || !amount || !platform) {
      return res.status(400).json({ 
        error: 'Missing required fields: artist_id, earning_type, amount, platform' 
      });
    }

    console.log(`💰 Adding earnings entry: ${currency}${amount} ${earning_type} from ${platform} for artist ${artist_id}`);

    // Insert earnings entry into earnings_log table
    const { data: earningsEntry, error: earningsError } = await supabase
      .from('earnings_log')
      .insert({
        artist_id,
        earning_type,
        amount: parseFloat(amount),
        currency,
        platform,
        territory: territory || null,
        status,
        payment_date: payment_date || null,
        period_start: period_start || null,
        period_end: period_end || null,
        notes: notes || null,
        created_at: new Date().toISOString(),
        created_by: artist_id // For now, using artist_id as created_by
      })
      .select()
      .single();

    if (earningsError) {
      console.error('Error inserting earnings entry:', earningsError);
      return res.status(500).json({ 
        error: 'Failed to add earnings entry',
        details: earningsError 
      });
    }

    console.log('✅ Earnings entry added successfully:', earningsEntry.id);

    return res.status(200).json({
      success: true,
      message: 'Earnings entry added successfully',
      entry: earningsEntry
    });

  } catch (error) {
    console.error('Error in add earnings API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requirePermission('earnings:edit:any')(handler);

