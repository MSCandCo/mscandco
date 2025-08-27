import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Get search query parameter
    const { search } = req.query

    // Build query for user profiles with artist role
    let query = supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, artist_name')
      .not('artist_name', 'is', null)
      .not('artist_name', 'eq', '')

    // Add search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase()
      query = query.or(`artist_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    }

    // Execute query with limit for performance
    const { data: artists, error } = await query
      .order('artist_name')
      .limit(100)

    if (error) {
      console.error('Error fetching artists:', error)
      return res.status(500).json({ error: 'Failed to fetch artists' })
    }

    // Transform data for frontend
    const transformedArtists = artists.map(artist => ({
      id: artist.id,
      email: artist.email,
      name: `${artist.first_name || ''} ${artist.last_name || ''}`.trim(),
      stageName: artist.artist_name,
      displayName: artist.artist_name || `${artist.first_name || ''} ${artist.last_name || ''}`.trim()
    }))

    console.log(`📋 Found ${transformedArtists.length} artists${search ? ` matching "${search}"` : ''}`)

    res.status(200).json({
      success: true,
      artists: transformedArtists,
      count: transformedArtists.length
    })

  } catch (error) {
    console.error('Artists list error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch artists'
    })
  }
}
