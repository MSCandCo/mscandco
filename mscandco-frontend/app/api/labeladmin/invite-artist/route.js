import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * POST /api/labeladmin/invite-artist
 * Send invitation to an artist to join the label
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

    // Search for existing artist by artist_name using service role
    const { data: artists, error: searchError } = await supabase
      .from('user_profiles')
      .select('id, artist_name, email, first_name, last_name')
      .eq('artist_name', artistName)
      .eq('role', 'artist')
      .is('deleted_at', null)
      .limit(1)

    if (searchError) {
      console.error('❌ Error searching for artist:', searchError)
      return NextResponse.json(
        { error: 'Failed to search for artist', details: searchError.message },
        { status: 500 }
      )
    }

    if (!artists || artists.length === 0) {
      console.log(`❌ Artist "${artistName}" not found in system`)
      return NextResponse.json(
        { error: `Artist "${artistName}" not found. Please check the artist name or ensure they have registered on the platform.` },
        { status: 404 }
      )
    }

    const existingArtist = artists[0]
    const artistId = existingArtist.id

    console.log('✅ Artist found:', existingArtist.artist_name, artistId)

    // Check if invitation already exists
    const { data: existingRequests, error: checkError } = await supabase
      .from('affiliation_requests')
      .select('id, status')
      .eq('label_admin_id', labelAdminId)
      .eq('artist_id', artistId)
      .limit(1)

    if (checkError) {
      console.error('❌ Error checking existing invitations:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing invitations', details: checkError.message },
        { status: 500 }
      )
    }

    if (existingRequests && existingRequests.length > 0) {
      const existingRequest = existingRequests[0]
      return NextResponse.json(
        { error: `You already have a ${existingRequest.status} invitation for this artist.` },
        { status: 400 }
      )
    }

    // Create affiliation request using service role
    const { data: requestData, error: insertError } = await supabase
      .from('affiliation_requests')
      .insert({
        label_admin_id: labelAdminId,
        artist_id: artistId,
        artist_first_name: firstName,
        artist_last_name: lastName,
        artist_name: artistName,
        label_percentage: labelSplit,
        message: message || null,
        status: 'pending'
      })
      .select('id, status, label_percentage')
      .single()

    if (insertError) {
      console.error('❌ Error creating affiliation request:', insertError)
      return NextResponse.json(
        { error: 'Failed to create invitation', details: insertError.message },
        { status: 500 }
      )
    }

    console.log('✅ Invitation sent successfully:', requestData.id)

    // Create notification for the artist
    try {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: artistId,
          type: 'invitation',
          title: 'New Label Invitation',
          message: `${firstName || ''} ${lastName || ''}, you have a new label partnership invitation`,
          data: {
            invitation_id: requestData.id,
            label_admin_id: labelAdminId,
            artist_split_percentage: artistSplit,
            label_split_percentage: labelSplit,
            personal_message: message || null
          },
          action_required: true,
          read: false
        })

      if (notifError) {
        console.error('❌ Error creating notification:', notifError)
        // Don't fail the whole request if notification fails
      } else {
        console.log('✅ Notification created for artist:', artistId)
      }
    } catch (notifError) {
      console.error('❌ Error creating notification:', notifError)
      // Don't fail the whole request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      requestId: requestData.id
    })

  } catch (error) {
    console.error('❌ Invite artist API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
