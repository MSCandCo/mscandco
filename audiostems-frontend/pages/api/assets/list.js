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

    // For now, we'll create mock assets with real artist associations
    // In production, this would query actual assets table
    // Get all artists first to create realistic asset associations
    const { data: artists, error: artistsError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, artist_name')
      .not('artist_name', 'is', null)
      .not('artist_name', 'eq', '')

    if (artistsError) {
      console.error('Error fetching artists for assets:', artistsError)
      return res.status(500).json({ error: 'Failed to fetch artist data' })
    }

    // Create realistic assets based on actual artists
    const mockAssets = []
    artists.forEach((artist, index) => {
      const artistName = artist.artist_name
      const baseAssets = [
        { name: `${artistName} - Lost in Time`, type: 'Single', genre: 'Pop' },
        { name: `${artistName} - Midnight Dreams`, type: 'Single', genre: 'R&B' },
        { name: `${artistName} - Summer Vibes EP`, type: 'EP', genre: 'Electronic' },
        { name: `${artistName} - City Lights`, type: 'Single', genre: 'Hip Hop' },
        { name: `${artistName} - Acoustic Sessions`, type: 'Album', genre: 'Acoustic' }
      ]

      baseAssets.forEach((asset, assetIndex) => {
        mockAssets.push({
          id: `asset_${index}_${assetIndex}`,
          name: asset.name,
          type: asset.type,
          genre: asset.genre,
          artist: {
            id: artist.id,
            email: artist.email,
            name: `${artist.first_name || ''} ${artist.last_name || ''}`.trim(),
            stageName: artist.artist_name,
            displayName: artist.artist_name
          },
          releaseDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          status: 'published'
        })
      })
    })

    // Apply search filter if provided
    let filteredAssets = mockAssets
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase()
      filteredAssets = mockAssets.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm) ||
        asset.artist.stageName.toLowerCase().includes(searchTerm) ||
        asset.artist.email.toLowerCase().includes(searchTerm) ||
        asset.type.toLowerCase().includes(searchTerm) ||
        asset.genre.toLowerCase().includes(searchTerm)
      )
    }

    // Sort by asset name and limit for performance
    filteredAssets = filteredAssets
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 100)

    console.log(`🎵 Found ${filteredAssets.length} assets${search ? ` matching "${search}"` : ''}`)

    res.status(200).json({
      success: true,
      assets: filteredAssets,
      count: filteredAssets.length
    })

  } catch (error) {
    console.error('Assets list error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch assets'
    })
  }
}
