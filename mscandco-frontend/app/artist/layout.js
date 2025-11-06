/**
 * Artist Layout - Server Component with Optimized Permission Check
 * 
 * This layout wraps ALL /artist/* pages
 * Checks for artist access BEFORE rendering any child page
 * 
 * Optimized: Fast role check first, then permission check if needed
 */

import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions'
import { redirect } from 'next/navigation'

// Helper to check if user has artist access
function hasArtistAccess(permissions) {
  const permissionNames = permissions.map(p => p.permission_name)
  
  // Check for wildcard (super admin)
  if (permissionNames.includes('*:*:*')) {
    return true
  }
  
  // Check for artist-specific permissions ONLY
  const hasArtistPerm = permissionNames.some(p => 
    p.startsWith('artist:') || 
    (p.startsWith('releases:') && !p.startsWith('admin:') && !p.startsWith('labeladmin:')) ||
    (p.startsWith('analytics:') && !p.startsWith('admin:') && !p.startsWith('labeladmin:')) ||
    (p.startsWith('earnings:') && !p.startsWith('admin:') && !p.startsWith('labeladmin:')) ||
    p === 'dashboard:access'
  )
  
  return hasArtistPerm
}

export default async function ArtistLayout({ children }) {
  // Get session from server-side cookies
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  // Security Check 1: Must be authenticated
  if (error || !session) {
    console.warn('Artist Layout: No authenticated user - redirecting to login')
    redirect('/login')
  }
  
  console.log('✅ Artist Layout: User authenticated:', session.user.email)
  
  // OPTIMIZED: Quick role check first (faster than permission check)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle()

  // If user has artist role, allow access immediately (skip expensive permission check)
  if (profile?.role === 'artist') {
    console.log('✅ Artist Layout: User has artist role - allowing access')
    return <>{children}</>
  }

  // If profile doesn't exist or role is null, allow access (will default to artist)
  if (!profile || !profile.role) {
    console.log('✅ Artist Layout: No profile or null role - allowing access (will default to artist)')
    return <>{children}</>
  }

  // If user has a different role, check permissions as fallback
  // (e.g., super_admin might have wildcard permission)
  console.log('⚠️ Artist Layout: User role is', profile.role, '- checking permissions as fallback')
  const permissions = await getUserPermissions(session.user.id, true)
  
  if (!hasArtistAccess(permissions)) {
    console.warn('Artist Layout: User lacks artist permissions - redirecting to dashboard')
    redirect('/dashboard')
  }
  
  console.log('✅ Artist Layout: User has artist access via permissions')
  
  // User is authenticated AND has artist access - render page
  return <>{children}</>
}
