-- CREATE PROFILE CHANGE REQUESTS TABLE
-- For handling profile change requests from artists to admins

-- Create profile change requests table
CREATE TABLE IF NOT EXISTS profile_change_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Request details
    field_name VARCHAR(100) NOT NULL,
    current_value TEXT,
    requested_value TEXT NOT NULL,
    reason TEXT NOT NULL,
    
    -- Request status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Admin review
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_user_id ON profile_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_status ON profile_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_created_at ON profile_change_requests(created_at);

-- Enable RLS
ALTER TABLE profile_change_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own requests" ON profile_change_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own requests" ON profile_change_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests" ON profile_change_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'role' = 'super_admin'
                OR auth.users.raw_user_meta_data->>'role' = 'company_admin'
            )
        )
    );

CREATE POLICY "Admins can update all requests" ON profile_change_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'role' = 'super_admin'
                OR auth.users.raw_user_meta_data->>'role' = 'company_admin'
            )
        )
    );

CREATE POLICY "Service role full access" ON profile_change_requests
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT ALL ON profile_change_requests TO service_role;
GRANT SELECT, INSERT ON profile_change_requests TO authenticated;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_profile_change_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profile_change_requests_updated_at 
    BEFORE UPDATE ON profile_change_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_profile_change_requests_updated_at();

COMMIT;
