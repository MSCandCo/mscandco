-- Profile Change Requests System
-- Handles admin-approved changes to locked profile fields

-- Create profile change requests table
CREATE TABLE IF NOT EXISTS profile_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  current_value TEXT,
  requested_value TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Admin response
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_user_id ON profile_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_status ON profile_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_field ON profile_change_requests(field_name);

-- RLS policies
ALTER TABLE profile_change_requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own requests
CREATE POLICY "users_read_own_change_requests" ON profile_change_requests
FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "users_create_change_requests" ON profile_change_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can read and update all requests
CREATE POLICY "admins_manage_change_requests" ON profile_change_requests
FOR ALL USING (
  auth.uid() IN (
    SELECT id FROM user_profiles 
    WHERE role IN ('company_admin', 'super_admin')
  )
);

-- Grant service role access
GRANT ALL ON profile_change_requests TO service_role;

-- Add missing profile fields that may be needed
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS artist_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS primary_genre TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS secondary_genre TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS years_active TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS record_label TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Label admin specific fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS business_type TEXT;

-- Company admin specific fields  
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS office_location TEXT;

-- Distribution partner specific fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS partner_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS distribution_channels TEXT;

-- Super admin specific fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS admin_title TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS responsibilities TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS access_level TEXT;

-- Verify table creation
SELECT 'profile_change_requests table created' as status;
SELECT COUNT(*) as request_count FROM profile_change_requests;
