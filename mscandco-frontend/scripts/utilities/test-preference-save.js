/**
 * Test script to verify preference saving works correctly
 * This will toggle a preference and verify it saves to the database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPreferenceSave() {
  try {
    const userId = '0a060de5-1c94-4060-a1c2-860224fc348d'; // Your user ID from logs

    console.log('🧪 Testing preference save flow...\n');

    // Step 1: Read current state
    console.log('📖 Step 1: Reading current preferences from database...');
    const { data: before, error: readError } = await supabase
      .from('user_profiles')
      .select('show_accessibility_features, show_open_data_features, show_sustainability_features, show_lyrics_features, show_copyright_features, show_learning_features')
      .eq('id', userId)
      .single();

    if (readError) {
      console.error('❌ Error reading:', readError);
      return;
    }

    console.log('Current state:', before);

    // Step 2: Toggle sustainability (currently false, let's set to true)
    console.log('\n🔄 Step 2: Toggling show_sustainability_features from false to true...');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        show_sustainability_features: true
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error updating:', updateError);
      return;
    }

    console.log('✅ Update command sent successfully');

    // Step 3: Read back to verify
    console.log('\n📖 Step 3: Reading back to verify the change...');
    const { data: after, error: verifyError } = await supabase
      .from('user_profiles')
      .select('show_accessibility_features, show_open_data_features, show_sustainability_features, show_lyrics_features, show_copyright_features, show_learning_features')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
      return;
    }

    console.log('New state:', after);

    // Step 4: Compare
    console.log('\n📊 Step 4: Comparison:');
    console.log('Before:', before.show_sustainability_features);
    console.log('After:', after.show_sustainability_features);

    if (after.show_sustainability_features === true) {
      console.log('\n✅ SUCCESS! Preference saved and persisted correctly!');
    } else {
      console.log('\n❌ FAILED! Preference did not persist!');
    }

    // Step 5: Toggle back to original state
    console.log('\n🔄 Step 5: Toggling back to original state...');
    const { error: restoreError } = await supabase
      .from('user_profiles')
      .update({
        show_sustainability_features: false
      })
      .eq('id', userId);

    if (restoreError) {
      console.error('❌ Error restoring:', restoreError);
      return;
    }

    console.log('✅ Restored to original state');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPreferenceSave();
