import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default async function handler(req, res) {
  // Only allow authenticated requests
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Verify the token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Check if user has admin permissions (super_admin or admin role)
  const userRole = user.user_metadata?.role
  if (userRole !== 'super_admin' && userRole !== 'admin') {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetUsers(req, res)
      case 'PUT':
        return await handleUpdateUser(req, res)
      case 'DELETE':
        return await handleDeleteUser(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

async function handleGetUsers(req, res) {
  // Fetch all users from auth
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    throw new Error(`Failed to fetch auth users: ${authError.message}`)
  }

  // Fetch all user profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError) {
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
  }

  // Merge auth and profile data
  const mergedUsers = authUsers.map(authUser => {
    const profile = profiles.find(p => p.id === authUser.id) || {}
    return {
      id: authUser.id,
      email: authUser.email,
      role: authUser.user_metadata?.role || profile.role || 'artist',
      status: profile.status || 'active',
      first_name: profile.first_name || authUser.user_metadata?.first_name || '',
      last_name: profile.last_name || authUser.user_metadata?.last_name || '',
      created_at: authUser.created_at || profile.created_at,
      last_sign_in_at: authUser.last_sign_in_at,
      email_confirmed_at: authUser.email_confirmed_at,
      ...profile
    }
  })

  return res.status(200).json({
    success: true,
    users: mergedUsers
  })
}

async function handleUpdateUser(req, res) {
  const { userId, updates } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  // Update auth user metadata if role is being changed
  if (updates.role) {
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: { role: updates.role }
      }
    )

    if (authError) {
      throw new Error(`Failed to update auth user: ${authError.message}`)
    }
  }

  // Update user profile
  const profileUpdates = { ...updates }
  delete profileUpdates.email // Can't update email in profiles table

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update(profileUpdates)
      .eq('id', userId)

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }
  }

  return res.status(200).json({
    success: true,
    message: 'User updated successfully'
  })
}

async function handleDeleteUser(req, res) {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  // Soft delete in user_profiles
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({
      status: 'deleted',
      deleted_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (profileError) {
    throw new Error(`Failed to delete profile: ${profileError.message}`)
  }

  return res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  })
}
