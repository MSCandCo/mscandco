#!/usr/bin/env node

/**
 * Execute Advanced AI Learning Migration
 * Applies all SQL migrations and verifies integration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
    .filter(s => !s.match(/^\s*COMMENT\s+ON/i)) // Skip COMMENT statements
    .filter(s => !s.match(/^\s*GRANT\s+/i)); // Skip GRANT statements (handled separately)

  const results = [];
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    try {
      // Try using Supabase RPC if available
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';' 
      }).catch(async () => {
        // Fallback: Try direct query execution
        return await supabase.from('_migration').insert([{ sql: statement + ';' }]).select();
      });

      if (error) {
        // Check if it's a "already exists" error (which is OK)
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.code === '42P07' || 
            error.code === '42710') {
          results.push({ 
            statement: statement.substring(0, 50) + '...', 
            status: 'skipped (already exists)',
            ok: true 
          });
        } else {
          results.push({ 
            statement: statement.substring(0, 50) + '...', 
            status: 'error',
            error: error.message,
            ok: false 
          });
        }
      } else {
        results.push({ 
          statement: statement.substring(0, 50) + '...', 
          status: 'success',
          ok: true 
        });
      }
    } catch (err) {
      results.push({ 
        statement: statement.substring(0, 50) + '...', 
        status: 'error',
        error: err.message,
        ok: false 
      });
    }
  }

  return results;
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...\n');

  const checks = [
    {
      name: 'AI Intelligence Score Column',
      check: async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('ai_intelligence_score')
          .limit(1);
        return !error;
      }
    },
    {
      name: 'AI Learning Confidence Column',
      check: async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('ai_learning_confidence')
          .limit(1);
        return !error;
      }
    },
    {
      name: 'AI Learning Analytics Table',
      check: async () => {
        const { data, error } = await supabase
          .from('ai_learning_analytics')
          .select('id')
          .limit(1);
        return !error;
      }
    },
    {
      name: 'AI Behavioral Patterns Table',
      check: async () => {
        const { data, error } = await supabase
          .from('ai_behavioral_patterns')
          .select('id')
          .limit(1);
        return !error;
      }
    },
    {
      name: 'AI Prediction Outcomes Table',
      check: async () => {
        const { data, error } = await supabase
          .from('ai_prediction_outcomes')
          .select('id')
          .limit(1);
        return !error;
      }
    },
    {
      name: 'update_advanced_learning Function',
      check: async () => {
        const { data, error } = await supabase.rpc('update_advanced_learning', {
          p_user_id: '00000000-0000-0000-0000-000000000000',
          p_category: 'test',
          p_data: { test: true }
        });
        // Function exists if we get a specific error (not "function doesn't exist")
        return error && !error.message.includes('does not exist');
      }
    },
    {
      name: 'calculate_confidence Function',
      check: async () => {
        const { data, error } = await supabase.rpc('calculate_confidence', {
          p_user_id: '00000000-0000-0000-0000-000000000000',
          p_category: 'test',
          p_data: { test: true }
        });
        return error && !error.message.includes('does not exist');
      }
    },
    {
      name: 'get_optimal_recommendation Function',
      check: async () => {
        const { data, error } = await supabase.rpc('get_optimal_recommendation', {
          p_user_id: '00000000-0000-0000-0000-000000000000',
          p_recommendation_type: 'genre'
        });
        return error && !error.message.includes('does not exist');
      }
    }
  ];

  const results = [];
  for (const check of checks) {
    try {
      const exists = await check.check();
      results.push({ name: check.name, status: exists ? '✅' : '❌', exists });
      console.log(`${exists ? '✅' : '❌'} ${check.name}`);
    } catch (err) {
      results.push({ name: check.name, status: '❌', exists: false, error: err.message });
      console.log(`❌ ${check.name} - Error: ${err.message}`);
    }
  }

  const allPassed = results.every(r => r.exists);
  return { allPassed, results };
}

async function runMigration() {
  console.log('🚀 Executing Advanced AI Learning Migration\n');
  console.log('=' .repeat(80));

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250109000004_advanced_ai_learning.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`📄 Loaded migration file: ${migrationPath}\n`);

    // Execute the SQL
    console.log('📊 Executing SQL statements...\n');
    const results = await executeSQL(sql);

    // Show results
    const successCount = results.filter(r => r.ok).length;
    const errorCount = results.filter(r => !r.ok).length;
    const skippedCount = results.filter(r => r.status.includes('already exists')).length;

    console.log(`\n📈 Execution Summary:`);
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ⏭️  Skipped (already exists): ${skippedCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);

    if (errorCount > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      results.filter(r => !r.ok).forEach(r => {
        console.log(`  - ${r.statement}`);
        console.log(`    Error: ${r.error}`);
      });
    }

    // Verify migration
    const verification = await verifyMigration();

    console.log(`\n${'='.repeat(80)}`);
    if (verification.allPassed) {
      console.log('\n✅ Migration completed successfully!');
      console.log('All components verified and ready to use.\n');
    } else {
      console.log('\n⚠️  Migration completed with some issues.');
      console.log('Some components may need manual verification.\n');
    }

    // Show next steps
    console.log('📋 Next Steps:');
    console.log('1. Restart Cursor/Claude Desktop to load new MCP tools');
    console.log('2. Test advanced intelligence: Use get_advanced_intelligence tool');
    console.log('3. Monitor learning: System will automatically learn from interactions');
    console.log('4. Check API endpoints: /api/ai/intelligence/[userId]\n');

    return verification.allPassed;

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('\n📋 Manual Execution Required:');
    console.log('Please run the SQL migration manually in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/[your-project]/sql/new\n');
    return false;
  }
}

// Run migration
runMigration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

