// Test script to verify super admin auto-CC on notifications
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Create a notification and automatically CC all super admins
 */
async function createNotification({
  user_id,
  type,
  title,
  message,
  data = null,
  action_url = null
}) {
  try {
    console.log('📧 Creating notification for user:', user_id);

    // Get all super admin user IDs
    const { data: superAdmins, error: superAdminError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('role', 'super_admin');

    if (superAdminError) {
      console.error('❌ Error fetching super admins:', superAdminError);
    }

    const superAdminIds = superAdmins?.map(admin => admin.id) || [];
    console.log(`   📬 CC'ing ${superAdminIds.length} super admin(s):`, superAdmins?.map(a => a.email));

    // Create notification for primary recipient
    const primaryNotification = {
      user_id,
      type,
      title,
      message,
      data,
      action_url,
      read: false
    };

    // Create notifications for super admins (as CC)
    const superAdminNotifications = superAdminIds
      .filter(adminId => adminId !== user_id) // Don't duplicate if user is super admin
      .map(adminId => ({
        user_id: adminId,
        type,
        title: `[CC] ${title}`, // Prefix to indicate it's a CC
        message,
        data: {
          ...data,
          cc_notification: true,
          original_recipient_id: user_id
        },
        action_url,
        read: false
      }));

    // Combine all notifications
    const allNotifications = [primaryNotification, ...superAdminNotifications];

    console.log(`   📨 Creating ${allNotifications.length} total notification(s)`);

    // Insert all notifications in a single query
    const { data: insertedNotifications, error: insertError } = await supabase
      .from('notifications')
      .insert(allNotifications)
      .select();

    if (insertError) {
      console.error('❌ Error inserting notifications:', insertError);
      return { success: false, error: insertError };
    }

    console.log(`✅ Created ${insertedNotifications.length} notification(s)`);
    console.log('   Primary notification ID:', insertedNotifications[0].id);
    if (superAdminNotifications.length > 0) {
      console.log('   CC notification IDs:', insertedNotifications.slice(1).map(n => n.id));
    }

    return {
      success: true,
      notifications: insertedNotifications,
      primary_notification: insertedNotifications[0],
      cc_count: superAdminNotifications.length
    };

  } catch (error) {
    console.error('❌ Error in createNotification:', error);
    return { success: false, error };
  }
}

// Test the function
async function test() {
  console.log('🧪 Testing super admin auto-CC notification system\n');

  const result = await createNotification({
    user_id: '0a060de5-1c94-4060-a1c2-860224fc348d', // Artist: info@htay.co.uk
    type: 'system',
    title: 'Test Super Admin CC',
    message: 'This is a test notification to verify super admin is automatically CC\'d on all notifications',
    data: { test: true, timestamp: new Date().toISOString() }
  });

  console.log('\n📊 Result:', JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

test();
