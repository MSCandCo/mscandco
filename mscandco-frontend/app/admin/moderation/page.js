import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ModerationQueue from '@/components/admin/ModerationQueue'

export const metadata = {
  title: 'Content Moderation - Admin',
  description: 'Review and moderate user-submitted content',
}

export default async function ModerationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has admin or content moderator role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['SuperAdmin', 'Admin', 'ContentModerator'].includes(profile.role)) {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and moderate user-submitted content to ensure platform quality and safety
          </p>
        </div>

        <ModerationQueue />
      </div>
    </div>
  )
}
