import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS

/**
 * POST /api/artist/respond-invitation
 * Artist accepts or declines a label invitation
 */
export async function POST(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const artistId = user.id
    const body = await request.json()
    const { invitation_id, action, decline_reason } = body

    console.log('🎯 Artist responding to invitation:', { artistId, invitation_id, action })

    // Validate action
    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "decline"' },
        { status: 400 }
      )
    }

    // Fetch the invitation using service role
    const { data: invitations, error: fetchError } = await supabase
      .from('affiliation_requests')
      .select('*')
      .eq('id', invitation_id)
      .eq('artist_id', artistId)
      .limit(1)

    if (fetchError) {
      console.error('❌ Error fetching invitation:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch invitation', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!invitations || invitations.length === 0) {
      console.error('❌ Invitation not found for artist:', {
        invitation_id,
        artistId
      })
      return NextResponse.json(
        { error: 'Invitation not found or you do not have permission to respond' },
        { status: 404 }
      )
    }

    const invitation = invitations[0]

    // Check if already responded
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `This invitation has already been ${invitation.status}` },
        { status: 400 }
      )
    }

    if (action === 'accept') {
      // Update invitation status to accepted
      const { error: updateError } = await supabase
        .from('affiliation_requests')
        .update({ 
          status: 'accepted', 
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation_id)

      if (updateError) {
        console.error('❌ Error updating invitation:', updateError)
        return NextResponse.json(
          { error: 'Failed to update invitation', details: updateError.message },
          { status: 500 }
        )
      }

      // Create active affiliation in label_artist_affiliations
      const { error: affiliationError } = await supabase
        .from('label_artist_affiliations')
        .insert({
          label_admin_id: invitation.label_admin_id,
          artist_id: artistId,
          label_percentage: invitation.label_percentage,
          status: 'active'
        })

      if (affiliationError) {
        console.error('❌ Error creating affiliation:', affiliationError)
        return NextResponse.json(
          { error: 'Failed to create affiliation', details: affiliationError.message },
          { status: 500 }
        )
      }

      // Create notification for label admin
      try {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: invitation.label_admin_id,
            type: 'invitation_response',
            title: 'Invitation Accepted',
            message: `${invitation.artist_name || 'An artist'} has accepted your partnership invitation!`,
            data: {
              artist_id: artistId,
              artist_name: invitation.artist_name,
              label_percentage: invitation.label_percentage,
              invitation_id: invitation_id
            },
            action_required: false,
            read: false
          })

        if (notifError) {
          console.error('❌ Error creating notification:', notifError)
          // Don't fail the whole request if notification fails
        }
      } catch (notifError) {
        console.error('❌ Error creating notification:', notifError)
        // Don't fail the whole request if notification fails
      }

      console.log('✅ Invitation accepted and affiliation created')

      return NextResponse.json({
        success: true,
        message: 'Partnership accepted successfully',
        affiliation_created: true
      })

    } else if (action === 'decline') {
      // Update invitation status to declined
      const { error: updateError } = await supabase
        .from('affiliation_requests')
        .update({ 
          status: 'declined',
          decline_reason: decline_reason || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation_id)

      if (updateError) {
        console.error('❌ Error updating invitation:', updateError)
        return NextResponse.json(
          { error: 'Failed to update invitation', details: updateError.message },
          { status: 500 }
        )
      }

      // Create notification for label admin
      try {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: invitation.label_admin_id,
            type: 'invitation_response',
            title: 'Invitation Declined',
            message: `${invitation.artist_name || 'An artist'} has declined your partnership invitation.`,
            data: {
              artist_id: artistId,
              artist_name: invitation.artist_name,
              decline_reason: decline_reason || 'No reason provided',
              invitation_id: invitation_id
            },
            action_required: false,
            read: false
          })

        if (notifError) {
          console.error('❌ Error creating notification:', notifError)
          // Don't fail the whole request if notification fails
        }
      } catch (notifError) {
        console.error('❌ Error creating notification:', notifError)
        // Don't fail the whole request if notification fails
      }

      console.log('✅ Invitation declined')

      return NextResponse.json({
        success: true,
        message: 'Partnership declined',
        declined: true
      })
    }

  } catch (error) {
    console.error('❌ Respond invitation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
