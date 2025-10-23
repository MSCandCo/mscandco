/**
 * User Management Page - App Router (Server Component)
 * 
 * Manage platform users and their roles
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserManagementClient from './UserManagementClient'

export default async function UserManagementPage() {
  const supabase = await createClient()
  
  // Get session (already authenticated by layout)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <UserManagementClient user={session.user} />
    </div>
  )
}
