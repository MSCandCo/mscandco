-- =====================================================
-- SKILLS DEVELOPMENT MODULE
-- Grant Feature #5: AI-powered learning and certification
-- =====================================================

-- Learning modules
CREATE TABLE IF NOT EXISTS public.learning_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Module details
    module_title TEXT NOT NULL,
    module_slug TEXT UNIQUE NOT NULL,
    module_description TEXT,
    module_category TEXT CHECK (module_category IN (
        'music_production',
        'distribution_basics',
        'marketing_promotion',
        'metadata_optimization',
        'legal_rights',
        'royalty_management',
        'brand_building',
        'social_media',
        'analytics_insights',
        'platform_specific'
    )),

    -- Content
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_duration_minutes INTEGER,
    content_type TEXT CHECK (content_type IN ('video', 'article', 'interactive', 'quiz', 'mixed')),

    -- Structure
    lesson_count INTEGER DEFAULT 0,
    quiz_count INTEGER DEFAULT 0,
    has_certificate BOOLEAN DEFAULT false,

    -- AI features
    ai_tutor_enabled BOOLEAN DEFAULT true,
    personalized_learning BOOLEAN DEFAULT false,

    -- Requirements
    prerequisites TEXT[], -- Slugs of required modules
    recommended_for_roles TEXT[], -- ['Artist', 'LabelAdmin', 'DistributionPartner']

    -- Metadata
    learning_objectives TEXT[],
    key_topics TEXT[],
    instructor_name TEXT,
    instructor_bio TEXT,

    -- Status
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,

    -- Analytics
    enrollment_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons within modules
CREATE TABLE IF NOT EXISTS public.learning_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,

    -- Lesson details
    lesson_title TEXT NOT NULL,
    lesson_slug TEXT NOT NULL,
    lesson_order INTEGER NOT NULL,

    -- Content
    content_type TEXT CHECK (content_type IN ('video', 'article', 'interactive', 'quiz', 'exercise')),
    video_url TEXT,
    article_content TEXT,
    interactive_embed_url TEXT,

    -- Duration
    estimated_duration_minutes INTEGER,

    -- Files and resources
    downloadable_resources JSONB DEFAULT '[]'::jsonb,

    -- AI-generated content
    ai_summary TEXT,
    ai_key_points TEXT[],
    ai_practice_questions JSONB DEFAULT '[]'::jsonb,

    is_published BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(module_id, lesson_slug)
);

-- User enrollments
CREATE TABLE IF NOT EXISTS public.learning_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,

    -- Progress
    enrollment_status TEXT NOT NULL DEFAULT 'active' CHECK (enrollment_status IN (
        'active',
        'completed',
        'dropped',
        'paused'
    )),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    quizzes_passed INTEGER DEFAULT 0,

    -- Time tracking
    total_time_spent_minutes INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,

    -- Completion
    completed_at TIMESTAMPTZ,
    certificate_issued_at TIMESTAMPTZ,
    certificate_url TEXT,

    -- Personalization
    learning_pace TEXT CHECK (learning_pace IN ('slow', 'normal', 'fast')),
    preferred_content_type TEXT,

    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, module_id)
);

-- Lesson progress tracking
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,

    -- Progress
    completion_status TEXT NOT NULL DEFAULT 'not_started' CHECK (completion_status IN (
        'not_started',
        'in_progress',
        'completed',
        'review'
    )),
    completion_percentage DECIMAL(5,2) DEFAULT 0,

    -- Time
    time_spent_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Engagement
    video_watch_percentage DECIMAL(5,2),
    notes TEXT,
    bookmarked BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, lesson_id)
);

-- Quizzes and assessments
CREATE TABLE IF NOT EXISTS public.learning_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.learning_lessons(id) ON DELETE SET NULL,

    -- Quiz details
    quiz_title TEXT NOT NULL,
    quiz_description TEXT,
    quiz_type TEXT CHECK (quiz_type IN ('knowledge_check', 'module_assessment', 'certification_exam', 'practice')),

    -- Configuration
    question_count INTEGER NOT NULL,
    passing_score_percentage DECIMAL(5,2) DEFAULT 70,
    time_limit_minutes INTEGER,
    max_attempts INTEGER DEFAULT 3,

    -- Questions (stored as JSONB)
    questions JSONB NOT NULL, -- Array of question objects

    -- Difficulty
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),

    is_published BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES public.learning_quizzes(id) ON DELETE CASCADE,

    -- Attempt details
    attempt_number INTEGER NOT NULL,
    answers JSONB NOT NULL, -- User's answers

    -- Scoring
    score_percentage DECIMAL(5,2) NOT NULL,
    correct_answers INTEGER,
    total_questions INTEGER,
    passed BOOLEAN,

    -- Time
    time_taken_minutes INTEGER,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,

    -- AI feedback
    ai_feedback TEXT,
    improvement_suggestions TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates
