/**
 * Root Layout - App Router
 * 
 * This wraps ALL pages in the application
 * Provides global styles, providers, and metadata
 */

// Force dynamic rendering for all pages to prevent Supabase build-time errors
export const dynamic = 'force-dynamic'

import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import PostHogProvider from '@/components/providers/PostHogProvider'
import RealtimeProviderWrapper from '@/components/providers/RealtimeProviderWrapper'
import { SessionValidator } from '@/components/auth/SessionValidator'
import { InactivityLogout } from '@/components/auth/InactivityLogout'
import AILearningTracker from '@/hooks/useAILearning'
import { Suspense } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import CookieConsentBanner from '@/components/CookieConsentBanner'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text flash
  preload: true,
  variable: '--font-inter',
})

export const metadata = {
  title: {
    template: '%s | MSC & Co',
    default: 'MSC & Co'
  },
  description: 'The first and only AI-native music distribution platform. Manage releases, track earnings, and grow your career through AI-powered insights. Built for gospel, Christian, and general music creators.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <SupabaseProvider>
            <PostHogProvider>
              <RealtimeProviderWrapper>
                <SessionValidator />
                <InactivityLogout timeoutMinutes={30} warningMinutes={5} />
                <Header />
                <main>
                  {children}
                </main>
                <Footer />
                <CookieConsentBanner />
                <Suspense fallback={null}>
                  <AILearningTracker />
                </Suspense>
              </RealtimeProviderWrapper>
            </PostHogProvider>
          </SupabaseProvider>
        </QueryProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}

