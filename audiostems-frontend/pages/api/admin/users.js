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
    if (userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Super Admin access required' })
    }

    if (req.method === 'GET') {
      // Get all users with their profiles and subscription info
      const [authUsersResult, profilesResult, subscriptionsResult] = await Promise.all([
        supabase.auth.admin.listUsers(),
        supabase.from('user_profiles').select('*'),
        supabase.from('subscriptions').select('*')
      ])

      const authUsers = authUsersResult.data?.users || []
      const profiles = profilesResult.data || []
      const subscriptions = subscriptionsResult.data || []

      // Combine auth users with their profiles and subscriptions
      const users = authUsers.map(authUser => {
        const profile = profiles.find(p => p.id === authUser.id)
        const subscription = subscriptions.find(s => s.user_id === authUser.id)
        
        // Determine role with proper fallback logic
        let userRole = authUser.user_metadata?.role || profile?.role
        
        // Email-based role detection for known users (same as other APIs)
        if (!userRole) {
          const userEmail = authUser.email
          if (userEmail === 'superadmin@mscandco.com') {
            userRole = 'super_admin'
          } else if (userEmail === 'companyadmin@mscandco.com') {
            userRole = 'company_admin'
          } else if (userEmail === 'labeladmin@mscandco.com') {
            userRole = 'label_admin'
          } else if (userEmail === 'codegroup@mscandco.com') {
            userRole = 'distribution_partner'
          } else if (userEmail.includes('codegroup') || userEmail.includes('code-group')) {
            userRole = 'distribution_partner'
          } else {
            userRole = 'artist'
          }
        }

        return {
          id: authUser.id,
          email: authUser.email,
          role: userRole,
          status: authUser.email_confirmed_at ? 'active' : 'pending',
          createdAt: authUser.created_at,
          lastSignIn: authUser.last_sign_in_at,
          
          // Profile information
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          artistName: profile?.artist_name || '',
          phone: profile?.phone || '',
          country: profile?.country || '',
          bio: profile?.bio || '',
          
          // Subscription information
          subscription: subscription ? {
            tier: subscription.tier,
            status: subscription.status,
            amount: subscription.amount,
            currency: subscription.currency,
            billingCycle: subscription.billing_cycle,
            currentPeriodEnd: subscription.current_period_end
          } : null,
          
          // Calculated fields
          totalReleases: profile?.releases_count || 0,
          totalEarnings: profile?.wallet_balance || 0,
          profileCompleted: profile?.profile_completed || false
        }
      })

      return res.status(200).json({
        success: true,
        data: users,
        count: users.length,
        timestamp: new Date().toISOString()
      })

    } else if (req.method === 'POST') {
      // Create new user
      const { email, password, role, firstName, lastName, artistName } = req.body

      if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required' })
      }

      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { role },
        email_confirm: true
      })

      if (authError) {
        return res.status(400).json({ error: authError.message })
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authUser.user.id,
          email: email,
          first_name: firstName || '',
          last_name: lastName || '',
          artist_name: artistName || '',
          profile_completed: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        // If profile creation fails, clean up auth user
        await supabase.auth.admin.deleteUser(authUser.user.id)
        return res.status(400).json({ error: profileError.message })
      }

      return res.status(201).json({
        success: true,
        data: {
          id: authUser.user.id,
          email: authUser.user.email,
          role: role,
          firstName: firstName || '',
          lastName: lastName || '',
          artistName: artistName || '',
          status: 'active',
          createdAt: authUser.user.created_at
        },
        message: 'User created successfully'
      })

    } else if (req.method === 'PUT') {
      // Update existing user
      const { userId, updates } = req.body

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      const authUpdates = {}
      const profileUpdates = {}

      // Prepare auth updates
      if (updates.email) authUpdates.email = updates.email
      if (updates.role) authUpdates.user_metadata = { role: updates.role }

      // Prepare profile updates
      if (updates.firstName !== undefined) profileUpdates.first_name = updates.firstName
      if (updates.lastName !== undefined) profileUpdates.last_name = updates.lastName
      if (updates.artistName !== undefined) profileUpdates.artist_name = updates.artistName
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone
      if (updates.country !== undefined) profileUpdates.country = updates.country
      if (updates.bio !== undefined) profileUpdates.bio = updates.bio

      profileUpdates.updated_at = new Date().toISOString()

      // Update auth user if needed
      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdates)
        if (authError) {
          return res.status(400).json({ error: authError.message })
        }
      }

      // Update profile if needed
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('id', userId)

        if (profileError) {
          return res.status(400).json({ error: profileError.message })
        }
      }

      return res.status(200).json({
        success: true,
        message: 'User updated successfully'
      })

    } else if (req.method === 'DELETE') {
      // Delete user
      const { userId } = req.body

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      // Delete user profile first
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        return res.status(400).json({ error: authError.message })
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('User management error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to process user request'
    })
  }
}
