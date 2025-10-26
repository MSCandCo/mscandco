import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/labeladmin/roster
 * Fetch aggregated contributors from all releases by all affiliated artists
 */
export async function GET(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const labelAdminId = user.id
    console.log('📋 Fetching label admin roster for:', labelAdminId)

    // Get all artists affiliated with this label admin
    const { data: affiliations, error: affiliationsError } = await supabase
      .from('artist_label_affiliations')
      .select('artist_id')
      .eq('label_admin_id', labelAdminId)
      .eq('status', 'accepted')

    if (affiliationsError) {
      console.error('❌ Error fetching affiliations:', affiliationsError)
      return NextResponse.json({ error: affiliationsError.message }, { status: 500 })
    }

    const artistIds = affiliations.map(a => a.artist_id)
    console.log(`✅ Found ${artistIds.length} affiliated artists`)

    if (artistIds.length === 0) {
      // No affiliated artists, return empty roster
      return NextResponse.json({ contributors: [] })
    }

    // Get all releases by these artists
    const { data: releases, error: releasesError } = await supabase
      .from('releases')
      .select('id, title, artist_id')
      .in('artist_id', artistIds)

    if (releasesError) {
      console.error('❌ Error fetching releases:', releasesError)
      return NextResponse.json({ error: releasesError.message }, { status: 500 })
    }

    const releaseIds = releases.map(r => r.id)
    console.log(`✅ Found ${releaseIds.length} releases from affiliated artists`)

    if (releaseIds.length === 0) {
      // No releases, return empty roster
      return NextResponse.json({ contributors: [] })
    }

    // Get all contributors from these releases
    const { data: releaseContributors, error: contributorsError } = await supabase
      .from('release_contributors')
      .select(`
        *,
        contributor:contributors(*)
      `)
      .in('release_id', releaseIds)

    if (contributorsError) {
      console.error('❌ Error fetching contributors:', contributorsError)
      return NextResponse.json({ error: contributorsError.message }, { status: 500 })
    }

    // Aggregate and deduplicate contributors
    const contributorMap = new Map()

    releaseContributors.forEach(rc => {
      if (!rc.contributor) return

      const contributorId = rc.contributor.id

      if (!contributorMap.has(contributorId)) {
        // First time seeing this contributor
        contributorMap.set(contributorId, {
          id: rc.contributor.id,
          name: rc.contributor.name,
          type: rc.contributor.type,
          isni: rc.contributor.isni,
          thumbnail_url: rc.contributor.thumbnail_url,
          created_at: rc.contributor.created_at,
          releases: [],
          roles: new Set()
        })
      }

      const contributor = contributorMap.get(contributorId)

      // Add release info
      const release = releases.find(r => r.id === rc.release_id)
      if (release) {
        contributor.releases.push({
          id: release.id,
          title: release.title,
          role: rc.role
        })
      }

      // Track unique roles this contributor has played
      if (rc.role) {
        contributor.roles.add(rc.role)
      }
    })

    // Convert Map to array and format for client
    const contributors = Array.from(contributorMap.values()).map(c => ({
      ...c,
      roles: Array.from(c.roles),
      releaseCount: c.releases.length
    }))

    console.log(`✅ Aggregated ${contributors.length} unique contributors from ${releaseIds.length} releases`)

    return NextResponse.json({
      success: true,
      contributors,
      summary: {
        totalContributors: contributors.length,
        totalReleases: releaseIds.length,
        totalArtists: artistIds.length
      }
    })

  } catch (error) {
    console.error('❌ Label admin roster API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
