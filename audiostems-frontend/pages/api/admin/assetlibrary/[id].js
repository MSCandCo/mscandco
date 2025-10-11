import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  const { id } = req.query;
  const { action } = req.body || {};

  try {
    if (req.method === 'GET') {
      // Get single file details
      console.log('📁 Fetching file details for:', id);

      const { data: file, error } = await supabase
        .from('media_files')
        .select(`
          *,
          uploader:uploaded_by (
            id,
            first_name,
            last_name,
            display_name,
            email,
            artist_name
          ),
          deleter:deleted_by (
            id,
            first_name,
            last_name,
            display_name,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching file:', error);
        return res.status(500).json({ error: 'Failed to fetch file' });
      }

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      return res.status(200).json({ success: true, file });
    }

    if (req.method === 'DELETE') {
      // Soft delete - move to recycle bin
      console.log('🗑️ Soft deleting file:', id);

      const { data, error } = await supabase
        .from('media_files')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          deleted_by: req.user.id,
          delete_reason: req.body.reason || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error deleting file:', error);
        return res.status(500).json({ error: 'Failed to delete file' });
      }

      console.log('✅ File moved to recycle bin');
      return res.status(200).json({
        success: true,
        message: 'File moved to recycle bin (90-day retention)',
        file: data
      });
    }

    if (req.method === 'POST') {
      // Handle different actions
      if (action === 'restore') {
        // Restore from recycle bin
        console.log('♻️ Restoring file:', id);

        const { data, error } = await supabase
          .from('media_files')
          .update({
            status: 'active',
            deleted_at: null,
            deleted_by: null,
            permanent_delete_at: null,
            delete_reason: null
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error restoring file:', error);
          return res.status(500).json({ error: 'Failed to restore file' });
        }

        console.log('✅ File restored');
        return res.status(200).json({
          success: true,
          message: 'File restored successfully',
          file: data
        });
      }

      if (action === 'permanent_delete') {
        // Permanent delete
        console.log('💀 Permanently deleting file:', id);

        // Get file details first for logging
        const { data: fileData } = await supabase
          .from('media_files')
          .select('file_name, file_path')
          .eq('id', id)
          .single();

        const { error } = await supabase
          .from('media_files')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('❌ Error permanently deleting file:', error);
          return res.status(500).json({ error: 'Failed to permanently delete file' });
        }

        console.log('✅ File permanently deleted:', fileData?.file_name);
        return res.status(200).json({
          success: true,
          message: 'File permanently deleted'
        });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Error in asset library [id] API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requirePermission('*:*:*')(handler);
