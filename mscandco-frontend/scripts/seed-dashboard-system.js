/**
 * Seed Dashboard System with Widget Types and Default Widgets
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDashboardSystem() {
  console.log('🌱 Seeding dashboard system...\n');

  try {
    // 1. Insert Widget Types
    console.log('📦 Creating widget types...');

    const widgetTypes = [
      { name: 'stats_card', display_name: 'Statistics Card', component_name: 'StatsCard', default_width: '1/4', default_height: 'small' },
      { name: 'message_box_half', display_name: 'Message Box (Half)', component_name: 'MessageBox', default_width: '1/2', default_height: 'auto' },
      { name: 'message_box_full', display_name: 'Message Box (Full)', component_name: 'MessageBox', default_width: 'full', default_height: 'auto' },
      { name: 'chart_line', display_name: 'Line Chart', component_name: 'LineChart', default_width: '1/2', default_height: 'medium' },
      { name: 'activity_feed', display_name: 'Activity Feed', component_name: 'ActivityFeed', default_width: '1/3', default_height: 'large' },
      { name: 'quick_actions', display_name: 'Quick Actions', component_name: 'QuickActions', default_width: '1/4', default_height: 'small' }
    ];

    for (const type of widgetTypes) {
      const { error } = await supabase
        .from('dashboard_widget_types')
        .upsert(type, { onConflict: 'name' });

      if (error) console.error(`  ❌ Error creating ${type.name}:`, error.message);
      else console.log(`  ✅ Created widget type: ${type.display_name}`);
    }

    // 2. Get widget type IDs
    const { data: types } = await supabase
      .from('dashboard_widget_types')
      .select('id, name');

    const typeMap = {};
    types.forEach(t => typeMap[t.name] = t.id);

    // 3. Create Default Widgets
    console.log('\n🎨 Creating default widgets...');

    const widgets = [
      // Super Admin / Company Admin Widgets
      {
        widget_type_id: typeMap['message_box_full'],
        name: 'Platform Announcements',
        description: 'Critical platform-wide announcements',
        config: { messageSource: 'platform_messages', priority: 'high' },
        default_width: 'full',
        default_order: 1
      },
      {
        widget_type_id: typeMap['stats_card'],
        name: 'Total Users',
        description: 'Total number of users',
        config: { metric: 'total_users', icon: 'users', color: 'blue' },
        required_permission: 'users_access:user_management:read',
        default_width: '1/4',
        default_order: 2
      },
      {
        widget_type_id: typeMap['stats_card'],
        name: 'Total Revenue',
        description: 'Platform-wide revenue',
        config: { metric: 'total_revenue', icon: 'dollar', color: 'green', format: 'currency' },
        required_permission: 'finance:earnings_management:read',
        default_width: '1/4',
        default_order: 3
      },
      {
        widget_type_id: typeMap['stats_card'],
        name: 'Active Releases',
        description: 'Number of active releases',
        config: { metric: 'active_releases', icon: 'music', color: 'purple' },
        required_permission: 'content:master_roster:read',
        default_width: '1/4',
        default_order: 4
      },
      {
        widget_type_id: typeMap['stats_card'],
        name: 'Active Subscriptions',
        description: 'Number of active subscriptions',
        config: { metric: 'active_subscriptions', icon: 'star', color: 'yellow' },
        default_width: '1/4',
        default_order: 5
      },

      // Artist Widgets
      {
        widget_type_id: typeMap['message_box_full'],
        name: 'Artist Announcements',
        description: 'Important updates for artists',
        config: { messageSource: 'artist_messages' },
        required_role: 'artist',
        default_width: 'full',
        default_order: 1
      },
      {
        widget_type_id: typeMap['stats_card'],
        name: 'Total Streams',
        description: 'Your total stream count',
        config: { metric: 'artist_streams', icon: 'play', color: 'blue' },
        required_role: 'artist',
        default_width: '1/4',
        default_order: 2
      },
      {
        widget_type_id: typeMap['stats_card'],
        name: 'Total Earnings',
        description: 'Your total earnings',
        config: { metric: 'artist_earnings', icon: 'dollar', color: 'green', format: 'currency' },
        required_role: 'artist',
        default_width: '1/4',
        default_order: 3
      },
      {
        widget_type_id: typeMap['stats_card'],
        name: 'Active Releases',
        description: 'Your active releases',
        config: { metric: 'artist_releases', icon: 'music', color: 'purple' },
        required_role: 'artist',
        default_width: '1/4',
        default_order: 4
      },
      {
        widget_type_id: typeMap['stats_card'],
        name: 'Monthly Listeners',
        description: 'Your monthly listeners',
        config: { metric: 'monthly_listeners', icon: 'users', color: 'orange' },
        required_role: 'artist',
        default_width: '1/4',
        default_order: 5
      }
    ];

    for (const widget of widgets) {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .insert(widget)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          console.log(`  ℹ️  Widget already exists: ${widget.name}`);
        } else {
          console.error(`  ❌ Error creating ${widget.name}:`, error.message);
        }
      } else {
        console.log(`  ✅ Created widget: ${widget.name}`);
      }
    }

    console.log('\n✅ Dashboard system seeded successfully!\n');

  } catch (error) {
    console.error('\n❌ Error seeding dashboard:', error);
    throw error;
  }
}

seedDashboardSystem()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
