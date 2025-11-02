-- Add 2FA Recovery Codes and Security Audit Logging
-- Migration Date: 2025-01-02
-- Purpose: Support recovery codes for 2FA and comprehensive security event logging

-- ============================================================================
-- 1. MFA Recovery Codes Table
-- ============================================================================

-- Store encrypted recovery codes for 2FA
CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL, -- bcrypt hash of the recovery code
  used_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 year',

  -- Ensure user_id exists and code is unique
  UNIQUE(user_id, code_hash)
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_mfa_recovery_codes_user_id
  ON mfa_recovery_codes(user_id);

-- Index for checking used codes
CREATE INDEX IF NOT EXISTS idx_mfa_recovery_codes_used
  ON mfa_recovery_codes(user_id, used_at)
  WHERE used_at IS NULL;

-- RLS Policies for recovery codes
ALTER TABLE mfa_recovery_codes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own unused recovery codes
CREATE POLICY "Users can view their own unused recovery codes"
  ON mfa_recovery_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND used_at IS NULL);

-- Only system can insert recovery codes (via function)
CREATE POLICY "System can insert recovery codes"
  ON mfa_recovery_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only system can mark codes as used
CREATE POLICY "System can update recovery codes"
  ON mfa_recovery_codes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. Security Audit Log Table
-- ============================================================================

