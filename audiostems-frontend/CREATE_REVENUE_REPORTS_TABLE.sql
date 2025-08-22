-- Create revenue_reports table for Super Admin earnings management

CREATE TABLE IF NOT EXISTS revenue_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User information
    user_id UUID NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT,
    user_role TEXT,
    
    -- Report details
    report_type TEXT NOT NULL CHECK (report_type IN ('withdrawal', 'payout', 'adjustment', 'bonus')),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'GBP',
    description TEXT,
    
    -- Period information
    period_start DATE,
    period_end DATE,
    
    -- Status and approval
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by_user_id UUID,
    processed_by_email TEXT,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_processed_by_user FOREIGN KEY (processed_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_revenue_reports_status ON revenue_reports(status);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_user_id ON revenue_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_submitted_at ON revenue_reports(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_type ON revenue_reports(report_type);

-- Enable RLS
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can see their own reports
CREATE POLICY "users_own_reports" ON revenue_reports
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can create their own reports
CREATE POLICY "users_create_reports" ON revenue_reports
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Super admins can see and manage all reports
CREATE POLICY "super_admin_all_reports" ON revenue_reports
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name = 'super_admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_revenue_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_revenue_reports_updated_at ON revenue_reports;
CREATE TRIGGER update_revenue_reports_updated_at
    BEFORE UPDATE ON revenue_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_revenue_reports_updated_at();

-- Insert sample pending reports for testing
INSERT INTO revenue_reports (
    user_id,
    user_email,
    user_name,
    user_role,
    report_type,
    amount,
    currency,
    description,
    period_start,
    period_end,
    status
) VALUES 
-- Get actual user IDs from existing users
((SELECT id FROM auth.users WHERE email = 'info@htay.co.uk'), 'info@htay.co.uk', 'H-Tay', 'artist', 'withdrawal', 1250.00, 'GBP', 'Monthly earnings withdrawal request', '2024-01-01', '2024-01-31', 'pending'),
((SELECT id FROM auth.users WHERE email = 'labeladmin@mscandco.com'), 'labeladmin@mscandco.com', 'Label Admin', 'label_admin', 'payout', 3400.50, 'GBP', 'Label revenue payout request', '2024-01-01', '2024-01-31', 'pending'),
((SELECT id FROM auth.users WHERE email = 'codegroup@mscandco.com'), 'codegroup@mscandco.com', 'Code Group', 'distribution_partner', 'withdrawal', 5670.25, 'GBP', 'Distribution partner commission withdrawal', '2024-01-01', '2024-01-31', 'pending')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON revenue_reports TO postgres, service_role;
