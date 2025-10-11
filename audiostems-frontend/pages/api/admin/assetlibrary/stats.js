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
    console.log('📊 Fetching asset library statistics...');

    // Get all files for statistics
    const { data: allFiles, error } = await supabase
      .from('media_files')
      .select('file_size, file_type, status, uploaded_by, created_at');

    if (error) {
      console.error('❌ Error fetching files:', error);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    // Calculate statistics
    const totalFiles = allFiles.length;
    const activeFiles = allFiles.filter(f => f.status === 'active').length;
    const deletedFiles = allFiles.filter(f => f.status === 'deleted').length;

    const totalStorage = allFiles
      .filter(f => f.status === 'active')
      .reduce((sum, f) => sum + (parseInt(f.file_size) || 0), 0);

    // Storage by file type
    const storageByType = {};
    const countByType = {};
    allFiles.filter(f => f.status === 'active').forEach(f => {
      const type = f.file_type || 'unknown';
      storageByType[type] = (storageByType[type] || 0) + (parseInt(f.file_size) || 0);
      countByType[type] = (countByType[type] || 0) + 1;
    });

    // Storage by user
    const storageByUser = {};
    const countByUser = {};
    allFiles.filter(f => f.status === 'active').forEach(f => {
      const userId = f.uploaded_by;
      storageByUser[userId] = (storageByUser[userId] || 0) + (parseInt(f.file_size) || 0);
      countByUser[userId] = (countByUser[userId] || 0) + 1;
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
      .filter(f => f.status === 'active')
      .sort((a, b) => (b.file_size || 0) - (a.file_size || 0))
      .slice(0, 10);

    // Recent uploads (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUploads = allFiles.filter(f =>
      f.status === 'active' && new Date(f.created_at) > thirtyDaysAgo
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
        active_files: activeFiles,
        deleted_files: deletedFiles,
        total_storage_bytes: totalStorage,
        total_storage_mb: (totalStorage / (1024 * 1024)).toFixed(2),
        total_storage_gb: (totalStorage / (1024 * 1024 * 1024)).toFixed(2),
        recent_uploads: recentUploads,
        average_file_size_mb: activeFiles > 0 ? ((totalStorage / activeFiles) / (1024 * 1024)).toFixed(2) : 0
      },
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

export default requirePermission('*:*:*')(handler);
