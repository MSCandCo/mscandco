import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      status = 'active',
      file_type,
      uploaded_by,
      entity_type,
      category,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      per_page = 50
    } = req.query;

    console.log('📁 Fetching media files...');

    // Build query
    let query = supabase
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
      `, { count: 'exact' });

    // Apply filters
    if (status === 'all') {
      // No status filter
    } else {
      query = query.eq('status', status);
    }

    if (file_type) {
      query = query.eq('file_type', file_type);
    }

    if (uploaded_by) {
      query = query.eq('uploaded_by', uploaded_by);
    }

    if (entity_type) {
      query = query.eq('entity_type', entity_type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('file_name', `%${search}%`);
    }

    // Sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(per_page);
    query = query.range(offset, offset + parseInt(per_page) - 1);

    const { data: files, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching media files:', error);
      return res.status(500).json({
        error: 'Failed to fetch media files',
        details: error.message
      });
    }

    // Enrich data with formatted information
    const enrichedFiles = files.map(file => ({
      ...file,
      uploader_name: file.uploader?.artist_name ||
                    file.uploader?.display_name ||
                    `${file.uploader?.first_name || ''} ${file.uploader?.last_name || ''}`.trim() ||
                    file.uploader?.email ||
                    'Unknown',
      deleter_name: file.deleter ? (
        file.deleter?.display_name ||
        `${file.deleter?.first_name || ''} ${file.deleter?.last_name || ''}`.trim() ||
        file.deleter?.email ||
        'Unknown'
      ) : null,
      file_size_mb: (file.file_size / (1024 * 1024)).toFixed(2),
      days_until_permanent_delete: file.permanent_delete_at
        ? Math.ceil((new Date(file.permanent_delete_at) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    }));

    console.log(`✅ Found ${files.length} media files`);

    return res.status(200).json({
      success: true,
      files: enrichedFiles,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: count,
        total_pages: Math.ceil(count / parseInt(per_page))
      }
    });

  } catch (error) {
    console.error('❌ Error in asset library API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Only superadmins can access
export default requirePermission('*:*:*')(handler);
