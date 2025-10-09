import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// req.user and req.userRole are automatically attached by middleware
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    artist_id,
    asset_id,
    earning_type,
    amount,
    currency = 'GBP',
    status = 'pending',
    payment_status = 'awaiting_payment',
    expected_payment_date,
    actual_payment_date,
    platform,
    territory,
    period_start,
    period_end,
    notes,
    created_by
  } = req.body;

  try {
    // Insert earnings entry
    const { data, error } = await supabase
      .from('earnings_entries')
      .insert({
        artist_id,
        asset_id,
        earning_type,
        amount,
        currency,
        status,
        payment_status,
        expected_payment_date,
        actual_payment_date,
        platform,
        territory,
        period_start,
        period_end,
        notes,
        created_by
      })
      .select()
      .single();

    if (error) throw error;

    // Ensure artist has a wallet
    await supabase
      .from('artist_wallet')
      .upsert({ artist_id }, { onConflict: 'artist_id' });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error adding earnings entry:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default requirePermission('earnings:edit:any')(handler);
