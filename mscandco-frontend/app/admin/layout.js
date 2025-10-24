import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/layouts/AdminLayout'

// Helper to check if user has wildcard or specific admin permissions
function hasAdminAccess(permissions) {
  const permissionNames = permissions.map(p => p.permission_name)
  
  // Check for wildcard (super admin)
  if (permissionNames.includes('*:*:*')) {
    return true
  }
  
  // Check for any admin or users_access permission
  const hasAdminPerm = permissionNames.some(p => 
    p.startsWith('admin:') || 
    p.startsWith('users_access:') ||
    p.startsWith('finance:') ||
    p.startsWith('platform:') ||
    p.startsWith('settings:') ||
    p.startsWith('analytics:') ||
    p.startsWith('asset_library:') ||
    p.startsWith('split_configuration:') ||
    p.startsWith('master_roster:') ||
    p.startsWith('permissions:') ||
    p.startsWith('requests:') ||
    p.startsWith('messages:') ||
    p.startsWith('permission_performance:') ||
    p.startsWith('profile:')
  )
  
  return hasAdminPerm
}

export default async function AdminLayoutServer({ children }) {
  const supabase = await createClient()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    console.warn('Admin Layout: No authenticated user - redirecting to login')
    redirect('/login')
  }

  const user = session.user

  const permissions = await getUserPermissions(user.id, true)

  if (!hasAdminAccess(permissions)) {
    console.warn('❌ Admin Layout: User does not have admin access - redirecting to dashboard')
    redirect('/dashboard')
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
}