/**
 * Admin Touring Management Page
 * Comprehensive admin backend for touring platform
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TouringAdminClient from './TouringAdminClient'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function TouringAdminPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?redirectedFrom=/admin/touring')
  }

  // Check admin permissions - permission-based access
  const { createServiceRoleClient } = await import('@/lib/supabase/server')
  const supabaseAdmin = await createServiceRoleClient()
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  // Permission-based access: super_admin, company_admin, or users with touring permissions
  // In the future, touring admins can be granted touring:admin:read or touring:admin:manage permissions
  const hasPermission = profile?.role === 'super_admin' || profile?.role === 'company_admin';
  
  // Future: Add permission checking here for custom touring admin roles
  // const { data: userPermissions } = await supabaseAdmin
  //   .from('user_permissions')
  //   .select('permission_key')
  //   .eq('user_id', session.user.id)
  //   .eq('is_active', true)
  // const hasPermission = profile?.role === 'super_admin' || 
  //                      profile?.role === 'company_admin' ||
  //                      userPermissions?.some(p => ['touring:admin:read', 'touring:admin:manage'].includes(p.permission_key))

  if (!hasPermission) {
    redirect('/unauthorized')
  }

  return <TouringAdminClient user={session.user} />
}

