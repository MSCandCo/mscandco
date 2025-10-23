import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/rbac/middleware'
import { hasPermission } from '@/lib/rbac/roles'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check delete permission
    const canDelete = await hasPermission(req.userRole, 'content:asset_library:delete', req.user.id)
    if (!canDelete) {
      return res.status(403).json({ error: 'Insufficient permissions to delete assets' })
    }

    const { bucket_id, full_path, file_ids } = req.body

    if (!bucket_id || (!full_path && !file_ids)) {
      return res.status(400).json({ error: 'Missing required fields: bucket_id and (full_path or file_ids)' })
    }

    console.log('🗑️ Deleting file(s) from storage...')

    let deleteResults = []

    if (file_ids && Array.isArray(file_ids)) {
      // Bulk delete multiple files
      console.log(`🗑️ Bulk deleting ${file_ids.length} files`)

      for (const fileData of file_ids) {
        const { error } = await supabase.storage
          .from(fileData.bucket_id)
          .remove([fileData.full_path])

        if (error) {
          console.error(`❌ Error deleting file ${fileData.full_path}:`, error)
          deleteResults.push({
            path: fileData.full_path,
            success: false,
            error: error.message
          })
        } else {
          console.log(`✅ Deleted file: ${fileData.full_path}`)
          deleteResults.push({
            path: fileData.full_path,
            success: true
          })
        }
      }

      const successCount = deleteResults.filter(r => r.success).length
      const failCount = deleteResults.filter(r => !r.success).length

      return res.status(200).json({
        success: successCount > 0,
        message: `Deleted ${successCount} file(s)${failCount > 0 ? `, ${failCount} failed` : ''}`,
        results: deleteResults
      })
    } else {
      // Single file delete
      const { error } = await supabase.storage
        .from(bucket_id)
        .remove([full_path])

      if (error) {
        console.error('❌ Error deleting file:', error)
        return res.status(500).json({
          error: 'Failed to delete file',
          details: error.message
        })
      }

      console.log('✅ File deleted successfully:', full_path)
      return res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      })
    }

  } catch (error) {
    console.error('❌ Error in asset library delete API:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}

// Requires authentication - permission checks are done inside handler
export default requireAuth(handler)
