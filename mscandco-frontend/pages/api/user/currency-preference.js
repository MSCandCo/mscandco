import { createClient } from '@/lib/supabase/server'

export default async function handler(req, res) {
  const supabase = await createClient()
  
  // Get the user from the session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id

  if (req.method === 'GET') {
    // Get user's currency preference
    const { data, error } = await supabase
      .from('user_profiles')
      .select('preferred_currency')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching currency preference:', error)
      return res.status(500).json({ error: 'Failed to fetch currency preference' })
    }

    return res.status(200).json({ 
      currency: data?.preferred_currency || 'GBP' 
    })
  }

  if (req.method === 'POST') {
    // Save user's currency preference
    const { currency } = req.body

    if (!currency) {
      return res.status(400).json({ error: 'Currency is required' })
    }

    // Validate currency code
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'NGN', 'GHS', 'KES', 'ZAR', 'ZMW']
    if (!validCurrencies.includes(currency)) {
      return res.status(400).json({ error: 'Invalid currency code' })
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ preferred_currency: currency })
      .eq('id', userId)

    if (error) {
      console.error('Error saving currency preference:', error)
      return res.status(500).json({ error: 'Failed to save currency preference' })
    }

    return res.status(200).json({ 
      success: true,
      currency 
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

