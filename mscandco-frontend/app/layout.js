/**
 * Root Layout - App Router
 * 
 * This wraps ALL pages in the application
 * Provides global styles, providers, and metadata
 */

import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import PostHogProvider from '@/components/providers/PostHogProvider'
import RealtimeProviderWrapper from '@/components/providers/RealtimeProviderWrapper'
import { SessionValidator } from '@/components/auth/SessionValidator'
import { InactivityLogout } from '@/components/auth/InactivityLogout'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import Header from '@/components/header'
import Footer from '@/components/footer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text flash
  preload: true,
  variable: '--font-inter',
})

export const metadata = {
  title: 'MSC & Co - AI-Native Music Distribution Platform',
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
              </RealtimeProviderWrapper>
            </PostHogProvider>
          </SupabaseProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

