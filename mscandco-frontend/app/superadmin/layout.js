/**
 * Superadmin Layout - Server Component with Permission Check
 * 
 * This layout wraps ALL /superadmin/* pages
 * Checks for superadmin permissions BEFORE rendering any child page
 * 
 * Security: Bank-Grade ✅
 * - Runs on server (can't be bypassed by client)
 * - Checks authentication before ANY rendering
 * - Verifies superadmin permissions before ANY content loads
 */

import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions'
import { redirect } from 'next/navigation'

// Helper to check if user has superadmin access
function hasSuperadminAccess(permissions) {
  const permissionNames = permissions.map(p => p.permission_name)
  
  // Check for wildcard (super admin)
  if (permissionNames.includes('*:*:*')) {
    return true
  }
  
  // Check for specific superadmin permissions
  const hasSuperadminPerm = permissionNames.some(p => 
    p.startsWith('admin:') && 
    (p.includes('superadmin') || p.includes('ghost_login') || p.includes('permissions'))
  )
  
  return hasSuperadminPerm
}

export default async function SuperadminLayout({ children }) {
  // Get session from server-side cookies (works perfectly in App Router!)
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  // Security Check 1: Must be authenticated
  if (error || !session) {
    console.warn('Superadmin Layout: No authenticated user - redirecting to login')
    redirect('/login')
  }
  
  console.log('✅ Superadmin Layout: User authenticated:', session.user.email)
  
  // Security Check 2: Must have superadmin permissions
  const permissions = await getUserPermissions(session.user.id, true)
  
  if (!hasSuperadminAccess(permissions)) {
    console.warn('Superadmin Layout: User lacks superadmin permissions - redirecting to dashboard')
    redirect('/dashboard')
  }
  
  console.log('✅ Superadmin Layout: User has superadmin access')
  
  // User is authenticated AND has superadmin permissions - render page
  return <>{children}</>
}






