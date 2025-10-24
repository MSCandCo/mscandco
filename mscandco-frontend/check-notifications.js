require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkNotifications() {
  console.log('🔍 Checking notifications in database\n');

  // Get all notifications
  const { data: allNotifications, error: allError } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ Error fetching notifications:', allError);
    return;
  }

  console.log(`📊 Total notifications in database: ${allNotifications.length}\n`);

  if (allNotifications.length === 0) {
    console.log('⚠️  No notifications found in database.');
    console.log('\n💡 Creating a sample notification for testing...\n');

    // Get an artist user
    const { data: artistUser, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name')
      .eq('role', 'artist')
      .limit(1)
      .single();

    if (userError || !artistUser) {
      console.error('❌ No artist user found to create sample notification');
      return;
    }

    // Create a sample notification
    const { data: newNotif, error: createError } = await supabase
      .from('notifications')
      .insert({
        user_id: artistUser.id,
        type: 'earning',
        title: 'New Earnings Posted',
        message: 'Your earnings for the month have been posted to your account.',
        read: false,
        action_required: false,
        data: {
          amount: 150.00,
          currency: 'GBP',
          period: 'October 2025'
        }
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating sample notification:', createError);
    } else {
      console.log('✅ Sample notification created:', newNotif);
    }
    return;
  }

  // Group by user
  const byUser = allNotifications.reduce((acc, notif) => {
    if (!acc[notif.user_id]) {
      acc[notif.user_id] = [];
    }
    acc[notif.user_id].push(notif);
    return acc;
  }, {});

  console.log('📋 Notifications by user:\n');
  for (const userId in byUser) {
    const userNotifs = byUser[userId];
    
    // Get user details
    const { data: user } = await supabase
      .from('user_profiles')
      .select('email, first_name, last_name, role')
      .eq('id', userId)
      .single();

    console.log(`👤 User: ${user?.email || userId} (${user?.role || 'unknown'})`);
    console.log(`   Total: ${userNotifs.length} notifications`);
    console.log(`   Unread: ${userNotifs.filter(n => !n.read).length}`);
    console.log(`   Types: ${[...new Set(userNotifs.map(n => n.type))].join(', ')}`);
    console.log('');
  }

  console.log('\n📊 Notification Types:');
  const types = allNotifications.reduce((acc, notif) => {
    acc[notif.type] = (acc[notif.type] || 0) + 1;
    return acc;
  }, {});
  
  for (const type in types) {
    console.log(`   ${type}: ${types[type]}`);
  }

  console.log('\n📋 Recent notifications (last 5):');
  allNotifications.slice(0, 5).forEach((notif, i) => {
    console.log(`\n${i + 1}. ${notif.title} (${notif.type})`);
    console.log(`   User: ${notif.user_id}`);
    console.log(`   Message: ${notif.message}`);
    console.log(`   Read: ${notif.read ? '✅' : '❌'}`);
    console.log(`   Created: ${new Date(notif.created_at).toLocaleString()}`);
  });
}

checkNotifications();
