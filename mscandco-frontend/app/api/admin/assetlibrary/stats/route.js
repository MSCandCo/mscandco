import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/assetlibrary/stats
 * Get statistics about the asset library
 */
export async function GET(request) {
  try {
    // Lazy load Supabase clients
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();
    
    // Authenticate user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin', 'label_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    // List all files from all buckets to calculate stats
    const bucketsToCheck = [
      'asset-library',
      'assets',
      'release-audio',
      'release-artwork',
      'profile-pictures',
      'email-templates'
    ]

    let allFiles = []

    // Get all files from all buckets (recursively)
    const getAllFilesRecursive = async (bucket, path = '', allFiles = []) => {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .list(path, {
          limit: 1000,
          offset: 0
        })

      if (error || !data) return allFiles

      for (const item of data) {
        if (item.id && item.metadata?.size !== undefined) {
          // It's a file
          allFiles.push(item)
        } else if (!item.name.includes('.')) {
          // It's likely a folder, recursively list it
          const folderPath = path ? `${path}/${item.name}` : item.name
          await getAllFilesRecursive(bucket, folderPath, allFiles)
        }
      }

      return allFiles
    }

    // Get all files from all buckets
    for (const bucketName of bucketsToCheck) {
      try {
        const bucketFiles = await getAllFilesRecursive(bucketName)
        if (bucketFiles.length > 0) {
          console.log(`📊 Stats: Found ${bucketFiles.length} files in ${bucketName}`)
          allFiles.push(...bucketFiles)
        }
      } catch (err) {
        // Silently skip buckets that don't exist
        continue
      }
    }

    console.log(`📊 Stats: Total files across all buckets: ${allFiles.length}`)
    const files = allFiles

    // Calculate statistics
    const totalFiles = files?.length || 0
    const totalSize = files?.reduce((sum, file) => {
      return sum + (file.metadata?.size || 0)
    }, 0) || 0

    // Categorize files by type
    const audioFiles = files?.filter(file => {
      const mimetype = file.metadata?.mimetype || ''
      return mimetype.startsWith('audio/')
    }).length || 0

    const imageFiles = files?.filter(file => {
      const mimetype = file.metadata?.mimetype || ''
      return mimetype.startsWith('image/')
    }).length || 0

    const documentFiles = files?.filter(file => {
      const mimetype = file.metadata?.mimetype || ''
      return mimetype.startsWith('application/') || mimetype.startsWith('text/')
    }).length || 0

    const otherFiles = totalFiles - audioFiles - imageFiles - documentFiles

    // Calculate recent uploads (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentUploads = files?.filter(file => {
      const createdAt = new Date(file.created_at)
      return createdAt >= thirtyDaysAgo
    }).length || 0

    return NextResponse.json({
      success: true,
      stats: {
        total_files: totalFiles,
        active_files: totalFiles,
        total_size: totalSize,
        total_size_mb: parseFloat((totalSize / (1024 * 1024)).toFixed(2)),
        total_storage_gb: parseFloat((totalSize / (1024 * 1024 * 1024)).toFixed(2)),
        recent_uploads: recentUploads,
        average_file_size_mb: totalFiles > 0 ? parseFloat(((totalSize / totalFiles) / (1024 * 1024)).toFixed(2)) : 0,
        by_type: {
          audio: audioFiles,
          image: imageFiles,
          document: documentFiles,
          other: otherFiles
        }
      }
    })

  } catch (error) {
    console.error('Error in assetlibrary stats GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

