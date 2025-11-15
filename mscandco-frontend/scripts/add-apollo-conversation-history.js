/**
 * Add conversation_history column to onboarding_progress table
 * Run this once to enable Apollo's intelligent conversation handling
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addConversationHistoryColumn() {
  console.log('🔧 Adding conversation_history column to onboarding_progress...');

  try {
    // Execute the ALTER TABLE command
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE onboarding_progress
        ADD COLUMN IF NOT EXISTS conversation_history JSONB DEFAULT '[]'::jsonb;

        COMMENT ON COLUMN onboarding_progress.conversation_history
        IS 'Stores the full conversation history between user and Apollo for context-aware responses';
      `
    });

    if (error) {
      console.error('❌ Error adding column:', error);
      console.log('\n💡 You can add this column manually in Supabase SQL Editor:');
      console.log('\nALTER TABLE onboarding_progress ADD COLUMN IF NOT EXISTS conversation_history JSONB DEFAULT \'[]\'::jsonb;\n');
      return;
    }

    console.log('✅ Successfully added conversation_history column!');
    console.log('🎉 Apollo is now fully intelligent and can handle conversations naturally!');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    console.log('\n💡 You can add this column manually in Supabase SQL Editor:');
    console.log('\nALTER TABLE onboarding_progress ADD COLUMN IF NOT EXISTS conversation_history JSONB DEFAULT \'[]\'::jsonb;\n');
  }
}

addConversationHistoryColumn();