CREATE TABLE IF NOT EXISTS public.learning_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,

    -- Certificate details
    certificate_number TEXT UNIQUE NOT NULL,
    certificate_title TEXT NOT NULL,

    -- Recipient
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,

    -- Content
    skills_acquired TEXT[],
    completion_date DATE NOT NULL,

    -- Verification
    verification_url TEXT,
    verification_qr_code_url TEXT,
    blockchain_hash TEXT, -- For verifiable credentials

    -- Files
    certificate_pdf_url TEXT,
    certificate_image_url TEXT,

    -- Sharing
    is_public BOOLEAN DEFAULT false,
    linkedin_share_count INTEGER DEFAULT 0,

    -- Expiry (if applicable)
    expires_at DATE,
    is_valid BOOLEAN DEFAULT true,

    issued_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI tutor interactions
CREATE TABLE IF NOT EXISTS public.ai_tutor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.learning_lessons(id) ON DELETE SET NULL,

    -- Session details
    session_topic TEXT,
    conversation JSONB NOT NULL, -- Array of messages {role, content, timestamp}

    -- AI model used
    ai_model TEXT DEFAULT 'gpt-4',

    -- Engagement
    message_count INTEGER DEFAULT 0,
    helpful_rating INTEGER CHECK (helpful_rating >= 1 AND helpful_rating <= 5),

    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning paths (curated sequences of modules)
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Path details
    path_name TEXT NOT NULL,
    path_slug TEXT UNIQUE NOT NULL,
    path_description TEXT,

    -- Target audience
    target_role TEXT,
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),

    -- Modules in path
    module_ids UUID[], -- Ordered list of module IDs
    estimated_total_hours INTEGER,

    -- Certificate
    issues_certificate BOOLEAN DEFAULT true,
    certificate_title TEXT,

    -- Status
    is_published BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User skill profiles
CREATE TABLE IF NOT EXISTS public.user_skill_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Skills assessment
    current_skills JSONB DEFAULT '{}'::jsonb, -- {metadata_optimization: 85, marketing: 60, ...}
    skill_gaps TEXT[],
    recommended_modules UUID[],

    -- Learning stats
    total_modules_completed INTEGER DEFAULT 0,
    total_certificates_earned INTEGER DEFAULT 0,
    total_learning_hours INTEGER DEFAULT 0,

    -- AI-powered insights
    learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'reading', 'kinesthetic', 'mixed')),
    strengths TEXT[],
    areas_for_improvement TEXT[],

    last_assessment_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module reviews
CREATE TABLE IF NOT EXISTS public.module_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,

    -- Rating
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

    -- Review
    review_title TEXT,
    review_text TEXT,

    -- Specific ratings
    content_quality_rating INTEGER CHECK (content_quality_rating >= 1 AND content_quality_rating <= 5),
    instructor_rating INTEGER CHECK (instructor_rating >= 1 AND instructor_rating <= 5),
    usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),

    -- Recommendation
    would_recommend BOOLEAN,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, module_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_learning_modules_category ON public.learning_modules(module_category);
CREATE INDEX IF NOT EXISTS idx_learning_modules_published ON public.learning_modules(is_published);
CREATE INDEX IF NOT EXISTS idx_learning_lessons_module ON public.learning_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.learning_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_module ON public.learning_enrollments(module_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.learning_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_public ON public.learning_certificates(is_public);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_user ON public.ai_tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON public.user_skill_profiles(user_id);

-- Enable RLS
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_modules
CREATE POLICY "Anyone can view published modules"
    ON public.learning_modules FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admins can manage all modules"
    ON public.learning_modules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin')
        )
    );

-- RLS Policies for learning_lessons
CREATE POLICY "Anyone can view published lessons"
    ON public.learning_lessons FOR SELECT
    USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM public.learning_modules
            WHERE id = module_id AND is_published = true
        )
    );

-- RLS Policies for learning_enrollments
CREATE POLICY "Users can view their own enrollments"
    ON public.learning_enrollments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in modules"
    ON public.learning_enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their enrollments"
    ON public.learning_enrollments FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for lesson_progress
CREATE POLICY "Users can manage their own progress"
    ON public.lesson_progress FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts"
    ON public.quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create quiz attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for learning_certificates
CREATE POLICY "Users can view their own certificates"
    ON public.learning_certificates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public certificates"
    ON public.learning_certificates FOR SELECT
    USING (is_public = true);

-- RLS Policies for ai_tutor_sessions
CREATE POLICY "Users can manage their own AI tutor sessions"
    ON public.ai_tutor_sessions FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for learning_paths
CREATE POLICY "Anyone can view published learning paths"
    ON public.learning_paths FOR SELECT
    USING (is_published = true);

