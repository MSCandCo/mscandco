import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    console.log('Testing earnings_log table access...');
    
    // Test if table exists and has data
    const { data, error, count } = await supabase
      .from('earnings_log')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('Table access error:', error);
      return res.status(500).json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    console.log('Table access successful:', { count, sampleData: data?.slice(0, 2) });

    return res.status(200).json({
      success: true,
      message: 'earnings_log table accessible',
      count,
      sampleData: data?.slice(0, 3) // First 3 entries
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
