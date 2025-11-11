-- =====================================================
-- ACCESSIBILITY FEATURES SYSTEM
-- Grant Feature #3: AI-powered accessibility for music content
-- =====================================================

-- Accessibility content for releases
CREATE TABLE IF NOT EXISTS public.accessibility_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Content types
    content_type TEXT NOT NULL CHECK (content_type IN (
        'audio_description',
        'lyric_transcription',
        'lyric_translation',
        'sign_language_video',
        'instrumental_description',
        'mood_description',
        'genre_explanation'
    )),

    -- Language and localization
    language_code TEXT NOT NULL, -- ISO 639-1 code (en, es, fr, etc.)
    language_name TEXT,

    -- Content
    text_content TEXT, -- For transcriptions, translations, descriptions
    audio_url TEXT, -- For audio descriptions
    video_url TEXT, -- For sign language videos
    subtitle_file_url TEXT, -- VTT/SRT format

    -- Generation metadata
    generation_method TEXT CHECK (generation_method IN ('ai_generated', 'human_created', 'ai_assisted', 'verified')),
    ai_model_used TEXT, -- 'openai-whisper', 'google-translate', etc.
    confidence_score DECIMAL(5,2),

    -- Verification and quality
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    quality_rating DECIMAL(3,2), -- 1-5 stars

    -- User feedback
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(release_id, content_type, language_code)
);

-- Sign language interpreter profiles
CREATE TABLE IF NOT EXISTS public.sign_language_interpreters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Interpreter details
    interpreter_name TEXT NOT NULL,
    languages TEXT[] NOT NULL, -- ['ASL', 'BSL', 'Auslan', etc.]
    certifications JSONB DEFAULT '[]'::jsonb,

    -- Specializations
    music_genres TEXT[],
    experience_years INTEGER,

    -- Contact and booking
    email TEXT,
    hourly_rate DECIMAL(10,2),
    available_for_booking BOOLEAN DEFAULT true,

    -- Portfolio
    portfolio_videos JSONB DEFAULT '[]'::jsonb,
    completed_projects INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accessibility requests
CREATE TABLE IF NOT EXISTS public.accessibility_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
    requester_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Request details
    request_type TEXT NOT NULL CHECK (request_type IN (
        'audio_description',
        'lyric_translation',
        'sign_language_video',
        'braille_notation',
        'simplified_version',
        'descriptive_audio'
    )),
    target_language TEXT,

    -- Priority and urgency
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    requested_deadline DATE,

    -- Assignment
    assigned_to UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'in_progress',
        'completed',
        'rejected',
        'cancelled'
    )),

    -- Communication
    request_notes TEXT,
    admin_notes TEXT,

    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accessibility user preferences
CREATE TABLE IF NOT EXISTS public.accessibility_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Visual preferences
    high_contrast_mode BOOLEAN DEFAULT false,
    font_size TEXT CHECK (font_size IN ('small', 'medium', 'large', 'extra_large')),
    reduced_motion BOOLEAN DEFAULT false,

    -- Audio preferences
    audio_descriptions_default BOOLEAN DEFAULT false,
    caption_language TEXT,
    auto_load_captions BOOLEAN DEFAULT false,

    -- Language preferences
    preferred_languages TEXT[], -- Ordered list of preferred languages
    auto_translate_lyrics BOOLEAN DEFAULT false,

    -- Assistive technology
    screen_reader_optimized BOOLEAN DEFAULT false,
    keyboard_navigation_only BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accessibility compliance tracking
CREATE TABLE IF NOT EXISTS public.accessibility_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,

    -- WCAG compliance levels
    wcag_level TEXT CHECK (wcag_level IN ('A', 'AA', 'AAA', 'non_compliant')),
    wcag_version TEXT DEFAULT '2.1',

    -- Compliance checks
    has_alt_text BOOLEAN DEFAULT false,
    has_transcripts BOOLEAN DEFAULT false,
    has_captions BOOLEAN DEFAULT false,
    has_audio_descriptions BOOLEAN DEFAULT false,
    has_keyboard_navigation BOOLEAN DEFAULT false,
    has_screen_reader_support BOOLEAN DEFAULT false,
    color_contrast_passed BOOLEAN DEFAULT false,

    -- Languages covered
    languages_available TEXT[],

    -- Audit information
    last_audit_date TIMESTAMPTZ,
    last_audit_by UUID REFERENCES auth.users(id),
    audit_notes TEXT,

    -- Certification
    certified BOOLEAN DEFAULT false,
    certification_date DATE,
    certification_body TEXT,
    certification_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(release_id)
);

