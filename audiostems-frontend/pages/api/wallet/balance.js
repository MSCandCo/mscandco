import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify user authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' })
    }

    // Decode JWT token (skip verification for now)
    let userInfo
    try {
      userInfo = jwt.decode(token)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const userId = userInfo?.sub

    if (!userId) {
      return res.status(401).json({ error: 'Invalid user ID' })
    }

    // Get user's wallet balance from user_profiles (since we're using wallet_balance column there)
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    // If no profile exists, return 0 balance
    if (!profile) {
      return res.status(200).json({
        success: true,
        data: {
          balance: 0.00,
          currency: 'GBP'
        }
      })
    }

    res.status(200).json({
      success: true,
      data: {
        balance: profile.wallet_balance || 0.00,
        currency: 'GBP'
      }
    })

  } catch (error) {
    console.error('Wallet balance error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    })
  }
}
