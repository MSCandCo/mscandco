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
      bucket = 'all',
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      per_page = 50
    } = req.query;

    console.log('📁 Fetching files from storage...');

    // Use Supabase storage list API to get ALL files from all buckets
    const { data: buckets } = await supabase.storage.listBuckets();
    let allFiles = [];

    console.log(`📦 Found ${buckets?.length || 0} storage buckets`);

    for (const bucketItem of buckets || []) {
      if (bucket !== 'all' && bucketItem.id !== bucket) continue;

      console.log(`📂 Listing files in bucket: ${bucketItem.id}`);

      // List all files in this bucket recursively
      const { data: bucketFiles, error: listError } = await supabase.storage
        .from(bucketItem.id)
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) {
        console.error(`❌ Error listing bucket ${bucketItem.id}:`, listError);
        continue;
      }

      if (bucketFiles) {
        // For each folder/user, list their files
        for (const item of bucketFiles) {
          if (item.id === null) {
            // This is a folder, list files inside it
            const { data: folderFiles } = await supabase.storage
              .from(bucketItem.id)
              .list(item.name, {
                limit: 1000
              });

            if (folderFiles) {
              allFiles = allFiles.concat(
                folderFiles.map(f => ({
                  id: f.id,
                  name: `${item.name}/${f.name}`,
                  bucket_id: bucketItem.id,
                  bucket_public: bucketItem.public,
                  created_at: f.created_at,
                  updated_at: f.updated_at,
                  metadata: f.metadata || {}
                }))
              );
            }
          } else {
            // This is a file at root level
            allFiles.push({
              id: item.id,
              name: item.name,
              bucket_id: bucketItem.id,
              bucket_public: bucketItem.public,
              created_at: item.created_at,
              updated_at: item.updated_at,
              metadata: item.metadata || {}
            });
          }
        }
      }
    }

    console.log(`📊 Total files found: ${allFiles.length}`);

    // Apply search filter
    if (search) {
      allFiles = allFiles.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort files
    allFiles.sort((a, b) => {
      const aValue = sort_by === 'name' ? a.name : new Date(a[sort_by] || a.created_at).getTime();
      const bValue = sort_by === 'name' ? b.name : new Date(b[sort_by] || b.created_at).getTime();

      if (sort_order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(per_page);
    const paginatedFiles = allFiles.slice(offset, offset + parseInt(per_page));

    // Get unique user IDs from paginated files
    const userIds = [...new Set(
      paginatedFiles
        .map(f => {
          const pathParts = f.name.split('/');
          return pathParts.length > 1 ? pathParts[0] : null;
        })
        .filter(id => id !== null)
    )];

    // Fetch user emails from auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers();

    const userMap = {};
    authUsers?.users?.forEach(u => {
      userMap[u.id] = u.email || 'Unknown';
    });

    console.log(`✅ Returning ${paginatedFiles.length} files (page ${page})`);

    return res.status(200).json({
      success: true,
      files: enrichFiles(paginatedFiles, userMap),
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: allFiles.length,
        total_pages: Math.ceil(allFiles.length / parseInt(per_page))
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

function enrichFiles(files, userMap = {}) {
  return files.map(file => {
    const metadata = typeof file.metadata === 'string'
      ? JSON.parse(file.metadata)
      : (file.metadata || {});

    const size = metadata.size || metadata.contentLength || 0;
    const mimetype = metadata.mimetype || 'unknown';

    // Extract file type from mimetype
    const fileType = mimetype.split('/')[0] || 'unknown';

    // Extract user ID from path (format: userId/filename)
    const pathParts = file.name.split('/');
    const userId = pathParts.length > 1 ? pathParts[0] : null;

    return {
      id: file.id,
      name: file.name.split('/').pop(), // Get filename without path
      full_path: file.name,
      bucket_id: file.bucket_id,
      bucket_public: file.bucket_public,
      file_type: fileType,
      file_size: size,
      file_size_mb: (size / (1024 * 1024)).toFixed(2),
      file_size_gb: (size / (1024 * 1024 * 1024)).toFixed(3),
      mimetype: mimetype,
      owner_id: userId,
      owner_email: userId ? (userMap[userId] || 'Unknown') : 'System',
      created_at: file.created_at,
      updated_at: file.updated_at,
      storage_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${file.bucket_public ? 'public' : 'authenticated'}/${file.bucket_id}/${file.name}`
    };
  });
}

// Requires read permission for asset library (V2 Permission System)
export default requirePermission('content:asset_library:read')(handler);
