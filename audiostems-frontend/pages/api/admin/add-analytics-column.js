// Add analytics_data column to user_profiles table
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔧 Adding analytics_data column to user_profiles...');

    // Execute SQL to add the column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_profiles 
        ADD COLUMN IF NOT EXISTS analytics_data JSONB DEFAULT '{}'::jsonb;
        
        CREATE INDEX IF NOT EXISTS idx_user_profiles_analytics_data 
        ON user_profiles USING GIN (analytics_data);
      `
    });

    if (error) {
      console.error('❌ Error adding column:', error);
      return res.status(500).json({ error: 'Failed to add column', details: error.message });
    }

    console.log('✅ Analytics column added successfully');

    // Test the column
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id, analytics_data')
      .limit(1);

    return res.status(200).json({
      success: true,
      message: 'Analytics column added successfully',
      test: {
        success: !testError,
        error: testError?.message,
        sampleData: testData?.[0]
      }
    });

  } catch (error) {
    console.error('Error adding analytics column:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
