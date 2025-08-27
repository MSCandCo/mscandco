-- Drop existing table and create fresh revenue system
-- Run this in Supabase SQL Editor

-- Drop existing table completely
DROP TABLE IF EXISTS revenue_reports CASCADE;

-- Create completely fresh revenue_reports table
CREATE TABLE revenue_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reporter_email TEXT NOT NULL,
    artist_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artist_email TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    description TEXT NOT NULL,
    release_title TEXT,
    reporting_period TEXT,
    status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'approved_wallet_failed')),
    approver_user_id UUID REFERENCES auth.users(id),
    approver_email TEXT,
    approval_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_revenue_reports_reporter ON revenue_reports(reporter_user_id);
CREATE INDEX idx_revenue_reports_artist ON revenue_reports(artist_user_id);
CREATE INDEX idx_revenue_reports_status ON revenue_reports(status);
CREATE INDEX idx_revenue_reports_created ON revenue_reports(created_at DESC);

-- Enable RLS
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy
CREATE POLICY "revenue_reports_policy" ON revenue_reports FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON revenue_reports TO service_role;
GRANT ALL ON revenue_reports TO authenticated;
