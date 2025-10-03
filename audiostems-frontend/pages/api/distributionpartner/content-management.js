import { createClient } from '@supabase/supabase-js'
import { requireRole } from '@/lib/rbac/middleware'

// Server-side Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  try {
    const userId = req.user.id

    if (req.method === 'GET') {
      // Get all content managed by this distribution partner
      const { data: releases, error: releasesError } = await supabase
        .from('releases')
        .select(`
          *,
          artist:user_profiles!releases_artist_id_fkey (
            id,
            first_name,
            last_name,
            artist_name,
            email
          )
        `)
        .eq('distribution_partner_id', userId)
        .order('created_at', { ascending: false })

      if (releasesError) {
        return res.status(400).json({ error: releasesError.message })
      }

      // Format releases data for content management
      const formattedReleases = releases.map(release => ({
        id: release.id,
        title: release.title,
        artistId: release.artist_id,
        artistName: release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim(),
        artistEmail: release.artist?.email,
        status: release.status,
        releaseDate: release.release_date,
        genre: release.genre,
        label: release.label,
        
        // Distribution info
        distributionStatus: release.distribution_status,
        platforms: release.platforms || [],
        
        // Performance metrics
        streams: release.streams || 0,
        earnings: release.earnings || 0,
        
        // Metadata
        createdAt: release.created_at,
        updatedAt: release.updated_at,
        submittedAt: release.submitted_at,
        
        // Review information
        reviewNotes: release.review_notes,
        rejectionReason: release.rejection_reason,
        
        // Technical details
        upc: release.upc,
        isrc: release.isrc,
        duration: release.duration,
        explicit: release.explicit || false
      }))

      // Calculate content statistics
      const contentStats = {
        totalContent: formattedReleases.length,
        byStatus: {
          draft: formattedReleases.filter(r => r.status === 'draft').length,
          submitted: formattedReleases.filter(r => r.status === 'submitted').length,
          in_review: formattedReleases.filter(r => r.status === 'in_review' || r.status === 'pending_review').length,
          approved: formattedReleases.filter(r => r.status === 'approved' || r.status === 'completed').length,
          live: formattedReleases.filter(r => r.status === 'live').length,
          rejected: formattedReleases.filter(r => r.status === 'rejected').length
        },
        byGenre: {},
        totalStreams: formattedReleases.reduce((sum, r) => sum + r.streams, 0),
        totalEarnings: formattedReleases.reduce((sum, r) => sum + r.earnings, 0)
      }

      // Calculate genre distribution
      formattedReleases.forEach(release => {
        const genre = release.genre || 'Unknown'
        contentStats.byGenre[genre] = (contentStats.byGenre[genre] || 0) + 1
      })

      return res.status(200).json({
        success: true,
        data: {
          releases: formattedReleases,
          statistics: contentStats
        },
        timestamp: new Date().toISOString()
      })

    } else if (req.method === 'PUT') {
      // Update release distribution status
      const { releaseId, distributionStatus, platforms, notes } = req.body

      if (!releaseId) {
        return res.status(400).json({ error: 'Release ID is required' })
      }

      // Verify this release belongs to this distribution partner
      const { data: release, error: checkError } = await supabase
        .from('releases')
        .select('distribution_partner_id')
        .eq('id', releaseId)
        .single()

      if (checkError || !release) {
        return res.status(404).json({ error: 'Release not found' })
      }

      if (release.distribution_partner_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this release' })
      }

      const updateData = {
        updated_at: new Date().toISOString()
      }

      if (distributionStatus) updateData.distribution_status = distributionStatus
      if (platforms) updateData.platforms = platforms
      if (notes) updateData.distribution_notes = notes

      const { data: updatedRelease, error: updateError } = await supabase
        .from('releases')
        .update(updateData)
        .eq('id', releaseId)
        .select()
        .single()

      if (updateError) {
        return res.status(400).json({ error: updateError.message })
      }

      return res.status(200).json({
        success: true,
        data: updatedRelease,
        message: 'Release updated successfully'
      })

    } else if (req.method === 'POST') {
      // Assign new content to this distribution partner
      const { releaseId, distributionNotes } = req.body

      if (!releaseId) {
        return res.status(400).json({ error: 'Release ID is required' })
      }

      const updateData = {
        distribution_partner_id: userId,
        distribution_status: 'assigned',
        distribution_notes: distributionNotes || '',
        updated_at: new Date().toISOString()
      }

      const { data: updatedRelease, error: updateError } = await supabase
        .from('releases')
        .update(updateData)
        .eq('id', releaseId)
        .select()
        .single()

      if (updateError) {
        return res.status(400).json({ error: updateError.message })
      }

      return res.status(200).json({
        success: true,
        data: updatedRelease,
        message: 'Content assigned successfully'
      })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Content management error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to process content management request'
    })
  }
}

export default requireRole('distribution_partner')(handler);
