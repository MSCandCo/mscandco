/**
 * User Management Page - App Router (Server Component)
 *
 * Manage platform users and their roles
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserManagementClient from './UserManagementClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'User Management',
  description: 'Manage platform users, roles, and permissions - user administration and access control',
  keywords: 'user management, admin panel, user administration, role management, access control',
  openGraph: {
    title: 'User Management | MSC & Co',
    description: 'Manage platform users, roles, and permissions - user administration and access control',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'User Management | MSC & Co',
    description: 'Manage platform users, roles, and permissions - user administration and access control',
  },
}

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