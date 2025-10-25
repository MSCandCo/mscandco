/**
 * Root Layout - App Router
 * 
 * This wraps ALL pages in the application
 * Provides global styles, providers, and metadata
 */

import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import PostHogProvider from '@/components/providers/PostHogProvider'
import RealtimeProvider from '@/components/providers/RealtimeProvider'
import Header from '@/components/header'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MSC & Co - Music Distribution Platform',
  description: 'Enterprise-grade music distribution and publishing platform with AI-powered features',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <PostHogProvider>
            <RealtimeProvider>
              <Header />
              <main>
                {children}
              </main>
              <Footer />
            </RealtimeProvider>
          </PostHogProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}

