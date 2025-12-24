/**
 * Supabase Middleware Client
 * 
 * Use this in middleware.js to refresh sessions
 * Ensures cookies are properly synced for SSR
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export function createClient(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Gracefully handle missing environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Missing Supabase credentials in middleware - returning no-op client')
    // Return a no-op client that won't crash middleware
    return {
      supabase: {
        auth: {
          getSession: async () => ({ data: { session: null }, error: { message: 'Missing Supabase credentials' } })
        }
      },
      response
    }
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  return { supabase, response }
}




