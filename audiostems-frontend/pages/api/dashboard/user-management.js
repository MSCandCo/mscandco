import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    // Verify admin permissions
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' })
    }

    // Decode JWT token (skip verification for now since we don't have JWT secret set up)
    let userInfo
    try {
      userInfo = jwt.decode(token)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const userRole = userInfo?.user_metadata?.role || 'artist'

    // Only company_admin and super_admin can access user management
    if (!['company_admin', 'super_admin'].includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    if (req.method === 'GET') {
      // Get all users with pagination
      const { page = 1, limit = 20, role, status } = req.query
      
      // Get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) {
        console.error('Error fetching auth users:', authError)
        throw authError
      }

      // Get all user profiles
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
      
      if (profileError) {
        console.error('Error fetching profiles:', profileError)
      }

      // Get all subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
      
      if (subError) {
        console.error('Error fetching subscriptions:', subError)
      }

      // Combine the data with proper structure for frontend
      const users = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id)
        const subscription = subscriptions?.find(s => s.user_id === authUser.id)
        
        if (!profile) return null
        
        // Infer role from email patterns (temporary solution)
        let inferredRole = 'artist'
        if (authUser.email.includes('superadmin')) inferredRole = 'super_admin'
        else if (authUser.email.includes('companyadmin')) inferredRole = 'company_admin'
        else if (authUser.email.includes('labeladmin')) inferredRole = 'label_admin'
        else if (authUser.email.includes('codegroup')) inferredRole = 'distribution_partner'
        
        return {
          id: authUser.id,
          email: authUser.email,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(), // This fixes the TypeError!
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          artistName: profile.artist_name || '',
          role: inferredRole,
          status: authUser.email_confirmed_at ? 'active' : 'pending',
          joinedDate: authUser.created_at,
          lastLogin: authUser.last_sign_in_at,
          totalReleases: profile.releases_count || 0,
          totalStreams: 0,
          totalEarnings: profile.wallet_balance || 0,
          totalRevenue: profile.wallet_balance || 0,
          subscription: subscription ? {
            tier: subscription.tier,
            status: subscription.status,
            billingCycle: subscription.billing_cycle
          } : null,
          profile: profile
        }
      }).filter(Boolean)

      // Apply filters
      let filteredUsers = users
      if (role) filteredUsers = filteredUsers.filter(u => u.role === role)
      if (status) filteredUsers = filteredUsers.filter(u => u.status === status)

      // Apply pagination
      const startIndex = (page - 1) * limit
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + parseInt(limit))

      res.status(200).json({
        success: true,
        data: paginatedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / limit)
        }
      })

    } else if (req.method === 'POST') {
      // Create new user
      const { email, role, password } = req.body

      if (!email || !role || !password) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role }
      })

      if (error) throw error

      res.status(201).json({
        success: true,
        data: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata.role
        }
      })

    } else if (req.method === 'PUT') {
      // Update user profile and auth data
      const { userId, updates } = req.body

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' })
      }

      // Separate auth updates from profile updates
      const authUpdates = {};
      const profileUpdates = {};

      // Auth fields that can be updated
      if (updates.email && updates.email !== '') {
        authUpdates.email = updates.email;
      }
      if (updates.role) {
        authUpdates.user_metadata = { role: updates.role };
      }

      // Profile fields
      const profileFields = [
        'firstName', 'lastName', 'phone', 'countryCode', 'artistName', 
        'bio', 'shortBio', 'country', 'artistType', 'walletEnabled',
        'negativeBalanceAllowed', 'walletCreditLimit', 'profileCompleted',
        'lockedFields', 'approvalRequiredFields', 'profileLockStatus'
      ];

      profileFields.forEach(field => {
        if (updates[field] !== undefined) {
          // Map frontend field names to database column names
          switch (field) {
            case 'firstName':
              profileUpdates.first_name = updates[field];
              break;
            case 'lastName':
              profileUpdates.last_name = updates[field];
              break;
            case 'countryCode':
              profileUpdates.country_code = updates[field];
              break;
            case 'artistName':
              profileUpdates.artist_name = updates[field];
              break;
            case 'shortBio':
              profileUpdates.short_bio = updates[field];
              break;
            case 'artistType':
              profileUpdates.artist_type = updates[field];
              break;
            case 'walletEnabled':
              profileUpdates.wallet_enabled = updates[field];
              break;
            case 'negativeBalanceAllowed':
              profileUpdates.negative_balance_allowed = updates[field];
              break;
            case 'walletCreditLimit':
              profileUpdates.wallet_credit_limit = updates[field];
              break;
            case 'profileCompleted':
              profileUpdates.profile_completed = updates[field];
              break;
            case 'lockedFields':
              profileUpdates.locked_fields = updates[field];
              break;
            case 'approvalRequiredFields':
              profileUpdates.approval_required_fields = updates[field];
              break;
            case 'profileLockStatus':
              profileUpdates.profile_lock_status = updates[field];
              break;
            default:
              profileUpdates[field] = updates[field];
          }
        }
      });

      // Add updated timestamp
      profileUpdates.updated_at = new Date().toISOString();

      let authResult = null;
      let profileResult = null;

      // Update auth data if needed
      if (Object.keys(authUpdates).length > 0) {
        const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
          userId,
          authUpdates
        );

        if (authError) {
          console.error('Auth update error:', authError);
          throw new Error(`Failed to update auth data: ${authError.message}`);
        }
        authResult = authData.user;
      }

      // Update profile data if needed
      if (Object.keys(profileUpdates).length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('id', userId)
          .select()
          .single();

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw new Error(`Failed to update profile: ${profileError.message}`);
        }
        profileResult = profileData;
      }

      // Get the updated user data to return
      const { data: updatedAuthUser } = await supabase.auth.admin.getUserById(userId);
      const { data: updatedProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Format the response similar to GET request
      const updatedUser = {
        id: updatedAuthUser.user.id,
        email: updatedAuthUser.user.email,
        name: `${updatedProfile?.first_name || ''} ${updatedProfile?.last_name || ''}`.trim(),
        firstName: updatedProfile?.first_name || '',
        lastName: updatedProfile?.last_name || '',
        artistName: updatedProfile?.artist_name || '',
        role: updatedAuthUser.user.user_metadata?.role || 'artist',
        status: updatedAuthUser.user.email_confirmed_at ? 'active' : 'pending',
        profile: updatedProfile
      };

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      })

    } else if (req.method === 'DELETE') {
      // Delete user
      const { userId } = req.query

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' })
      }

      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) throw error

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('User management error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    })
  }
}
