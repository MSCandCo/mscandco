import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

// Server-side Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    // Verify authentication and Company Admin role
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

    const userId = userInfo?.sub
    const userRole = userInfo?.user_metadata?.role
    if (userRole !== 'company_admin') {
      return res.status(403).json({ error: 'Company Admin access required' })
    }

    if (req.method === 'GET') {
      // Get all artist requests with related user information
      const { data: artistRequests, error: requestsError } = await supabase
        .from('artist_requests')
        .select(`
          *,
          label_admin:user_profiles!artist_requests_label_admin_id_fkey (
            id,
            first_name,
            last_name,
            artist_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (requestsError) {
        return res.status(400).json({ error: requestsError.message })
      }

      // Format requests data
      const formattedRequests = artistRequests.map(request => ({
        id: request.id,
        artistName: request.artist_name,
        artistEmail: request.artist_email,
        artistType: request.artist_type,
        genre: request.genre,
        country: request.country,
        bio: request.bio,
        socialLinks: request.social_links || {},
        
        // Label admin information
        labelAdminId: request.label_admin_id,
        labelAdminName: request.label_admin?.artist_name || 
          `${request.label_admin?.first_name} ${request.label_admin?.last_name}`.trim() || 
          'Unknown Label Admin',
        labelAdminEmail: request.label_admin?.email,
        
        // Request status and metadata
        status: request.status,
        submittedAt: request.created_at,
        reviewedAt: request.reviewed_at,
        reviewedBy: request.reviewed_by,
        rejectionReason: request.rejection_reason,
        approvalNotes: request.approval_notes,
        
        // Additional metadata
        requestType: request.request_type || 'artist_addition',
        priority: request.priority || 'normal',
        tags: request.tags || []
      }))

      // Calculate request statistics
      const requestStats = {
        totalRequests: formattedRequests.length,
        byStatus: {
          pending: formattedRequests.filter(r => r.status === 'pending').length,
          approved: formattedRequests.filter(r => r.status === 'approved').length,
          rejected: formattedRequests.filter(r => r.status === 'rejected').length,
          under_review: formattedRequests.filter(r => r.status === 'under_review').length
        },
        byGenre: {},
        byCountry: {},
        byLabelAdmin: {},
        
        // Time-based metrics
        averageReviewTime: 0,
        approvalRate: formattedRequests.length > 0 ? 
          (formattedRequests.filter(r => r.status === 'approved').length / formattedRequests.length) * 100 : 0
      }

      // Calculate genre distribution
      formattedRequests.forEach(request => {
        const genre = request.genre || 'Unknown'
        requestStats.byGenre[genre] = (requestStats.byGenre[genre] || 0) + 1
      })

      // Calculate country distribution
      formattedRequests.forEach(request => {
        const country = request.country || 'Unknown'
        requestStats.byCountry[country] = (requestStats.byCountry[country] || 0) + 1
      })

      // Calculate requests by label admin
      formattedRequests.forEach(request => {
        const labelAdmin = request.labelAdminName
        requestStats.byLabelAdmin[labelAdmin] = (requestStats.byLabelAdmin[labelAdmin] || 0) + 1
      })

      // Calculate average review time for completed requests
      const reviewedRequests = formattedRequests.filter(r => 
        r.reviewedAt && (r.status === 'approved' || r.status === 'rejected')
      )
      
      if (reviewedRequests.length > 0) {
        const totalReviewTime = reviewedRequests.reduce((sum, request) => {
          const submitted = new Date(request.submittedAt)
          const reviewed = new Date(request.reviewedAt)
          return sum + (reviewed - submitted)
        }, 0)
        
        requestStats.averageReviewTime = totalReviewTime / reviewedRequests.length / (1000 * 60 * 60 * 24) // Convert to days
      }

      return res.status(200).json({
        success: true,
        data: {
          requests: formattedRequests,
          statistics: requestStats
        },
        timestamp: new Date().toISOString()
      })

    } else if (req.method === 'PUT') {
      // Update request status (approve/reject)
      const { requestId, status, reviewNotes, rejectionReason } = req.body

      if (!requestId || !status) {
        return res.status(400).json({ error: 'Request ID and status are required' })
      }

      if (!['approved', 'rejected', 'under_review', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' })
      }

      const updateData = {
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
        updated_at: new Date().toISOString()
      }

      if (status === 'approved' && reviewNotes) {
        updateData.approval_notes = reviewNotes
      }

      if (status === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason
      }

      const { data: updatedRequest, error: updateError } = await supabase
        .from('artist_requests')
        .update(updateData)
        .eq('id', requestId)
        .select(`
          *,
          label_admin:user_profiles!artist_requests_label_admin_id_fkey (
            first_name,
            last_name,
            artist_name,
            email
          )
        `)
        .single()

      if (updateError) {
        return res.status(400).json({ error: updateError.message })
      }

      // If approved, create the artist-label relationship
      if (status === 'approved') {
        try {
          // First, create the artist user account
          const { data: newArtist, error: createError } = await supabase.auth.admin.createUser({
            email: updatedRequest.artist_email,
            password: Math.random().toString(36).slice(-8), // Temporary password
            user_metadata: { role: 'artist' },
            email_confirm: true
          })

          if (createError) {
            console.error('Failed to create artist user:', createError)
            // Continue anyway - the request is approved but user creation failed
          } else {
            // Create user profile
            await supabase
              .from('user_profiles')
              .insert({
                id: newArtist.user.id,
                email: updatedRequest.artist_email,
                first_name: updatedRequest.artist_name.split(' ')[0] || '',
                last_name: updatedRequest.artist_name.split(' ').slice(1).join(' ') || '',
                artist_name: updatedRequest.artist_name,
                artist_type: updatedRequest.artist_type,
                country: updatedRequest.country,
                bio: updatedRequest.bio,
                profile_completed: false,
                registration_stage: 'approved_by_label',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            // Create label-artist relationship
            await supabase
              .from('label_artists')
              .insert({
                label_admin_id: updatedRequest.label_admin_id,
                artist_id: newArtist.user.id,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
          }
        } catch (creationError) {
          console.error('Error creating artist account:', creationError)
          // The request is still approved, but account creation failed
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          id: updatedRequest.id,
          status: updatedRequest.status,
          reviewedAt: updatedRequest.reviewed_at,
          reviewedBy: updatedRequest.reviewed_by,
          approvalNotes: updatedRequest.approval_notes,
          rejectionReason: updatedRequest.rejection_reason
        },
        message: `Request ${status} successfully`
      })

    } else if (req.method === 'DELETE') {
      // Delete request (Company Admin can delete requests)
      const { requestId } = req.body

      if (!requestId) {
        return res.status(400).json({ error: 'Request ID is required' })
      }

      const { error: deleteError } = await supabase
        .from('artist_requests')
        .delete()
        .eq('id', requestId)

      if (deleteError) {
        return res.status(400).json({ error: deleteError.message })
      }

      return res.status(200).json({
        success: true,
        message: 'Request deleted successfully'
      })

    } else if (req.method === 'POST') {
      // Bulk operations (approve/reject multiple requests)
      const { requestIds, action, reviewNotes, rejectionReason } = req.body

      if (!requestIds || !Array.isArray(requestIds) || !action) {
        return res.status(400).json({ error: 'Request IDs array and action are required' })
      }

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' })
      }

      const updateData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
        updated_at: new Date().toISOString()
      }

      if (action === 'approve' && reviewNotes) {
        updateData.approval_notes = reviewNotes
      }

      if (action === 'reject' && rejectionReason) {
        updateData.rejection_reason = rejectionReason
      }

      const { data: updatedRequests, error: bulkUpdateError } = await supabase
        .from('artist_requests')
        .update(updateData)
        .in('id', requestIds)
        .select()

      if (bulkUpdateError) {
        return res.status(400).json({ error: bulkUpdateError.message })
      }

      return res.status(200).json({
        success: true,
        data: {
          updatedCount: updatedRequests.length,
          action: action
        },
        message: `${updatedRequests.length} requests ${action}d successfully`
      })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Artist requests error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to process artist requests'
    })
  }
}
