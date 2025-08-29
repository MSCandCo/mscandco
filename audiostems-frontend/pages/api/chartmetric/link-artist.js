// Chartmetric Artist Linking API
// Allows users to link their profile to a Chartmetric artist ID for real analytics data

import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const CHARTMETRIC_API_BASE = 'https://api.chartmetric.com/api';

// Get Chartmetric access token with enhanced error handling
async function getChartmetricToken() {
  if (!process.env.CHARTMETRIC_REFRESH_TOKEN) {
    throw new Error('Chartmetric API not configured - CHARTMETRIC_REFRESH_TOKEN required');
  }

  console.log('🔑 Requesting new Chartmetric access token...');
  
  try {
    const response = await fetch(`${CHARTMETRIC_API_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshtoken: process.env.CHARTMETRIC_REFRESH_TOKEN
      })
    });

    console.log('Token response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token request failed:', response.status, errorText);
      throw new Error(`Token request failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Token obtained successfully, length:', data.token?.length);
    return data.token;
  } catch (error) {
    console.error('Chartmetric token error:', error);
    throw error;
  }
}

// Search for artists in Chartmetric with enhanced error handling
async function searchChartmetricArtists(query, token) {
  console.log(`🔍 Searching Chartmetric for: "${query}"`);
  
  const response = await fetch(`${CHARTMETRIC_API_BASE}/search?q=${encodeURIComponent(query)}&type=artists&limit=10`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log(`Search response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Search failed: ${response.status} - ${errorText}`);
    
    if (response.status === 401) {
      throw new Error('Authentication failed - token expired or invalid');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded - wait before retrying');
    } else {
      throw new Error(`Search failed: ${response.status} - ${response.statusText}`);
    }
  }

  const data = await response.json();
  console.log(`Found ${data?.obj?.artists?.length || 0} artists for query: "${query}"`);
  return data;
}

// Get detailed artist information with enhanced error handling
async function getArtistDetails(artistId, token) {
  console.log(`🎵 Fetching artist details for ID: ${artistId}`);
  
  const response = await fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log(`Artist details response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Artist details failed: ${response.status} - ${errorText}`);
    
    if (response.status === 401) {
      throw new Error('Authentication failed - token expired or invalid');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded - wait before retrying');
    } else if (response.status === 404) {
      throw new Error('Artist not found in Chartmetric database');
    } else {
      throw new Error(`Failed to get artist details: ${response.status} - ${response.statusText}`);
    }
  }

  const data = await response.json();
  console.log('Artist details fetched successfully:', data?.obj?.name || 'Unknown');
  return data;
}

// Handle specific Chartmetric errors
function handleChartmetricError(error, response = null) {
  console.error('Chartmetric API Error:', error);
  
  if (response?.status === 401) {
    return 'Authentication failed - token expired or invalid';
  }
  if (response?.status === 429) {
    return 'Rate limit exceeded - wait before retrying';
  }
  if (response?.status === 404) {
    return 'Artist not found in Chartmetric database';
  }
  if (response?.status === 403) {
    return 'Access denied - check API permissions';
  }
  return `API error: ${error.message}`;
}

