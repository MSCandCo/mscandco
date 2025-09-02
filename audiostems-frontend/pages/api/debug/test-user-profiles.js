// Test user_profiles table and analytics_data column
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    console.log('🔍 Testing user_profiles table...');

    // Test if we can read user_profiles
    const { data: profiles, error: readError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, analytics_data')
      .limit(1);

    console.log('📊 user_profiles read test:', { 
      success: !readError, 
      error: readError?.message,
      hasAnalyticsColumn: profiles?.[0]?.hasOwnProperty('analytics_data')
    });

    // Test if we can update user_profiles
    const testUserId = '0a060de5-1c94-4060-a1c2-860224fc348d'; // Henry Taylor
    
    const { data: updated, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        analytics_data: { 
          test: 'test data',
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', testUserId)
      .select();

    console.log('✏️ user_profiles update test:', { 
      success: !updateError, 
      error: updateError?.message,
      updatedRows: updated?.length || 0
    });

    return res.status(200).json({
      success: true,
      tests: {
        read: {
          success: !readError,
          error: readError?.message,
          hasAnalyticsColumn: profiles?.[0]?.hasOwnProperty('analytics_data')
        },
        update: {
          success: !updateError,
          error: updateError?.message,
          updatedRows: updated?.length || 0
        }
      },
      sampleProfile: profiles?.[0]
    });

  } catch (error) {
    console.error('User profiles test error:', error);
    return res.status(500).json({ error: error.message });
  }
}
