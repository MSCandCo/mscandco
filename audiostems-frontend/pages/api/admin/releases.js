import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

// Server-side Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    // Verify authentication and Super Admin role
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' })
    }

    let userInfo
    try {
      userInfo = jwt.decode(token)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const userRole = userInfo?.user_metadata?.role
    if (!['super_admin', 'company_admin'].includes(userRole)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    if (req.method === 'GET') {
      // Get all releases with artist information
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
        .order('created_at', { ascending: false })

      if (releasesError) {
        return res.status(400).json({ error: releasesError.message })
      }

      // Format releases data
      const formattedReleases = releases.map(release => ({
        id: release.id,
        title: release.title,
        artistId: release.artist_id,
        artistName: release.artist?.artist_name || `${release.artist?.first_name} ${release.artist?.last_name}`.trim(),
        status: release.status,
        releaseDate: release.release_date,
        genre: release.genre,
        label: release.label,
        upc: release.upc,
        isrc: release.isrc,
        
        // Financial data
        streams: release.streams || 0,
        earnings: release.earnings || 0,
        
        // Metadata
        createdAt: release.created_at,
        updatedAt: release.updated_at,
        submittedAt: release.submitted_at,
        approvedAt: release.approved_at,
        
        // Review information
        reviewNotes: release.review_notes,
        rejectionReason: release.rejection_reason,
        
        // Distribution
        distributionStatus: release.distribution_status,
        platforms: release.platforms || []
      }))

      // Calculate status counts
      const statusCounts = {
        draft: formattedReleases.filter(r => r.status === 'draft').length,
        submitted: formattedReleases.filter(r => r.status === 'submitted').length,
        in_review: formattedReleases.filter(r => r.status === 'in_review' || r.status === 'pending_review').length,
        approved: formattedReleases.filter(r => r.status === 'approved' || r.status === 'completed').length,
        live: formattedReleases.filter(r => r.status === 'live').length,
        rejected: formattedReleases.filter(r => r.status === 'rejected').length
      }

      return res.status(200).json({
        success: true,
        data: {
          releases: formattedReleases,
          statusCounts: statusCounts,
          totalReleases: formattedReleases.length
        },
        timestamp: new Date().toISOString()
      })

    } else if (req.method === 'PUT') {
      // Update release (approve, reject, etc.)
      const { releaseId, status, reviewNotes, rejectionReason } = req.body

      if (!releaseId || !status) {
        return res.status(400).json({ error: 'Release ID and status are required' })
      }

      const updateData = {
        status: status,
        updated_at: new Date().toISOString()
      }

      // Add status-specific fields
      if (status === 'approved' || status === 'completed') {
        updateData.approved_at = new Date().toISOString()
        updateData.review_notes = reviewNotes || ''
      } else if (status === 'rejected') {
        updateData.rejection_reason = rejectionReason || ''
        updateData.review_notes = reviewNotes || ''
      } else if (status === 'live') {
        updateData.live_at = new Date().toISOString()
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
        message: `Release ${status} successfully`
      })

    } else if (req.method === 'DELETE') {
      // Delete release (Super Admin only)
      if (userRole !== 'super_admin') {
        return res.status(403).json({ error: 'Super Admin access required for deletion' })
      }

      const { releaseId } = req.body

      if (!releaseId) {
        return res.status(400).json({ error: 'Release ID is required' })
      }

      const { error: deleteError } = await supabase
        .from('releases')
        .delete()
        .eq('id', releaseId)

      if (deleteError) {
        return res.status(400).json({ error: deleteError.message })
      }

      return res.status(200).json({
        success: true,
        message: 'Release deleted successfully'
      })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Release management error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to process release request'
    })
  }
}
