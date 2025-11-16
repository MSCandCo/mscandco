/**
 * Create lyrics table in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createLyricsTable() {
  try {
    console.log('🔧 Creating lyrics table...\n');

    const sql = readFileSync('database/migrations/add_lyrics_table.sql', 'utf8');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If RPC doesn't exist, try direct approach
      console.log('⚠️  RPC method not available, executing SQL directly...\n');

      // Execute SQL line by line
      const statements = sql.split(';').filter(s => s.trim());

      for (const statement of statements) {
        if (!statement.trim()) continue;

        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error: execError } = await supabase.from('_sql').insert({ query: statement });

        if (execError) {
          console.error('Error:', execError.message);
        }
      }

      console.log('\n⚠️  Could not execute via Supabase client.');
      console.log('📋 Please run this SQL manually in Supabase SQL Editor:\n');
      console.log(sql);
      return;
    }

    console.log('✅ Lyrics table created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please run the SQL manually in Supabase SQL Editor.');
    console.log('File location: database/migrations/add_lyrics_table.sql');
  }
}

createLyricsTable();
