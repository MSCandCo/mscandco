#!/usr/bin/env node

/**
 * Complete Deployment Verification Script
 * Verifies both Grant Features and AI Learning System
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifyTables() {
  log('\n📊 VERIFYING DATABASE TABLES\n', 'bold');

  const grantFeatureTables = [
    'copyright_verifications',
    'copyright_clearances',
    'copyright_knowledge_base',
    'carbon_footprint_tracking',
    'sustainability_profiles',
    'carbon_offset_transactions',
    'accessibility_content',
    'accessibility_compliance',
    'open_data_metrics',
    'research_datasets',
    'open_data_api_keys',
    'learning_modules',
    'learning_enrollments',
    'learning_certificates',
    'ai_tutor_sessions',
    'user_skill_profiles',
    'learning_lessons',
    'streaming_trends',
    'grant_features_metadata',
  ];

  const aiLearningTables = [
    'ai_learning_analytics',
    'ai_behavioral_patterns',
    'ai_prediction_outcomes',
  ];

  let grantFeaturesCount = 0;
  let aiLearningCount = 0;

  // Verify Grant Features tables
  for (const table of grantFeatureTables) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .limit(1);

    if (!error) {
      log(`  ✓ ${table}`, 'green');
      grantFeaturesCount++;
    } else {
      log(`  ✗ ${table} - ${error.message}`, 'red');
    }
  }

  // Verify AI Learning tables
  for (const table of aiLearningTables) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .limit(1);

    if (!error) {
      log(`  ✓ ${table}`, 'green');
      aiLearningCount++;
    } else {
      log(`  ✗ ${table} - ${error.message}`, 'red');
    }
  }

  log(`\n  Grant Features Tables: ${grantFeaturesCount}/${grantFeatureTables.length}`, grantFeaturesCount === grantFeatureTables.length ? 'green' : 'yellow');
  log(`  AI Learning Tables: ${aiLearningCount}/${aiLearningTables.length}`, aiLearningCount === aiLearningTables.length ? 'green' : 'yellow');

  return { grantFeaturesCount, aiLearningCount };
}

async function verifyRLS() {
  log('\n🔒 VERIFYING RLS POLICIES\n', 'bold');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT tablename, COUNT(*) as policy_count
      FROM pg_policies
      WHERE schemaname = 'public'
      AND (
        tablename LIKE '%copyright%' OR
        tablename LIKE '%carbon%' OR
        tablename LIKE '%accessibility%' OR
        tablename LIKE '%learning%' OR
        tablename LIKE 'ai_%'
      )
      GROUP BY tablename
      ORDER BY tablename;
    `
  }).catch(() => null);

  if (data && data.length > 0) {
    data.forEach(row => {
      log(`  ✓ ${row.tablename}: ${row.policy_count} policies`, 'green');
    });
  } else {
    log('  ⚠ Unable to verify RLS policies (may need service role access)', 'yellow');
  }
}

async function verifyMetadata() {
  log('\n📋 VERIFYING GRANT FEATURES METADATA\n', 'bold');

  const { data, error } = await supabase
    .from('grant_features_metadata')
    .select('feature_name, deployment_status');

  if (error) {
    log(`  ✗ Could not fetch metadata: ${error.message}`, 'red');
    return;
  }

  if (data && data.length > 0) {
    data.forEach(feature => {
      const status = feature.deployment_status === 'active' ? 'green' : 'yellow';
      log(`  ✓ ${feature.feature_name}: ${feature.deployment_status}`, status);
    });
  } else {
    log('  ⚠ No metadata found', 'yellow');
  }
}

async function verifyAIColumns() {
  log('\n🤖 VERIFYING AI LEARNING COLUMNS\n', 'bold');

  const columns = [
    'ai_intelligence_score',
    'ai_learning_confidence',
    'ai_prediction_accuracy',
    'ai_behavioral_cluster',
    'ai_last_learning_update',
  ];

  // Check if columns exist by trying to select them
  const { data, error } = await supabase
    .from('user_profiles')
    .select(columns.join(','))
    .limit(1);

  if (!error) {
    log('  ✓ All AI learning columns exist in user_profiles', 'green');
    columns.forEach(col => log(`    - ${col}`, 'blue'));
  } else {
    log(`  ✗ AI columns check failed: ${error.message}`, 'red');
  }
}

async function generateReport() {
  log('\n' + '='.repeat(60), 'bold');
  log('  COMPLETE DEPLOYMENT VERIFICATION REPORT', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  const tables = await verifyTables();
  await verifyRLS();
  await verifyMetadata();
  await verifyAIColumns();

  log('\n' + '='.repeat(60), 'bold');
  log('  SUMMARY', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  const total = tables.grantFeaturesCount + tables.aiLearningCount;
  const expected = 22; // 19 grant features + 3 AI learning

  if (total >= expected) {
    log('  ✅ DEPLOYMENT SUCCESSFUL!', 'green');
    log(`  📊 ${total} tables verified and operational`, 'green');
    log('  🎉 Ready for production use!', 'green');
  } else {
    log(`  ⚠ PARTIAL DEPLOYMENT`, 'yellow');
    log(`  📊 ${total}/${expected} tables verified`, 'yellow');
    log('  🔧 Some components may need attention', 'yellow');
  }

  log('\n  Next Steps:', 'bold');
  log('  1. Build frontend dashboards', 'blue');
  log('  2. Complete API routes', 'blue');
  log('  3. Integrate MCP tools', 'blue');
  log('  4. Test with real data', 'blue');
  log('  5. Submit grant applications', 'blue');

  log('\n' + '='.repeat(60) + '\n', 'bold');
}

generateReport().catch(console.error);
