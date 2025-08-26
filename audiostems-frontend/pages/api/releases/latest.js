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

// Curated International Gospel/CCM content as fallback
function createRecentGospelContent() {
  return [
    // Keep 6 African/Nigerian artists
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
      title: 'Dunsin Oyekan - Fragrance to Fire',
      artist: 'Dunsin Oyekan',
      thumbnail: 'https://i.ytimg.com/vi/GUm8jxGVaWA/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=GUm8jxGVaWA',
      publishedAt: '2024-06-22T13:40:00Z',
      source: 'curated'
    },
    // Add 1 Ghanaian artist
    {
      id: 'youtube-fallback-6',
      title: 'Joe Mettle - Bo Noo Ni',
      artist: 'Joe Mettle',
      thumbnail: 'https://i.ytimg.com/vi/YQQ2StSwg54/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Ghanaian',
      youtubeUrl: 'https://www.youtube.com/watch?v=YQQ2StSwg54',
      publishedAt: '2024-08-14T12:10:00Z',
      source: 'curated'
    },
    
    // Add 2 Zambian artists
    {
      id: 'youtube-fallback-7',
      title: 'Pompi - Luyando',
      artist: 'Pompi',
      thumbnail: 'https://i.ytimg.com/vi/qJCRnkHP0Z4/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Zambian',
      youtubeUrl: 'https://www.youtube.com/watch?v=qJCRnkHP0Z4',
      publishedAt: '2024-07-08T15:25:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-8',
      title: 'Esther Chungu - Jehovah',
      artist: 'Esther Chungu',
      thumbnail: 'https://i.ytimg.com/vi/2KHYeEQswQs/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Zambian',
      youtubeUrl: 'https://www.youtube.com/watch?v=2KHYeEQswQs',
      publishedAt: '2024-08-14T12:10:00Z',
      source: 'curated'
    },
    
    // Add 1 South African artist
    {
      id: 'youtube-fallback-9',
      title: 'Benjamin Dube - Elshadai',
      artist: 'Benjamin Dube',
      thumbnail: 'https://i.ytimg.com/vi/kOvwMz_BcUM/hqdefault.jpg',
      genre: 'Gospel',
      region: 'South African',
      youtubeUrl: 'https://www.youtube.com/watch?v=kOvwMz_BcUM',
      publishedAt: '2024-09-20T17:30:00Z',
      source: 'curated'
    },
    
    // Add 1 Zimbabwean artist
    {
      id: 'youtube-fallback-10',
      title: 'Takesure Zamar - Ndinewe',
      artist: 'Takesure Zamar',
      thumbnail: 'https://i.ytimg.com/vi/8Ey6urBAnlw/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Zimbabwean',
      youtubeUrl: 'https://www.youtube.com/watch?v=8Ey6urBAnlw',
      publishedAt: '2024-10-05T14:50:00Z',
      source: 'curated'
    },
    
    // Add Called Out Music
    {
      id: 'youtube-fallback-11',
      title: 'CalledOut Music - Ancient of Days x Open The Eyes of my Heart (Live Video)',
      artist: 'CalledOut Music',
      thumbnail: 'https://i.ytimg.com/vi/3BVEbM0bDwc/hqdefault.jpg',
      genre: 'Gospel',
      region: 'British',
      youtubeUrl: 'https://www.youtube.com/watch?v=3BVEbM0bDwc',
      publishedAt: '2024-11-10T16:20:00Z',
      source: 'curated'
    },
    
    // Add Annatoria
    {
      id: 'youtube-fallback-12',
      title: 'Hasn\'t By Now (Music Video) | Woman Evolve Worship X Annatoria',
      artist: 'Annatoria',
      thumbnail: 'https://i.ytimg.com/vi/lOOX0NaYb5M/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=lOOX0NaYb5M',
      publishedAt: '2024-11-15T18:45:00Z',
      source: 'curated'
    },
    
    // Add Limoblaze
    {
      id: 'youtube-fallback-13',
      title: 'Limoblaze - Jireh (My Provider)',
      artist: 'Limoblaze',
      thumbnail: 'https://i.ytimg.com/vi/Ex4IcpJHNzA/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=Ex4IcpJHNzA',
      publishedAt: '2024-11-20T14:30:00Z',
      source: 'curated'
    },
    
    // Add Charles Dada
    {
      id: 'youtube-fallback-14',
      title: 'Praise & Worship with Charles Dada | Gateway Chapel | LIVE Praise',
      artist: 'Charles Dada',
      thumbnail: 'https://i.ytimg.com/vi/DXDGE_lRI0E/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=DXDGE_lRI0E',
      publishedAt: '2024-11-25T12:15:00Z',
      source: 'curated'
    },
    
    // Add Annatoria x Warehouse Worship Medley
    {
      id: 'youtube-fallback-21',
      title: 'Annatoria x Warehouse Worship Medley - Nothing Else / It\'s all about you / Jesus at the Center',
      artist: 'Annatoria x Warehouse Worship',
      thumbnail: 'https://i.ytimg.com/vi/F3zt1adPmCc/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=F3zt1adPmCc',
      publishedAt: '2024-12-02T14:20:00Z',
      source: 'curated'
    },
    
    // Add RCCG Festival Of Life London 2019 - Charles Dada
    {
      id: 'youtube-fallback-22',
      title: 'RCCG Festival Of Life London 2019 - Praise and Worship - Charles Dada',
      artist: 'Charles Dada',
      thumbnail: 'https://i.ytimg.com/vi/Jbe7OruLk8I/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=Jbe7OruLk8I',
      publishedAt: '2024-12-03T16:45:00Z',
      source: 'curated'
    },
    
    // Add American Gospel/CCM artists (keeping 2)
    {
      id: 'youtube-fallback-15',
      title: 'Chris Tomlin - How Great Is Our God',
      artist: 'Chris Tomlin',
      thumbnail: 'https://i.ytimg.com/vi/KO2YMxhkEtE/hqdefault.jpg',
      genre: 'Contemporary Christian',
      region: 'American',
      youtubeUrl: 'https://www.youtube.com/watch?v=KO2YMxhkEtE',
      publishedAt: '2024-07-08T15:25:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-16',
      title: 'Bethel Music - Goodness of God',
      artist: 'Bethel Music',
      thumbnail: 'https://i.ytimg.com/vi/cnyVFp8rGwE/hqdefault.jpg',
      genre: 'Contemporary Christian',
      region: 'American',
      youtubeUrl: 'https://www.youtube.com/watch?v=cnyVFp8rGwE',
      publishedAt: '2024-09-20T17:30:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-17',
      title: 'Maverick City Music - Jireh',
      artist: 'Maverick City Music',
      thumbnail: 'https://i.ytimg.com/vi/QvLxZEU02uI/hqdefault.jpg',
      genre: 'Contemporary Christian',
      region: 'American',
      youtubeUrl: 'https://www.youtube.com/watch?v=QvLxZEU02uI',
      publishedAt: '2024-10-05T14:50:00Z',
      source: 'curated'
    },
    
    // Add British Gospel/CCM artists (keeping 2)
    {
      id: 'youtube-fallback-18',
      title: 'Hillsong London - What A Beautiful Name',
      artist: 'Hillsong London',
      thumbnail: 'https://i.ytimg.com/vi/nQWFzMvCfLE/hqdefault.jpg',
      genre: 'Contemporary Christian',
      region: 'British',
      youtubeUrl: 'https://www.youtube.com/watch?v=nQWFzMvCfLE',
      publishedAt: '2024-11-10T16:20:00Z',
      source: 'curated'
    },
    {
      id: 'youtube-fallback-19',
      title: 'Rend Collective - My Lighthouse',
      artist: 'Rend Collective',
      thumbnail: 'https://i.ytimg.com/vi/lOOX0NaYb5M/hqdefault.jpg',
      genre: 'Contemporary Christian',
      region: 'British',
      youtubeUrl: 'https://www.youtube.com/watch?v=lOOX0NaYb5M',
      publishedAt: '2024-11-15T18:45:00Z',
      source: 'curated'
    },
    
    // Add Michael Oyo - Bamisee
    {
      id: 'youtube-fallback-20',
      title: 'Michael Oyo - Bamisee',
      artist: 'Michael Oyo',
      thumbnail: 'https://i.ytimg.com/vi/DbLxPnkr_e0/hqdefault.jpg',
      genre: 'Gospel',
      region: 'Nigerian',
      youtubeUrl: 'https://www.youtube.com/watch?v=DbLxPnkr_e0',
      publishedAt: '2024-12-01T10:30:00Z',
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

  // Detect mobile devices for optimized response
  const userAgent = req.headers['user-agent'] || ''
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  console.log(`📱 ${isMobile ? 'Mobile' : 'Desktop'} request detected`)

  // Set timeout for mobile requests (8 seconds)
  if (isMobile) {
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        console.log('⏰ Mobile timeout reached, returning fallback')
        return res.status(200).json({
          success: true,
          data: createRecentGospelContent(),
          sources: {
            youtube: 0,
            fallback: 22,
            timeout: true,
            mobile: true
          }
        })
      }
    }, 8000)
    
    // Clear timeout if response is sent
    res.on('finish', () => clearTimeout(timeoutId))
  }

  try {
    // Get working API key
    const YOUTUBE_API_KEY = await getWorkingApiKey()
    
    // Date filter: last 2 years (more flexible)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    const publishedAfter = twoYearsAgo.toISOString()

    // Reduced search terms for mobile to speed up response
    const searchTerms = isMobile ? [
      'Nigerian gospel music 2024',
      'Contemporary christian 2024',
      'Hillsong worship 2024'
    ] : [
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
    
    console.log(`🔍 Using ${searchTerms.length} search terms for ${isMobile ? 'mobile' : 'desktop'}`)

    let allVideos = []

    // Use enhanced search for each term
    for (const searchTerm of searchTerms) {
      const videos = await searchYouTubeVideos(YOUTUBE_API_KEY, searchTerm, publishedAfter)
      allVideos.push(...videos)
      
      // Shorter delay for mobile, longer for desktop
      await new Promise(resolve => setTimeout(resolve, isMobile ? 100 : 150))
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
    
    console.log(`🎉 Final result: ${finalVideos.length} videos from API key ${currentKeyIndex + 1} (${isMobile ? 'mobile' : 'desktop'})`)

    res.status(200).json({
      success: true,
      data: finalVideos,
      sources: {
        youtube: finalVideos.length,
        apiKeyUsed: currentKeyIndex + 1,
        regions: [...new Set(finalVideos.map(v => v.region))],
        enhanced: true,
        mobile: isMobile,
        searchTermsUsed: searchTerms.length
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
        mobile: isMobile,
        error: error.message,
        message: 'All YouTube API keys exhausted - using curated content'
      }
    })
  }
}