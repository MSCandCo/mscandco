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
      // Get all users with their profiles and subscription information
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        return res.status(400).json({ error: authError.message })
      }

      // Get user profiles and subscription data
      const [profilesResult, subscriptionsResult, labelArtistsResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*'),
        
        supabase
          .from('subscriptions')
          .select('*'),
        
        supabase
          .from('label_artists')
          .select(`
            *,
            artist:user_profiles!label_artists_artist_id_fkey (
              first_name,
              last_name,
              artist_name
            ),
            label_admin:user_profiles!label_artists_label_admin_id_fkey (
              first_name,
              last_name,
              artist_name
            )
          `)
      ])

      const profiles = profilesResult.data || []
      const subscriptions = subscriptionsResult.data || []
      const labelArtists = labelArtistsResult.data || []

      // Combine auth users with their profiles and subscription data
      const users = authUsers.users.map(user => {
        const profile = profiles.find(p => p.id === user.id) || {}
        const subscription = subscriptions.find(s => s.user_id === user.id) || {}
        const labelRelationships = labelArtists.filter(la => 
          la.artist_id === user.id || la.label_admin_id === user.id
        )

        return {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'artist',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          
          // Profile information
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          artistName: profile.artist_name || '',
          artistType: profile.artist_type || '',
          country: profile.country || '',
          phone: profile.phone || '',
          bio: profile.bio || '',
          
          // Subscription information
          subscriptionTier: subscription.tier || 'none',
          subscriptionStatus: subscription.status || 'inactive',
          subscriptionAmount: subscription.amount || 0,
          subscriptionCurrency: subscription.currency || 'GBP',
          billingCycle: subscription.billing_cycle || 'monthly',
          
          // Wallet information
          walletBalance: profile.wallet_balance || 0,
          walletEnabled: profile.wallet_enabled || false,
          
          // Profile status
          profileCompleted: profile.profile_completed || false,
          lockedFields: profile.locked_fields || [],
          approvalRequiredFields: profile.approval_required_fields || [],
          
          // Label relationships
          labelRelationships: labelRelationships.map(lr => ({
            id: lr.id,
            type: lr.artist_id === user.id ? 'artist' : 'label_admin',
            relatedUser: lr.artist_id === user.id ? 
              lr.label_admin : lr.artist,
            status: lr.status,
            createdAt: lr.created_at
          })),
          
          // Statistics
          releasesCount: profile.releases_count || 0,
          storageUsed: profile.storage_used_mb || 0,
          
          // System fields
          registrationDate: profile.registration_date || user.created_at,
          lastUpdated: profile.updated_at || user.updated_at
        }
      })

      // Sort users by creation date (newest first)
      users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      return res.status(200).json({
        success: true,
        data: users,
        total: users.length,
        timestamp: new Date().toISOString()
      })

    } else if (req.method === 'PUT') {
      // Update user information
      const { targetUserId, updates } = req.body

      if (!targetUserId || !updates) {
        return res.status(400).json({ error: 'Target user ID and updates are required' })
      }

      // Separate auth updates from profile updates
      const authUpdates = {}
      const profileUpdates = {}

      // Map frontend field names to database field names
      const fieldMapping = {
        email: 'email',
        role: 'role',
        firstName: 'first_name',
        lastName: 'last_name',
        artistName: 'artist_name',
        artistType: 'artist_type',
        country: 'country',
        phone: 'phone',
        bio: 'bio',
        walletEnabled: 'wallet_enabled',
        profileCompleted: 'profile_completed',
        lockedFields: 'locked_fields',
        approvalRequiredFields: 'approval_required_fields'
      }

      // Categorize updates
      Object.keys(updates).forEach(key => {
        if (key === 'email' || key === 'role') {
          if (key === 'email') {
            authUpdates.email = updates[key]
          } else if (key === 'role') {
            authUpdates.user_metadata = { 
              ...authUpdates.user_metadata, 
              role: updates[key] 
            }
          }
        } else if (fieldMapping[key]) {
          profileUpdates[fieldMapping[key]] = updates[key]
        }
      })

      // Add updated timestamp
      profileUpdates.updated_at = new Date().toISOString()

      try {
        // Update auth user if needed
        if (Object.keys(authUpdates).length > 0) {
          const { error: authError } = await supabase.auth.admin.updateUserById(
            targetUserId, 
            authUpdates
          )
          if (authError) {
            return res.status(400).json({ error: `Auth update failed: ${authError.message}` })
          }
        }

        // Update user profile if needed
        if (Object.keys(profileUpdates).length > 0) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update(profileUpdates)
            .eq('id', targetUserId)
          
          if (profileError) {
            return res.status(400).json({ error: `Profile update failed: ${profileError.message}` })
          }
        }

        // Fetch updated user data
        const { data: updatedAuthUser } = await supabase.auth.admin.getUserById(targetUserId)
        const { data: updatedProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', targetUserId)
          .single()

        const updatedUser = {
          id: updatedAuthUser.user.id,
          email: updatedAuthUser.user.email,
          role: updatedAuthUser.user.user_metadata?.role || 'artist',
          created_at: updatedAuthUser.user.created_at,
          
          // Profile information
          firstName: updatedProfile?.first_name || '',
          lastName: updatedProfile?.last_name || '',
          artistName: updatedProfile?.artist_name || '',
          artistType: updatedProfile?.artist_type || '',
          country: updatedProfile?.country || '',
          phone: updatedProfile?.phone || '',
          bio: updatedProfile?.bio || '',
          
          // Profile status
          profileCompleted: updatedProfile?.profile_completed || false,
          lockedFields: updatedProfile?.locked_fields || [],
          approvalRequiredFields: updatedProfile?.approval_required_fields || [],
          walletEnabled: updatedProfile?.wallet_enabled || false,
          
          lastUpdated: updatedProfile?.updated_at || new Date().toISOString()
        }

        return res.status(200).json({
          success: true,
          data: updatedUser,
          message: 'User updated successfully'
        })

      } catch (updateError) {
        console.error('User update error:', updateError)
        return res.status(500).json({ error: 'Failed to update user' })
      }

    } else if (req.method === 'POST') {
      // Create new user (Company Admin can create users)
      const { email, password, role, firstName, lastName, artistName } = req.body

      if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required' })
      }

      try {
        // Create auth user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: { role },
          email_confirm: true
        })

        if (createError) {
          return res.status(400).json({ error: createError.message })
        }

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: newUser.user.id,
            email: newUser.user.email,
            first_name: firstName || '',
            last_name: lastName || '',
            artist_name: artistName || '',
            profile_completed: false,
            registration_stage: 'basic_info',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          // Clean up auth user if profile creation fails
          await supabase.auth.admin.deleteUser(newUser.user.id)
          return res.status(400).json({ error: `Profile creation failed: ${profileError.message}` })
        }

        return res.status(201).json({
          success: true,
          data: {
            id: newUser.user.id,
            email: newUser.user.email,
            role,
            firstName: firstName || '',
            lastName: lastName || '',
            artistName: artistName || ''
          },
          message: 'User created successfully'
        })

      } catch (createError) {
        console.error('User creation error:', createError)
        return res.status(500).json({ error: 'Failed to create user' })
      }

    } else if (req.method === 'DELETE') {
      // Delete user (Company Admin can delete users)
      const { targetUserId } = req.body

      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID is required' })
      }

      try {
        // Delete user profile first
        const { error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', targetUserId)

        // Delete auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(targetUserId)

        if (authError) {
          return res.status(400).json({ error: authError.message })
        }

        return res.status(200).json({
          success: true,
          message: 'User deleted successfully'
        })

      } catch (deleteError) {
        console.error('User deletion error:', deleteError)
        return res.status(500).json({ error: 'Failed to delete user' })
      }

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('User management error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to process user management request'
    })
  }
}
