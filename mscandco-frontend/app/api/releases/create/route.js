import { createClient } from '@/lib/supabase/server'
import { enforceReleaseLimit, trackReleaseCreation } from '@/lib/middleware/tierEnforcement'

/**
 * Create Release API
 * Enforces tier limits before allowing release creation
 */
export async function POST(request) {
  try {
    // Enterprise pattern: Lazy load Supabase client at runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const supabase = await createClient()
    const data = await request.json()

    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authUser.id
    const trackCount = data.tracks?.length || 0

    // TIER ENFORCEMENT: Check if user can create this release
    const limitCheck = await enforceReleaseLimit(userId, trackCount)

    if (!limitCheck.allowed) {
      return Response.json({
        error: 'Tier limit reached',
        message: limitCheck.error,
        upgradeRequired: limitCheck.upgradeRequired,
        currentUsage: limitCheck.currentUsage,
        limit: limitCheck.limit,
        upgradeUrl: `/billing/upgrade?tier=${limitCheck.upgradeRequired}&reason=release_limit`
      }, { status: 403 })
    }

    // Show upgrade prompt if user would save money by upgrading
    if (limitCheck.promptUpgrade) {
      // Still allow release creation, but return upgrade recommendation
      console.log('Upgrade recommended:', limitCheck.upgradeMessage)
    }

    // Create release (your existing release creation logic here)
    const releaseData = {
      user_id: userId,
      title: data.title,
      artist_name: data.artist_name,
      release_date: data.release_date,
      artwork_url: data.artwork_url,
      upc: data.upc || null,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .insert(releaseData)
      .select()
      .single()

    if (releaseError) {
      console.error('Error creating release:', releaseError)
      return Response.json({ error: 'Failed to create release' }, { status: 500 })
    }

    // Create tracks if provided
    if (data.tracks && data.tracks.length > 0) {
      const tracksData = data.tracks.map((track, index) => ({
        release_id: release.id,
        title: track.title,
        duration: track.duration,
        isrc: track.isrc || null,
        track_number: index + 1,
        file_url: track.file_url
      }))

      const { error: tracksError } = await supabase
        .from('tracks')
        .insert(tracksData)

      if (tracksError) {
        console.error('Error creating tracks:', tracksError)
        // Rollback release
        await supabase.from('releases').delete().eq('id', release.id)
        return Response.json({ error: 'Failed to create tracks' }, { status: 500 })
      }
    }

    // TIER TRACKING: Increment usage counters
    await trackReleaseCreation(userId, trackCount)

    // Return success with optional upgrade prompt
    return Response.json({
      success: true,
      release,
      message: 'Release created successfully',
      upgradePrompt: limitCheck.promptUpgrade ? {
        message: limitCheck.upgradeMessage,
        savings: limitCheck.savingsIfUpgrade
      } : null
    })
  } catch (error) {
    console.error('Create release error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
