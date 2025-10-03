import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

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

    const label_admin_id = req.user.id;
    console.log('🔍 Authenticated label admin:', label_admin_id);

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

    // CREATE NOTIFICATION for the artist
    await supabase.from('notifications').insert({
      user_id: data.artist_id,
      type: 'invitation',
      title: 'New Label Invitation',
      message: `${artist_first_name} ${artist_last_name}, you have a new label partnership invitation`,
      data: {
        invitation_id: data.id,
        label_admin_id: data.label_admin_id,
        label_split_percentage: data.label_split_percentage,
        artist_split_percentage: data.artist_split_percentage,
        personal_message: data.personal_message
      },
      action_required: true,
      action_type: 'accept_decline',
      action_url: '/artist/messages'
    });

    console.log('✅ Notification created for artist');
    
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Invitation failed:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default requirePermission('artist:invite')(handler);
