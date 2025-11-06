import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/admin/assetlibrary/stats
 * Get statistics about the asset library
 */
export async function GET(request) {
  try {
    // Authenticate user
    const supabase = await createServerClient()
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
    
    // Get all files from all buckets
    for (const bucketName of bucketsToCheck) {
      try {
        const { data: bucketFiles, error } = await supabaseAdmin.storage
          .from(bucketName)
          .list('', {
            limit: 1000,
            offset: 0
          })
        
        if (!error && bucketFiles) {
          // Filter out folders
          const actualFiles = bucketFiles.filter(f => f.id !== null && f.metadata?.size !== undefined)
          allFiles.push(...actualFiles)
        }
      } catch (err) {
        // Silently skip buckets that don't exist
        continue
      }
    }
    
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

    return NextResponse.json({
      success: true,
      stats: {
        total_files: totalFiles,
        total_size: totalSize,
        total_size_mb: (totalSize / (1024 * 1024)).toFixed(2),
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

