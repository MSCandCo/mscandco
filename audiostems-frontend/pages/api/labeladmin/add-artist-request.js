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
    // Get the user from the session
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify user is a label admin
    const { data: roleData } = await supabase
      .from('user_role_assignments')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'label_admin') {
      return res.status(403).json({ error: 'Label admin access required' });
    }

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
      .eq('id', user.id)
      .single();

    // Create the artist request
    const { data, error } = await supabase
      .from('artist_requests')
      .insert([
        {
          requested_by_user_id: user.id,
          requested_by_email: user.email,
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
