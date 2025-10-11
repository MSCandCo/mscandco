import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧹 Running cleanup for expired files...');

    // Call the cleanup function
    const { data, error } = await supabase.rpc('cleanup_expired_media_files');

    if (error) {
      console.error('❌ Error running cleanup:', error);
      return res.status(500).json({
        error: 'Failed to run cleanup',
        details: error.message
      });
    }

    const deletedCount = data || 0;

    console.log(`✅ Cleanup complete. Deleted ${deletedCount} expired files`);

    return res.status(200).json({
      success: true,
      message: `Cleanup complete. ${deletedCount} files permanently deleted.`,
      deleted_count: deletedCount
    });

  } catch (error) {
    console.error('❌ Error in cleanup API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requirePermission('*:*:*')(handler);
