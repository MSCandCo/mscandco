-- ============================================
-- SKILLS MANAGEMENT DATABASE SCHEMA
-- ============================================
-- Single source of truth for learning features
-- Full database connectivity for skills admin page
-- ============================================

-- Learning Modules Table
-- Stores educational content and courses
CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('music_distribution', 'copyright', 'marketing', 'analytics', 'financial', 'platform_tools')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes INTEGER,
  content_markdown TEXT,
  content_video_url TEXT,
  content_audio_url TEXT,
  content_resources JSONB DEFAULT '[]'::JSONB,
  learning_objectives TEXT[],
  prerequisites UUID[],
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Enrollments Table
-- Tracks user enrollments and progress in modules
CREATE TABLE IF NOT EXISTS learning_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'abandoned')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_section INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  quiz_scores JSONB DEFAULT '[]'::JSONB,
  completion_certificate_id UUID,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Learning Certificates Table
-- Stores certificates issued upon module completion
CREATE TABLE IF NOT EXISTS learning_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES learning_enrollments(id) ON DELETE SET NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  certificate_url TEXT,
  final_score INTEGER,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT true,
  verification_code TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Tutor Sessions Table
-- Tracks AI-powered tutoring conversations
CREATE TABLE IF NOT EXISTS ai_tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES learning_modules(id) ON DELETE SET NULL,
  enrollment_id UUID REFERENCES learning_enrollments(id) ON DELETE SET NULL,
  session_title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  message_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  context_summary TEXT,
  topics_covered TEXT[],
  learning_insights JSONB DEFAULT '{}'::JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Tutor Messages Table
-- Stores individual messages in tutor sessions
CREATE TABLE IF NOT EXISTS ai_tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_tutor_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT,
  response_time_ms INTEGER,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module Quiz Questions Table (optional for future use)
CREATE TABLE IF NOT EXISTS module_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB DEFAULT '[]'::JSONB,
  correct_answer TEXT,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Learning Modules Indexes
