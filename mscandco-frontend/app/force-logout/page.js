'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ForceLogoutPage() {
  const [status, setStatus] = useState('Initiating force logout...')
  const [steps, setSteps] = useState([])

  const addStep = (step) => {
    setSteps(prev => [...prev, step])
  }

  useEffect(() => {
    const forceLogout = async () => {
      try {
        // Step 1: Sign out from Supabase
        addStep('✓ Signing out from Supabase...')
        await supabase.auth.signOut({ scope: 'global' })
        
        // Step 2: Clear all localStorage
        addStep('✓ Clearing localStorage...')
        if (typeof window !== 'undefined') {
          localStorage.clear()
        }
        
        // Step 3: Clear all sessionStorage
        addStep('✓ Clearing sessionStorage...')
        if (typeof window !== 'undefined') {
          sessionStorage.clear()
        }
        
        // Step 4: Clear all cookies
        addStep('✓ Clearing all cookies...')
        if (typeof window !== 'undefined' && document.cookie) {
          const cookies = document.cookie.split(";")
          
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i]
            const eqPos = cookie.indexOf("=")
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
            
            // Clear cookie for all possible paths and domains
            const domains = [
              window.location.hostname,
              `.${window.location.hostname}`,
              'localhost',
              '.localhost'
            ]
            
            const paths = ['/', '/artist', '/admin', '/superadmin']
            
            domains.forEach(domain => {
              paths.forEach(path => {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`
              })
            })
          }
        }
        
        // Step 5: Clear Supabase-specific storage
        addStep('✓ Clearing Supabase auth tokens...')
        if (typeof window !== 'undefined') {
          const supabaseKeys = [
            'sb-auth-token',
            'sb-localhost-auth-token',
            'supabase.auth.token',
            'sb-access-token',
            'sb-refresh-token'
          ]
          
          supabaseKeys.forEach(key => {
            localStorage.removeItem(key)
            sessionStorage.removeItem(key)
          })
        }
        
        // Step 6: Clear any ghost mode data
        addStep('✓ Clearing ghost mode data...')
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('ghost_mode')
          sessionStorage.removeItem('ghost_session')
          sessionStorage.removeItem('original_admin_user')
          sessionStorage.removeItem('ghost_target_user')
        }
        
        // Step 7: Call logout API
        addStep('✓ Calling logout API...')
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
          })
        } catch (e) {
          // Ignore API errors
        }
        
        addStep('✅ Force logout complete!')
        setStatus('Logout successful! Redirecting...')
        
        // Wait 2 seconds then redirect
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
        
      } catch (error) {
        console.error('Force logout error:', error)
        addStep(`❌ Error: ${error.message}`)
        setStatus('Error during logout, but redirecting anyway...')
        
        // Force redirect even on error
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
    }

    forceLogout()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Force Logout</h1>
          <p className="text-gray-600">{status}</p>
        </div>
        
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2">
              {step}
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          This will clear all authentication data and cookies
        </div>
      </div>
    </div>
  )
}

