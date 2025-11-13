-- Create navigation menus table
CREATE TABLE IF NOT EXISTS navigation_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL, -- 'users_access', 'analytics', 'finance', 'content', 'distribution'
  title VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  icon VARCHAR(50), -- icon name for UI
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  required_permission VARCHAR(100), -- permission string like 'user:read:any'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_navigation_category ON navigation_menus(category);
CREATE INDEX IF NOT EXISTS idx_navigation_active ON navigation_menus(is_active);

-- Add RLS policies
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read navigation menus
CREATE POLICY "Anyone can view active navigation menus"
  ON navigation_menus FOR SELECT
  USING (is_active = true);

-- Only superadmins can insert/update/delete
CREATE POLICY "Superadmins can manage navigation menus"
  ON navigation_menus FOR ALL
  USING (auth.jwt() ->> 'role' = 'super_admin');
