-- =====================================================
-- AI MUSIC RIGHTS & COPYRIGHT VERIFICATION SYSTEM
-- Grant Feature #1: Automated copyright conflict detection
-- =====================================================

-- Copyright verification results table
CREATE TABLE IF NOT EXISTS public.copyright_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Verification details
    verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'processing', 'clear', 'potential_conflict', 'conflict_detected', 'manual_review_required', 'failed')),
    confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),

    -- AI Analysis results
    melody_similarity_score DECIMAL(5,2),
    lyrics_similarity_score DECIMAL(5,2),
    audio_fingerprint_matches JSONB DEFAULT '[]'::jsonb,
    sample_clearance_status TEXT CHECK (sample_clearance_status IN ('clear', 'requires_clearance', 'pending_verification', 'not_applicable')),

    -- Conflict details
    potential_conflicts JSONB DEFAULT '[]'::jsonb, -- Array of {title, artist, similarity_score, isrc, catalog_source}
    conflict_severity TEXT CHECK (conflict_severity IN ('low', 'medium', 'high', 'critical', null)),

    -- Metadata for verification
    verified_catalogs TEXT[] DEFAULT ARRAY['spotify', 'apple_music', 'youtube', 'soundexchange'], -- Catalogs checked
    audio_file_url TEXT,
    lyrics_text TEXT,
    composition_data JSONB,

    -- Manual review
    requires_manual_review BOOLEAN DEFAULT false,
    manual_review_notes TEXT,
    manual_review_by UUID REFERENCES auth.users(id),
    manual_review_at TIMESTAMPTZ,

    -- Resolution
    resolution_status TEXT CHECK (resolution_status IN ('unresolved', 'cleared', 'license_obtained', 'content_modified', 'rejected', null)),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copyright clearance licenses table
CREATE TABLE IF NOT EXISTS public.copyright_clearances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID REFERENCES public.copyright_verifications(id) ON DELETE CASCADE,
    release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Clearance details
    clearance_type TEXT NOT NULL CHECK (clearance_type IN ('sample', 'cover', 'interpolation', 'composition', 'mechanical')),
    original_work_title TEXT NOT NULL,
    original_work_artist TEXT NOT NULL,
    original_work_isrc TEXT,
    original_work_iswc TEXT,

    -- Rights holders
    rights_holder_name TEXT,
    rights_holder_contact TEXT,
    publisher_name TEXT,
    publisher_contact TEXT,

    -- License information
    license_type TEXT CHECK (license_type IN ('mechanical', 'master', 'sync', 'public_domain', 'creative_commons')),
    license_reference_number TEXT,
    license_start_date DATE,
    license_end_date DATE,
    license_territory TEXT[], -- Countries where license is valid

    -- Financial terms
    license_fee_amount DECIMAL(10,2),
    license_fee_currency TEXT DEFAULT 'GBP',
    royalty_split_percentage DECIMAL(5,2),
    payment_status TEXT CHECK (payment_status IN ('not_required', 'pending', 'paid', 'failed')),

    -- Documentation
    license_document_url TEXT,
    supporting_documents JSONB DEFAULT '[]'::jsonb,

    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'expired')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copyright knowledge base (for AI training and reference)
CREATE TABLE IF NOT EXISTS public.copyright_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Work identification
    work_title TEXT NOT NULL,
    work_artist TEXT NOT NULL,
    work_isrc TEXT,
    work_iswc TEXT,
    work_upc TEXT,

    -- Audio fingerprinting
    audio_fingerprint BYTEA, -- Chromaprint or similar
    audio_fingerprint_hash TEXT,
    melody_pattern JSONB,
    rhythm_pattern JSONB,

    -- Metadata
    release_date DATE,
    duration_ms INTEGER,
    genre TEXT[],
    catalog_source TEXT NOT NULL, -- 'spotify', 'apple_music', 'youtube', etc.
    catalog_id TEXT,

    -- Rights information
    rights_holders JSONB,
    publishers JSONB,
    known_samples JSONB DEFAULT '[]'::jsonb,

    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification audit log
