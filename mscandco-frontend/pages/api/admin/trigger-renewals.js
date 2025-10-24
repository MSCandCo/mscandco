/**
 * Manual Trigger for Subscription Renewals
 * 
 * Admin endpoint to manually trigger subscription renewal processing
 * Useful for testing and immediate processing of overdue subscriptions
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin'].includes(profile.role)) {
      return res.status(403).json({ error: 'Forbidden - Admin access required' })
    }

    console.log('🔄 Manual renewal trigger by admin:', session.user.email)

    // Call the renewal cron endpoint internally
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-key'
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3013'
    
    const response = await fetch(`${baseUrl}/api/cron/process-renewals?secret=${cronSecret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret
      }
    })

    const result = await response.json()

    return res.json({
      success: true,
      message: 'Renewal process triggered successfully',
      ...result
    })

  } catch (error) {
    console.error('❌ Error triggering renewals:', error)
    return res.status(500).json({ 
      error: 'Failed to trigger renewals',
      details: error.message 
    })
  }
}

