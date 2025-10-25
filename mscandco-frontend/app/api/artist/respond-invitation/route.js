import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db/postgres'

/**
 * POST /api/artist/respond-invitation
 * Artist accepts or declines a label invitation
 */
export async function POST(request) {
  try {
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

    // First, fetch the invitation without artist_id filter to see what's in the DB
    const checkResult = await query(
      `SELECT * FROM affiliation_requests WHERE id = $1`,
      [invitation_id]
    )

    console.log('📋 Invitation lookup result:', {
      found: checkResult.rows.length > 0,
      invitation: checkResult.rows[0],
      currentArtistId: artistId
    })

    // Fetch the invitation using direct PostgreSQL
    const invitationResult = await query(
      `SELECT * FROM affiliation_requests
       WHERE id = $1 AND artist_id = $2`,
      [invitation_id, artistId]
    )

    const invitation = invitationResult.rows[0]

    if (!invitation) {
      console.error('❌ Invitation not found for artist:', {
        invitation_id,
        artistId,
        checkResult: checkResult.rows[0]
      })
      return NextResponse.json(
        { error: 'Invitation not found or you do not have permission to respond' },
        { status: 404 }
      )
    }

    // Check if already responded
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `This invitation has already been ${invitation.status}` },
        { status: 400 }
      )
    }

    if (action === 'accept') {
      // Update invitation status to accepted
      await query(
        `UPDATE affiliation_requests
         SET status = 'accepted', updated_at = NOW()
         WHERE id = $1`,
        [invitation_id]
      )

      // Create active affiliation in label_artist_affiliations
      await query(
        `INSERT INTO label_artist_affiliations (
          label_admin_id, artist_id, label_percentage, status, created_at
        ) VALUES ($1, $2, $3, 'active', NOW())`,
        [invitation.label_admin_id, artistId, invitation.label_percentage]
      )

      // Create notification for label admin
      await query(
        `INSERT INTO notifications (
          user_id, type, title, message, data, action_required, read, created_at
        ) VALUES ($1, 'invitation_response', 'Invitation Accepted', $2, $3, false, false, NOW())`,
        [
          invitation.label_admin_id,
          `${invitation.artist_name || 'An artist'} has accepted your partnership invitation!`,
          JSON.stringify({
            artist_id: artistId,
            artist_name: invitation.artist_name,
            label_percentage: invitation.label_percentage,
            invitation_id: invitation_id
          })
        ]
      )

      console.log('✅ Invitation accepted and affiliation created')

      return NextResponse.json({
        success: true,
        message: 'Partnership accepted successfully',
        affiliation_created: true
      })

    } else if (action === 'decline') {
      // Update invitation status to declined
      await query(
        `UPDATE affiliation_requests
         SET status = 'declined', 
             decline_reason = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [decline_reason || null, invitation_id]
      )

      // Create notification for label admin
      await query(
        `INSERT INTO notifications (
          user_id, type, title, message, data, action_required, read, created_at
        ) VALUES ($1, 'invitation_response', 'Invitation Declined', $2, $3, false, false, NOW())`,
        [
          invitation.label_admin_id,
          `${invitation.artist_name || 'An artist'} has declined your partnership invitation.`,
          JSON.stringify({
            artist_id: artistId,
            artist_name: invitation.artist_name,
            decline_reason: decline_reason || 'No reason provided',
            invitation_id: invitation_id
          })
        ]
      )

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

