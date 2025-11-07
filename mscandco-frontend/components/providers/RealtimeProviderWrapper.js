'use client'

import { useUser } from '@/components/providers/SupabaseProvider'
import RealtimeProvider from '@/components/providers/RealtimeProvider'

/**
 * Wrapper component to pass user from SupabaseProvider to RealtimeProvider
 * This is needed because RealtimeProvider requires a user prop
 */
export default function RealtimeProviderWrapper({ children }) {
  const { user } = useUser()
  
  return (
    <RealtimeProvider user={user}>
      {children}
    </RealtimeProvider>
  )
}