-- Comprehensive security event logging
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for failed login attempts
  event_type TEXT NOT NULL, -- e.g., '2fa_enabled', '2fa_disabled', 'login_success', 'login_failed', etc.
  event_category TEXT NOT NULL, -- 'authentication', 'authorization', '2fa', 'account', 'data_access'
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  success BOOLEAN NOT NULL DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb, -- Additional event-specific data
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CHECK (event_category IN ('authentication', 'authorization', '2fa', 'account', 'data_access', 'security')),
  CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id
  ON security_audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_event_type
  ON security_audit_log(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_category
  ON security_audit_log(event_category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_severity
  ON security_audit_log(severity, created_at DESC)
  WHERE severity IN ('error', 'critical');

CREATE INDEX IF NOT EXISTS idx_security_audit_failed_events
  ON security_audit_log(user_id, created_at DESC)
  WHERE success = false;

-- RLS Policies for audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit log
CREATE POLICY "Users can view their own security audit log"
  ON security_audit_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all security audit logs"
  ON security_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Only system can insert audit logs (via function)
CREATE POLICY "System can insert audit logs"
  ON security_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 3. Helper Function: Log Security Event
-- ============================================================================

CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_category TEXT,
  p_severity TEXT DEFAULT 'info',
  p_success BOOLEAN DEFAULT true,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Insert the audit log entry
  INSERT INTO security_audit_log (
    user_id,
    event_type,
    event_category,
    severity,
    success,
    ip_address,
    user_agent,
    details
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_category,
    p_severity,
    p_success,
    p_ip_address,
    p_user_agent,
    p_details
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- ============================================================================
-- 4. Helper Function: Generate Recovery Codes
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_recovery_codes(
  p_user_id UUID,
  p_code_hashes TEXT[] -- Array of bcrypt hashes
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_hash TEXT;
  v_count INTEGER := 0;
BEGIN
  -- Delete any existing unused recovery codes for this user
  DELETE FROM mfa_recovery_codes
  WHERE user_id = p_user_id
  AND used_at IS NULL;

  -- Insert new recovery codes
  FOREACH v_code_hash IN ARRAY p_code_hashes
  LOOP
    INSERT INTO mfa_recovery_codes (user_id, code_hash)
    VALUES (p_user_id, v_code_hash);

    v_count := v_count + 1;
  END LOOP;

  -- Log the event
  PERFORM log_security_event(
    p_user_id,
    'recovery_codes_generated',
    '2fa',
    'info',
    true,
    NULL,
    NULL,
    jsonb_build_object('count', v_count)
  );

  RETURN jsonb_build_object(
    'success', true,
    'codes_generated', v_count,
    'message', format('Generated %s recovery codes', v_count)
  );
END;
$$;

-- ============================================================================
-- 5. Helper Function: Verify Recovery Code
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_recovery_code(
  p_user_id UUID,
  p_code_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_id UUID;
  v_found BOOLEAN := false;
BEGIN
  -- Check if the code exists and is unused
  SELECT id INTO v_code_id
  FROM mfa_recovery_codes
  WHERE user_id = p_user_id
  AND code_hash = p_code_hash
  AND used_at IS NULL
  AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;

  IF v_code_id IS NOT NULL THEN
    v_found := true;

    -- Mark the code as used
    UPDATE mfa_recovery_codes
    SET used_at = NOW()
    WHERE id = v_code_id;

    -- Log successful recovery code use
    PERFORM log_security_event(
      p_user_id,
      'recovery_code_used',
      '2fa',
      'warning',
      true,
      NULL,
      NULL,
      jsonb_build_object('code_id', v_code_id)
    );

    RETURN jsonb_build_object(
      'valid', true,
      'message', 'Recovery code verified and marked as used'
    );
  ELSE
    -- Log failed recovery code attempt
    PERFORM log_security_event(
      p_user_id,
      'recovery_code_failed',
      '2fa',
      'warning',
      false,
      NULL,
      NULL,
      '{}'::jsonb
    );

    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Invalid or already used recovery code'
    );
  END IF;
END;
$$;

-- ============================================================================
-- 6. Helper Function: Get Unused Recovery Code Count
-- ============================================================================

CREATE OR REPLACE FUNCTION get_recovery_code_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM mfa_recovery_codes
  WHERE user_id = p_user_id
  AND used_at IS NULL
  AND (expires_at IS NULL OR expires_at > NOW());

  RETURN COALESCE(v_count, 0);
END;
$$;

-- ============================================================================
-- 7. Create View: User Security Summary
-- ============================================================================

CREATE OR REPLACE VIEW user_security_summary AS
SELECT
  up.id AS user_id,
  up.email,
  up.role,
  up.two_factor_enabled,
  -- Recovery code stats
  (SELECT get_recovery_code_count(up.id)) AS unused_recovery_codes,
  (SELECT COUNT(*) FROM mfa_recovery_codes WHERE user_id = up.id AND used_at IS NOT NULL) AS used_recovery_codes,
  -- Recent security events
  (SELECT COUNT(*) FROM security_audit_log
   WHERE user_id = up.id
   AND event_category = '2fa'
   AND created_at > NOW() - INTERVAL '30 days') AS mfa_events_last_30_days,
  (SELECT COUNT(*) FROM security_audit_log
   WHERE user_id = up.id
   AND success = false
   AND created_at > NOW() - INTERVAL '30 days') AS failed_events_last_30_days,
  -- Last security events
  (SELECT created_at FROM security_audit_log
   WHERE user_id = up.id
   AND event_type = 'login_success'
   ORDER BY created_at DESC LIMIT 1) AS last_successful_login,
  (SELECT created_at FROM security_audit_log
   WHERE user_id = up.id
   AND event_type = 'login_failed'
   ORDER BY created_at DESC LIMIT 1) AS last_failed_login
FROM user_profiles up
WHERE up.deleted_at IS NULL;

-- Grant access to authenticated users (RLS will filter)
GRANT SELECT ON user_security_summary TO authenticated;

-- ============================================================================
-- 8. Update soft_delete function to log event
-- ============================================================================

-- Update the existing soft_delete function to log the deletion event
CREATE OR REPLACE FUNCTION soft_delete_user_account(
  p_user_id UUID,
  p_deletion_reason TEXT DEFAULT NULL,
  p_deleted_by UUID DEFAULT NULL,
  p_deletion_method TEXT DEFAULT 'self'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_data JSONB;
  v_wallet_balance DECIMAL(10,2);
  v_pending_earnings DECIMAL(10,2);
  v_total_earnings DECIMAL(10,2);
  v_user_email TEXT;
  v_user_role TEXT;
BEGIN
  -- Get user profile data
  SELECT
    jsonb_build_object(
      'id', id,
      'email', email,
      'role', role,
      'artist_name', artist_name,
      'first_name', first_name,
      'last_name', last_name,
      'created_at', created_at
    ),
    COALESCE(wallet_balance, 0),
    email,
    role
  INTO v_profile_data, v_wallet_balance, v_user_email, v_user_role
  FROM user_profiles
  WHERE id = p_user_id;

  IF v_profile_data IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Calculate earnings
  SELECT
    COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(amount), 0)
  INTO v_pending_earnings, v_total_earnings
  FROM earnings_log
  WHERE artist_id = p_user_id;

  -- Create audit record
  INSERT INTO deleted_users_audit (
    user_id,
    email,
    role,
    final_wallet_balance,
    total_earnings,
    pending_earnings,
    financial_snapshot,
    profile_snapshot,
    deletion_reason,
    deleted_by,
    deletion_method,
    metadata
  ) VALUES (
    p_user_id,
    v_user_email,
    v_user_role,
    v_wallet_balance,
    v_total_earnings,
    v_pending_earnings,
    jsonb_build_object(
      'wallet_balance', v_wallet_balance,
      'total_earnings', v_total_earnings,
      'pending_earnings', v_pending_earnings,
      'earnings_count', (SELECT COUNT(*) FROM earnings_log WHERE artist_id = p_user_id)
    ),
    v_profile_data,
    p_deletion_reason,
    p_deleted_by,
    p_deletion_method,
    jsonb_build_object(
      'deleted_at', NOW(),
      'deletion_initiated_by', COALESCE(p_deleted_by::text, 'self')
    )
  );

  -- Mark user as deleted (soft delete)
  UPDATE user_profiles
  SET
    deleted_at = NOW(),
    deletion_reason = p_deletion_reason,
    final_wallet_balance = v_wallet_balance
  WHERE id = p_user_id;

  -- Log the security event
  PERFORM log_security_event(
    p_user_id,
    'account_deleted',
    'account',
    'warning',
    true,
    NULL,
    NULL,
    jsonb_build_object(
      'deletion_method', p_deletion_method,
      'deleted_by', p_deleted_by,
      'reason', p_deletion_reason,
      'wallet_balance', v_wallet_balance
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'wallet_balance', v_wallet_balance,
    'pending_earnings', v_pending_earnings,
    'message', 'Account successfully deleted (soft delete)'
  );
END;
$$;

-- ============================================================================
-- 9. Comments
-- ============================================================================

COMMENT ON TABLE mfa_recovery_codes IS 'Stores encrypted recovery codes for 2FA. Each user gets 10 single-use codes.';
COMMENT ON TABLE security_audit_log IS 'Comprehensive security event logging for authentication, authorization, and account events.';
COMMENT ON FUNCTION log_security_event IS 'Logs a security event to the audit log. Used throughout the application.';
COMMENT ON FUNCTION generate_recovery_codes IS 'Generates new recovery codes for a user. Deletes existing unused codes.';
COMMENT ON FUNCTION verify_recovery_code IS 'Verifies a recovery code and marks it as used if valid.';
COMMENT ON FUNCTION get_recovery_code_count IS 'Returns the count of unused, non-expired recovery codes for a user.';

-- ============================================================================
-- Done!
-- ============================================================================

-- Output success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete: 2FA recovery codes and security audit logging added';
  RAISE NOTICE '📊 Tables created: mfa_recovery_codes, security_audit_log';
  RAISE NOTICE '🔧 Functions created: log_security_event, generate_recovery_codes, verify_recovery_code, get_recovery_code_count';
  RAISE NOTICE '👁️  View created: user_security_summary';
  RAISE NOTICE '🔐 RLS policies applied to all tables';
END $$;
