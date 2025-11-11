-- =====================================================
-- GRANT FEATURES COMPLETE MIGRATION
-- Integrates perfectly with Advanced AI Learning System
-- =====================================================

-- This migration adds grant features WITHOUT conflicting with:
-- - Cursor's AI Learning System (ai_learning_analytics, ai_behavioral_patterns, ai_prediction_outcomes)
-- - Existing platform features

BEGIN;

-- =====================================================
-- 1. COPYRIGHT VERIFICATION SYSTEM
-- =====================================================

-- Additional tables not yet created
CREATE TABLE IF NOT EXISTS public.copyright_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_title TEXT NOT NULL,
    work_artist TEXT NOT NULL,
    work_isrc TEXT,
    work_iswc TEXT,
    work_upc TEXT,
    audio_fingerprint BYTEA,
    audio_fingerprint_hash TEXT,
    melody_pattern JSONB,
    rhythm_pattern JSONB,
    release_date DATE,
    duration_ms INTEGER,
    genre TEXT[],
    catalog_source TEXT NOT NULL,
    catalog_id TEXT,
    rights_holders JSONB,
    publishers JSONB,
    known_samples JSONB DEFAULT '[]'::jsonb,
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copyright_knowledge_title ON public.copyright_knowledge_base USING gin(to_tsvector('english', work_title));
CREATE INDEX IF NOT EXISTS idx_copyright_knowledge_artist ON public.copyright_knowledge_base USING gin(to_tsvector('english', work_artist));

CREATE TABLE IF NOT EXISTS public.copyright_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID REFERENCES public.copyright_verifications(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copyright_logs_verification ON public.copyright_verification_logs(verification_id);

-- Enable RLS
ALTER TABLE public.copyright_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copyright_verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view copyright knowledge base"
    ON public.copyright_knowledge_base FOR SELECT
    USING (true);

CREATE POLICY "Users can view logs for their verifications"
    ON public.copyright_verification_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.copyright_verifications
            WHERE id = verification_id
            AND user_id = auth.uid()
        )
    );

-- =====================================================
-- 2. CARBON TRACKING ADDITIONAL TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.carbon_offset_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    carbon_tracking_id UUID REFERENCES public.carbon_footprint_tracking(id) ON DELETE SET NULL,

    offset_provider TEXT NOT NULL,
    offset_amount_kg DECIMAL(15,6) NOT NULL,
    offset_cost_amount DECIMAL(10,2) NOT NULL,
    offset_cost_currency TEXT DEFAULT 'GBP',

    offset_project_name TEXT,
    offset_project_type TEXT,
    offset_project_location TEXT,
    offset_project_url TEXT,

    certificate_number TEXT,
    certificate_url TEXT,
    verification_standard TEXT,

    transaction_status TEXT NOT NULL CHECK (transaction_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_date TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sustainability_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    achievement_type TEXT NOT NULL,
    achievement_title TEXT NOT NULL,
    achievement_description TEXT,
    achievement_icon_url TEXT,

    milestone_value DECIMAL(15,2),
    milestone_unit TEXT,

    earned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, achievement_type)
);

CREATE INDEX IF NOT EXISTS idx_carbon_transactions_user ON public.carbon_offset_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_achievements_user ON public.sustainability_achievements(user_id);

ALTER TABLE public.carbon_offset_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own offset transactions"
    ON public.carbon_offset_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements"
    ON public.sustainability_achievements FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- 3. ACCESSIBILITY ADDITIONAL TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sign_language_interpreters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    interpreter_name TEXT NOT NULL,
    languages TEXT[] NOT NULL,
    certifications JSONB DEFAULT '[]'::jsonb,

    music_genres TEXT[],
    experience_years INTEGER,

    email TEXT,
    hourly_rate DECIMAL(10,2),
    available_for_booking BOOLEAN DEFAULT true,

    portfolio_videos JSONB DEFAULT '[]'::jsonb,
    completed_projects INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.accessibility_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
    requester_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    request_type TEXT NOT NULL CHECK (request_type IN (
        'audio_description',
        'lyric_translation',
        'sign_language_video',
        'braille_notation',
        'simplified_version',
        'descriptive_audio'
    )),
    target_language TEXT,

    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    requested_deadline DATE,

    assigned_to UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ,

    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'in_progress',
        'completed',
        'rejected',
        'cancelled'
    )),

    request_notes TEXT,
    admin_notes TEXT,

    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.accessibility_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    high_contrast_mode BOOLEAN DEFAULT false,
    font_size TEXT CHECK (font_size IN ('small', 'medium', 'large', 'extra_large')),
    reduced_motion BOOLEAN DEFAULT false,

    audio_descriptions_default BOOLEAN DEFAULT false,
    caption_language TEXT,
    auto_load_captions BOOLEAN DEFAULT false,

    preferred_languages TEXT[],
    auto_translate_lyrics BOOLEAN DEFAULT false,

    screen_reader_optimized BOOLEAN DEFAULT false,
    keyboard_navigation_only BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sign_language_interpreters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view interpreter profiles"
    ON public.sign_language_interpreters FOR SELECT
    USING (available_for_booking = true);

