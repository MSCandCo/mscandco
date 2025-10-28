-- Create payout_requests table for safe withdrawal system
-- This ensures NO money leaves the platform without admin approval

CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payout details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'GBP',
  
  -- Bank details (encrypted in production!)
  bank_details JSONB NOT NULL, -- { account_name, account_number, sort_code, bank_name }
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled')),
  
  -- Timestamps
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Admin actions
  approved_by UUID REFERENCES auth.users(id),
  processed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- Additional info
  notes TEXT,
  admin_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payout_requests_user ON payout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_requested_at ON payout_requests(requested_at DESC);

-- RLS Policies
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own payout requests
DROP POLICY IF EXISTS "Users can view own payout requests" ON payout_requests;
CREATE POLICY "Users can view own payout requests" ON payout_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own payout requests
DROP POLICY IF EXISTS "Users can create own payout requests" ON payout_requests;
CREATE POLICY "Users can create own payout requests" ON payout_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own pending requests
DROP POLICY IF EXISTS "Users can cancel own pending requests" ON payout_requests;
CREATE POLICY "Users can cancel own pending requests" ON payout_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'cancelled'));

-- Admins can view all payout requests
DROP POLICY IF EXISTS "Admins can view all payout requests" ON payout_requests;
CREATE POLICY "Admins can view all payout requests" ON payout_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('super_admin', 'company_admin')
    )
  );

-- Admins can update payout requests
DROP POLICY IF EXISTS "Admins can update payout requests" ON payout_requests;
CREATE POLICY "Admins can update payout requests" ON payout_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('super_admin', 'company_admin')
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_payout_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payout_request_updated_at_trigger ON payout_requests;
CREATE TRIGGER update_payout_request_updated_at_trigger
  BEFORE UPDATE ON payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_payout_request_updated_at();

-- ============================================
-- IMPORTANT: Fixing the wallet balance issue
-- ============================================

-- Check if there are any unauthorized withdrawals
-- (negative entries in earnings_log without proper earning_type)
SELECT 
  id,
  artist_id,
  amount,
  earning_type,
  platform,
  status,
  notes,
  created_at
FROM earnings_log
WHERE amount < 0
  AND earning_type NOT IN ('subscription_payment', 'commission', 'refund')
ORDER BY created_at DESC;

-- If you find any unauthorized withdrawals, you can reverse them:
-- DELETE FROM earnings_log WHERE id = 'unauthorized-entry-id';

-- Or mark them as cancelled:
-- UPDATE earnings_log SET status = 'cancelled' WHERE id = 'unauthorized-entry-id';

COMMENT ON TABLE payout_requests IS 'Payout requests from users - requires admin approval before processing';
COMMENT ON COLUMN payout_requests.status IS 'pending → approved → processing → completed (or rejected/cancelled)';

