// Admin API for managing artist releases
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

// Add user roles
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  ARTIST: 'artist'
};

// Check if user has admin permissions
async function checkAdminPermissions(userId) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  return profile?.role === USER_ROLES.SUPER_ADMIN || profile?.role === USER_ROLES.COMPANY_ADMIN;
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

    const isAdmin = await checkAdminPermissions(userId);

    if (req.method === 'GET') {
      // Get releases for specific artist
      const { artistId } = req.query;
      
      if (!artistId) {
        return res.status(400).json({ error: 'Artist ID required' });
      }

      const { data: releases, error } = await supabase
        .from('artist_releases')
        .select('*')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch releases' });
      }

      return res.json({
        success: true,
        data: releases,
        isAdmin
      });
    }

    if (req.method === 'POST') {
      // Create new release (admin only)
      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin permissions required' });
      }

      const {
        artistId,
        title,
        artist,
        featuring,
        releaseDate,
        releaseType,
        audioFileUrl,
        coverImageUrl,
        platforms,
        isLive
      } = req.body;

      // If setting as live, unset other live releases for this artist
      if (isLive) {
        await supabase
          .from('artist_releases')
          .update({ is_live: false })
          .eq('artist_id', artistId);
      }

      const { data: release, error } = await supabase
        .from('artist_releases')
        .insert({
          artist_id: artistId,
          title,
          artist,
          featuring,
          release_date: releaseDate,
          release_type: releaseType,
          audio_file_url: audioFileUrl,
          cover_image_url: coverImageUrl,
          platforms: platforms || [],
          is_live: isLive,
          status: 'live'
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to create release', details: error.message });
      }

      return res.json({
        success: true,
        data: release,
        message: 'Release created successfully'
      });
    }

    if (req.method === 'PUT') {
      // Update release (admin only)
      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin permissions required' });
      }

      const { id } = req.query;
      const updateData = req.body;

      // If setting as live, unset other live releases for this artist
      if (updateData.isLive) {
        await supabase
          .from('artist_releases')
          .update({ is_live: false })
          .eq('artist_id', updateData.artistId);
      }

      const { data: release, error } = await supabase
        .from('artist_releases')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update release' });
      }

      return res.json({
        success: true,
        data: release,
        message: 'Release updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Delete release (admin only)
      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin permissions required' });
      }

      const { id } = req.query;

      const { error } = await supabase
        .from('artist_releases')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Failed to delete release' });
      }

      return res.json({
        success: true,
        message: 'Release deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Admin releases API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
