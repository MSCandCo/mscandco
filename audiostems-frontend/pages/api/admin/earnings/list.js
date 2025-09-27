import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artist_id } = req.query;

    if (!artist_id) {
      return res.status(400).json({ error: 'artist_id parameter is required' });
    }

    console.log(`📊 Loading earnings list for artist: ${artist_id}`);

    // Fetch all earnings for the artist
    const { data: earnings, error: earningsError } = await supabase
      .from('earnings_log')
      .select('*')
      .eq('artist_id', artist_id)
      .order('created_at', { ascending: false });

    if (earningsError) {
      console.error('Error fetching earnings:', earningsError);
      return res.status(500).json({ 
        error: 'Failed to fetch earnings',
        details: earningsError 
      });
    }

    console.log(`✅ Found ${earnings.length} earnings entries for artist`);

    // Calculate summary statistics
    const summary = {
      total_entries: earnings.length,
      total_amount: earnings.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
      pending_amount: earnings.filter(e => e.status === 'pending').reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
      paid_amount: earnings.filter(e => e.status === 'paid').reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
      held_amount: earnings.filter(e => e.status === 'held').reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
      by_status: {
        pending: earnings.filter(e => e.status === 'pending').length,
        paid: earnings.filter(e => e.status === 'paid').length,
        held: earnings.filter(e => e.status === 'held').length,
        disputed: earnings.filter(e => e.status === 'disputed').length
      },
      by_platform: earnings.reduce((acc, entry) => {
        const platform = entry.platform || 'Unknown';
        acc[platform] = (acc[platform] || 0) + parseFloat(entry.amount || 0);
        return acc;
      }, {}),
      by_type: earnings.reduce((acc, entry) => {
        const type = entry.earning_type || 'unknown';
        acc[type] = (acc[type] || 0) + parseFloat(entry.amount || 0);
        return acc;
      }, {})
    };

    return res.status(200).json({
      success: true,
      earnings: earnings || [],
      summary
    });

  } catch (error) {
    console.error('Error in earnings list API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

