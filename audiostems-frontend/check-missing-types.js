const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMissingTypes() {
  console.log('🔍 Checking for missing enum types...\n');
  
  const types = [
    'user_role',
    'subscription_plan', 
    'release_status',
    'approval_status',
    'format_type',
    'product_type',
    'publishing_type',
    'release_workflow_status',
    'business_type',
    'payment_method',
    'change_request_type'
  ];
  
  for (const type of types) {
    try {
      // Try to use the type in a query
      const { data, error } = await supabaseAdmin
        .rpc('check_type_exists', { type_name: type })
        .catch(async () => {
          // Fallback: try a direct query
          const result = await supabaseAdmin
            .from('pg_type')
            .select('typname')
            .eq('typname', type)
            .single()
            .catch(() => ({ data: null, error: { message: 'Type does not exist' } }));
          
          return result;
        });
      
      if (error && error.message.includes('does not exist')) {
        console.log(`❌ Missing type: ${type}`);
      } else if (error) {
        console.log(`❓ Unknown status for type: ${type} - ${error.message}`);
      } else {
        console.log(`✅ Type exists: ${type}`);
      }
    } catch (err) {
      console.log(`❌ Error checking type ${type}: ${err.message}`);
    }
  }
}

checkMissingTypes();
