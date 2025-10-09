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
    const { payout_id, action, notes } = req.body; // action: 'approve' or 'reject'

    if (!payout_id || !action) {
      return res.status(400).json({ error: 'Missing required fields: payout_id, action' });
    }

    console.log(`💰 Processing payout ${action} for ID: ${payout_id}`);

    if (action === 'approve') {
      // Update payout request status in earnings_log (our current working table)
      const { error: payoutUpdateError } = await supabase
        .from('earnings_log')
        .update({ 
          status: 'paid',
          notes: `APPROVED: ${new Date().toISOString()} | Admin approved payout request | ${notes || ''}`.trim()
        })
        .eq('id', payout_id)
        .eq('earning_type', 'payout_request');

      if (payoutUpdateError) {
        console.error('Error updating payout status:', payoutUpdateError);
        return res.status(500).json({ error: 'Failed to update payout status', details: payoutUpdateError });
      }

      // Get payout details
      const { data: payout, error: payoutError } = await supabase
        .from('earnings_log')
        .select('artist_id, amount, currency, notes')
        .eq('id', payout_id)
        .eq('earning_type', 'payout_request')
        .single();

      if (payoutError || !payout) {
        console.error('Error fetching payout details:', payoutError);
        return res.status(404).json({ error: 'Payout not found', details: payoutError });
      }

      // For the working system, the wallet recalculation is automatic via our existing logic
      // The available balance will be reduced by this approval automatically

      console.log(`✅ Payout ${payout_id} approved successfully`);
      console.log(`💷 Amount: £${Math.abs(payout.amount)} ${payout.currency}`);
      console.log(`👤 Artist: ${payout.artist_id}`);

      return res.status(200).json({
        success: true,
        message: 'Payout approved successfully',
        payout: {
          id: payout_id,
          amount: Math.abs(payout.amount),
          currency: payout.currency,
          artist_id: payout.artist_id,
          status: 'approved'
        }
      });
    }

    if (action === 'reject') {
      const { error: rejectError } = await supabase
        .from('earnings_log')
        .update({ 
          status: 'rejected',
          notes: `REJECTED: ${new Date().toISOString()} | Reason: ${notes || 'No reason provided'}`
        })
        .eq('id', payout_id)
        .eq('earning_type', 'payout_request');

      if (rejectError) {
        console.error('Error rejecting payout:', rejectError);
        return res.status(500).json({ error: 'Failed to reject payout', details: rejectError });
      }

      console.log(`❌ Payout ${payout_id} rejected: ${notes || 'No reason provided'}`);

      return res.status(200).json({
        success: true,
        message: 'Payout rejected successfully',
        payout: {
          id: payout_id,
          status: 'rejected',
          reason: notes || 'No reason provided'
        }
      });
    }

    return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });

  } catch (error) {
    console.error('Error in payout approval API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requirePermission('earnings:edit:any')(handler);
