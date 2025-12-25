-- Safe Revenue System Setup
-- This checks what exists and only creates what's needed

-- First, let's see what columns exist in the current table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'revenue_reports' 
ORDER BY ordinal_position;

-- If you want to keep existing data, run this instead:
-- ALTER TABLE revenue_reports RENAME TO revenue_reports_backup;

-- Then create the new table with correct structure:
CREATE TABLE IF NOT EXISTS revenue_reports_new (
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

-- If you had data to migrate, you could do:
-- INSERT INTO revenue_reports_new (columns...) 
-- SELECT columns... FROM revenue_reports_backup;

-- Then rename:
-- DROP TABLE revenue_reports_backup;
-- ALTER TABLE revenue_reports_new RENAME TO revenue_reports;
