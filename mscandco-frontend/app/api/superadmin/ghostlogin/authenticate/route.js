import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
 * GET /api/superadmin/ghostlogin/authenticate
 * Authenticate using magic link token and redirect to dashboard
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const redirectTo = searchParams.get('redirect') || '/dashboard'

    if (!token || !email) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
    }

    // Use the magic link token to verify and get user
    // We'll use Supabase's verifyOtp method or exchange the token
    // Since we have admin access, we can create a session directly
    
    // Get the user by email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error listing users:', userError)
      return NextResponse.redirect(new URL('/login?error=user_not_found', request.url))
    }

    const targetUser = userData.users.find(u => u.email === email)
    
    if (!targetUser) {
      return NextResponse.redirect(new URL('/login?error=user_not_found', request.url))
    }

    // Generate a session for the target user using admin API
    // Create a session token for the target user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3013'}${redirectTo}`
      }
    })

    if (sessionError || !sessionData?.properties?.action_link) {
      console.error('Error generating session:', sessionError)
      // Fallback: redirect to the magic link directly
      // The magic link will handle authentication
      const magicLink = `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('http://', '')}/auth/v1/verify?token=${encodeURIComponent(token)}&type=magiclink&redirect_to=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3013'}/auth/callback?type=magiclink&redirect=${encodeURIComponent(redirectTo)}`)}`
      return NextResponse.redirect(magicLink)
    }

    // Extract the verification URL from the magic link
    const verificationUrl = sessionData.properties.action_link
    
    // Redirect to Supabase's verification endpoint which will then redirect to our callback
    return NextResponse.redirect(verificationUrl)

  } catch (error) {
    console.error('Error in ghost login authenticate:', error)
    return NextResponse.redirect(new URL('/login?error=authentication_failed', request.url))
  }
}

