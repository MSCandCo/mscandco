import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db/postgres'

/**
 * POST /api/labeladmin/invite-artist
 * Send invitation to an artist to join the label
 * Uses direct PostgreSQL connection to bypass Supabase JS client issues
 */
export async function POST(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const labelAdminId = user.id
    const body = await request.json()
    
    const { firstName, lastName, artistName, message, labelSplit, artistSplit } = body

    console.log('📧 Sending artist invitation:', { labelAdminId, artistName, labelSplit })

    // Validate splits
    if (labelSplit + artistSplit !== 100) {
      return NextResponse.json(
        { error: 'Label and artist splits must total 100%' },
        { status: 400 }
      )
    }

    // Search for existing artist by artist_name using direct PostgreSQL
    const searchResult = await query(
      `SELECT id, artist_name, email, first_name, last_name 
       FROM user_profiles 
       WHERE artist_name = $1 AND role = $2
       LIMIT 1`,
      [artistName, 'artist']
    )

    if (searchResult.rowCount === 0) {
      console.log(`❌ Artist "${artistName}" not found in system`)
      return NextResponse.json(
        { error: `Artist "${artistName}" not found. Please check the artist name or ensure they have registered on the platform.` },
        { status: 404 }
      )
    }

    const existingArtist = searchResult.rows[0]
    const artistId = existingArtist.id

    console.log('✅ Artist found:', existingArtist.artist_name, artistId)

    // Check if invitation already exists
    const checkResult = await query(
      `SELECT id, status 
       FROM affiliation_requests 
       WHERE label_admin_id = $1 AND artist_id = $2
       LIMIT 1`,
      [labelAdminId, artistId]
    )

    if (checkResult.rowCount > 0) {
      const existingRequest = checkResult.rows[0]
      return NextResponse.json(
        { error: `You already have a ${existingRequest.status} invitation for this artist.` },
        { status: 400 }
      )
    }

    // Create affiliation request using direct PostgreSQL
    const insertResult = await query(
      `INSERT INTO affiliation_requests (
        label_admin_id,
        artist_id,
        artist_first_name,
        artist_last_name,
        artist_name,
        label_percentage,
        message,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, status, label_percentage`,
      [
        labelAdminId,
        artistId,
        firstName,
        lastName,
        artistName,
        labelSplit,
        message || null,
        'pending'
      ]
    )

    const request_data = insertResult.rows[0]

    console.log('✅ Invitation sent successfully:', request_data.id)

    // Create notification for the artist
    try {
      await query(
        `INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          data,
          action_required,
          read,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          artistId,
          'invitation',
          'New Label Invitation',
          `${existingArtist.first_name || ''} ${existingArtist.last_name || ''}, you have a new label partnership invitation`,
          JSON.stringify({
            invitation_id: request_data.id,
            label_admin_id: labelAdminId,
            artist_split_percentage: 100 - labelSplit,
            label_split_percentage: labelSplit,
            personal_message: message || null
          }),
          true,
          false
        ]
      )
      console.log('✅ Notification created for artist:', artistId)
    } catch (notifError) {
      console.error('❌ Error creating notification:', notifError)
      // Don't fail the whole request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      requestId: request_data.id
    })

  } catch (error) {
    console.error('❌ Invite artist API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
