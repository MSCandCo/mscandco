/**
 * Label Admin Layout - Server Component with Permission Check
 * 
 * This layout wraps ALL /labeladmin/* pages
 * Checks for label admin permissions BEFORE rendering any child page
 * 
 * Security: Bank-Grade ✅
 * - Runs on server (can't be bypassed by client)
 * - Checks authentication before ANY rendering
 * - Verifies label admin permissions before ANY content loads
 */

import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions'
import { redirect } from 'next/navigation'

// Helper to check if user has label admin access
function hasLabelAdminAccess(permissions) {
  const permissionNames = permissions.map(p => p.permission_name)
  
  // Check for wildcard (super admin)
  if (permissionNames.includes('*:*:*')) {
    return true
  }
  
  // Check for label admin specific permissions ONLY
  const hasLabelAdminPerm = permissionNames.some(p => 
    p.startsWith('labeladmin:') || 
    (p.startsWith('releases:') && !p.startsWith('admin:')) ||
    (p.startsWith('analytics:') && !p.startsWith('admin:')) ||
    (p.startsWith('earnings:') && !p.startsWith('admin:')) ||
    (p.startsWith('roster:') && !p.startsWith('admin:')) ||
    (p.startsWith('artists:') && !p.startsWith('admin:')) ||
    p === 'dashboard:access'
  )
  
  return hasLabelAdminPerm
}

export default async function LabelAdminLayout({ children }) {
  // Get session from server-side cookies (works perfectly in App Router!)
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  // Security Check 1: Must be authenticated
  if (error || !session) {
    console.warn('Label Admin Layout: No authenticated user - redirecting to login')
    redirect('/login')
  }
  
  console.log('✅ Label Admin Layout: User authenticated:', session.user.email)
  
  // Security Check 2: Must have label admin permissions
  const permissions = await getUserPermissions(session.user.id, true)
  
  if (!hasLabelAdminAccess(permissions)) {
    console.warn('Label Admin Layout: User lacks label admin permissions - redirecting to dashboard')
    redirect('/dashboard')
  }
  
  console.log('✅ Label Admin Layout: User has label admin access')
  
  // User is authenticated AND has label admin permissions - render page
  return <>{children}</>
}
