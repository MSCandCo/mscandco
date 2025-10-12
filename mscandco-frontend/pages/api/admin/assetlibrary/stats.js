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
    console.log('📊 Fetching asset library statistics from storage...');

    // Get all buckets and files from storage
    const { data: buckets } = await supabase.storage.listBuckets();
    let allFiles = [];

    for (const bucketItem of buckets || []) {
      const { data: bucketFiles } = await supabase.storage
        .from(bucketItem.id)
        .list('', {
          limit: 1000
        });

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
                  created_at: f.created_at,
                  metadata: f.metadata || {},
                  owner: item.name // folder name is user ID
                }))
              );
            }
          } else {
            // This is a file at root level
            allFiles.push({
              id: item.id,
              name: item.name,
              bucket_id: bucketItem.id,
              created_at: item.created_at,
              metadata: item.metadata || {},
              owner: null
            });
          }
        }
      }
    }

    // Calculate statistics
    const totalFiles = allFiles.length;

    const totalStorage = allFiles.reduce((sum, f) => {
      const size = f.metadata?.size || f.metadata?.contentLength || 0;
      return sum + parseInt(size);
    }, 0);

    // Storage by bucket
    const storageByBucket = {};
    const countByBucket = {};
    allFiles.forEach(f => {
      const bucket = f.bucket_id || 'unknown';
      const size = f.metadata?.size || f.metadata?.contentLength || 0;
      storageByBucket[bucket] = (storageByBucket[bucket] || 0) + parseInt(size);
      countByBucket[bucket] = (countByBucket[bucket] || 0) + 1;
    });

    // Storage by file type
    const storageByType = {};
    const countByType = {};
    allFiles.forEach(f => {
      const mimetype = f.metadata?.mimetype || 'unknown';
      const type = mimetype.split('/')[0] || 'unknown';
      const size = f.metadata?.size || f.metadata?.contentLength || 0;
      storageByType[type] = (storageByType[type] || 0) + parseInt(size);
      countByType[type] = (countByType[type] || 0) + 1;
    });

    // Storage by user
    const storageByUser = {};
    const countByUser = {};
    allFiles.forEach(f => {
      const userId = f.owner;
      if (userId) {
        const size = f.metadata?.size || f.metadata?.contentLength || 0;
        storageByUser[userId] = (storageByUser[userId] || 0) + parseInt(size);
        countByUser[userId] = (countByUser[userId] || 0) + 1;
      }
    });

    // Top users by storage
    const topUsers = Object.entries(storageByUser)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Get user details for top users
    const topUserIds = topUsers.map(([userId]) => userId);
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, display_name, artist_name, email')
      .in('id', topUserIds);

    const userMap = {};
    userProfiles?.forEach(u => {
      userMap[u.id] = u.artist_name || u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
    });

    const topUsersWithNames = topUsers.map(([userId, storage]) => ({
      user_id: userId,
      user_name: userMap[userId] || 'Unknown',
      storage_bytes: storage,
      storage_mb: (storage / (1024 * 1024)).toFixed(2),
      file_count: countByUser[userId]
    }));

    // Largest files
    const largestFiles = allFiles
      .sort((a, b) => {
        const aSize = a.metadata?.size || a.metadata?.contentLength || 0;
        const bSize = b.metadata?.size || b.metadata?.contentLength || 0;
        return bSize - aSize;
      })
      .slice(0, 10)
      .map(f => ({
        name: f.name,
        bucket_id: f.bucket_id,
        file_size: f.metadata?.size || f.metadata?.contentLength || 0,
        file_size_mb: ((f.metadata?.size || f.metadata?.contentLength || 0) / (1024 * 1024)).toFixed(2),
        mimetype: f.metadata?.mimetype || 'unknown'
      }));

    // Recent uploads (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUploads = allFiles.filter(f =>
      new Date(f.created_at) > thirtyDaysAgo
    ).length;

    // Upload trend (group by day, last 30 days)
    const uploadTrend = {};
    allFiles.forEach(f => {
      if (new Date(f.created_at) > thirtyDaysAgo) {
        const date = new Date(f.created_at).toISOString().split('T')[0];
        uploadTrend[date] = (uploadTrend[date] || 0) + 1;
      }
    });

    const sortedUploadTrend = Object.entries(uploadTrend)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({ date, count }));

    console.log('✅ Statistics calculated successfully');

    return res.status(200).json({
      success: true,
      stats: {
        total_files: totalFiles,
        active_files: totalFiles, // All files in storage are "active"
        deleted_files: 0,
        total_storage_bytes: totalStorage,
        total_storage_mb: (totalStorage / (1024 * 1024)).toFixed(2),
        total_storage_gb: (totalStorage / (1024 * 1024 * 1024)).toFixed(2),
        recent_uploads: recentUploads,
        average_file_size_mb: totalFiles > 0 ? ((totalStorage / totalFiles) / (1024 * 1024)).toFixed(2) : 0
      },
      storage_by_bucket: Object.entries(storageByBucket).map(([bucket, bytes]) => ({
        bucket,
        storage_bytes: bytes,
        storage_mb: (bytes / (1024 * 1024)).toFixed(2),
        storage_gb: (bytes / (1024 * 1024 * 1024)).toFixed(3),
        count: countByBucket[bucket]
      })),
      storage_by_type: Object.entries(storageByType).map(([type, bytes]) => ({
        type,
        storage_bytes: bytes,
        storage_mb: (bytes / (1024 * 1024)).toFixed(2),
        count: countByType[type]
      })),
      count_by_type: Object.entries(countByType).map(([type, count]) => ({ type, count })),
      top_users: topUsersWithNames,
      upload_trend: sortedUploadTrend,
      largest_files: largestFiles
    });

  } catch (error) {
    console.error('❌ Error in stats API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Requires read permission for asset library stats (V2 Permission System)
export default requirePermission('content:asset_library:read')(handler);