-- RLS Policies for user_skill_profiles
CREATE POLICY "Users can view their own skill profile"
    ON public.user_skill_profiles FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for module_reviews
CREATE POLICY "Anyone can view reviews"
    ON public.module_reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own reviews"
    ON public.module_reviews FOR ALL
    USING (auth.uid() = user_id);

-- Function to update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
    v_progress DECIMAL(5,2);
BEGIN
    -- Get total lessons in module
    SELECT COUNT(*) INTO v_total_lessons
    FROM public.learning_lessons
    WHERE module_id = NEW.module_id AND is_published = true;

    -- Get completed lessons for user
    SELECT COUNT(*) INTO v_completed_lessons
    FROM public.lesson_progress
    WHERE module_id = NEW.module_id
    AND user_id = NEW.user_id
    AND completion_status = 'completed';

    -- Calculate progress
    IF v_total_lessons > 0 THEN
        v_progress := (v_completed_lessons::DECIMAL / v_total_lessons) * 100;
    ELSE
        v_progress := 0;
    END IF;

    -- Update enrollment
    UPDATE public.learning_enrollments
    SET
        progress_percentage = v_progress,
        lessons_completed = v_completed_lessons,
        last_accessed_at = NOW(),
        enrollment_status = CASE
            WHEN v_progress = 100 THEN 'completed'
            ELSE enrollment_status
        END,
        completed_at = CASE
            WHEN v_progress = 100 AND completed_at IS NULL THEN NOW()
            ELSE completed_at
        END,
        updated_at = NOW()
    WHERE user_id = NEW.user_id AND module_id = NEW.module_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_progress_on_lesson_complete
AFTER INSERT OR UPDATE ON public.lesson_progress
FOR EACH ROW
WHEN (NEW.completion_status = 'completed')
EXECUTE FUNCTION update_enrollment_progress();

-- Function to issue certificate on module completion
CREATE OR REPLACE FUNCTION issue_certificate_on_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_module_title TEXT;
    v_user_name TEXT;
    v_user_email TEXT;
    v_cert_number TEXT;
BEGIN
    IF NEW.enrollment_status = 'completed' AND NEW.completed_at IS NOT NULL AND NEW.certificate_issued_at IS NULL THEN
        -- Get module info
        SELECT module_title INTO v_module_title
        FROM public.learning_modules
        WHERE id = NEW.module_id AND has_certificate = true;

        IF v_module_title IS NOT NULL THEN
            -- Get user info
            SELECT COALESCE(display_name, name, email) INTO v_user_name
            FROM public.user_profiles
            WHERE user_id = NEW.user_id;

            SELECT email INTO v_user_email
            FROM auth.users
            WHERE id = NEW.user_id;

            -- Generate certificate number
            v_cert_number := 'MSC-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));

            -- Insert certificate
            INSERT INTO public.learning_certificates (
                user_id,
                module_id,
                certificate_number,
                certificate_title,
                recipient_name,
                recipient_email,
                skills_acquired,
                completion_date
            )
            SELECT
                NEW.user_id,
                NEW.module_id,
                v_cert_number,
                v_module_title,
                v_user_name,
                v_user_email,
                learning_objectives,
                CURRENT_DATE
            FROM public.learning_modules
            WHERE id = NEW.module_id;

            -- Update enrollment with certificate info
            UPDATE public.learning_enrollments
            SET certificate_issued_at = NOW()
            WHERE id = NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER issue_cert_on_complete
AFTER UPDATE ON public.learning_enrollments
FOR EACH ROW EXECUTE FUNCTION issue_certificate_on_completion();

-- Grant permissions
GRANT SELECT ON public.learning_modules TO anon, authenticated;
GRANT SELECT ON public.learning_lessons TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.learning_enrollments TO authenticated;
GRANT ALL ON public.lesson_progress TO authenticated;
GRANT SELECT ON public.learning_quizzes TO authenticated;
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT SELECT ON public.learning_certificates TO anon, authenticated;
GRANT ALL ON public.ai_tutor_sessions TO authenticated;
GRANT SELECT ON public.learning_paths TO anon, authenticated;
GRANT ALL ON public.user_skill_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.module_reviews TO authenticated;

GRANT ALL ON public.learning_modules TO service_role;
GRANT ALL ON public.learning_lessons TO service_role;
GRANT ALL ON public.learning_enrollments TO service_role;
GRANT ALL ON public.lesson_progress TO service_role;
GRANT ALL ON public.learning_quizzes TO service_role;
GRANT ALL ON public.quiz_attempts TO service_role;
GRANT ALL ON public.learning_certificates TO service_role;
GRANT ALL ON public.ai_tutor_sessions TO service_role;
GRANT ALL ON public.learning_paths TO service_role;
GRANT ALL ON public.user_skill_profiles TO service_role;
GRANT ALL ON public.module_reviews TO service_role;
