// Get milestones for artist
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { artistId, type } = req.query;

    if (!artistId) {
      return res.status(400).json({ error: 'Artist ID required' });
    }

    if (req.method === 'GET') {
      console.log('🏆 Fetching milestones for artist:', artistId, 'type:', type);

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
        console.error('❌ Database error:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
      }

      // Calculate relative dates
      const milestonesWithDates = milestones.map(milestone => ({
        ...milestone,
        relative_date: calculateRelativeDate(milestone.milestone_date)
      }));

      console.log('📦 Milestones found:', milestonesWithDates.length);

      return res.json({
        success: true,
        data: milestonesWithDates
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
