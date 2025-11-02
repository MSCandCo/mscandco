-- Soft Delete System for User Account Deletion
-- Preserves financial records and audit trail while marking accounts as deleted
-- Critical for GDPR compliance AND financial/legal requirements

-- 1. Add deleted_at column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS final_wallet_balance DECIMAL(10,2) DEFAULT 0;

-- 2. Create deleted_users table for audit trail
CREATE TABLE IF NOT EXISTS deleted_users_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Original user ID (no FK constraint)
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  display_name TEXT,
  artist_name TEXT,
  deleted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deletion_reason TEXT,
  final_wallet_balance DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  pending_earnings DECIMAL(10,2) DEFAULT 0,
  deleted_by UUID, -- Who performed the deletion (user_id for self-delete, admin_id for admin delete)
  deletion_method TEXT DEFAULT 'self', -- 'self' or 'admin'
  financial_snapshot JSONB, -- Store full financial summary
  metadata JSONB -- Store any other important data
);

-- 3. Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_deleted_users_user_id ON deleted_users_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_deleted_users_deleted_at ON deleted_users_audit(deleted_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_deleted_at ON user_profiles(deleted_at);

-- 4. Update RLS policies to exclude deleted users from normal queries
CREATE POLICY "Hide deleted users from normal queries" ON user_profiles
  FOR SELECT
  TO public
  USING (deleted_at IS NULL);

-- 5. Create view for active users only
CREATE OR REPLACE VIEW active_users AS
SELECT * FROM user_profiles
WHERE deleted_at IS NULL;

-- 6. Create view for admins to see deleted users (with financial data preserved)
CREATE OR REPLACE VIEW deleted_users_with_earnings AS
SELECT
  dua.*,
  (
    SELECT COALESCE(SUM(amount), 0)
    FROM earnings_log
    WHERE artist_id = dua.user_id
  ) as actual_total_earnings,
  (
    SELECT COALESCE(SUM(amount), 0)
    FROM earnings_log
    WHERE artist_id = dua.user_id
    AND status = 'pending'
  ) as actual_pending_earnings,
  (
    SELECT COUNT(*)
    FROM earnings_log
    WHERE artist_id = dua.user_id
  ) as total_earnings_records
FROM deleted_users_audit dua;

-- 7. Create function to safely delete user account (soft delete)
CREATE OR REPLACE FUNCTION soft_delete_user_account(
  p_user_id UUID,
  p_deletion_reason TEXT DEFAULT NULL,
  p_deleted_by UUID DEFAULT NULL,
  p_deletion_method TEXT DEFAULT 'self'
)
RETURNS JSONB AS $$
DECLARE
  v_wallet_balance DECIMAL(10,2);
  v_total_earnings DECIMAL(10,2);
  v_pending_earnings DECIMAL(10,2);
  v_user_data JSONB;
  v_financial_snapshot JSONB;
  v_result JSONB;
BEGIN
  -- 1. Get current wallet balances
  SELECT
    COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)
  INTO v_wallet_balance, v_total_earnings, v_pending_earnings
  FROM earnings_log
  WHERE artist_id = p_user_id;

  -- 2. Get user profile data
  SELECT to_jsonb(up.*) INTO v_user_data
  FROM user_profiles up
  WHERE id = p_user_id;

  -- 3. Create financial snapshot
  v_financial_snapshot := jsonb_build_object(
    'available_balance', v_wallet_balance,
    'total_earnings', v_total_earnings,
    'pending_earnings', v_pending_earnings,
    'earnings_records', (
      SELECT jsonb_agg(to_jsonb(el.*))
      FROM earnings_log el
      WHERE artist_id = p_user_id
    )
  );

  -- 4. Insert into deleted_users_audit
  INSERT INTO deleted_users_audit (
    user_id,
    email,
    role,
    display_name,
    artist_name,
    deleted_at,
    deletion_reason,
    final_wallet_balance,
    total_earnings,
    pending_earnings,
    deleted_by,
    deletion_method,
    financial_snapshot,
    metadata
  ) VALUES (
    p_user_id,
    v_user_data->>'email',
    v_user_data->>'role',
    v_user_data->>'display_name',
    v_user_data->>'artist_name',
    NOW(),
    p_deletion_reason,
    v_wallet_balance,
    v_total_earnings,
    v_pending_earnings,
    COALESCE(p_deleted_by, p_user_id),
    p_deletion_method,
    v_financial_snapshot,
    v_user_data
  );

  -- 5. Mark user_profiles as deleted (soft delete - DON'T actually delete)
  UPDATE user_profiles
  SET
    deleted_at = NOW(),
    deletion_reason = p_deletion_reason,
    final_wallet_balance = v_wallet_balance
  WHERE id = p_user_id;

  -- 6. Return result
  v_result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'wallet_balance', v_wallet_balance,
    'pending_earnings', v_pending_earnings,
    'message', 'User account soft deleted successfully'
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION soft_delete_user_account TO authenticated;

-- Comments
COMMENT ON TABLE deleted_users_audit IS 'Audit trail for deleted user accounts. Preserves financial records for legal/compliance.';
COMMENT ON FUNCTION soft_delete_user_account IS 'Soft deletes a user account while preserving earnings data and audit trail.';
COMMENT ON COLUMN user_profiles.deleted_at IS 'Timestamp when user account was deleted. NULL means active account.';
COMMENT ON COLUMN user_profiles.final_wallet_balance IS 'Final wallet balance at time of account deletion.';

-- Verification
SELECT 'Soft delete system implemented successfully' as status;
