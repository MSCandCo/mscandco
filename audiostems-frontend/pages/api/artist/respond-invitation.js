// ARTIST RESPOND TO INVITATION API
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // PROPER AUTHENTICATION - No hardcoded IDs
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { invitation_id, action } = req.body; // action: 'accept' or 'decline'
    const artist_id = user.id;

    if (!invitation_id || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    console.log('📝 Artist responding to invitation:', { invitation_id, action });

    // Update invitation status
    const { data: invitation, error: updateError } = await supabase
      .from('artist_invitations')
      .update({
        status: action === 'accept' ? 'accepted' : 'declined',
        responded_at: new Date().toISOString()
      })
      .eq('id', invitation_id)
      .eq('artist_id', artist_id) // Security: only respond to own invitations
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating invitation:', updateError);
      return res.status(500).json({ error: 'Failed to update invitation' });
    }

    // If accepted, create the partnership relationship
    if (action === 'accept') {
      const { data: relationship, error: relError } = await supabase
        .from('artist_label_relationships')
        .insert({
          artist_id: invitation.artist_id,
          label_admin_id: invitation.label_admin_id,
          label_split_percentage: invitation.label_split_percentage,
          artist_split_percentage: invitation.artist_split_percentage,
          status: 'active'
        })
        .select()
        .single();

      if (relError) {
        console.error('❌ Error creating relationship:', relError);
        return res.status(500).json({ error: 'Invitation accepted but failed to create partnership' });
      }

      console.log('✅ Partnership relationship created:', relationship.id);
    }

    return res.json({
      success: true,
      message: action === 'accept' 
        ? 'Partnership accepted! You are now affiliated with this label.'
        : 'Invitation declined.',
      invitation: invitation
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
