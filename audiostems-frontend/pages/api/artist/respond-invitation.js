// ARTIST RESPOND TO INVITATION API
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
    const { invitation_id, action, decline_reason } = req.body; // action: 'accept' or 'decline'
    const artist_id = req.user.id;

    if (!invitation_id || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    console.log('📝 Artist responding to invitation:', { invitation_id, action });

    // Update invitation status
    const { data: invitation, error: updateError } = await supabase
      .from('artist_invitations')
      .update({
        status: action === 'accept' ? 'accepted' : 'declined',
        responded_at: new Date().toISOString(),
        response_note: decline_reason || null
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
      // Check if relationship already exists
      const { data: existingRelationship } = await supabase
        .from('artist_label_relationships')
        .select('id')
        .eq('artist_id', invitation.artist_id)
        .eq('label_admin_id', invitation.label_admin_id)
        .eq('status', 'active')
        .single();

      // Only create if doesn't exist
      if (!existingRelationship) {
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
      } else {
        console.log('✅ Partnership relationship already exists:', existingRelationship.id);
      }

      // AUTOMATIC RELEASE LINKING
      // Get label admin's company name to match against releases
      const { data: labelProfile } = await supabase
        .from('user_profiles')
        .select('company_name')
        .eq('id', invitation.label_admin_id)
        .single();
      
      if (labelProfile?.company_name) {
        // Update releases where record_label matches label admin's company name
        const { data: updatedReleases, error: linkError } = await supabase
          .from('releases')
          .update({ label_admin_id: invitation.label_admin_id })
          .eq('artist_id', invitation.artist_id)
          .eq('record_label', labelProfile.company_name)
          .select('id');

        if (!linkError && updatedReleases?.length > 0) {
          console.log(`✅ Linked ${updatedReleases.length} releases to label admin`);
        }
      }
    }

    // CREATE NOTIFICATION for label admin
    await supabase.from('notifications').insert({
      user_id: invitation.label_admin_id,
      type: 'invitation_response',
      title: action === 'accept' ? 'Invitation Accepted' : 'Invitation Declined',
      message: action === 'accept' 
        ? `${invitation.artist_first_name} ${invitation.artist_last_name} accepted your partnership invitation`
        : `${invitation.artist_first_name} ${invitation.artist_last_name} declined your partnership invitation${decline_reason ? ': ' + decline_reason : ''}`,
      data: {
        invitation_id: invitation.id,
        artist_id: invitation.artist_id,
        action: action,
        decline_reason: decline_reason
      },
      action_required: false,
      read: false
    });

    console.log('✅ Notification created for label admin');

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

export default requireAuth()(handler);
