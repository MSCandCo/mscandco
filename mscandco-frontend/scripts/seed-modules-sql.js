import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedModules() {
  console.log('🌱 Loading comprehensive learning modules SQL...\n');

  const sqlPath = join(__dirname, '../database/seed-data/learning_modules_comprehensive.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });

    if (error) {
      console.error('❌ Error executing SQL:', error.message);
      return;
    }

    console.log('✅ Successfully seeded learning modules!');
    console.log('📊 Modules loaded from comprehensive seed data file');

    // Verify
    const { data: modules, error: verifyError } = await supabase
      .from('learning_modules')
      .select('id, title, category')
      .order('category', { ascending: true })
      .order('order_index', { ascending: true });

    if (verifyError) {
      console.error('⚠️  Could not verify:', verifyError.message);
    } else {
      console.log(`\n📚 Total modules in database: ${modules.length}`);
      console.log('\nModules by category:');

      const byCategory = modules.reduce((acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + 1;
        return acc;
      }, {});

      Object.entries(byCategory).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} modules`);
      });
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

seedModules();
