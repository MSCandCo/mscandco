-- Dashboard Widget System Migration
-- Creates tables for flexible, role-based, personalized dashboard layouts

BEGIN;

-- 1. Widget Types Table
-- Defines available widget types (stats, message, chart, activity, etc.)
CREATE TABLE IF NOT EXISTS dashboard_widget_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'stats_card', 'message_box', 'chart', 'activity_feed'
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  component_name VARCHAR(100) NOT NULL, -- React component name
  default_width VARCHAR(20) DEFAULT '1/4', -- '1/4', '1/3', '1/2', '2/3', '3/4', 'full'
  default_height VARCHAR(20) DEFAULT 'auto', -- 'auto', 'small', 'medium', 'large'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Dashboard Widgets Table
-- Defines specific widget instances with their configuration
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_type_id UUID NOT NULL REFERENCES dashboard_widget_types(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., 'Total Users', 'Platform Announcement', 'Revenue Chart'
  description TEXT,

  -- Widget Configuration (JSON)
  config JSONB DEFAULT '{}', -- Widget-specific settings (metrics, data source, colors, etc.)

  -- Permissions
  required_permission VARCHAR(255), -- Permission needed to see this widget (null = everyone)
  required_role VARCHAR(100), -- Role needed to see this widget (null = everyone)

  -- Display Settings
  default_width VARCHAR(20) DEFAULT '1/4',
  default_height VARCHAR(20) DEFAULT 'auto',
  default_order INTEGER DEFAULT 0, -- Default position in layout

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_draggable BOOLEAN DEFAULT true,
  is_hideable BOOLEAN DEFAULT true,
  is_resizable BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 3. Role Dashboard Layouts Table
-- Default widget layouts for each role
CREATE TABLE IF NOT EXISTS role_dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(100) NOT NULL, -- 'super_admin', 'company_admin', 'artist', etc.
  widget_id UUID NOT NULL REFERENCES dashboard_widgets(id) ON DELETE CASCADE,

  -- Position in grid
  grid_column_start INTEGER DEFAULT 1, -- 1-12 (12-column grid)
  grid_column_span INTEGER DEFAULT 3, -- How many columns to span
  grid_row INTEGER DEFAULT 1, -- Which row

  -- Display order (for sorting)
  display_order INTEGER DEFAULT 0,

  -- Visibility
  is_visible BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique widget per role
  UNIQUE(role, widget_id)
);

-- 4. User Dashboard Layouts Table
-- User-specific customizations (overrides role defaults)
CREATE TABLE IF NOT EXISTS user_dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_id UUID NOT NULL REFERENCES dashboard_widgets(id) ON DELETE CASCADE,

  -- Position in grid
  grid_column_start INTEGER DEFAULT 1,
  grid_column_span INTEGER DEFAULT 3,
  grid_row INTEGER DEFAULT 1,

  -- Display order
  display_order INTEGER DEFAULT 0,

  -- Visibility (user can hide/show widgets)
  is_visible BOOLEAN DEFAULT true,

  -- Custom widget settings (user-specific overrides)
  custom_config JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique widget per user
  UNIQUE(user_id, widget_id)
);

-- 5. Dashboard Messages Table
-- For message box widgets (announcements, alerts, info)
CREATE TABLE IF NOT EXISTS dashboard_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,

  -- Message type
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error', 'announcement'
  priority INTEGER DEFAULT 0, -- Higher = more important

  -- Targeting
  target_roles TEXT[], -- Array of roles, null = all roles
  target_users UUID[], -- Array of user IDs, null = all users

  -- Display settings
  is_dismissible BOOLEAN DEFAULT true,
  show_icon BOOLEAN DEFAULT true,
  icon_name VARCHAR(100), -- Icon to display
  bg_color VARCHAR(50), -- Background color
  text_color VARCHAR(50), -- Text color

  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 6. User Dismissed Messages Table
-- Track which users have dismissed which messages
CREATE TABLE IF NOT EXISTS user_dismissed_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES dashboard_messages(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure user can only dismiss once
  UNIQUE(user_id, message_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_type ON dashboard_widgets(widget_type_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_permission ON dashboard_widgets(required_permission);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_role ON dashboard_widgets(required_role);
CREATE INDEX IF NOT EXISTS idx_role_layouts_role ON role_dashboard_layouts(role);
CREATE INDEX IF NOT EXISTS idx_role_layouts_widget ON role_dashboard_layouts(widget_id);
CREATE INDEX IF NOT EXISTS idx_user_layouts_user ON user_dashboard_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_layouts_widget ON user_dashboard_layouts(widget_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_messages_active ON dashboard_messages(is_active);
CREATE INDEX IF NOT EXISTS idx_dashboard_messages_dates ON dashboard_messages(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_dismissed_messages_user ON user_dismissed_messages(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE dashboard_widget_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dismissed_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read widget types"
  ON dashboard_widget_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read widgets"
  ON dashboard_widgets FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to read role layouts"
  ON role_dashboard_layouts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to read their own layouts"
  ON user_dashboard_layouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to manage their own layouts"
  ON user_dashboard_layouts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to read active messages"
  ON dashboard_messages FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

CREATE POLICY "Allow users to manage their dismissed messages"
  ON user_dismissed_messages FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;

-- Verification
SELECT 'Dashboard system tables created successfully' AS status;
