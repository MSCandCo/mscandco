import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET' && req.method !== 'PUT') {
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

    // Get user's role
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (req.method === 'POST') {
      // Create new change request
      const {
        releaseId,
        requestType,
        fieldName,
        currentValue,
        requestedValue,
        reason,
        urgencyLevel = 1
      } = req.body;

      // Validate required fields
      if (!releaseId || !fieldName || !reason) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user can create change requests for this release
      const { data: release } = await supabase
        .from('releases')
        .select('artist_id, label_admin_id, status')
        .eq('id', releaseId)
        .single();

      if (!release) {
        return res.status(404).json({ error: 'Release not found' });
      }

      const canCreateRequest = (
        release.artist_id === user.id ||
        release.label_admin_id === user.id ||
        ['company_admin', 'super_admin'].includes(userProfile.role)
      );

      if (!canCreateRequest) {
        return res.status(403).json({ error: 'Not authorized to create change requests for this release' });
      }

      // Only allow change requests for releases that are not editable
      if (!['in_review', 'completed', 'live'].includes(release.status)) {
        return res.status(400).json({ error: 'Change requests can only be made for releases in review, completed, or live' });
      }

      const changeRequestData = {
        release_id: releaseId,
        requested_by: user.id,
        request_type: requestType,
        field_name: fieldName,
        current_value: currentValue,
        requested_value: requestedValue,
        reason: reason,
        urgency_level: urgencyLevel,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newRequest, error: createError } = await supabase
        .from('change_requests')
        .insert(changeRequestData)
        .select()
        .single();

      if (createError) {
        return res.status(400).json({ error: createError.message });
      }

      // Update release pending change requests count
      await supabase
        .from('releases')
        .update({ 
          pending_change_requests: supabase.raw('pending_change_requests + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId);

      return res.status(201).json({
        message: 'Change request created successfully',
        changeRequest: newRequest
      });

    } else if (req.method === 'GET') {
      // Get change requests
      const { releaseId, status } = req.query;

      let query = supabase
        .from('change_requests')
        .select(`
          *,
          requestedBy:user_profiles!requested_by(first_name, last_name, display_name),
          reviewedBy:user_profiles!reviewed_by(first_name, last_name, display_name),
          release:releases(project_name, artist_name, status)
        `)
        .order('created_at', { ascending: false });

      if (releaseId) {
        query = query.eq('release_id', releaseId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      // Filter based on user role and permissions
      if (!['company_admin', 'super_admin', 'distribution_partner'].includes(userProfile.role)) {
        // Artists and label admins can only see their own requests
        query = query.eq('requested_by', user.id);
      }

      const { data: changeRequests, error: fetchError } = await query;

      if (fetchError) {
        return res.status(400).json({ error: fetchError.message });
      }

      return res.status(200).json({ changeRequests });

    } else if (req.method === 'PUT') {
      // Update change request (approve/reject)
      const { requestId, status, reviewNotes } = req.body;

      if (!requestId || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user can review change requests
      if (!['distribution_partner', 'company_admin', 'super_admin'].includes(userProfile.role)) {
        return res.status(403).json({ error: 'Not authorized to review change requests' });
      }

      // Get existing request
      const { data: existingRequest } = await supabase
        .from('change_requests')
        .select('id, release_id, status')
        .eq('id', requestId)
        .single();

      if (!existingRequest) {
        return res.status(404).json({ error: 'Change request not found' });
      }

      if (existingRequest.status !== 'pending') {
        return res.status(400).json({ error: 'Change request has already been reviewed' });
      }

      const updateData = {
        status: status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
        updated_at: new Date().toISOString()
      };

      const { data: updatedRequest, error: updateError } = await supabase
        .from('change_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      // Update release pending change requests count
      await supabase
        .from('releases')
        .update({ 
          pending_change_requests: supabase.raw('GREATEST(pending_change_requests - 1, 0)'),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRequest.release_id);

      // If approved, we might want to notify the artist or trigger additional workflow
      if (status === 'approved') {
        // Here you could add logic to automatically apply the change
        // or notify relevant parties
      }

      return res.status(200).json({
        message: `Change request ${status} successfully`,
        changeRequest: updatedRequest
      });
    }

  } catch (error) {
    console.error('Error in change requests API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
