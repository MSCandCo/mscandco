/**
 * Artist Layout - Server Component with Permission Check
 * 
 * This layout wraps ALL /artist/* pages
 * Checks for artist permissions BEFORE rendering any child page
 * 
 * Security: Bank-Grade ✅
 * - Runs on server (can't be bypassed by client)
 * - Checks authentication before ANY rendering
 * - Verifies artist permissions before ANY content loads
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
  // Get session from server-side cookies (works perfectly in App Router!)
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  // Security Check 1: Must be authenticated
  if (error || !session) {
    console.warn('Artist Layout: No authenticated user - redirecting to login')
    redirect('/login')
  }
  
  console.log('✅ Artist Layout: User authenticated:', session.user.email)
  
  // Security Check 2: Must have artist permissions
  const permissions = await getUserPermissions(session.user.id, true)
  
  if (!hasArtistAccess(permissions)) {
    console.warn('Artist Layout: User lacks artist permissions - redirecting to dashboard')
    redirect('/dashboard')
  }
  
  console.log('✅ Artist Layout: User has artist access')
  
  // User is authenticated AND has artist permissions - render page
  return <>{children}</>
}
