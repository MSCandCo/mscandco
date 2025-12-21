import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = require('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}
/**
 * DELETE /api/admin/assetlibrary/delete
 * Delete file(s) from Supabase Storage
 */
export async function DELETE(request) {
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

    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json({
        error: 'Invalid request body',
        message: 'Request body must be valid JSON',
        details: process.env.NODE_ENV === 'development' ? parseError.message : undefined
      }, { status: 400 })
    }

    const { bucket_id, full_path, file_ids } = body

    // Validate input
    if (!bucket_id) {
      return NextResponse.json({
        error: 'Missing required field',
        message: 'bucket_id is required'
      }, { status: 400 })
    }

    // Handle bulk delete (multiple files)
    if (file_ids && Array.isArray(file_ids) && file_ids.length > 0) {
      const deleteResults = []
      const errors = []

      for (const fileInfo of file_ids) {
        const fileBucket = fileInfo.bucket_id || bucket_id
        const filePath = fileInfo.full_path

        if (!filePath) {
          errors.push({ file: fileInfo, error: 'Missing full_path' })
          continue
        }

        try {
          const { data, error } = await supabaseAdmin.storage
            .from(fileBucket)
            .remove([filePath])

          if (error) {
            console.error(`Error deleting ${filePath} from ${fileBucket}:`, error)
            errors.push({ file: fileInfo, error: error.message })
          } else {
            deleteResults.push({ file: fileInfo, success: true })
          }
        } catch (err) {
          console.error(`Exception deleting ${filePath}:`, err)
          errors.push({ file: fileInfo, error: err.message })
        }
      }

      return NextResponse.json({
        success: true,
        message: `Deleted ${deleteResults.length} file(s)${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
        deleted: deleteResults.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
      })
    }

    // Handle single file delete
    if (!full_path) {
      return NextResponse.json({
        error: 'Missing required field',
        message: 'full_path is required for single file delete'
      }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket_id)
      .remove([full_path])

    if (error) {
      console.error(`Error deleting ${full_path} from ${bucket_id}:`, error)
      return NextResponse.json({
        error: 'Failed to delete file',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      deleted: full_path
    })

  } catch (error) {
    console.error('Error in assetlibrary DELETE:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to delete file(s)',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    )
  }
}

