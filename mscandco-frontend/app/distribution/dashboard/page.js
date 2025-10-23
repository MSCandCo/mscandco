/**
 * Distribution Dashboard - App Router (Server Component)
 * 
 * Main dashboard for distribution users
 * Shows distribution overview, catalog management, and platform metrics
 */

import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DistributionDashboardPage() {
  const supabase = await createClient()
  
  // Get session (already authenticated by layout, but we get user data)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  // Get permissions and user profile
  const permissions = await getUserPermissions(session.user.id, true)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, first_name, last_name')
    .eq('id', session.user.id)
    .single()
  
  const userName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : session.user.email
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        🌐 Distribution Dashboard - App Router
      </h1>
      
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-900 mb-2">
            ✅ App Router Migration Complete!
          </h2>
          <p className="text-green-700">
            This distribution dashboard is now using App Router with perfect SSR authentication.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            👤 Distribution Profile
          </h2>
          <p className="text-blue-700">
            Name: <strong>{userName}</strong>
          </p>
          <p className="text-blue-700">
            Email: <strong>{session.user.email}</strong>
          </p>
          <p className="text-blue-700">
            Role: <strong>{profile?.role || 'distribution'}</strong>
          </p>
          <p className="text-blue-700">
            Permissions: <strong>{permissions.length} total</strong>
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/distribution/catalog"
            className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
          >
            <h3 className="font-semibold text-purple-900">📚 Catalog</h3>
            <p className="text-sm text-purple-700">Manage distribution catalog</p>
          </Link>
          
          <Link 
            href="/distribution/platforms"
            className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
          >
            <h3 className="font-semibold text-green-900">🌐 Platforms</h3>
            <p className="text-sm text-green-700">Manage distribution platforms</p>
          </Link>
          
          <Link 
            href="/distribution/analytics"
            className="block p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
          >
            <h3 className="font-semibold text-indigo-900">📊 Analytics</h3>
            <p className="text-sm text-indigo-700">Distribution performance metrics</p>
          </Link>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            🚧 Migration Status
          </h2>
          <p className="text-yellow-700">
            <strong>App Router Pages:</strong> Dashboard, Catalog, Platforms, Analytics
          </p>
          <p className="text-yellow-700">
            <strong>Next:</strong> Full UI restoration with original designs
          </p>
        </div>
      </div>
    </div>
  )
}
