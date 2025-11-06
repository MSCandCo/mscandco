-- ================================
-- DMCA TAKEDOWN SYSTEM
-- ================================
-- Purpose: Legal compliance with DMCA (Digital Millennium Copyright Act)
-- Compliance: US copyright law requirement for online platforms
-- Created: January 2025

-- ================================
-- 1. DMCA NOTICES TABLE
-- ================================

CREATE TABLE IF NOT EXISTS dmca_notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Notice Type
  notice_type TEXT NOT NULL CHECK (notice_type IN ('takedown', 'counter_notification')),

  -- Complainant Information
  complainant_name TEXT NOT NULL,
  complainant_email TEXT NOT NULL,
  complainant_address TEXT,
  complainant_phone TEXT,

  -- Copyright Information
  copyrighted_work_description TEXT NOT NULL,
  infringing_content_url TEXT NOT NULL,
  infringing_content_id UUID, -- Reference to the actual content (release_id, etc.)
  content_type TEXT CHECK (content_type IN ('release', 'profile', 'image', 'other')),

  -- Legal Declarations
  good_faith_statement TEXT NOT NULL,
  perjury_statement TEXT NOT NULL,
  electronic_signature TEXT NOT NULL,

  -- Counter-Notification Specific Fields
  original_notice_id UUID REFERENCES dmca_notices(id), -- Links counter to original
  counter_justification TEXT, -- Why content should be restored
  consent_to_jurisdiction BOOLEAN, -- Agreement to US jurisdiction

  -- Processing Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',       -- Awaiting admin review
    'processing',    -- Being investigated
    'valid',         -- Notice determined valid, content taken down
    'invalid',       -- Notice rejected as invalid
    'counter_filed', -- Counter-notification filed
    'restored',      -- Content restored after counter-notification period
    'withdrawn'      -- Notice withdrawn by complainant
  )),

  -- Admin Processing
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  action_taken TEXT, -- content_removed, access_disabled, counter_notified, restored

  -- Affected User
  affected_user_id UUID REFERENCES auth.users(id),
  user_notified_at TIMESTAMP WITH TIME ZONE,

  -- Restoration Timeline (for counter-notifications)
  takedown_date TIMESTAMP WITH TIME ZONE,
  counter_period_expires TIMESTAMP WITH TIME ZONE, -- 10-14 business days from counter-notification
  restoration_date TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 2. DMCA NOTICE HISTORY TABLE
-- ================================

CREATE TABLE IF NOT EXISTS dmca_notice_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id UUID NOT NULL REFERENCES dmca_notices(id) ON DELETE CASCADE,

  -- Action Details
  action TEXT NOT NULL, -- status_changed, content_removed, counter_filed, restored
  previous_status TEXT,
  new_status TEXT,
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 3. DMCA AFFECTED CONTENT TABLE
-- ================================
-- Track all content affected by a DMCA notice

CREATE TABLE IF NOT EXISTS dmca_affected_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id UUID NOT NULL REFERENCES dmca_notices(id) ON DELETE CASCADE,

  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  content_url TEXT,
  content_title TEXT,

  -- Status
  removed BOOLEAN DEFAULT FALSE,
  removed_at TIMESTAMP WITH TIME ZONE,
  restored BOOLEAN DEFAULT FALSE,
  restored_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 4. INDEXES FOR PERFORMANCE
-- ================================

CREATE INDEX IF NOT EXISTS idx_dmca_notices_status ON dmca_notices(status);
CREATE INDEX IF NOT EXISTS idx_dmca_notices_type ON dmca_notices(notice_type);
CREATE INDEX IF NOT EXISTS idx_dmca_notices_user ON dmca_notices(affected_user_id);
CREATE INDEX IF NOT EXISTS idx_dmca_notices_created ON dmca_notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dmca_notice_history_notice ON dmca_notice_history(notice_id);
CREATE INDEX IF NOT EXISTS idx_dmca_affected_content_notice ON dmca_affected_content(notice_id);
CREATE INDEX IF NOT EXISTS idx_dmca_affected_content_content ON dmca_affected_content(content_type, content_id);