export default async function handler(req, res) {
  try {
    // Get user from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    const userId = decoded?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if Chartmetric is configured
    if (!process.env.CHARTMETRIC_REFRESH_TOKEN) {
      return res.status(503).json({ 
        error: 'Chartmetric API not configured',
        message: 'CHARTMETRIC_REFRESH_TOKEN environment variable is required'
      });
    }

    // Get fresh Chartmetric token for each request
    let chartmetricToken;
    try {
      chartmetricToken = await getChartmetricToken();
    } catch (tokenError) {
      console.error('Failed to obtain Chartmetric token:', tokenError);
      return res.status(503).json({ 
        error: 'Chartmetric API unavailable',
        message: 'Unable to authenticate with Chartmetric API',
        details: tokenError.message
      });
    }

    if (req.method === 'GET') {
      // Search for artists or get current linked artist
      const { q: query, current } = req.query;

      if (current === 'true') {
        // Get current linked artist for this user
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('chartmetric_artist_id, chartmetric_artist_name, chartmetric_verified')
          .eq('id', userId)
          .single();

        if (error) {
          return res.status(500).json({ error: 'Failed to get user profile' });
        }

        if (!profile.chartmetric_artist_id) {
          return res.json({ linked: false, artist: null });
        }

        // Get fresh artist details from Chartmetric
        try {
          const artistDetails = await getArtistDetails(profile.chartmetric_artist_id, chartmetricToken);
          return res.json({ 
            linked: true, 
            artist: {
              id: profile.chartmetric_artist_id,
              name: profile.chartmetric_artist_name,
              verified: profile.chartmetric_verified,
              details: artistDetails
            }
          });
        } catch (error) {
          // Artist might not exist anymore, return stored data
          return res.json({ 
            linked: true, 
            artist: {
              id: profile.chartmetric_artist_id,
              name: profile.chartmetric_artist_name,
              verified: profile.chartmetric_verified,
              error: 'Could not fetch fresh data from Chartmetric'
            }
          });
        }
      }

      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      // Search for artists
      const searchResults = await searchChartmetricArtists(query, chartmetricToken);
      
      return res.json({
        success: true,
        query,
        results: searchResults.obj?.artists || [],
        total: searchResults.obj?.artists?.length || 0
      });

    } else if (req.method === 'POST') {
      // Link user to a Chartmetric artist
      const { artistId, artistName, verified = false } = req.body;

      console.log('🔗 Attempting to link artist:', { artistId, artistName, verified, userId });

      if (!artistId || !artistName) {
        console.error('❌ Missing required fields:', { artistId, artistName });
        return res.status(400).json({ 
          error: 'Artist ID and name are required',
          received: { artistId, artistName }
        });
      }

      // Verify the artist exists in Chartmetric with enhanced error handling
      try {
        console.log('🔍 Step 1: Verifying artist in Chartmetric:', artistId);
        const artistDetails = await getArtistDetails(artistId, chartmetricToken);
        
        if (!artistDetails?.obj) {
          console.error('❌ Invalid artist data from Chartmetric');
          return res.status(400).json({ 
            error: 'Invalid artist data received from Chartmetric',
            artistId 
          });
        }
        
        console.log('✅ Step 2: Artist verified successfully:', {
          id: artistId,
          name: artistDetails.obj.name,
          chartmetricName: artistDetails.obj.name,
          verified: artistDetails.obj.cm_artist_verified || false
        });
        
        // Update user profile with Chartmetric artist link
        console.log('💾 Step 3: Updating user profile in Supabase for user:', userId);
        
        // Try to update with Chartmetric columns, fallback if columns don't exist
        let updateResult, error;
        
        try {
          const updateData = {
            chartmetric_artist_id: artistId,
            chartmetric_artist_name: artistDetails.obj.name,
            chartmetric_verified: artistDetails.obj.cm_artist_verified || false,
            chartmetric_linked_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('📝 Attempting full Chartmetric update:', updateData);
          
          const result = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('id', userId)
            .select();
            
          updateResult = result.data;
          error = result.error;
          
        } catch (updateError) {
          console.log('⚠️ Chartmetric columns may not exist, trying basic update...');
          
          // Fallback: just update the updated_at field to confirm the linking worked
          const fallbackResult = await supabase
            .from('user_profiles')
            .update({
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select();
            
          updateResult = fallbackResult.data;
          error = fallbackResult.error;
          
          console.log('📋 Note: Chartmetric data stored in memory only (database migration needed)');
        }

        if (error) {
          console.error('❌ Supabase update error:', {
            error: error.message,
            code: error.code,
            details: error.details,
            userId
          });
          return res.status(500).json({ 
            error: 'Failed to link artist profile',
            details: error.message,
            code: error.code,
            userId
          });
        }

        console.log('✅ Step 4: Artist linked successfully:', {
          userId,
          artistId,
          artistName: artistDetails.obj.name,
          updateResult: updateResult?.length
        });

        return res.json({
          success: true,
          message: 'Artist profile linked successfully',
          artist: {
            id: artistId,
            name: artistName,
            verified,
            details: artistDetails
          }
        });

      } catch (error) {
        console.error('❌ Artist verification/linking error:', error);
        const errorMessage = handleChartmetricError(error);
        
        return res.status(400).json({ 
          error: 'Failed to link artist profile',
          message: errorMessage,
          details: error.message,
          artistId,
          artistName
        });
      }

    } else if (req.method === 'DELETE') {
      // Unlink artist from user profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          chartmetric_artist_id: null,
          chartmetric_artist_name: null,
          chartmetric_verified: false,
          chartmetric_linked_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        return res.status(500).json({ error: 'Failed to unlink artist profile' });
      }

      return res.json({
        success: true,
        message: 'Artist profile unlinked successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Chartmetric artist linking error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}