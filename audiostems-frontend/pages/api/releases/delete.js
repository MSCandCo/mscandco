// Delete release API
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Release ID is required' });
  }

  try {
    console.log('🗑️ Deleting release:', id);

    // Delete the release
    const { error } = await supabase
      .from('releases')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Database delete error:', error);
      return res.status(500).json({ 
        error: 'Failed to delete release', 
        details: error.message 
      });
    }

    console.log('✅ Release deleted successfully:', id);
    
    return res.json({
      success: true,
      message: 'Release deleted successfully'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Protect with release delete permissions (OR logic)
export default requirePermission(['release:delete:own', 'release:delete:label'])(handler);
