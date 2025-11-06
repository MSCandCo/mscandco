-- ================================
-- SUPPORT TICKET SYSTEM
-- ================================
-- Purpose: Customer support and help desk system
-- Created: January 2025

-- ================================
-- 1. SUPPORT TICKETS TABLE
-- ================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Ticket Information
  ticket_number TEXT UNIQUE NOT NULL, -- Human-readable ticket ID (e.g., SUP-12345)
  subject TEXT NOT NULL,
  description TEXT NOT NULL,

  -- User Information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL, -- Store email even if user is deleted
  user_name TEXT,

  -- Categorization
  category TEXT NOT NULL CHECK (category IN (
    'billing',
    'technical',
    'account',
    'distribution',
    'royalties',
    'content',
    'dmca',
    'other'
  )),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open',        -- New ticket
    'assigned',    -- Assigned to support agent
    'in_progress', -- Being worked on
    'waiting',     -- Waiting for user response
    'resolved',    -- Resolved
    'closed'       -- Closed
  )),

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,

  -- Resolution
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,

  -- Timestamps
  first_response_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Metrics
  response_time_seconds INTEGER, -- Time to first response
  resolution_time_seconds INTEGER -- Time to resolution
);

-- ================================
-- 2. TICKET MESSAGES TABLE
-- ================================

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

  -- Message Content
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Internal note visible only to support team

  -- Author
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  author_type TEXT NOT NULL CHECK (author_type IN ('user', 'support', 'system')),

  -- Attachments
  attachments JSONB, -- Array of file URLs and metadata

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 3. TICKET TAGS TABLE
-- ================================

CREATE TABLE IF NOT EXISTS ticket_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(ticket_id, tag)
);

-- ================================
-- 4. SUPPORT TEAM MEMBERS TABLE
-- ================================
-- Track support team member availability and workload

CREATE TABLE IF NOT EXISTS support_team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Availability
  available BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'away', 'offline')),

  -- Specializations
  specializations TEXT[], -- billing, technical, etc.

  -- Workload
  current_ticket_count INTEGER DEFAULT 0,
  max_ticket_capacity INTEGER DEFAULT 10,

  -- Performance Metrics
  total_tickets_handled INTEGER DEFAULT 0,
  avg_response_time_seconds INTEGER,
  avg_resolution_time_seconds INTEGER,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 5. AUTO-GENERATE TICKET NUMBER
-- ================================

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  next_num := nextval('ticket_number_seq');
  RETURN 'SUP-' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 6. INDEXES FOR PERFORMANCE
-- ================================

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created ON ticket_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_tags_ticket ON ticket_tags(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_tags_tag ON ticket_tags(tag);

-- ================================
-- 7. AUTO-UPDATE TRIGGERS
-- ================================

CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_tickets_updated
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number_trigger
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Trigger to update metrics on status changes
CREATE OR REPLACE FUNCTION update_ticket_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update first response time
  IF OLD.first_response_at IS NULL AND NEW.first_response_at IS NOT NULL THEN
    NEW.response_time_seconds := EXTRACT(EPOCH FROM (NEW.first_response_at - NEW.created_at));
  END IF;

  -- Update resolution time
  IF OLD.status != 'resolved' AND NEW.status = 'resolved' THEN
    NEW.resolved_at := NOW();
    NEW.resolution_time_seconds := EXTRACT(EPOCH FROM (NOW() - NEW.created_at));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_metrics_trigger
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_metrics();

-- Trigger to update last_activity_at when messages are added
CREATE OR REPLACE FUNCTION update_ticket_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_tickets
  SET last_activity_at = NOW()
  WHERE id = NEW.ticket_id;

  -- Mark first response time
  IF NEW.author_type = 'support' THEN
    UPDATE support_tickets
    SET first_response_at = NOW()
    WHERE id = NEW.ticket_id AND first_response_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_last_activity_trigger
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_last_activity();

-- ================================
-- 8. RLS POLICIES
-- ================================

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_team_members ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Users can create tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Users can update their own tickets (limited fields)
CREATE POLICY "Users can update own tickets"
  ON support_tickets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Support team can view all tickets
CREATE POLICY "Support team can view all tickets"
  ON support_tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin', 'SupportAgent')
    )
  );

-- Support team can update tickets
CREATE POLICY "Support team can update tickets"
  ON support_tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin', 'SupportAgent')
    )
  );

-- Messages: Users can view messages for their tickets
CREATE POLICY "Users can view own ticket messages"
  ON ticket_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
    AND NOT is_internal
  );

-- Messages: Support team can view all messages
CREATE POLICY "Support team can view all messages"
  ON ticket_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin', 'SupportAgent')
    )
  );

-- Messages: Users can add messages to their tickets
CREATE POLICY "Users can add messages to own tickets"
  ON ticket_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Messages: Support team can add messages
CREATE POLICY "Support team can add messages"
  ON ticket_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin', 'SupportAgent')
    )
  );

-- Tags: Support team only
CREATE POLICY "Support team can manage tags"
  ON ticket_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin', 'SupportAgent')
    )
  );

-- Support team members: Admins only
CREATE POLICY "Admins can manage support team"
  ON support_team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('SuperAdmin', 'Admin')
    )
  );

-- ================================
-- 9. ADMIN VIEWS FOR REPORTING
-- ================================

-- Ticket Summary by Status
CREATE OR REPLACE VIEW ticket_summary_by_status AS
SELECT
  status,
  category,
  priority,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d,
  AVG(response_time_seconds) as avg_response_time_seconds,
  AVG(resolution_time_seconds) as avg_resolution_time_seconds
FROM support_tickets
GROUP BY status, category, priority;

-- Support Team Performance
CREATE OR REPLACE VIEW support_team_performance AS
SELECT
  stm.user_id,
  up.name as agent_name,
  stm.available,
  stm.status,
  stm.current_ticket_count,
  stm.total_tickets_handled,
  stm.avg_response_time_seconds,
  stm.avg_resolution_time_seconds,
  COUNT(st.id) FILTER (WHERE st.status IN ('open', 'assigned', 'in_progress')) as active_tickets
FROM support_team_members stm
LEFT JOIN user_profiles up ON up.id = stm.user_id
LEFT JOIN support_tickets st ON st.assigned_to = stm.user_id
GROUP BY stm.user_id, up.name, stm.available, stm.status, stm.current_ticket_count, stm.total_tickets_handled, stm.avg_response_time_seconds, stm.avg_resolution_time_seconds;

-- ================================
-- MIGRATION COMPLETE
-- ================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON support_tickets TO authenticated;
GRANT SELECT, INSERT ON ticket_messages TO authenticated;
GRANT SELECT ON ticket_tags TO authenticated;
GRANT SELECT ON ticket_summary_by_status TO authenticated;

-- Comments for documentation
COMMENT ON TABLE support_tickets IS 'Customer support tickets';
COMMENT ON TABLE ticket_messages IS 'Messages and replies for support tickets';
COMMENT ON TABLE ticket_tags IS 'Tags for organizing and categorizing tickets';
COMMENT ON TABLE support_team_members IS 'Support team member availability and metrics';