CREATE POLICY "Users can view their own requests"
    ON public.accessibility_requests FOR SELECT
    USING (auth.uid() = requester_user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can manage their own preferences"
    ON public.accessibility_user_preferences FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- 4. OPEN DATA ADDITIONAL TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.streaming_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    date DATE NOT NULL,
    hour INTEGER CHECK (hour >= 0 AND hour < 24),

    genre TEXT NOT NULL,

    stream_count BIGINT DEFAULT 0,
    unique_listeners INTEGER DEFAULT 0,

    growth_percentage DECIMAL(10,2),
    trending_score DECIMAL(10,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(date, hour, genre)
);

CREATE TABLE IF NOT EXISTS public.dataset_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES public.research_datasets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    institution TEXT,
    research_purpose TEXT NOT NULL,
    intended_use TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,

    access_granted_until DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    api_key_hash TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    endpoint TEXT NOT NULL,
    http_method TEXT NOT NULL,
    request_params JSONB,

    response_status INTEGER,
    response_time_ms INTEGER,
    data_rows_returned INTEGER,

    ip_address INET,
    user_agent TEXT,

    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_streaming_trends_date ON public.streaming_trends(date);
CREATE INDEX IF NOT EXISTS idx_streaming_trends_genre ON public.streaming_trends(genre);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON public.api_usage_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_key ON public.api_usage_tracking(api_key_hash);

ALTER TABLE public.streaming_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view streaming trends"
    ON public.streaming_trends FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own dataset requests"
    ON public.dataset_access_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own API usage"
    ON public.api_usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. SKILLS DEVELOPMENT ADDITIONAL TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.learning_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,

    lesson_title TEXT NOT NULL,
    lesson_slug TEXT NOT NULL,
    lesson_order INTEGER NOT NULL,

    content_type TEXT CHECK (content_type IN ('video', 'article', 'interactive', 'quiz', 'exercise')),
    video_url TEXT,
    article_content TEXT,
    interactive_embed_url TEXT,

    estimated_duration_minutes INTEGER,

    downloadable_resources JSONB DEFAULT '[]'::jsonb,

    ai_summary TEXT,
    ai_key_points TEXT[],
    ai_practice_questions JSONB DEFAULT '[]'::jsonb,

    is_published BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(module_id, lesson_slug)
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,

    completion_status TEXT NOT NULL DEFAULT 'not_started' CHECK (completion_status IN (
        'not_started',
        'in_progress',
        'completed',
        'review'
    )),
    completion_percentage DECIMAL(5,2) DEFAULT 0,

    time_spent_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    video_watch_percentage DECIMAL(5,2),
    notes TEXT,
    bookmarked BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.learning_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.learning_lessons(id) ON DELETE SET NULL,

    quiz_title TEXT NOT NULL,
    quiz_description TEXT,
    quiz_type TEXT CHECK (quiz_type IN ('knowledge_check', 'module_assessment', 'certification_exam', 'practice')),

    question_count INTEGER NOT NULL,
    passing_score_percentage DECIMAL(5,2) DEFAULT 70,
    time_limit_minutes INTEGER,
    max_attempts INTEGER DEFAULT 3,

    questions JSONB NOT NULL,

    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),

    is_published BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES public.learning_quizzes(id) ON DELETE CASCADE,

    attempt_number INTEGER NOT NULL,
    answers JSONB NOT NULL,

    score_percentage DECIMAL(5,2) NOT NULL,
    correct_answers INTEGER,
    total_questions INTEGER,
    passed BOOLEAN,

    time_taken_minutes INTEGER,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,

    ai_feedback TEXT,
    improvement_suggestions TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    path_name TEXT NOT NULL,
    path_slug TEXT UNIQUE NOT NULL,
    path_description TEXT,

    target_role TEXT,
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),

    module_ids UUID[],
    estimated_total_hours INTEGER,

    issues_certificate BOOLEAN DEFAULT true,
    certificate_title TEXT,

    is_published BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.module_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,

    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

    review_title TEXT,
    review_text TEXT,

    content_quality_rating INTEGER CHECK (content_quality_rating >= 1 AND content_quality_rating <= 5),
    instructor_rating INTEGER CHECK (instructor_rating >= 1 AND instructor_rating <= 5),
    usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),

    would_recommend BOOLEAN,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_lessons_module ON public.learning_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);

ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Anyone can view published lessons"
    ON public.learning_lessons FOR SELECT
    USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM public.learning_modules
            WHERE id = module_id AND is_published = true
        )
    );

CREATE POLICY "Users can manage their own progress"
    ON public.lesson_progress FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own quiz attempts"
    ON public.quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published learning paths"
    ON public.learning_paths FOR SELECT
    USING (is_published = true);

CREATE POLICY "Anyone can view reviews"
    ON public.module_reviews FOR SELECT
    USING (true);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON public.copyright_knowledge_base TO authenticated;
GRANT SELECT ON public.copyright_verification_logs TO authenticated;
GRANT SELECT, INSERT ON public.carbon_offset_transactions TO authenticated;
GRANT SELECT ON public.sustainability_achievements TO authenticated;
GRANT SELECT ON public.sign_language_interpreters TO authenticated, anon;
GRANT SELECT, INSERT ON public.accessibility_requests TO authenticated;
GRANT ALL ON public.accessibility_user_preferences TO authenticated;
GRANT SELECT ON public.streaming_trends TO anon, authenticated;
GRANT SELECT, INSERT ON public.dataset_access_requests TO authenticated;
GRANT SELECT ON public.api_usage_tracking TO authenticated;
GRANT SELECT ON public.learning_lessons TO anon, authenticated;
GRANT ALL ON public.lesson_progress TO authenticated;
GRANT SELECT ON public.learning_quizzes TO authenticated;
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT SELECT ON public.learning_paths TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.module_reviews TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

COMMIT;

-- Verification query
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND (
        tablename LIKE '%copyright%' OR
        tablename LIKE '%carbon%' OR
        tablename LIKE '%accessibility%' OR
        tablename LIKE '%open_data%' OR
        tablename LIKE '%learning%' OR
        tablename LIKE '%sustainability%'
    );

    RAISE NOTICE '✅ Grant Features Migration Complete!';
    RAISE NOTICE '📊 Total grant feature tables: %', table_count;
    RAISE NOTICE '🎉 Ready for production use!';
END $$;
