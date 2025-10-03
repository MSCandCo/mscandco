// LABEL ADMIN EARNINGS API
// Shows earnings from affiliated artists
import { createClient } from '@supabase/supabase-js';
import { requireRole } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware
    const labelAdminId = req.user.id;

    console.log('💰 Fetching label admin earnings:', labelAdminId);

    // Get all affiliated artists and their shared earnings
    const { data: sharedEarnings, error } = await supabase
      .from('shared_earnings')
      .select(`
        id,
        artist_amount,
        label_amount,
        total_amount,
        platform,
        earning_type,
        currency,
        created_at,
        affiliation:label_artist_affiliations!shared_earnings_affiliation_id_fkey (
          id,
          label_percentage,
          artist:user_profiles!label_artist_affiliations_artist_id_fkey (
            id,
            artist_name,
            first_name,
            last_name,
            email
          )
        ),
        original_earning:earnings_log!shared_earnings_original_earning_id_fkey (
          id,
          amount,
          platform,
          earning_type,
          date_earned
        )
      `)
      .eq('affiliation.label_admin_id', labelAdminId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching shared earnings:', error);
      return res.status(500).json({ error: 'Failed to fetch earnings' });
    }

    // Calculate totals
    const totalLabelEarnings = sharedEarnings.reduce((sum, earning) => sum + (earning.label_amount || 0), 0);
    const totalArtistEarnings = sharedEarnings.reduce((sum, earning) => sum + (earning.artist_amount || 0), 0);
    const totalEarnings = sharedEarnings.reduce((sum, earning) => sum + (earning.total_amount || 0), 0);

    // Group by artist
    const earningsByArtist = sharedEarnings.reduce((acc, earning) => {
      const artistName = earning.affiliation?.artist?.artist_name || 
                        `${earning.affiliation?.artist?.first_name} ${earning.affiliation?.artist?.last_name}` ||
                        'Unknown Artist';
      
      if (!acc[artistName]) {
        acc[artistName] = {
          artistId: earning.affiliation?.artist?.id,
          artistName,
          artistEmail: earning.affiliation?.artist?.email,
          totalEarnings: 0,
          labelShare: 0,
          percentage: earning.affiliation?.label_percentage || 0,
          entries: []
        };
      }
      
      acc[artistName].totalEarnings += earning.total_amount || 0;
      acc[artistName].labelShare += earning.label_amount || 0;
      acc[artistName].entries.push(earning);
      
      return acc;
    }, {});

    console.log(`✅ Label admin earnings loaded: £${totalLabelEarnings.toFixed(2)} from ${Object.keys(earningsByArtist).length} artists`);

    return res.json({
      success: true,
      summary: {
        totalLabelEarnings,
        totalArtistEarnings,
        totalEarnings,
        artistCount: Object.keys(earningsByArtist).length,
        entryCount: sharedEarnings.length
      },
      earningsByArtist,
      recentEarnings: sharedEarnings.slice(0, 10) // Last 10 entries
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireRole('label_admin')(handler);
