/**
 * POST /api/admin/profile-requests/[requestId]/approve
 *
 * Approve a profile change request
 * Protected by: user:approve_changes:any
 */

import { requirePermission } from '@/lib/permissions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check permission
    const authorized = await requirePermission(req, res, 'user:approve_changes:any');
    if (!authorized) return;

    const { requestId } = req.query;
    const { notes } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
    }

    // Get the request
    const { data: request, error: fetchError } = await supabase
      .from('profile_change_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Request already ${request.status}`
      });
    }

    // Apply the changes to user_profiles
    const updates = {};
    const requestedValue = request.requested_value;

    if (requestedValue.first_name !== undefined) updates.first_name = requestedValue.first_name;
    if (requestedValue.last_name !== undefined) updates.last_name = requestedValue.last_name;
    if (requestedValue.email !== undefined) updates.email = requestedValue.email;
    if (requestedValue.artist_name !== undefined) updates.artist_name = requestedValue.artist_name;
    if (requestedValue.phone !== undefined) updates.phone = requestedValue.phone;
    if (requestedValue.bio !== undefined) updates.bio = requestedValue.bio;
    if (requestedValue.date_of_birth !== undefined) updates.date_of_birth = requestedValue.date_of_birth;
    if (requestedValue.nationality !== undefined) updates.nationality = requestedValue.nationality;
    if (requestedValue.country !== undefined) updates.country = requestedValue.country;
    if (requestedValue.city !== undefined) updates.city = requestedValue.city;

    updates.updated_at = new Date().toISOString();

    // Update user profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', request.user_id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to apply changes',
        details: updateError.message
      });
    }

    // Mark request as approved
    const { error: approveError } = await supabase
      .from('profile_change_requests')
      .update({
        status: 'approved',
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (approveError) {
      console.error('Error approving request:', approveError);
      return res.status(500).json({
        success: false,
        error: 'Failed to approve request',
        details: approveError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Request approved successfully'
    });

  } catch (error) {
    console.error('Approve request error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
