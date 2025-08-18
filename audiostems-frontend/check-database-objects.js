const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseObjects() {
  console.log('🔍 Comprehensive Database Objects Check...\n');
  
  // Check tables
  console.log('📋 TABLES:');
  const tables = ['user_profiles', 'artists', 'releases', 'wallets', 'change_requests', 'revenue_distributions', 'subscription_payments', 'wallet_transactions'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table} - ${error.message}`);
      } else {
        console.log(`✅ ${table} - exists`);
      }
    } catch (err) {
      console.log(`❌ ${table} - ${err.message}`);
    }
  }
  
  // Check types/enums using raw SQL
  console.log('\n🏷️  TYPES/ENUMS:');
  const types = ['user_role', 'subscription_plan', 'release_status', 'approval_status', 'format_type', 'product_type', 'publishing_type', 'release_workflow_status', 'business_type', 'payment_method', 'change_request_type'];
  
  for (const type of types) {
    try {
      const { data, error } = await supabaseAdmin.rpc('check_type_exists', { type_name: type });
      if (error) {
        // Fallback: try direct query
        const { data: typeData, error: typeError } = await supabaseAdmin
          .from('pg_type')
          .select('typname')
          .eq('typname', type)
          .single();
        
        if (typeError) {
          console.log(`❌ ${type} - doesn't exist`);
        } else {
          console.log(`✅ ${type} - exists`);
        }
      } else {
        console.log(`✅ ${type} - exists`);
      }
    } catch (err) {
      console.log(`❌ ${type} - doesn't exist`);
    }
  }
  
  // Check functions
  console.log('\n⚙️  FUNCTIONS:');
  const functions = ['handle_updated_at', 'auto_save_release', 'sync_profile_data'];
  
  for (const func of functions) {
    try {
      const { data, error } = await supabaseAdmin
        .from('pg_proc')
        .select('proname')
        .eq('proname', func)
        .single();
      
      if (error) {
        console.log(`❌ ${func} - doesn't exist`);
      } else {
        console.log(`✅ ${func} - exists`);
      }
    } catch (err) {
      console.log(`❌ ${func} - doesn't exist`);
    }
  }
  
  // Check triggers
  console.log('\n🔄 TRIGGERS:');
  const triggers = ['trigger_user_profiles_updated_at', 'trigger_artists_updated_at', 'trigger_releases_updated_at'];
  
  for (const trigger of triggers) {
    try {
      const { data, error } = await supabaseAdmin
        .from('pg_trigger')
        .select('tgname')
        .eq('tgname', trigger)
        .single();
      
      if (error) {
        console.log(`❌ ${trigger} - doesn't exist`);
      } else {
        console.log(`✅ ${trigger} - exists`);
      }
    } catch (err) {
      console.log(`❌ ${trigger} - doesn't exist`);
    }
  }
}

checkDatabaseObjects().catch(console.error);
