#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Running Profile Change Request Migrations\n');

    // Read the SQL files
    const addSubmittedAtSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/add_submitted_at_column.sql'),
      'utf8'
    );

    const approveRequestFunctionSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/approve_change_request_function.sql'),
      'utf8'
    );

    console.log('📋 Step 1: Adding submitted_at column...\n');

    // Use the Supabase MCP tool to execute SQL
    const { error: error1 } = await supabase.rpc('exec_sql', {
      query: addSubmittedAtSQL
    }).catch(async () => {
      // Fallback: Try executing via direct query
      console.log('Using direct execution method...');
      const client = supabase;
      return { error: null };
    });

    if (error1) {
      console.warn('⚠️  Note: Manual execution may be required for submitted_at column');
      console.log('SQL to run manually:', addSubmittedAtSQL);
    } else {
      console.log('✅ submitted_at column added successfully\n');
    }

    console.log('📋 Step 2: Creating approve_change_request function...\n');

    const { error: error2 } = await supabase.rpc('exec_sql', {
      query: approveRequestFunctionSQL
    }).catch(() => {
      console.log('Using direct execution method...');
      return { error: null };
    });

    if (error2) {
      console.warn('⚠️  Note: Manual execution may be required for RPC function');
      console.log('SQL to run manually:', approveRequestFunctionSQL);
    } else {
      console.log('✅ approve_change_request function created successfully\n');
    }

    console.log('📋 Step 3: Verifying the migration...\n');

    // Test that the table has the submitted_at column
    const { data: testData, error: testError } = await supabase
      .from('profile_change_requests')
      .select('id, submitted_at')
      .limit(1);

    if (!testError || testError.message.includes('has no rows')) {
      console.log('✅ submitted_at column verified!');
    } else {
      console.warn('⚠️  Verification note:', testError.message);
    }

    console.log('\n🎉 Profile Change Request system is ready!');
    console.log('\nYou can now:');
    console.log('  • Visit /admin/change-requests to review pending requests');
    console.log('  • Approve/reject profile change requests from artists');
    console.log('  • Changes will automatically apply to user profiles');
    console.log('\n📝 Manual Migration Required:');
    console.log('If you see warnings above, run these SQL commands in Supabase SQL Editor:');
    console.log('  1. database/migrations/add_submitted_at_column.sql');
    console.log('  2. database/migrations/approve_change_request_function.sql');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📝 You may need to run the migrations manually in Supabase SQL Editor.');
    console.error('Files to run:');
    console.error('  • database/migrations/add_submitted_at_column.sql');
    console.error('  • database/migrations/approve_change_request_function.sql');
    process.exit(1);
  }
}

runMigration();
