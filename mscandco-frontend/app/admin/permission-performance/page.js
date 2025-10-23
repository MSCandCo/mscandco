import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PermissionPerformancePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) redirect('/login')
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Permission Performance</h1>
      <p className="text-gray-600 mb-6">Monitor permission system performance and audit logs</p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900">Permission performance metrics and audit logs will be displayed here.</p>
      </div>
    </div>
  )
}
