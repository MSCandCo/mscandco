-- Revenue Reports Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS revenue_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reporter_email TEXT NOT NULL,
    artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artist_email TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    description TEXT NOT NULL,
    release_title TEXT,
    reporting_period TEXT,
    status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'approved_wallet_failed')),
    approver_id UUID REFERENCES auth.users(id),
    approver_email TEXT,
    approval_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_revenue_reports_reporter ON revenue_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_artist ON revenue_reports(artist_id);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_status ON revenue_reports(status);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_created ON revenue_reports(created_at DESC);

-- Enable RLS
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own revenue reports" ON revenue_reports
    FOR SELECT USING (
        auth.uid() = reporter_id OR 
        auth.uid() = artist_id OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.email LIKE '%@mscandco.com' 
                OR auth.users.email = 'info@htay.co.uk'
            )
        )
    );

CREATE POLICY "Distribution partners can create reports" ON revenue_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update reports" ON revenue_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.email LIKE '%@mscandco.com' 
                OR auth.users.email = 'info@htay.co.uk'
            )
        )
    );

-- Service role can do everything
CREATE POLICY "Service role full access revenue_reports" ON revenue_reports
    FOR ALL USING (current_setting('role') = 'service_role');

-- Grant permissions
GRANT ALL ON revenue_reports TO service_role;
GRANT ALL ON revenue_reports TO authenticated;
