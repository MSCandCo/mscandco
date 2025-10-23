/**
 * Root Layout - App Router
 * 
 * This wraps ALL pages in the application
 * Provides global styles, providers, and metadata
 */

import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import Header from '@/components/header'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MSC & Co - Music Distribution Platform',
  description: 'Multi-brand music distribution and publishing platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  )
}

