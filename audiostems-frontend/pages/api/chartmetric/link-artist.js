// Chartmetric Artist Linking API
// Allows users to link their profile to a Chartmetric artist ID for real analytics data

import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const CHARTMETRIC_API_BASE = 'https://api.chartmetric.com/api';

// Get Chartmetric access token
async function getChartmetricToken() {
  if (!process.env.CHARTMETRIC_REFRESH_TOKEN) {
    throw new Error('Chartmetric API not configured');
  }

  const response = await fetch(`${CHARTMETRIC_API_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshtoken: process.env.CHARTMETRIC_REFRESH_TOKEN
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get Chartmetric token');
  }

  const data = await response.json();
  return data.token;
}

// Search for artists in Chartmetric
async function searchChartmetricArtists(query, token) {
  const response = await fetch(`${CHARTMETRIC_API_BASE}/search?q=${encodeURIComponent(query)}&type=artists&limit=10`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to search Chartmetric artists');
  }

  return response.json();
}

// Get detailed artist information
async function getArtistDetails(artistId, token) {
  const response = await fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get artist details for ID ${artistId}`);
  }

  return response.json();
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

    const chartmetricToken = await getChartmetricToken();

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

      console.log('🔗 Linking artist:', { artistId, artistName, verified, userId });

      if (!artistId || !artistName) {
        console.error('Missing required fields:', { artistId, artistName });
        return res.status(400).json({ error: 'Artist ID and name are required' });
      }

      // Verify the artist exists in Chartmetric
      try {
        console.log('Verifying artist in Chartmetric:', artistId);
        const artistDetails = await getArtistDetails(artistId, chartmetricToken);
        console.log('Artist verified:', artistDetails?.obj?.name || 'Unknown');
        
        // Update user profile with Chartmetric artist link
        console.log('💾 Updating user profile in Supabase for user:', userId);
        const { error } = await supabase
          .from('user_profiles')
          .update({
            chartmetric_artist_id: artistId,
            chartmetric_artist_name: artistName,
            chartmetric_verified: verified,
            chartmetric_linked_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('Supabase update error:', error);
          return res.status(500).json({ 
            error: 'Failed to link artist profile',
            details: error.message,
            code: error.code
          });
        }

        console.log('Artist linked successfully');

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
        console.error('Artist verification/linking error:', error);
        return res.status(400).json({ 
          error: 'Invalid artist ID or artist not found in Chartmetric',
          details: error.message
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