-- ================================
-- 5. AUTO-UPDATE TRIGGER
-- ================================

CREATE OR REPLACE FUNCTION update_dmca_notice_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dmca_notices_updated
  BEFORE UPDATE ON dmca_notices
  FOR EACH ROW
  EXECUTE FUNCTION update_dmca_notice_timestamp();

-- ================================
-- 6. HISTORY LOGGING TRIGGER
-- ================================

CREATE OR REPLACE FUNCTION log_dmca_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO dmca_notice_history (
      notice_id,
      action,
      previous_status,
      new_status,
      performed_by,
      notes
    ) VALUES (
      NEW.id,
      'status_changed',
      OLD.status,
      NEW.status,
      NEW.reviewed_by,
      NEW.admin_notes
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dmca_notice_history_trigger
  AFTER UPDATE ON dmca_notices
  FOR EACH ROW
  EXECUTE FUNCTION log_dmca_action();

-- ================================
-- 7. RLS POLICIES
-- ================================

-- Enable RLS
ALTER TABLE dmca_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE dmca_notice_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE dmca_affected_content ENABLE ROW LEVEL SECURITY;

-- Users can view notices affecting their content
CREATE POLICY "Users can view own DMCA notices"
  ON dmca_notices
  FOR SELECT
  USING (
    auth.uid() = affected_user_id
  );

-- Anyone can submit a DMCA notice (INSERT only)
CREATE POLICY "Anyone can submit DMCA notice"
  ON dmca_notices
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all DMCA notices
CREATE POLICY "Admins can view all DMCA notices"
  ON dmca_notices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin')
    )
  );

-- Admins can update DMCA notices
CREATE POLICY "Admins can update DMCA notices"
  ON dmca_notices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin')
    )
  );

-- Admins can view DMCA history
CREATE POLICY "Admins can view DMCA history"
  ON dmca_notice_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin')
    )
  );

-- Admins can manage affected content
CREATE POLICY "Admins can manage affected content"
  ON dmca_affected_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin')
    )
  );

-- ================================
-- 8. ADMIN VIEWS FOR REPORTING
-- ================================

-- DMCA Notice Summary
CREATE OR REPLACE VIEW dmca_notice_summary AS
SELECT
  notice_type,
  status,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count
FROM dmca_notices
GROUP BY notice_type, status;

-- Recent DMCA Activity
CREATE OR REPLACE VIEW recent_dmca_activity AS
SELECT
  dn.id,
  dn.notice_type,
  dn.status,
  dn.complainant_name,
  dn.complainant_email,
  dn.infringing_content_url,
  dn.created_at,
  dn.reviewed_at,
  u.email as affected_user_email,
  up.name as affected_user_name,
  r.email as reviewer_email,
  rp.name as reviewer_name
FROM dmca_notices dn
LEFT JOIN auth.users u ON u.id = dn.affected_user_id
LEFT JOIN user_profiles up ON up.id = dn.affected_user_id
LEFT JOIN auth.users r ON r.id = dn.reviewed_by
LEFT JOIN user_profiles rp ON rp.id = dn.reviewed_by
ORDER BY dn.created_at DESC
LIMIT 100;

-- ================================
-- 9. HELPER FUNCTIONS
-- ================================

