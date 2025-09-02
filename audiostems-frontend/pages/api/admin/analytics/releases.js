// Admin API for managing artist releases
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Server-side Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    const userRole = decoded?.user_metadata?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check admin permissions from user metadata (correct source)
    const isAdmin = ['super_admin', 'company_admin'].includes(userRole);
    console.log('🔐 Admin check:', { userId, userRole, isAdmin });

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
        console.log('❌ Admin permission denied:', { userId, userRole });
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

      console.log('💾 Saving release data:', { 
        artistId, 
        title, 
        artist, 
        releaseType, 
        platformsCount: platforms?.length || 0,
        isLive 
      });

      // If setting as live, unset other live releases for this artist
      if (isLive) {
        const { error: updateError } = await supabase
          .from('artist_releases')
          .update({ is_live: false })
          .eq('artist_id', artistId);
          
        if (updateError) {
          console.log('⚠️ Error updating other releases:', updateError);
        }
      }

      // Insert new release
      const { data: release, error } = await supabase
        .from('artist_releases')
        .insert({
          artist_id: artistId,
          title: title || '',
          artist: artist || '',
          featuring: featuring || null,
          release_date: releaseDate || null,
          release_type: releaseType || '',
          audio_file_url: audioFileUrl || null,
          cover_image_url: coverImageUrl || null,
          platforms: platforms || [],
          is_live: isLive || false,
          status: 'live'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database insert error:', error);
        return res.status(500).json({ error: 'Failed to create release', details: error.message });
      }

      console.log('✅ Release saved successfully:', release.id);
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
