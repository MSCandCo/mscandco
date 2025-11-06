-- ================================
-- CONTENT MODERATION SYSTEM
-- ================================
-- Purpose: Admin moderation queue for reviewing user-submitted content
-- Compliance: Content moderation requirements for platform safety
-- Created: January 2025

-- ================================
-- 1. CONTENT MODERATION TABLE
-- ================================

CREATE TABLE IF NOT EXISTS content_moderation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Content Reference
  content_type TEXT NOT NULL CHECK (content_type IN ('release', 'profile', 'comment', 'image', 'other')),
  content_id UUID NOT NULL, -- References the actual content (release_id, profile_id, etc.)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Moderation Details
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'auto_approved')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Flags and Reasons
  flag_reason TEXT, -- Copyright infringement, explicit content, spam, etc.
  flag_details TEXT, -- Additional context
  automated_flags JSONB, -- AI/automated detection results

  -- Reviewer Information
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,

  -- Actions Taken
  action_taken TEXT, -- approved, rejected, content_removed, user_warned, user_banned
  action_details JSONB, -- Additional action metadata

  -- Appeal Process
  appeal_status TEXT CHECK (appeal_status IN ('none', 'pending', 'approved', 'rejected')),
  appeal_notes TEXT,
  appeal_reviewed_by UUID REFERENCES auth.users(id),
  appeal_reviewed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 2. MODERATION HISTORY TABLE
-- ================================
-- Track all moderation actions for audit trail

CREATE TABLE IF NOT EXISTS moderation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moderation_id UUID NOT NULL REFERENCES content_moderation(id) ON DELETE CASCADE,

  -- Action Details
  action TEXT NOT NULL, -- status_changed, reviewer_assigned, notes_added, appeal_submitted
  previous_status TEXT,
  new_status TEXT,
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 3. MODERATION RULES TABLE
-- ================================
-- Configurable moderation rules and policies

CREATE TABLE IF NOT EXISTS moderation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  rule_name TEXT NOT NULL,
  rule_description TEXT,
  content_type TEXT NOT NULL,

  -- Rule Configuration
  enabled BOOLEAN DEFAULT TRUE,
  auto_flag BOOLEAN DEFAULT FALSE, -- Automatically flag content matching this rule
  auto_reject BOOLEAN DEFAULT FALSE, -- Automatically reject without review
  keywords TEXT[], -- Keywords to match
  patterns TEXT[], -- Regex patterns to match

  -- Severity
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action TEXT NOT NULL DEFAULT 'flag' CHECK (action IN ('flag', 'reject', 'require_review')),

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 4. INDEXES FOR PERFORMANCE
-- ================================

CREATE INDEX IF NOT EXISTS idx_content_moderation_status ON content_moderation(status);
CREATE INDEX IF NOT EXISTS idx_content_moderation_content ON content_moderation(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_user ON content_moderation(user_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_created ON content_moderation(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_moderation_priority ON content_moderation(priority, status);
CREATE INDEX IF NOT EXISTS idx_moderation_history_moderation ON moderation_history(moderation_id);
CREATE INDEX IF NOT EXISTS idx_moderation_rules_content_type ON moderation_rules(content_type) WHERE enabled = TRUE;

-- ================================
-- 5. AUTO-UPDATE TRIGGER
-- ================================

CREATE OR REPLACE FUNCTION update_content_moderation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_moderation_updated
  BEFORE UPDATE ON content_moderation
  FOR EACH ROW
  EXECUTE FUNCTION update_content_moderation_timestamp();

-- ================================
-- 6. HISTORY LOGGING TRIGGER
-- ================================

CREATE OR REPLACE FUNCTION log_moderation_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO moderation_history (
      moderation_id,
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
      NEW.reviewer_notes
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_moderation_history
  AFTER UPDATE ON content_moderation
  FOR EACH ROW
  EXECUTE FUNCTION log_moderation_action();

-- ================================
-- 7. RLS POLICIES
-- ================================

-- Enable RLS
ALTER TABLE content_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_rules ENABLE ROW LEVEL SECURITY;

-- Users can view their own moderation status
CREATE POLICY "Users can view own content moderation"
  ON content_moderation
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Admins can view all moderation records
CREATE POLICY "Admins can view all content moderation"
  ON content_moderation
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin', 'ContentModerator')
    )
  );

-- Admins can insert moderation records
CREATE POLICY "Admins can insert content moderation"
  ON content_moderation
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin', 'ContentModerator')
    )
  );

-- Admins can update moderation records
CREATE POLICY "Admins can update content moderation"
  ON content_moderation
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin', 'ContentModerator')
    )
  );

-- Admins can view moderation history
CREATE POLICY "Admins can view moderation history"
  ON moderation_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin', 'ContentModerator')
    )
  );

-- Admins can manage moderation rules
CREATE POLICY "Admins can manage moderation rules"
  ON moderation_rules
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

-- Moderation Queue Summary
CREATE OR REPLACE VIEW moderation_queue_summary AS
SELECT
  status,
  priority,
  content_type,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (COALESCE(reviewed_at, NOW()) - created_at))) as avg_review_time_seconds
FROM content_moderation
WHERE status IN ('pending', 'flagged')
GROUP BY status, priority, content_type;

