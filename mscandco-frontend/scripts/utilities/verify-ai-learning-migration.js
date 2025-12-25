#!/usr/bin/env node

/**
 * Verify Advanced AI Learning Migration
 * Checks if all components are properly created
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyMigration() {
  console.log('🔍 Verifying Advanced AI Learning Migration\n');
  console.log('='.repeat(80));

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
      name: 'AI Prediction Accuracy Column',
      check: async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('ai_prediction_accuracy')
          .limit(1);
        return !error;
      }
    },
    {
      name: 'AI Behavioral Cluster Column',
      check: async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('ai_behavioral_cluster')
          .limit(1);
        return !error;
      }
    },
    {
      name: 'AI Last Learning Update Column',
      check: async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('ai_last_learning_update')
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
        try {
          const { data, error } = await supabase.rpc('update_advanced_learning', {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_category: 'test',
            p_data: { test: true }
          });
          // Function exists if we get a specific error (not "function doesn't exist")
          return error && !error.message.includes('does not exist');
        } catch (err) {
          return false;
        }
      }
    },
    {
      name: 'calculate_confidence Function',
      check: async () => {
        try {
          const { data, error } = await supabase.rpc('calculate_confidence', {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_category: 'test',
            p_data: { test: true }
          });
          return error && !error.message.includes('does not exist');
        } catch (err) {
          return false;
        }
      }
    },
    {
      name: 'calculate_intelligence_score Function',
      check: async () => {
        try {
          const { data, error } = await supabase.rpc('calculate_intelligence_score', {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_learning_data: { test: true }
          });
          return error && !error.message.includes('does not exist');
        } catch (err) {
          return false;
        }
      }
    },
    {
      name: 'detect_behavioral_patterns Function',
      check: async () => {
        try {
          const { data, error } = await supabase.rpc('detect_behavioral_patterns', {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_category: 'test',
            p_data: { test: true }
          });
          return error && !error.message.includes('does not exist');
        } catch (err) {
          return false;
        }
      }
    },
    {
      name: 'get_optimal_recommendation Function',
      check: async () => {
        try {
          const { data, error } = await supabase.rpc('get_optimal_recommendation', {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_recommendation_type: 'genre'
          });
          return error && !error.message.includes('does not exist');
        } catch (err) {
          return false;
        }
      }
    },
    {
      name: 'predict_next_value Function',
      check: async () => {
        try {
          const { data, error } = await supabase.rpc('predict_next_value', {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_metric: 'releases',
            p_timeframe: '30 days'
          });
          return error && !error.message.includes('does not exist');
        } catch (err) {
          return false;
        }
      }
    },
    {
      name: 'find_similar_users Function',
      check: async () => {
        try {
          const { data, error } = await supabase.rpc('find_similar_users', {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_category: 'releases',
            p_limit: 10
          });
          return error && !error.message.includes('does not exist');
        } catch (err) {
          return false;
        }
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
  const passedCount = results.filter(r => r.exists).length;
  const totalCount = results.length;

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Verification Summary:`);
  console.log(`  ✅ Passed: ${passedCount}/${totalCount}`);
  console.log(`  ❌ Failed: ${totalCount - passedCount}/${totalCount}`);

  if (allPassed) {
    console.log('\n🎉 All components verified successfully!');
    console.log('The Advanced AI Learning System is fully operational.\n');
  } else {
    console.log('\n⚠️  Some components are missing.');
    console.log('Please execute the migration SQL in Supabase SQL Editor:\n');
    console.log('https://supabase.com/dashboard/project/[your-project]/sql/new');
    console.log('\nMigration file: mscandco-frontend/supabase/migrations/20250109000004_advanced_ai_learning.sql\n');
  }

  return allPassed;
}

verifyMigration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

