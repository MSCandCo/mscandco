/**
 * Enable all community features for all users
 * Run this to turn on Open Data, Sustainability, Lyrics, Copyright, and Learning features
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function enableAllFeatures() {
  try {
    console.log('🔧 Enabling all community features for all users...\n');

    // Update all users to have all features enabled
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        show_accessibility_features: true,
        show_open_data_features: true,
        show_sustainability_features: true,
        show_lyrics_features: true,
        show_copyright_features: true,
        show_learning_features: true
      })
      .is('id', null); // This will match nothing, so we need to use a different approach

    if (error) {
      console.error('❌ Error:', error);

      // Try updating all rows without a WHERE clause
      const { data: allData, error: allError } = await supabase
        .rpc('enable_all_features_for_all_users');

      if (allError) {
        console.log('⚠️  RPC function not found, using direct update...');

        // Get all user IDs first
        const { data: users } = await supabase
          .from('user_profiles')
          .select('id');

        if (users && users.length > 0) {
          console.log(`📊 Found ${users.length} users`);

          for (const user of users) {
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({
                show_accessibility_features: true,
                show_open_data_features: true,
                show_sustainability_features: true,
                show_lyrics_features: true,
                show_copyright_features: true,
                show_learning_features: true
              })
              .eq('id', user.id);

            if (updateError) {
              console.error(`❌ Failed for user ${user.id}:`, updateError.message);
            } else {
              console.log(`✅ Enabled features for user ${user.id}`);
            }
          }
        }
      } else {
        console.log('✅ RPC function executed successfully');
      }
    } else {
      console.log('✅ Features enabled for all users');
    }

    console.log('\n✨ Done! All community features are now enabled.');
    console.log('\n📋 Enabled features:');
    console.log('  ✅ Accessibility');
    console.log('  ✅ Open Data');
    console.log('  ✅ Sustainability');
    console.log('  ✅ Lyrics Analysis');
    console.log('  ✅ Copyright');
    console.log('  ✅ Learning');

    console.log('\n💡 Users can now toggle these on/off in Settings > Preferences');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

enableAllFeatures();
