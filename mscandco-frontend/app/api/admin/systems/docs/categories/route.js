import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  try {
    // Authenticate with anon key
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return default categories
    const categories = [
      { id: '1', name: 'API', count: 15 },
      { id: '2', name: 'Guides', count: 28 },
      { id: '3', name: 'Reference', count: 12 }
    ]

    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