CREATE INDEX IF NOT EXISTS idx_learning_modules_published ON learning_modules(is_published);
CREATE INDEX IF NOT EXISTS idx_learning_modules_category ON learning_modules(category);
CREATE INDEX IF NOT EXISTS idx_learning_modules_author ON learning_modules(author_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_featured ON learning_modules(is_featured) WHERE is_published = true;

-- Learning Enrollments Indexes
CREATE INDEX IF NOT EXISTS idx_learning_enrollments_user ON learning_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_enrollments_module ON learning_enrollments(module_id);
CREATE INDEX IF NOT EXISTS idx_learning_enrollments_status ON learning_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_learning_enrollments_progress ON learning_enrollments(user_id, progress_percentage);

-- Learning Certificates Indexes
CREATE INDEX IF NOT EXISTS idx_learning_certificates_user ON learning_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_certificates_module ON learning_certificates(module_id);
CREATE INDEX IF NOT EXISTS idx_learning_certificates_issued ON learning_certificates(issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_certificates_number ON learning_certificates(certificate_number);

-- AI Tutor Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_user ON ai_tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_module ON ai_tutor_sessions(module_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_status ON ai_tutor_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_last_message ON ai_tutor_sessions(last_message_at DESC);

-- AI Tutor Messages Indexes
CREATE INDEX IF NOT EXISTS idx_ai_tutor_messages_session ON ai_tutor_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_messages_created ON ai_tutor_messages(created_at);

-- Module Quiz Questions Indexes
CREATE INDEX IF NOT EXISTS idx_module_quiz_questions_module ON module_quiz_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_module_quiz_questions_order ON module_quiz_questions(module_id, order_index);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_quiz_questions ENABLE ROW LEVEL SECURITY;

-- Learning Modules Policies
DROP POLICY IF EXISTS "Published modules are viewable by all users" ON learning_modules;
CREATE POLICY "Published modules are viewable by all users"
  ON learning_modules FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Authors can view their own unpublished modules" ON learning_modules;
CREATE POLICY "Authors can view their own unpublished modules"
  ON learning_modules FOR SELECT
  USING (auth.uid() = author_id);

-- Learning Enrollments Policies
DROP POLICY IF EXISTS "Users can view their own enrollments" ON learning_enrollments;
CREATE POLICY "Users can view their own enrollments"
  ON learning_enrollments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can enroll themselves" ON learning_enrollments;
CREATE POLICY "Users can enroll themselves"
  ON learning_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own enrollments" ON learning_enrollments;
CREATE POLICY "Users can update their own enrollments"
  ON learning_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- Learning Certificates Policies
DROP POLICY IF EXISTS "Users can view their own certificates" ON learning_certificates;
CREATE POLICY "Users can view their own certificates"
  ON learning_certificates FOR SELECT
  USING (auth.uid() = user_id);

-- AI Tutor Sessions Policies
DROP POLICY IF EXISTS "Users can view their own tutor sessions" ON ai_tutor_sessions;
CREATE POLICY "Users can view their own tutor sessions"
  ON ai_tutor_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own tutor sessions" ON ai_tutor_sessions;
CREATE POLICY "Users can create their own tutor sessions"
  ON ai_tutor_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tutor sessions" ON ai_tutor_sessions;
CREATE POLICY "Users can update their own tutor sessions"
  ON ai_tutor_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- AI Tutor Messages Policies
DROP POLICY IF EXISTS "Users can view messages from their own sessions" ON ai_tutor_messages;
CREATE POLICY "Users can view messages from their own sessions"
  ON ai_tutor_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_tutor_sessions
      WHERE id = ai_tutor_messages.session_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages to their own sessions" ON ai_tutor_messages;
CREATE POLICY "Users can insert messages to their own sessions"
  ON ai_tutor_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_tutor_sessions
      WHERE id = ai_tutor_messages.session_id
      AND user_id = auth.uid()
    )
  );

-- Module Quiz Questions Policies
DROP POLICY IF EXISTS "Users can view questions for published modules" ON module_quiz_questions;
CREATE POLICY "Users can view questions for published modules"
  ON module_quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM learning_modules
      WHERE id = module_quiz_questions.module_id
      AND is_published = true
    )
  );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp (reuse if already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_learning_modules_updated_at ON learning_modules;
CREATE TRIGGER update_learning_modules_updated_at
  BEFORE UPDATE ON learning_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_enrollments_updated_at ON learning_enrollments;
CREATE TRIGGER update_learning_enrollments_updated_at
  BEFORE UPDATE ON learning_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_tutor_sessions_updated_at ON ai_tutor_sessions;
CREATE TRIGGER update_ai_tutor_sessions_updated_at
  BEFORE UPDATE ON ai_tutor_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_module_quiz_questions_updated_at ON module_quiz_questions;
CREATE TRIGGER update_module_quiz_questions_updated_at
  BEFORE UPDATE ON module_quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGERS FOR AUTO-INCREMENTING COUNTERS
-- ============================================

-- Update enrollment status when progress reaches 100%
CREATE OR REPLACE FUNCTION update_enrollment_status_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.progress_percentage = 100 AND OLD.progress_percentage < 100 THEN
    NEW.status = 'completed';
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enrollment_completion_trigger ON learning_enrollments;
CREATE TRIGGER enrollment_completion_trigger
  BEFORE UPDATE ON learning_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_enrollment_status_on_completion();

-- Update AI tutor session message count
CREATE OR REPLACE FUNCTION update_tutor_session_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ai_tutor_sessions
    SET message_count = message_count + 1,
        last_message_at = NEW.created_at,
        total_tokens_used = total_tokens_used + COALESCE(NEW.tokens_used, 0)
    WHERE id = NEW.session_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_session_message_count_trigger ON ai_tutor_messages;
CREATE TRIGGER update_session_message_count_trigger
  AFTER INSERT ON ai_tutor_messages
  FOR EACH ROW EXECUTE FUNCTION update_tutor_session_message_count();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate unique certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Format: CERT-YYYY-XXXXXXXX (CERT-2025-AB1CD2EF)
    new_number := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8));

    -- Check if number already exists
    SELECT EXISTS(SELECT 1 FROM learning_certificates WHERE certificate_number = new_number) INTO exists_check;

    -- If unique, exit loop
    EXIT WHEN NOT exists_check;
  END LOOP;

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate certificate number on insert
CREATE OR REPLACE FUNCTION auto_generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL THEN
    NEW.certificate_number := generate_certificate_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_certificate_number_trigger ON learning_certificates;
CREATE TRIGGER auto_certificate_number_trigger
  BEFORE INSERT ON learning_certificates
  FOR EACH ROW EXECUTE FUNCTION auto_generate_certificate_number();