CREATE TABLE IF NOT EXISTS public.copyright_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID REFERENCES public.copyright_verifications(id) ON DELETE CASCADE,

    action TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    details JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_copyright_verifications_release ON public.copyright_verifications(release_id);
CREATE INDEX IF NOT EXISTS idx_copyright_verifications_track ON public.copyright_verifications(track_id);
CREATE INDEX IF NOT EXISTS idx_copyright_verifications_user ON public.copyright_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_copyright_verifications_status ON public.copyright_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_copyright_clearances_verification ON public.copyright_clearances(verification_id);
CREATE INDEX IF NOT EXISTS idx_copyright_clearances_release ON public.copyright_clearances(release_id);
CREATE INDEX IF NOT EXISTS idx_copyright_knowledge_isrc ON public.copyright_knowledge_base(work_isrc);
CREATE INDEX IF NOT EXISTS idx_copyright_knowledge_title ON public.copyright_knowledge_base USING gin(to_tsvector('english', work_title));
CREATE INDEX IF NOT EXISTS idx_copyright_knowledge_artist ON public.copyright_knowledge_base USING gin(to_tsvector('english', work_artist));
CREATE INDEX IF NOT EXISTS idx_copyright_logs_verification ON public.copyright_verification_logs(verification_id);

-- Enable RLS
ALTER TABLE public.copyright_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copyright_clearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copyright_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copyright_verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for copyright_verifications
CREATE POLICY "Users can view their own copyright verifications"
    ON public.copyright_verifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create copyright verifications"
    ON public.copyright_verifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications"
    ON public.copyright_verifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all copyright verifications"
    ON public.copyright_verifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin', 'LabelAdmin')
        )
    );

CREATE POLICY "Admins can update all verifications for manual review"
    ON public.copyright_verifications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin', 'LabelAdmin')
        )
    );

-- RLS Policies for copyright_clearances
CREATE POLICY "Users can view their own clearances"
    ON public.copyright_clearances FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create clearances"
    ON public.copyright_clearances FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all clearances"
    ON public.copyright_clearances FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin', 'LabelAdmin')
        )
    );

CREATE POLICY "Admins can approve clearances"
    ON public.copyright_clearances FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin', 'LabelAdmin')
        )
    );

-- RLS Policies for copyright_knowledge_base (read-only for most users)
CREATE POLICY "Anyone can view copyright knowledge base"
    ON public.copyright_knowledge_base FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify knowledge base"
    ON public.copyright_knowledge_base FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin')
        )
    );

-- RLS Policies for verification logs
CREATE POLICY "Users can view logs for their verifications"
    ON public.copyright_verification_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.copyright_verifications
            WHERE id = verification_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all verification logs"
    ON public.copyright_verification_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin', 'LabelAdmin')
        )
    );

-- Function to automatically log verification changes
CREATE OR REPLACE FUNCTION log_copyright_verification_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO public.copyright_verification_logs (verification_id, action, performed_by, details)
        VALUES (
            NEW.id,
            'verification_updated',
            auth.uid(),
            jsonb_build_object(
                'old_status', OLD.verification_status,
                'new_status', NEW.verification_status,
                'confidence_score', NEW.confidence_score
            )
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.copyright_verification_logs (verification_id, action, performed_by, details)
        VALUES (
            NEW.id,
            'verification_created',
            auth.uid(),
            jsonb_build_object('status', NEW.verification_status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER copyright_verification_change_log
AFTER INSERT OR UPDATE ON public.copyright_verifications
FOR EACH ROW EXECUTE FUNCTION log_copyright_verification_change();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.copyright_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.copyright_clearances TO authenticated;
GRANT SELECT ON public.copyright_knowledge_base TO authenticated;
GRANT SELECT ON public.copyright_verification_logs TO authenticated;

GRANT ALL ON public.copyright_verifications TO service_role;
GRANT ALL ON public.copyright_clearances TO service_role;
GRANT ALL ON public.copyright_knowledge_base TO service_role;
GRANT ALL ON public.copyright_verification_logs TO service_role;
