// API Key rotation system
const YOUTUBE_API_KEYS = [
  process.env.YOUTUBE_API_KEY_1,
  process.env.YOUTUBE_API_KEY_2,
  process.env.YOUTUBE_API_KEY_3,
  process.env.YOUTUBE_API_KEY_4,
  process.env.YOUTUBE_API_KEY_5
].filter(Boolean)

let currentKeyIndex = 0

async function getWorkingApiKey() {
  const startingIndex = currentKeyIndex
  
  do {
    const apiKey = YOUTUBE_API_KEYS[currentKeyIndex]
    console.log(`Testing API key ${currentKeyIndex + 1}/5`)
    
    try {
      // Test with minimal quota usage
      const testUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=gospel&type=video&maxResults=1`
      const response = await fetch(testUrl)
      const data = await response.json()
      
      if (!data.error) {
        console.log(`✅ API key ${currentKeyIndex + 1} working`)
        return apiKey
      } 
      
      if (data.error?.errors?.[0]?.reason === 'quotaExceeded') {
        console.log(`❌ API key ${currentKeyIndex + 1} quota exceeded`)
      } else {
        console.log(`❌ API key ${currentKeyIndex + 1} error:`, data.error?.message)
      }
      
    } catch (error) {
      console.log(`❌ API key ${currentKeyIndex + 1} network error:`, error.message)
    }
    
    // Move to next key
    currentKeyIndex = (currentKeyIndex + 1) % YOUTUBE_API_KEYS.length
    
  } while (currentKeyIndex !== startingIndex)
  
  throw new Error('All 5 YouTube API keys have exceeded quota or failed')
}

// Enhanced search function that combines search + videos endpoints
async function searchYouTubeVideos(apiKey, searchTerm, publishedAfter) {
  try {
    // Step 1: Use search endpoint to get video IDs
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    searchUrl.searchParams.append('key', apiKey)
    searchUrl.searchParams.append('q', searchTerm)
    searchUrl.searchParams.append('type', 'video')
    searchUrl.searchParams.append('publishedAfter', publishedAfter)
    searchUrl.searchParams.append('order', 'relevance') // Changed from 'date' to 'relevance'
            searchUrl.searchParams.append('maxResults', '8') // Reduced for faster loading
    searchUrl.searchParams.append('videoDuration', 'medium')
    searchUrl.searchParams.append('videoDefinition', 'high')
    searchUrl.searchParams.append('videoEmbeddable', 'true')
    searchUrl.searchParams.append('safeSearch', 'moderate')

    console.log(`🔍 Enhanced search: ${searchTerm}`)
    
    const searchResponse = await fetch(searchUrl.toString())
    const searchData = await searchResponse.json()
    
    if (searchData.error) {
      console.log(`❌ Search API error for "${searchTerm}":`, searchData.error.message)
      return []
    }
    
    if (!searchData.items?.length) {
      console.log(`📦 No search results for: ${searchTerm}`)
      return []
    }

    console.log(`📦 Found ${searchData.items.length} search results for: ${searchTerm}`)

    // Step 2: Get detailed video info using videos endpoint
    const videoIds = searchData.items.map(item => item.id.videoId).join(',')
    
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
    videosUrl.searchParams.append('key', apiKey)
    videosUrl.searchParams.append('id', videoIds)
    videosUrl.searchParams.append('part', 'snippet,statistics,contentDetails,status')
    
    const videosResponse = await fetch(videosUrl.toString())
    const videosData = await videosResponse.json()
    
    if (videosData.error) {
      console.log(`❌ Videos API error for "${searchTerm}":`, videosData.error.message)
      return []
    }
    
    if (!videosData.items?.length) {
      console.log(`📦 No video details for: ${searchTerm}`)
      return []
    }

    console.log(`📊 Got details for ${videosData.items.length} videos`)

    // Step 3: Filter and format results
    const validVideos = videosData.items
      .filter(video => {
        // Filter out unavailable videos
        if (video.status?.uploadStatus !== 'processed') return false
        if (video.status?.privacyStatus !== 'public') return false
        
        // Filter by duration (3-20 minutes for music videos)
        const duration = video.contentDetails?.duration
        if (duration) {
          const match = duration.match(/PT(\d+)M(\d+)S/)
          if (match) {
            const minutes = parseInt(match[1]) + parseInt(match[2]) / 60
            if (minutes < 2 || minutes > 20) return false
          }
        }
        
        // Must have view count (indicates it's accessible)
        if (!video.statistics?.viewCount) return false
        
        return true
      })
      .map(video => {
        // Determine region and genre
        const title = video.snippet.title.toLowerCase()
        const channelTitle = video.snippet.channelTitle.toLowerCase()
        const description = video.snippet.description?.toLowerCase() || ''
        
        let region = 'International'
        if (searchTerm.includes('nigerian') || title.includes('nigeria') || channelTitle.includes('nigeria')) region = 'Nigerian'
        else if (searchTerm.includes('south african') || title.includes('south africa')) region = 'South African'
        else if (searchTerm.includes('ghanaian') || title.includes('ghana')) region = 'Ghanaian'
        else if (searchTerm.includes('kenyan') || title.includes('kenya')) region = 'Kenyan'
        else if (searchTerm.includes('american') || searchTerm.includes('southern')) region = 'American'
        else if (searchTerm.includes('uk') || searchTerm.includes('british')) region = 'British'
        
        let genre = 'Gospel'
        if (searchTerm.includes('contemporary christian') || searchTerm.includes('hillsong') || searchTerm.includes('bethel')) {
          genre = 'Contemporary Christian'
        }
        
        return {
          id: `youtube-${video.id}`,
          title: video.snippet.title,
          artist: video.snippet.channelTitle,
          thumbnail: video.snippet.thumbnails.maxres?.url || 
                     video.snippet.thumbnails.high?.url || 
                     video.snippet.thumbnails.medium?.url,
          genre: genre,
          region: region,
          youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
          publishedAt: video.snippet.publishedAt,
          viewCount: parseInt(video.statistics.viewCount),
          source: 'youtube-enhanced',
          duration: video.contentDetails.duration,
          searchTerm: searchTerm
        }
      })
      // Sort by view count to get popular/accessible videos
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 3) // Take top 3 from each search

    console.log(`✅ Found ${validVideos.length} valid videos for: ${searchTerm}`)
    return validVideos

  } catch (error) {
    console.error(`❌ Enhanced search failed for "${searchTerm}":`, error.message)
    return []
  }
}

// Curated African/Nigerian Gospel content as fallback
function createRecentGospelContent() {
  return [
    {
      id: 'youtube-fallback-1',
      title: 'Sinach - Way Maker (Live)',
      artist: 'Sinach',
      thumbnail: 'https://i.ytimg.com/vi/29IWl6dws1w/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=29IWl6dws1w',
      publishedAt: '2024-01-15T10:00:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-2',
      title: 'Mercy Chinwo - Excess Love',
      artist: 'Mercy Chinwo',
      thumbnail: 'https://i.ytimg.com/vi/YhQipwl6qi8/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=YhQipwl6qi8',
      publishedAt: '2024-02-10T14:30:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-3',
      title: 'Tim Godfrey - Nara (Live)',
      artist: 'Tim Godfrey',
      thumbnail: 'https://i.ytimg.com/vi/a-3yk4FKUSY/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=a-3yk4FKUSY',
      publishedAt: '2024-03-05T16:45:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-4',
      title: 'Nathaniel Bassey - Hallelujah Challenge',
      artist: 'Nathaniel Bassey',
      thumbnail: 'https://i.ytimg.com/vi/VFdB2HBxHQs/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=VFdB2HBxHQs',
      publishedAt: '2024-04-12T09:20:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-5',
      title: 'Tope Alabi - Logan Ti Ode',
      artist: 'Tope Alabi',
      thumbnail: 'https://i.ytimg.com/vi/8bGl4d_xjPY/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=8bGl4d_xjPY',
      publishedAt: '2024-05-18T11:15:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-6',
      title: 'Dunsin Oyekan - Fragrance to Fire',
      artist: 'Dunsin Oyekan',
      thumbnail: 'https://i.ytimg.com/vi/GUm8jxGVaWA/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=GUm8jxGVaWA',
      publishedAt: '2024-06-22T13:40:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-7',
      title: 'Eben - Victory',
      artist: 'Eben',
      thumbnail: 'https://i.ytimg.com/vi/Hs3yAyNiyt8/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=Hs3yAyNiyt8',
      publishedAt: '2024-07-08T15:25:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-8',
      title: 'Frank Edwards - Mma Mma',
      artist: 'Frank Edwards',
      thumbnail: 'https://i.ytimg.com/vi/8jYTcSQYB7w/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=8jYTcSQYB7w',
      publishedAt: '2024-08-14T12:10:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-9',
      title: 'Preye Odede - Bulie',
      artist: 'Preye Odede',
      thumbnail: 'https://i.ytimg.com/vi/xCZ4-mx1iMk/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=xCZ4-mx1iMk',
      publishedAt: '2024-09-20T17:30:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-10',
      title: 'Ada Ehi - Fix My Eyes',
      artist: 'Ada Ehi',
      thumbnail: 'https://i.ytimg.com/vi/ZUPyCgqGAQQ/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=ZUPyCgqGAQQ',
      publishedAt: '2024-10-05T14:50:00Z',
      source: 'curated'
    }
  ]
}

// Main API handler
export default async function handler(req, res) {
  console.log('=== ENHANCED INTERNATIONAL GOSPEL SEARCH - API ROTATION ===')
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get working API key
    const YOUTUBE_API_KEY = await getWorkingApiKey()
    
    // Date filter: last 2 years (more flexible)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    const publishedAfter = twoYearsAgo.toISOString()

    // Reduced search terms for faster loading (6 instead of 12)
    const searchTerms = [
      // Nigerian Gospel (primary focus)
      'Nigerian gospel music 2024 official video',
      'Afrobeats gospel Nigeria music video',
      
      // African Gospel
      'South African gospel 2024 music video',
      'Ghana gospel songs 2024 official',
      
      // Contemporary Christian
      'Contemporary christian music 2024 official',
      'Hillsong worship 2024 official video'
    ]

    let allVideos = []

    // Use enhanced search for each term
    for (const searchTerm of searchTerms) {
      const videos = await searchYouTubeVideos(YOUTUBE_API_KEY, searchTerm, publishedAfter)
      allVideos.push(...videos)
      
      // Reduced delay for faster loading
      await new Promise(resolve => setTimeout(resolve, 150))
    }

    // Remove duplicates by URL and artist (each artist appears only once)
    const uniqueVideos = []
    const seenUrls = new Set()
    const seenArtists = new Set()
    
    // Sort by view count first to prioritize popular videos
    const sortedVideos = allVideos.sort((a, b) => b.viewCount - a.viewCount)
    
    for (const video of sortedVideos) {
      // Skip if we've seen this URL
      if (seenUrls.has(video.youtubeUrl)) continue
      
      // Skip if we've seen this artist (case-insensitive)
      const artistKey = video.artist.toLowerCase().trim()
      if (seenArtists.has(artistKey)) continue
      
      // Add to unique collection
      uniqueVideos.push(video)
      seenUrls.add(video.youtubeUrl)
      seenArtists.add(artistKey)
      
      // Stop when we have enough videos
      if (uniqueVideos.length >= 15) break
    }

    const finalVideos = uniqueVideos
    
    console.log(`🎉 Final result: ${finalVideos.length} videos from API key ${currentKeyIndex + 1}`)

    res.status(200).json({
      success: true,
      data: finalVideos,
      sources: {
        youtube: finalVideos.length,
        apiKeyUsed: currentKeyIndex + 1,
        regions: [...new Set(finalVideos.map(v => v.region))],
        enhanced: true
      }
    })

  } catch (error) {
    console.error('❌ All API keys failed:', error.message)
    
    // Fallback to curated content
    const fallbackVideos = createRecentGospelContent()
    
    res.status(200).json({
      success: true,
      data: fallbackVideos,
      sources: {
        youtube: 0,
        curated: fallbackVideos.length,
        fallback: true,
        message: 'All YouTube API keys exhausted - using curated content'
      }
    })
  }
}