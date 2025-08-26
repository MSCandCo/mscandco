export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get Chartmetric access token
    const tokenResponse = await fetch('https://api.chartmetric.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshtoken: process.env.CHARTMETRIC_REFRESH_TOKEN
      })
    })

    const { token } = await tokenResponse.json()

    // Fetch latest Gospel/Christian releases from YouTube
    const releasesResponse = await fetch('https://api.chartmetric.com/api/youtube/videos/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'gospel christian worship praise',
        max_results: 20,
        order: 'date',
        published_after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Last 30 days
      })
    })

    const chartmetricData = await releasesResponse.json()

    // Format Chartmetric data
    const formattedReleases = chartmetricData.obj?.items?.map(video => ({
      id: `chartmetric-${video.id}`,
      title: video.snippet?.title || 'Unknown Title',
      artist: video.snippet?.channelTitle || 'Unknown Artist',
      thumbnail: video.snippet?.thumbnails?.maxres?.url || 
                 video.snippet?.thumbnails?.high?.url ||
                 video.snippet?.thumbnails?.default?.url,
      genre: 'Gospel',
      youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
      source: 'chartmetric',
      publishedAt: video.snippet?.publishedAt
    })) || []

    res.status(200).json({
      success: true,
      data: formattedReleases.slice(0, 10) // Limit to 10 from Chartmetric
    })

  } catch (error) {
    console.error('Chartmetric API error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch Chartmetric data',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}
