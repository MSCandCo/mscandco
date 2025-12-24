/**
 * Login Tracker for Suspicious Activity Detection
 * Tracks user logins and detects unusual patterns
 */

import { createClient } from '@supabase/supabase-js'
import { sendSuspiciousLoginEmail } from './emailService'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Parse user agent to extract device and browser info
 */
function parseUserAgent(userAgent) {
  const browsers = {
    Chrome: /Chrome/i,
    Safari: /Safari/i,
    Firefox: /Firefox/i,
    Edge: /Edge/i,
    Opera: /Opera|OPR/i,
  }

  const devices = {
    Mobile: /Mobile|Android|iPhone|iPad/i,
    Tablet: /Tablet|iPad/i,
    Desktop: /./,
  }

  let browser = 'Unknown Browser'
  let device = 'Unknown Device'

  for (const [name, regex] of Object.entries(browsers)) {
    if (regex.test(userAgent)) {
      browser = name
      break
    }
  }

  for (const [name, regex] of Object.entries(devices)) {
    if (regex.test(userAgent)) {
      device = name
      break
    }
  }

  return { browser, device }
}

/**
 * Get approximate location from IP address
 * You can integrate with a service like ipapi.co or ip-api.com
 */
async function getLocationFromIP(ipAddress) {
  try {
    // Example using ipapi.co (you'll need to sign up for API key)
    // const response = await fetch(`https://ipapi.co/${ipAddress}/json/`)
    // const data = await response.json()
    // return `${data.city}, ${data.region}, ${data.country_name}`

    // For now, return a placeholder
    return 'Unknown Location'
  } catch (error) {
    console.error('Error getting location:', error)
    return 'Unknown Location'
  }
}

/**
 * Track user login and detect suspicious activity
 */
export async function trackLogin(userId, req) {
  try {
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown'
    const userAgent = req.headers.get('user-agent') || ''
    const { browser, device } = parseUserAgent(userAgent)
    const location = await getLocationFromIP(ipAddress)

    // Get user's previous logins
    const { data: previousLogins, error: loginError } = await supabaseAdmin
      .from('user_login_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Check if this is a new IP or location
    const isNewIP = !previousLogins?.some(login => login.ip_address === ipAddress)
    const isNewLocation = !previousLogins?.some(login => login.location === location)
    const isSuspicious = isNewIP || isNewLocation

    // Store login record
    const { error: insertError } = await supabaseAdmin
      .from('user_login_history')
      .insert({
        user_id: userId,
        ip_address: ipAddress,
        location: location,
        device: device,
        browser: browser,
        user_agent: userAgent,
        is_suspicious: isSuspicious,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Error inserting login history:', insertError)
    }

    // Send alert if suspicious
    if (isSuspicious && previousLogins?.length > 0) {
      const { data: user, error: userError } = await supabaseAdmin
        .from('user_profiles')
        .select('email')
        .eq('id', userId)
        .single()

      if (!userError && user) {
        await sendSuspiciousLoginEmail(user.email, {
          loginDate: new Date().toLocaleDateString(),
          loginTime: new Date().toLocaleTimeString(),
          location: location,
          device: device,
          browser: browser,
          ipAddress: ipAddress,
        })
      }
    }

    // Update last login timestamp
    await supabaseAdmin
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId)

    return { success: true, isSuspicious }
  } catch (error) {
    console.error('Error tracking login:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create the user_login_history table (run this migration)
 */
export const createLoginHistoryTableSQL = `
CREATE TABLE IF NOT EXISTS user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  location TEXT,
  device TEXT,
  browser TEXT,
  user_agent TEXT,
  is_suspicious BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_login_history_user_id ON user_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_history_created_at ON user_login_history(created_at);

-- Add RLS policies
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own login history
CREATE POLICY "Users can view own login history"
  ON user_login_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert login history
CREATE POLICY "System can insert login history"
  ON user_login_history
  FOR INSERT
  WITH CHECK (true);
`
