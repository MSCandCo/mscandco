import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/admin/assetlibrary
 * Fetch files from Supabase Storage (asset-library bucket)
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '50')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // List files from Supabase Storage
    // Check all existing buckets: release-audio, release-artwork, profile-pictures, email-templates
    // Also try asset-library and assets if they exist
    let files = []
    let listError = null
    
    // List of buckets to check (in priority order)
    const bucketsToCheck = [
      'asset-library',  // Primary asset bucket (if exists)
      'assets',         // Alternative asset bucket (if exists)
      'release-audio',  // Existing bucket with audio files
      'release-artwork', // Existing bucket with artwork files
      'profile-pictures', // Existing bucket with profile pictures
      'email-templates'  // Existing bucket with email templates
    ]
    
    console.log('📦 Attempting to list files from multiple buckets...')
    
    // List files recursively by listing all folders
    const getAllFiles = async (bucket, path = '', allFiles = []) => {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .list(path, {
          limit: 1000,
          offset: 0,
          sortBy: { column: sortBy === 'name' ? 'name' : 'created_at', order: sortOrder }
        })
      
      if (error) {
        // Don't log errors for buckets that don't exist - that's expected
        if (!error.message?.includes('Bucket not found') && !error.message?.includes('not found')) {
          console.error(`Error listing path ${path} from ${bucket}:`, error)
        }
        return allFiles
      }
      
      if (!data) return allFiles
      
      for (const item of data) {
        if (item.id) {
          // It's a file
          allFiles.push({
            ...item,
            fullPath: path ? `${path}/${item.name}` : item.name,
            bucket_name: bucket // Track which bucket this file came from
          })
        } else if (!item.name.includes('.')) {
          // It's likely a folder (no extension), recursively list it
          const folderPath = path ? `${path}/${item.name}` : item.name
          await getAllFiles(bucket, folderPath, allFiles)
        }
      }
      
      return allFiles
    }
    
    // Try each bucket and aggregate all files
    const allBucketsFiles = []
    let foundBuckets = []
    
    for (const bucketName of bucketsToCheck) {
      try {
        const bucketFiles = await getAllFiles(bucketName)
        if (bucketFiles.length > 0) {
          console.log(`✅ Found ${bucketFiles.length} files in ${bucketName} bucket`)
          allBucketsFiles.push(...bucketFiles)
          foundBuckets.push(bucketName)
        }
      } catch (err) {
        // Silently skip buckets that don't exist or have errors
        if (err.message?.includes('Bucket not found') || err.message?.includes('not found')) {
          // Expected - bucket doesn't exist
          continue
        } else {
          console.error(`❌ Error listing from ${bucketName}:`, err)
        }
      }
    }
    
    if (allBucketsFiles.length > 0) {
      console.log(`✅ Total files found across ${foundBuckets.length} bucket(s): ${allBucketsFiles.length}`)
      console.log(`📦 Buckets with files: ${foundBuckets.join(', ')}`)
      files = allBucketsFiles
    } else {
      console.log('⚠️ No files found in any bucket')
      listError = { message: 'No files found in any storage bucket' }
    }

    // Filter out folders (Supabase Storage returns folders as objects with null size)
    files = files.filter(file => file.id !== null && file.metadata?.size !== undefined)

    if (listError) {
      console.error('❌ Error listing files:', listError)
      // Return empty array instead of error if bucket doesn't exist
      if (listError.message?.includes('Bucket not found') || listError.message?.includes('not found')) {
        console.log('⚠️ Bucket not found, returning empty result')
        return NextResponse.json({
          success: true,
          files: [],
          pagination: {
            page: 1,
            per_page: perPage,
            total: 0,
            total_pages: 0
          },
          message: `No files found in any storage bucket. Checked: ${bucketsToCheck.join(', ')}. Files from release-audio, release-artwork, profile-pictures, and email-templates buckets will appear here.`,
          bucket_checked: bucketsToCheck.join(', ')
        })
      }
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch files', 
          message: listError.message,
          details: listError 
        },
        { status: 500 }
      )
    }

    console.log(`📊 Filtered files (excluding folders): ${files.length}`)

    // Filter files by search term if provided
    let filteredFiles = files || []
    if (search) {
      filteredFiles = filteredFiles.filter(file => 
        file.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Paginate
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex)

    // Get signed URLs for each file
    const filesWithUrls = await Promise.all(
      paginatedFiles.map(async (file) => {
        // Use the bucket name from the file (tracked during listing)
        const bucketToUse = file.bucket_name || 'asset-library'
        
        // Create signed URL - handle both root files and nested paths
        const filePath = file.fullPath || file.name
        const { data: urlData, error: urlError } = await supabaseAdmin.storage
          .from(bucketToUse)
          .createSignedUrl(filePath, 3600) // 1 hour expiry

        if (urlError) {
          console.error(`Error creating signed URL for ${filePath} in ${bucketToUse}:`, urlError)
        }

        // Determine file type from mimetype
        const mimetype = file.metadata?.mimetype || 'application/octet-stream'
        let fileType = 'document'
        if (mimetype.startsWith('audio/')) fileType = 'audio'
        else if (mimetype.startsWith('image/')) fileType = 'image'
        else if (mimetype.startsWith('video/')) fileType = 'video'

        return {
          id: file.id || file.name,
          name: file.name,
          file_size: file.metadata?.size || 0,
          size: file.metadata?.size || 0, // Keep both for compatibility
          file_type: fileType,
          type: mimetype,
          mimetype: mimetype,
          storage_url: urlData?.signedUrl || null,
          url: urlData?.signedUrl || null, // Keep both for compatibility
          created_at: file.created_at,
          updated_at: file.updated_at || file.created_at,
          owner_email: null, // Not available from storage, can be enhanced later
          bucket_id: bucketToUse,
          bucket_name: bucketToUse, // Show which bucket the file is from
          full_path: filePath
        }
      })
    )

    return NextResponse.json({
      success: true,
      files: filesWithUrls,
      pagination: {
        page,
        per_page: perPage,
        total: filteredFiles.length,
        total_pages: Math.ceil(filteredFiles.length / perPage)
      }
    })

  } catch (error) {
    console.error('Error in assetlibrary GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

