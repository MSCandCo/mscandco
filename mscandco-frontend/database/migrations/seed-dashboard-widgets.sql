-- Seed Dashboard Widget Types and Default Widgets
BEGIN;

-- Insert Widget Types
INSERT INTO dashboard_widget_types (name, display_name, description, component_name, default_width, default_height) VALUES
('stats_card', 'Statistics Card', 'Display a single metric with label and value', 'StatsCard', '1/4', 'small'),
('message_box_half', 'Message Box (Half)', 'Display announcements/messages in half-width', 'MessageBox', '1/2', 'auto'),
('message_box_full', 'Message Box (Full)', 'Display announcements/messages in full-width', 'MessageBox', 'full', 'auto'),
('chart_line', 'Line Chart', 'Display time-series data as line chart', 'LineChart', '1/2', 'medium'),
('chart_bar', 'Bar Chart', 'Display comparison data as bar chart', 'BarChart', '1/2', 'medium'),
('chart_pie', 'Pie Chart', 'Display proportional data as pie chart', 'PieChart', '1/3', 'medium'),
('activity_feed', 'Activity Feed', 'Display recent activities/events', 'ActivityFeed', '1/3', 'large'),
('quick_actions', 'Quick Actions', 'Display quick action buttons', 'QuickActions', '1/4', 'small'),
('table_widget', 'Data Table', 'Display tabular data', 'TableWidget', 'full', 'large')
ON CONFLICT (name) DO NOTHING;

-- Get widget type IDs
DO $$
DECLARE
  stats_card_id UUID;
  message_half_id UUID;
  message_full_id UUID;
  chart_line_id UUID;
  activity_feed_id UUID;
  quick_actions_id UUID;
BEGIN
  SELECT id INTO stats_card_id FROM dashboard_widget_types WHERE name = 'stats_card';
  SELECT id INTO message_half_id FROM dashboard_widget_types WHERE name = 'message_box_half';
  SELECT id INTO message_full_id FROM dashboard_widget_types WHERE name = 'message_box_full';
  SELECT id INTO chart_line_id FROM dashboard_widget_types WHERE name = 'chart_line';
  SELECT id INTO activity_feed_id FROM dashboard_widget_types WHERE name = 'activity_feed';
  SELECT id INTO quick_actions_id FROM dashboard_widget_types WHERE name = 'quick_actions';

  -- Super Admin Widgets
  INSERT INTO dashboard_widgets (widget_type_id, name, description, config, required_permission, default_width, default_order) VALUES
  -- Message Box (Full Width)
  (message_full_id, 'Platform Announcements', 'Critical platform-wide announcements',
   '{"messageSource": "platform_messages", "priority": "high"}', NULL, 'full', 1),

  -- Stats Cards
  (stats_card_id, 'Total Users', 'Total number of users in the platform',
   '{"metric": "total_users", "icon": "users", "color": "blue"}', 'users_access:user_management:read', '1/4', 2),

  (stats_card_id, 'Total Revenue', 'Platform-wide revenue',
   '{"metric": "total_revenue", "icon": "dollar", "color": "green", "format": "currency"}', 'finance:earnings_management:read', '1/4', 3),

  (stats_card_id, 'Active Releases', 'Number of active releases',
   '{"metric": "active_releases", "icon": "music", "color": "purple"}', 'content:master_roster:read', '1/4', 4),

  (stats_card_id, 'Active Subscriptions', 'Number of active subscriptions',
   '{"metric": "active_subscriptions", "icon": "star", "color": "yellow"}', NULL, '1/4', 5),

  -- Charts
  (chart_line_id, 'User Growth', 'User growth over time',
   '{"dataSource": "user_growth", "xAxis": "date", "yAxis": "count", "color": "blue"}', 'analytics:platform_analytics:read', '1/2', 6),

  (chart_line_id, 'Revenue Trends', 'Revenue trends over time',
   '{"dataSource": "revenue_trends", "xAxis": "date", "yAxis": "amount", "color": "green", "format": "currency"}', 'finance:earnings_management:read', '1/2', 7),

  -- Activity Feed
  (activity_feed_id, 'Recent Activity', 'Platform-wide recent activities',
   '{"dataSource": "platform_activity", "limit": 10}', NULL, '1/3', 8),

  -- Quick Actions
  (quick_actions_id, 'Admin Actions', 'Quick access to admin functions',
   '{"actions": ["add_user", "create_release", "view_analytics", "manage_permissions"]}', NULL, '1/4', 9)
  ON CONFLICT DO NOTHING;

  -- Artist Widgets
  INSERT INTO dashboard_widgets (widget_type_id, name, description, config, required_role, default_width, default_order) VALUES
  -- Message Box (Full Width)
  (message_full_id, 'Artist Announcements', 'Important updates for artists',
   '{"messageSource": "artist_messages", "priority": "medium"}', 'artist', 'full', 1),

  -- Stats Cards
  (stats_card_id, 'Total Streams', 'Your total stream count',
   '{"metric": "artist_streams", "icon": "play", "color": "blue"}', 'artist', '1/4', 2),

  (stats_card_id, 'Total Earnings', 'Your total earnings',
   '{"metric": "artist_earnings", "icon": "dollar", "color": "green", "format": "currency"}', 'artist', '1/4', 3),

  (stats_card_id, 'Active Releases', 'Your active releases',
   '{"metric": "artist_releases", "icon": "music", "color": "purple"}', 'artist', '1/4', 4),

  (stats_card_id, 'Monthly Listeners', 'Your monthly listeners',
   '{"metric": "monthly_listeners", "icon": "users", "color": "orange"}', 'artist', '1/4', 5),

  -- Charts
  (chart_line_id, 'Streams Over Time', 'Your streaming trends',
   '{"dataSource": "artist_stream_trends", "xAxis": "date", "yAxis": "streams", "color": "blue"}', 'artist', '1/2', 6),

  (chart_line_id, 'Earnings Over Time', 'Your earnings trends',
   '{"dataSource": "artist_earnings_trends", "xAxis": "date", "yAxis": "amount", "color": "green", "format": "currency"}', 'artist', '1/2', 7),

  -- Activity Feed
  (activity_feed_id, 'Recent Activity', 'Your recent activity',
   '{"dataSource": "artist_activity", "limit": 10}', 'artist', '1/3', 8),

  -- Quick Actions
  (quick_actions_id, 'Quick Actions', 'Quick access to common tasks',
   '{"actions": ["upload_release", "view_analytics", "check_earnings", "edit_profile"]}', 'artist', '1/4', 9)
  ON CONFLICT DO NOTHING;

  -- Label Admin Widgets
  INSERT INTO dashboard_widgets (widget_type_id, name, description, config, required_role, default_width, default_order) VALUES
  (message_half_id, 'Label Updates', 'Important label updates',
   '{"messageSource": "label_messages"}', 'label_admin', '1/2', 1),

  (stats_card_id, 'Total Artists', 'Artists under your label',
   '{"metric": "label_artists", "icon": "users", "color": "blue"}', 'label_admin', '1/4', 2),

  (stats_card_id, 'Label Revenue', 'Total label revenue',
   '{"metric": "label_revenue", "icon": "dollar", "color": "green", "format": "currency"}', 'label_admin', '1/4', 3),

  (stats_card_id, 'Active Releases', 'Active releases count',
   '{"metric": "label_releases", "icon": "music", "color": "purple"}', 'label_admin', '1/4', 4)
  ON CONFLICT DO NOTHING;

END $$;

COMMIT;

SELECT 'Dashboard widgets seeded successfully' AS status;