-- Moderator Performance
CREATE OR REPLACE VIEW moderator_performance AS
SELECT
  reviewed_by,
  up.name as moderator_name,
  COUNT(*) as reviews_completed,
  COUNT(*) FILTER (WHERE action_taken = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE action_taken = 'rejected') as rejected_count,
  AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at))) as avg_review_time_seconds,
  MIN(reviewed_at) as first_review,
  MAX(reviewed_at) as last_review
FROM content_moderation cm
LEFT JOIN user_profiles up ON up.id = cm.reviewed_by
WHERE reviewed_by IS NOT NULL
GROUP BY reviewed_by, up.name;

-- Recent Moderation Activity
CREATE OR REPLACE VIEW recent_moderation_activity AS
SELECT
  cm.id,
  cm.content_type,
  cm.status,
  cm.priority,
  cm.flag_reason,
  cm.created_at,
  cm.reviewed_at,
  u.email as user_email,
  up.name as user_name,
  r.email as reviewer_email,
  rp.name as reviewer_name
FROM content_moderation cm
LEFT JOIN auth.users u ON u.id = cm.user_id
LEFT JOIN user_profiles up ON up.id = cm.user_id
LEFT JOIN auth.users r ON r.id = cm.reviewed_by
LEFT JOIN user_profiles rp ON rp.id = cm.reviewed_by
ORDER BY cm.created_at DESC
LIMIT 100;

-- ================================
-- 9. HELPER FUNCTIONS
-- ================================

-- Function to auto-create moderation record when release is submitted
CREATE OR REPLACE FUNCTION create_release_moderation_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create moderation record when status changes to 'submitted'
  IF (TG_OP = 'UPDATE' AND OLD.status != 'submitted' AND NEW.status = 'submitted') OR
     (TG_OP = 'INSERT' AND NEW.status = 'submitted') THEN

    INSERT INTO content_moderation (
      content_type,
      content_id,
      user_id,
      status,
      priority
    ) VALUES (
      'release',
      NEW.id,
      NEW.artist_id,
      'pending',
      'normal'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to releases table
DROP TRIGGER IF EXISTS release_moderation_trigger ON releases;
CREATE TRIGGER release_moderation_trigger
  AFTER INSERT OR UPDATE OF status ON releases
  FOR EACH ROW
  EXECUTE FUNCTION create_release_moderation_record();

-- Function to approve moderation and update content status
CREATE OR REPLACE FUNCTION approve_content(
  p_moderation_id UUID,
  p_reviewer_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_moderation content_moderation%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Get moderation record
  SELECT * INTO v_moderation
  FROM content_moderation
  WHERE id = p_moderation_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Moderation record not found');
  END IF;

  -- Update moderation record
  UPDATE content_moderation
  SET
    status = 'approved',
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW(),
    reviewer_notes = p_notes,
    action_taken = 'approved'
  WHERE id = p_moderation_id;

  -- Update the actual content based on type
  IF v_moderation.content_type = 'release' THEN
    UPDATE releases
    SET
      status = 'approved',
      approval_date = NOW()
    WHERE id = v_moderation.content_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'moderation_id', p_moderation_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject content
CREATE OR REPLACE FUNCTION reject_content(
  p_moderation_id UUID,
  p_reviewer_id UUID,
  p_reason TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_moderation content_moderation%ROWTYPE;
BEGIN
  -- Get moderation record
  SELECT * INTO v_moderation
  FROM content_moderation
  WHERE id = p_moderation_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Moderation record not found');
  END IF;

  -- Update moderation record
  UPDATE content_moderation
  SET
    status = 'rejected',
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW(),
    flag_reason = p_reason,
    reviewer_notes = p_notes,
    action_taken = 'rejected'
  WHERE id = p_moderation_id;

  -- Update the actual content based on type
  IF v_moderation.content_type = 'release' THEN
    UPDATE releases
    SET status = 'rejected'
    WHERE id = v_moderation.content_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'moderation_id', p_moderation_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 10. SEED DEFAULT MODERATION RULES
-- ================================

INSERT INTO moderation_rules (rule_name, rule_description, content_type, severity, action, keywords) VALUES
('Explicit Content', 'Flag releases with explicit lyrics or adult content', 'release', 'medium', 'require_review', ARRAY['explicit', 'adult', 'nsfw']),
('Copyright Keywords', 'Flag potential copyright infringement', 'release', 'high', 'flag', ARRAY['cover', 'remix', 'sample', 'tribute']),
('Spam Detection', 'Detect spam or promotional content', 'release', 'low', 'flag', ARRAY['buy now', 'click here', 'limited time', 'subscribe'])
ON CONFLICT DO NOTHING;

-- ================================
-- MIGRATION COMPLETE
-- ================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON content_moderation TO authenticated;
GRANT SELECT ON moderation_history TO authenticated;
GRANT SELECT ON moderation_rules TO authenticated;
GRANT SELECT ON moderation_queue_summary TO authenticated;
GRANT SELECT ON moderator_performance TO authenticated;
GRANT SELECT ON recent_moderation_activity TO authenticated;

-- Comments for documentation
COMMENT ON TABLE content_moderation IS 'Content moderation queue for admin review of user-submitted content';
COMMENT ON TABLE moderation_history IS 'Audit trail of all moderation actions';
COMMENT ON TABLE moderation_rules IS 'Configurable automated moderation rules';
COMMENT ON FUNCTION approve_content IS 'Approve moderated content and update status';
COMMENT ON FUNCTION reject_content IS 'Reject moderated content with reason';
