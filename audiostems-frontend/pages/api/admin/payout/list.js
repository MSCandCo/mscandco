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
    console.log('📊 Loading all payout requests...');

    // Get all payout requests from earnings_log (our working table)
    const { data: payoutRequests, error: payoutError } = await supabase
      .from('earnings_log')
      .select(`
        id,
        artist_id,
        amount,
        currency,
        status,
        notes,
        platform,
        territory,
        created_at
      `)
      .eq('earning_type', 'payout_request')
      .order('created_at', { ascending: false });

    if (payoutError) {
      console.error('Error fetching payout requests:', payoutError);
      return res.status(500).json({ error: 'Failed to fetch payout requests', details: payoutError });
    }

    // Get artist names for each payout request
    const artistIds = [...new Set(payoutRequests.map(p => p.artist_id))];
    
    const { data: artists, error: artistError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, artist_name')
      .in('id', artistIds);

    if (artistError) {
      console.error('Error fetching artist details:', artistError);
      return res.status(500).json({ error: 'Failed to fetch artist details', details: artistError });
    }

    // Create artist lookup map
    const artistMap = {};
    artists.forEach(artist => {
      artistMap[artist.id] = artist;
    });

    // Enhance payout requests with artist info
    const enhancedPayouts = payoutRequests.map(payout => ({
      ...payout,
      amount: Math.abs(payout.amount), // Convert negative amount to positive for display
      artist_name: artistMap[payout.artist_id]?.artist_name || 
                   `${artistMap[payout.artist_id]?.first_name || ''} ${artistMap[payout.artist_id]?.last_name || ''}`.trim() || 
                   'Unknown Artist',
      artist_email: artistMap[payout.artist_id]?.email || 'Unknown Email',
      request_date: payout.created_at,
      last_updated: payout.created_at,
      payout_method: payout.platform || 'bank_transfer', // Use platform field for method
      bank_details: payout.notes ? extractBankDetails(payout.notes) : null
    }));

    // Calculate statistics
    const pending = enhancedPayouts.filter(p => p.status === 'pending');
    const approved = enhancedPayouts.filter(p => p.status === 'paid'); // In earnings_log, approved is 'paid'
    const rejected = enhancedPayouts.filter(p => p.status === 'rejected');

    const stats = {
      total_pending: pending.reduce((sum, p) => sum + p.amount, 0),
      approved_this_month: approved
        .filter(p => new Date(p.created_at).getMonth() === new Date().getMonth())
        .reduce((sum, p) => sum + p.amount, 0),
      requests_count: {
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
        total: enhancedPayouts.length
      }
    };

    console.log(`✅ Loaded ${enhancedPayouts.length} payout requests`);
    console.log(`📊 Stats: ${pending.length} pending, ${approved.length} approved, ${rejected.length} rejected`);

    return res.status(200).json({
      success: true,
      payout_requests: enhancedPayouts,
      statistics: stats
    });

  } catch (error) {
    console.error('Error in payout list API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Helper function to extract bank details from notes
function extractBankDetails(notes) {
  try {
    // Look for bank details in notes
    const bankMatch = notes.match(/Payout request for £[\d.]+ via (\w+)/);
    return bankMatch ? bankMatch[1] : 'bank_transfer';
  } catch (error) {
    return 'bank_transfer';
  }
}
