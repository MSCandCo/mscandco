// Admin API for managing artist milestones
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
      // Create new milestone (admin only)
      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin permissions required' });
      }

      const {
        artistId,
        title,
        highlight,
        description,
        milestoneDate,
        category
      } = req.body;

      const { data: milestone, error } = await supabase
        .from('artist_milestones')
        .insert({
          artist_id: artistId,
          title,
          highlight,
          description,
          milestone_date: milestoneDate,
          category: category || 'advanced'
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to create milestone', details: error.message });
      }

      return res.json({
        success: true,
        data: milestone,
        message: 'Milestone created successfully'
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
