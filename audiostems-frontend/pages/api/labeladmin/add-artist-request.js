import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware

    const { firstName, lastName, stageName, labelRoyaltyPercent } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !stageName || !labelRoyaltyPercent) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate royalty percentage
    const royaltyPercent = parseFloat(labelRoyaltyPercent);
    if (isNaN(royaltyPercent) || royaltyPercent < 0 || royaltyPercent > 100) {
      return res.status(400).json({ error: 'Label royalty percentage must be between 0 and 100' });
    }

    // Get label admin's profile to include label information
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('company_name, email')
      .eq('id', req.user.id)
      .single();

    // Create the artist request
    const { data, error } = await supabase
      .from('artist_requests')
      .insert([
        {
          requested_by_user_id: req.user.id,
          requested_by_email: req.user.email,
          label_name: profileData?.company_name || 'Unknown Label',
          artist_first_name: firstName.trim(),
          artist_last_name: lastName.trim(),
          artist_stage_name: stageName.trim(),
          label_royalty_percent: royaltyPercent,
          status: 'pending',
          request_type: 'add_artist',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error creating artist request:', error);
      return res.status(500).json({ error: 'Failed to create artist request' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Artist request submitted successfully',
      request_id: data[0]?.id 
    });

  } catch (error) {
    console.error('Error in add-artist-request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