-- Accessibility analytics
CREATE TABLE IF NOT EXISTS public.accessibility_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,

    -- Usage tracking
    transcription_views INTEGER DEFAULT 0,
    translation_views INTEGER DEFAULT 0,
    audio_description_plays INTEGER DEFAULT 0,
    sign_language_views INTEGER DEFAULT 0,

    -- Language breakdown
    language_usage JSONB DEFAULT '{}'::jsonb, -- {en: 150, es: 45, fr: 30}

    -- Feature adoption
    assistive_tech_users INTEGER DEFAULT 0,
    screen_reader_sessions INTEGER DEFAULT 0,

    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(release_id, period_start, period_end)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accessibility_content_release ON public.accessibility_content(release_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_content_type ON public.accessibility_content(content_type);
CREATE INDEX IF NOT EXISTS idx_accessibility_content_language ON public.accessibility_content(language_code);
CREATE INDEX IF NOT EXISTS idx_accessibility_requests_status ON public.accessibility_requests(status);
CREATE INDEX IF NOT EXISTS idx_accessibility_compliance_release ON public.accessibility_compliance(release_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_analytics_release ON public.accessibility_analytics(release_id);

-- Enable RLS
ALTER TABLE public.accessibility_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sign_language_interpreters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accessibility_content
CREATE POLICY "Anyone can view accessibility content"
    ON public.accessibility_content FOR SELECT
    USING (true);

CREATE POLICY "Users can create accessibility content for their releases"
    ON public.accessibility_content FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.releases
            WHERE id = release_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own accessibility content"
    ON public.accessibility_content FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for sign_language_interpreters
CREATE POLICY "Anyone can view interpreter profiles"
    ON public.sign_language_interpreters FOR SELECT
    USING (available_for_booking = true);

CREATE POLICY "Interpreters can manage their own profile"
    ON public.sign_language_interpreters FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for accessibility_requests
CREATE POLICY "Users can view their own requests"
    ON public.accessibility_requests FOR SELECT
    USING (auth.uid() = requester_user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create accessibility requests"
    ON public.accessibility_requests FOR INSERT
    WITH CHECK (auth.uid() = requester_user_id);

CREATE POLICY "Admins can view and manage all requests"
    ON public.accessibility_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin')
        )
    );

-- RLS Policies for accessibility_user_preferences
CREATE POLICY "Users can manage their own preferences"
    ON public.accessibility_user_preferences FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for accessibility_compliance
CREATE POLICY "Anyone can view compliance info"
    ON public.accessibility_compliance FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage compliance"
    ON public.accessibility_compliance FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin')
        )
    );

-- RLS Policies for accessibility_analytics
CREATE POLICY "Release owners can view their analytics"
    ON public.accessibility_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.releases
            WHERE id = release_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all analytics"
    ON public.accessibility_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin')
        )
    );

-- Function to generate AI accessibility content
CREATE OR REPLACE FUNCTION generate_accessibility_content(
    p_release_id UUID,
    p_content_type TEXT,
    p_language_code TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- This function would integrate with AI services (OpenAI, Google Cloud, etc.)
    -- For now, return a placeholder structure
    v_result := jsonb_build_object(
        'success', true,
        'content_type', p_content_type,
        'language', p_language_code,
        'status', 'processing',
        'message', 'AI generation queued'
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update accessibility compliance on content addition
CREATE OR REPLACE FUNCTION update_accessibility_compliance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.accessibility_compliance (
        release_id,
        has_transcripts,
        has_captions,
        has_audio_descriptions,
        languages_available
    )
    VALUES (
        NEW.release_id,
        NEW.content_type = 'lyric_transcription',
        NEW.subtitle_file_url IS NOT NULL,
        NEW.content_type = 'audio_description',
        ARRAY[NEW.language_code]
    )
    ON CONFLICT (release_id) DO UPDATE
    SET
        has_transcripts = accessibility_compliance.has_transcripts OR (NEW.content_type = 'lyric_transcription'),
        has_captions = accessibility_compliance.has_captions OR (NEW.subtitle_file_url IS NOT NULL),
        has_audio_descriptions = accessibility_compliance.has_audio_descriptions OR (NEW.content_type = 'audio_description'),
        languages_available = array_append(
            accessibility_compliance.languages_available,
            NEW.language_code
        ),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_compliance_on_content
AFTER INSERT ON public.accessibility_content
FOR EACH ROW EXECUTE FUNCTION update_accessibility_compliance();

-- Grant permissions
GRANT SELECT ON public.accessibility_content TO authenticated, anon;
GRANT INSERT, UPDATE ON public.accessibility_content TO authenticated;
GRANT SELECT ON public.sign_language_interpreters TO authenticated, anon;
GRANT ALL ON public.sign_language_interpreters TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.accessibility_requests TO authenticated;
GRANT ALL ON public.accessibility_user_preferences TO authenticated;
GRANT SELECT ON public.accessibility_compliance TO authenticated, anon;
GRANT SELECT ON public.accessibility_analytics TO authenticated;

GRANT ALL ON public.accessibility_content TO service_role;
GRANT ALL ON public.sign_language_interpreters TO service_role;
GRANT ALL ON public.accessibility_requests TO service_role;
GRANT ALL ON public.accessibility_user_preferences TO service_role;
GRANT ALL ON public.accessibility_compliance TO service_role;
GRANT ALL ON public.accessibility_analytics TO service_role;
