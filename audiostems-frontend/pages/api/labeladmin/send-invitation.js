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
    const {
      artist_id,
      artist_first_name,
      artist_last_name,
      personal_message,
      label_split_percentage,
      artist_split_percentage
    } = req.body;

    console.log('Creating invitation:', req.body);

    // Validate required fields
    if (!artist_id) {
      return res.status(400).json({ error: 'Artist not selected' });
    }

    if (label_split_percentage + artist_split_percentage !== 100) {
      return res.status(400).json({ error: 'Splits must equal 100%' });
    }

    const label_admin_id = '12345678-1234-5678-9012-123456789012';

    const { data, error } = await supabase
      .from('artist_invitations')
      .insert({
        label_admin_id,
        artist_id,
        artist_first_name,
        artist_last_name,
        artist_search_name: `${artist_first_name} ${artist_last_name}`,
        personal_message,
        label_split_percentage,
        artist_split_percentage,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Invitation created:', data);
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Invitation failed:', error);
    return res.status(500).json({ error: error.message });
  }
}