-- Function to process a valid DMCA takedown
CREATE OR REPLACE FUNCTION process_dmca_takedown(
  p_notice_id UUID,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_notice dmca_notices%ROWTYPE;
  v_affected_content RECORD;
BEGIN
  -- Get notice
  SELECT * INTO v_notice
  FROM dmca_notices
  WHERE id = p_notice_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Notice not found');
  END IF;

  -- Update notice status
  UPDATE dmca_notices
  SET
    status = 'valid',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    admin_notes = p_notes,
    action_taken = 'content_removed',
    takedown_date = NOW()
  WHERE id = p_notice_id;

  -- Remove the content if it's a release
  IF v_notice.content_type = 'release' AND v_notice.infringing_content_id IS NOT NULL THEN
    UPDATE releases
    SET status = 'rejected'
    WHERE id = v_notice.infringing_content_id;

    -- Track affected content
    INSERT INTO dmca_affected_content (
      notice_id,
      content_type,
      content_id,
      content_url,
      removed,
      removed_at
    ) VALUES (
      p_notice_id,
      v_notice.content_type,
      v_notice.infringing_content_id,
      v_notice.infringing_content_url,
      true,
      NOW()
    );
  END IF;

  -- Notify affected user (user_notified_at set by notification system)
  UPDATE dmca_notices
  SET user_notified_at = NOW()
  WHERE id = p_notice_id;

  RETURN jsonb_build_object('success', true, 'notice_id', p_notice_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process counter-notification
CREATE OR REPLACE FUNCTION process_counter_notification(
  p_notice_id UUID,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_notice dmca_notices%ROWTYPE;
  v_original_notice dmca_notices%ROWTYPE;
BEGIN
  -- Get counter-notification
  SELECT * INTO v_notice
  FROM dmca_notices
  WHERE id = p_notice_id AND notice_type = 'counter_notification';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Counter-notification not found');
  END IF;

  -- Get original notice
  SELECT * INTO v_original_notice
  FROM dmca_notices
  WHERE id = v_notice.original_notice_id;

  -- Update original notice status
  UPDATE dmca_notices
  SET
    status = 'counter_filed',
    counter_period_expires = NOW() + INTERVAL '14 days'
  WHERE id = v_notice.original_notice_id;

  -- Update counter-notification
  UPDATE dmca_notices
  SET
    status = 'processing',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    admin_notes = p_notes
  WHERE id = p_notice_id;

  RETURN jsonb_build_object(
    'success', true,
    'notice_id', p_notice_id,
    'restoration_eligible_date', NOW() + INTERVAL '14 days'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore content after counter-notification period
CREATE OR REPLACE FUNCTION restore_content_after_counter(
  p_notice_id UUID,
  p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_notice dmca_notices%ROWTYPE;
  v_counter dmca_notices%ROWTYPE;
BEGIN
  -- Get original notice
  SELECT * INTO v_notice
  FROM dmca_notices
  WHERE id = p_notice_id AND status = 'counter_filed';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Notice not eligible for restoration');
  END IF;

  -- Check if counter period has expired
  IF v_notice.counter_period_expires > NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Counter-notification period has not expired',
      'expires_at', v_notice.counter_period_expires
    );
  END IF;

  -- Update original notice
  UPDATE dmca_notices
  SET
    status = 'restored',
    restoration_date = NOW()
  WHERE id = p_notice_id;

  -- Restore content if it's a release
  IF v_notice.content_type = 'release' AND v_notice.infringing_content_id IS NOT NULL THEN
    UPDATE releases
    SET status = 'approved'
    WHERE id = v_notice.infringing_content_id;

    -- Update affected content
    UPDATE dmca_affected_content
    SET
      restored = true,
      restored_at = NOW()
    WHERE notice_id = p_notice_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'notice_id', p_notice_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- MIGRATION COMPLETE
-- ================================

-- Grant necessary permissions
GRANT SELECT, INSERT ON dmca_notices TO authenticated;
GRANT SELECT ON dmca_notice_history TO authenticated;
GRANT SELECT ON dmca_affected_content TO authenticated;
GRANT SELECT ON dmca_notice_summary TO authenticated;
GRANT SELECT ON recent_dmca_activity TO authenticated;

-- Comments for documentation
COMMENT ON TABLE dmca_notices IS 'DMCA takedown notices and counter-notifications for copyright compliance';
COMMENT ON TABLE dmca_notice_history IS 'Audit trail of DMCA notice processing';
COMMENT ON TABLE dmca_affected_content IS 'Content affected by DMCA takedown notices';
COMMENT ON FUNCTION process_dmca_takedown IS 'Process a valid DMCA takedown notice';
COMMENT ON FUNCTION process_counter_notification IS 'Process a counter-notification from affected user';
COMMENT ON FUNCTION restore_content_after_counter IS 'Restore content after counter-notification period expires';
