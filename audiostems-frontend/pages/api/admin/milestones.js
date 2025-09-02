// Admin routes for milestones management
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Simplified auth for testing
    const isAdmin = true; // TODO: Implement proper admin check
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      // Get milestones for artist
      const { artistId, type } = req.query;
      
      if (!artistId) {
        return res.status(400).json({ error: 'Artist ID required' });
      }

      let query = supabase
        .from('milestones')
        .select('*')
        .eq('artist_id', artistId);

      if (type) {
        query = query.eq('analytics_type', type);
      }

      const { data: milestones, error } = await query
        .order('milestone_date', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Database error', details: error.message });
      }

      // Calculate relative dates
      const milestonesWithDates = milestones.map(milestone => ({
        ...milestone,
        relative_date: calculateRelativeDate(milestone.milestone_date)
      }));

      return res.json({
        success: true,
        data: milestonesWithDates
      });
    }

    if (req.method === 'POST') {
      // Create new milestone
      const {
        artistId,
        title,
        highlight,
        description,
        milestoneDate,
        analyticsType
      } = req.body;

      const { data: milestone, error } = await supabase
        .from('milestones')
        .insert({
          artist_id: artistId,
          title: title || '',
          highlight: highlight || '',
          description: description || '',
          milestone_date: milestoneDate || new Date().toISOString().split('T')[0],
          analytics_type: analyticsType || 'basic'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating milestone:', error);
        return res.status(500).json({ error: 'Failed to create milestone', details: error.message });
      }

      console.log('✅ Milestone created:', milestone.id);
      return res.json({
        success: true,
        data: milestone,
        message: 'Milestone created successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Delete milestone
      const { id } = req.query;

      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Failed to delete milestone', details: error.message });
      }

      return res.json({
        success: true,
        message: 'Milestone deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Milestones API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Helper function for relative dates
function calculateRelativeDate(dateString) {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}
