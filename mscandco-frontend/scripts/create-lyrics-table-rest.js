/**
 * Create lyrics table using Supabase REST API
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

    // Read the SQL file
    const sql = readFileSync('database/migrations/add_lyrics_table.sql', 'utf8');

    console.log('📋 SQL to execute:');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    console.log('\n⚠️  PLEASE RUN THE ABOVE SQL IN SUPABASE SQL EDITOR\n');
    console.log('Steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the SQL above');
    console.log('5. Click "Run"\n');

    console.log('Once done, the lyrics table will be created with:');
    console.log('✅ All required columns (id, release_id, track_name, lyrics_text, etc.)');
    console.log('✅ JSONB fields for AI analysis results');
    console.log('✅ Row Level Security policies');
    console.log('✅ Indexes for performance');
    console.log('✅ Updated_at trigger\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createLyricsTable();
