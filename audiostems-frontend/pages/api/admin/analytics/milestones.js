// Admin API for managing artist milestones
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
    console.log('🔐 Milestones admin check:', { userId, userRole, isAdmin });

    if (req.method === 'GET') {
      // Get milestones for specific artist
      const { artistId, category } = req.query;
      
      if (!artistId) {
        return res.status(400).json({ error: 'Artist ID required' });
      }

      let query = supabase
        .from('artist_milestones')
        .select('*')
        .eq('artist_id', artistId);

      if (category) {
        query = query.eq('category', category);
      }

      const { data: milestones, error } = await query
        .order('milestone_date', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch milestones' });
      }

      // Calculate relative dates (e.g., "2 days ago")
      const milestonesWithRelativeDates = milestones.map(milestone => ({
        ...milestone,
        relativeDate: calculateRelativeDate(milestone.milestone_date)
      }));

      return res.json({
        success: true,
        data: milestonesWithRelativeDates,
        isAdmin
      });
    }

    if (req.method === 'POST') {
      // Create/update milestones (admin only)
      if (!isAdmin) {
        console.log('❌ Milestones admin permission denied:', { userId, userRole });
        return res.status(403).json({ error: 'Admin permissions required' });
      }

      const { artistId, milestones } = req.body;

      if (!artistId) {
        return res.status(400).json({ error: 'Artist ID required' });
      }

      console.log('💾 Saving milestones data:', { 
        artistId, 
        milestonesCount: milestones?.length || 0,
        milestones: milestones 
      });

      // Delete existing milestones for this artist
      const { error: deleteError } = await supabase
        .from('artist_milestones')
        .delete()
        .eq('artist_id', artistId);

      if (deleteError) {
        console.log('⚠️ Error deleting old milestones:', deleteError);
      }

      // Insert new milestones (only if they have content)
      const validMilestones = milestones.filter(m => m.title || m.tag || m.milestone || m.date);
      
      if (validMilestones.length === 0) {
        console.log('✅ No milestones to save (all empty)');
        return res.json({
          success: true,
          message: 'Empty milestones cleared successfully'
        });
      }

      const { data: savedMilestones, error } = await supabase
        .from('artist_milestones')
        .insert(validMilestones.map(milestone => ({
          artist_id: artistId,
          title: milestone.title || '',
          highlight: milestone.tag || '', // Map 'tag' to 'highlight' 
          description: milestone.milestone || '', // Map 'milestone' to 'description'
          milestone_date: milestone.date || new Date().toISOString().split('T')[0],
          category: 'basic' // All milestones are basic since managed from basic tab
        })))
        .select();

      if (error) {
        console.error('❌ Database insert error (milestones):', error);
        return res.status(500).json({ error: 'Failed to create milestones', details: error.message });
      }

      console.log('✅ Milestones saved successfully:', savedMilestones?.length || 0);
      return res.json({
        success: true,
        data: savedMilestones,
        message: `${savedMilestones?.length || 0} milestones saved successfully`
      });
    }

    if (req.method === 'PUT') {
      // Update milestone (admin only)
      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin permissions required' });
      }

      const { id } = req.query;
      const updateData = req.body;

      const { data: milestone, error } = await supabase
        .from('artist_milestones')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update milestone' });
      }

      return res.json({
        success: true,
        data: milestone,
        message: 'Milestone updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Delete milestone (admin only)
      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin permissions required' });
      }

      const { id } = req.query;

      const { error } = await supabase
        .from('artist_milestones')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Failed to delete milestone' });
      }

      return res.json({
        success: true,
        message: 'Milestone deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Admin milestones API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Helper function to calculate relative dates
function calculateRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}
