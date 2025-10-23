import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ArtistDashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">🎵 Artist Dashboard</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900">
          <strong>✅ Page Structure Ready!</strong><br/>
          Restore full dashboard functionality from <code>_migrating_pages/artist-dashboard.js</code>
        </p>
        <p className="text-sm text-blue-700 mt-2">
          See <code>RESTORATION_GUIDE.md</code> for instructions.
        </p>
      </div>
    </div>
  )
}
