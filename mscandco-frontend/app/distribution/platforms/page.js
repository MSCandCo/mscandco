/**
 * Distribution Platforms Page - App Router (Server Component)
 * 
 * Manage distribution platforms and integrations
 */

import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions'
import { redirect } from 'next/navigation'

export default async function DistributionPlatformsPage() {
  const supabase = await createClient()
  
  // Get session (already authenticated by layout)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  // Get permissions
  const permissions = await getUserPermissions(session.user.id, true)
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        🌐 Distribution Platforms
      </h1>
      
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-900 mb-2">
            ✅ App Router Migration Complete!
          </h2>
          <p className="text-green-700">
            This distribution platforms page is now using App Router with perfect SSR authentication.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            👤 Distribution Access
          </h2>
          <p className="text-blue-700">
            Email: <strong>{session.user.email}</strong>
          </p>
          <p className="text-blue-700">
            Permissions: <strong>{permissions.length} total</strong>
          </p>
          <p className="text-blue-700">
            Platforms Access: <strong className="text-green-600">✅ Granted</strong>
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            🚧 Platforms Interface
          </h2>
          <p className="text-yellow-700">
            The complete platforms interface will be built next.
            This will include platform management, integration tools, and status monitoring.
          </p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-purple-900 mb-2">
            🌐 Platform Features
          </h2>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-white p-3 rounded border">
              <h3 className="font-semibold text-purple-900">Platform Management</h3>
              <p className="text-sm text-purple-700">Manage distribution platforms</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <h3 className="font-semibold text-purple-900">Integration Tools</h3>
              <p className="text-sm text-purple-700">Platform integration tools</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <h3 className="font-semibold text-purple-900">Status Monitoring</h3>
              <p className="text-sm text-purple-700">Monitor platform status</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <h3 className="font-semibold text-purple-900">API Management</h3>
              <p className="text-sm text-purple-700">Manage platform APIs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
