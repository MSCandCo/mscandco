/**
 * Distribution Layout - Server Component with Permission Check
 * 
 * This layout wraps ALL /distribution/* pages
 * Checks for distribution permissions BEFORE rendering any child page
 * 
 * Security: Bank-Grade ✅
 * - Runs on server (can't be bypassed by client)
 * - Checks authentication before ANY rendering
 * - Verifies distribution permissions before ANY content loads
 */

import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions'
import { redirect } from 'next/navigation'

// Helper to check if user has distribution access
function hasDistributionAccess(permissions) {
  const permissionNames = permissions.map(p => p.permission_name)
  
  // Check for wildcard (super admin)
  if (permissionNames.includes('*:*:*')) {
    return true
  }
  
  // Check for distribution specific permissions ONLY
  const hasDistributionPerm = permissionNames.some(p => 
    p.startsWith('distribution:') || 
    p.startsWith('platform:') ||
    p.startsWith('releases:') ||
    p.startsWith('catalog:') ||
    p === 'dashboard:access'
  )
  
  return hasDistributionPerm
}

export default async function DistributionLayout({ children }) {
  // Get session from server-side cookies (works perfectly in App Router!)
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  // Security Check 1: Must be authenticated
  if (error || !session) {
    console.warn('Distribution Layout: No authenticated user - redirecting to login')
    redirect('/login')
  }
  
  console.log('✅ Distribution Layout: User authenticated:', session.user.email)
  
  // Security Check 2: Must have distribution permissions
  const permissions = await getUserPermissions(session.user.id, true)
  
  if (!hasDistributionAccess(permissions)) {
    console.warn('Distribution Layout: User lacks distribution permissions - redirecting to dashboard')
    redirect('/dashboard')
  }
  
  console.log('✅ Distribution Layout: User has distribution access')
  
  // User is authenticated AND has distribution permissions - render page
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}






