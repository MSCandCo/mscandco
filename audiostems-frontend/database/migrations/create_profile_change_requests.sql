-- Create profile_change_requests table for handling profile change requests
-- This table stores requests from users to change their profile information

CREATE TABLE IF NOT EXISTS profile_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_type VARCHAR(50) NOT NULL, -- e.g., 'email', 'name', 'phone', etc.
  current_value TEXT, -- Current value (JSON string for complex data)
  requested_value TEXT NOT NULL, -- Requested new value (JSON string for complex data)
  reason TEXT NOT NULL, -- User's reason for the change
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT, -- Admin notes when reviewing
  reviewed_by UUID, -- Admin who reviewed the request
  reviewed_at TIMESTAMPTZ, -- When it was reviewed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_user_id ON profile_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_status ON profile_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_created_at ON profile_change_requests(created_at);

-- Add RLS (Row Level Security)
ALTER TABLE profile_change_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own requests
CREATE POLICY "Users can view own profile change requests" ON profile_change_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own requests
CREATE POLICY "Users can create own profile change requests" ON profile_change_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all requests (will be handled by service role)
CREATE POLICY "Service role can manage all profile change requests" ON profile_change_requests
  FOR ALL TO service_role USING (true);

-- Grant permissions
GRANT ALL ON profile_change_requests TO service_role;
GRANT SELECT, INSERT ON profile_change_requests TO authenticated;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profile_change_requests_updated_at 
  BEFORE UPDATE ON profile_change_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

