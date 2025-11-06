/**
 * React Query Provider
 *
 * Provides client-side caching for API requests
 * Dramatically improves performance by reducing redundant network calls
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }) {
  // Create QueryClient inside component to ensure one instance per request
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes by default
        staleTime: 1000 * 60 * 5,
        // Keep unused data in cache for 30 minutes
        cacheTime: 1000 * 60 * 30,
        // Retry failed requests 3 times
        retry: 3,
        // Don't refetch on window focus (too aggressive)
        refetchOnWindowFocus: false,
        // Refetch on mount only if data is stale
        refetchOnMount: 'stale',
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  )
}
