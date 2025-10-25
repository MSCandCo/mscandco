-- COMPLETE LABEL-ARTIST AFFILIATION SYSTEM
-- Run this first to create all necessary tables

-- 1. AFFILIATION REQUESTS TABLE
-- Stores requests from label admins to artists
CREATE TABLE IF NOT EXISTS affiliation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Request parties
    label_admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Artist details (for inviting artists who don't exist yet)
    artist_first_name TEXT,
    artist_last_name TEXT,
    artist_name TEXT,
    
    -- Request details
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled', 'accepted', 'declined')),
    message TEXT,
    
    -- Proposed terms
    label_percentage DECIMAL(5,2) DEFAULT 10.00 CHECK (label_percentage >= 0 AND label_percentage <= 50),
    
    -- Response details
    response_message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LABEL-ARTIST RELATIONSHIPS TABLE  
-- Stores approved affiliations between label admins and artists
CREATE TABLE IF NOT EXISTS label_artist_affiliations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relationship parties
    label_admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Terms
    label_percentage DECIMAL(5,2) NOT NULL CHECK (label_percentage >= 0 AND label_percentage <= 50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated')),
    
    -- Permissions
    can_create_releases BOOLEAN DEFAULT TRUE,
    can_view_analytics BOOLEAN DEFAULT TRUE,
    can_manage_earnings BOOLEAN DEFAULT TRUE,
    
    -- Reference to original request
    request_id UUID REFERENCES affiliation_requests(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one active affiliation per label-artist pair
    UNIQUE(label_admin_id, artist_id)
);

-- 3. SHARED EARNINGS TABLE
-- Tracks earnings splits between artists and label admins
CREATE TABLE IF NOT EXISTS shared_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relationship
    affiliation_id UUID REFERENCES label_artist_affiliations(id) ON DELETE CASCADE,
    
    -- Original earning
    original_earning_id UUID REFERENCES earnings_log(id) ON DELETE CASCADE,
    
    -- Split amounts
    artist_amount DECIMAL(10,2) NOT NULL,
    label_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Details
    platform VARCHAR(50),
    earning_type VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'GBP',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_affiliation_requests_label_admin ON affiliation_requests(label_admin_id);
CREATE INDEX IF NOT EXISTS idx_affiliation_requests_artist ON affiliation_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_affiliation_requests_status ON affiliation_requests(status);
CREATE INDEX IF NOT EXISTS idx_affiliation_requests_artist_name ON affiliation_requests(artist_name);

CREATE INDEX IF NOT EXISTS idx_label_affiliations_label_admin ON label_artist_affiliations(label_admin_id);
CREATE INDEX IF NOT EXISTS idx_label_affiliations_artist ON label_artist_affiliations(artist_id);
CREATE INDEX IF NOT EXISTS idx_label_affiliations_status ON label_artist_affiliations(status);

CREATE INDEX IF NOT EXISTS idx_shared_earnings_affiliation ON shared_earnings(affiliation_id);
CREATE INDEX IF NOT EXISTS idx_shared_earnings_original ON shared_earnings(original_earning_id);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE affiliation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_artist_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_earnings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "affiliation_requests_select" ON affiliation_requests;
DROP POLICY IF EXISTS "affiliation_requests_insert" ON affiliation_requests;
DROP POLICY IF EXISTS "affiliation_requests_update" ON affiliation_requests;
DROP POLICY IF EXISTS "affiliations_select" ON label_artist_affiliations;
DROP POLICY IF EXISTS "shared_earnings_select" ON shared_earnings;

-- RLS Policies for affiliation_requests
CREATE POLICY "affiliation_requests_select" ON affiliation_requests
FOR SELECT USING (
    auth.uid() = label_admin_id OR 
    auth.uid() = artist_id OR
    auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('super_admin', 'company_admin'))
);

CREATE POLICY "affiliation_requests_insert" ON affiliation_requests
FOR INSERT WITH CHECK (
    auth.uid() = label_admin_id OR
    auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('super_admin', 'company_admin'))
);

CREATE POLICY "affiliation_requests_update" ON affiliation_requests
FOR UPDATE USING (
    auth.uid() = artist_id OR 
    auth.uid() = label_admin_id OR
    auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('super_admin', 'company_admin'))
);

-- RLS Policies for label_artist_affiliations
CREATE POLICY "affiliations_select" ON label_artist_affiliations
FOR SELECT USING (
    auth.uid() = label_admin_id OR 
    auth.uid() = artist_id OR
    auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('super_admin', 'company_admin'))
);

-- RLS Policies for shared_earnings
CREATE POLICY "shared_earnings_select" ON shared_earnings
FOR SELECT USING (
    auth.uid() IN (
        SELECT artist_id FROM label_artist_affiliations WHERE id = affiliation_id
        UNION
        SELECT label_admin_id FROM label_artist_affiliations WHERE id = affiliation_id
    ) OR
    auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('super_admin', 'company_admin'))
);

-- 6. TRIGGERS FOR AUTOMATIC EARNINGS SPLITTING
CREATE OR REPLACE FUNCTION split_earnings_for_affiliations()
RETURNS TRIGGER AS $$
BEGIN
    -- When new earnings are added, automatically split them for affiliated artists
    IF NEW.amount > 0 THEN
        INSERT INTO shared_earnings (
            affiliation_id,
            original_earning_id, 
            artist_amount,
            label_amount,
            total_amount,
            platform,
            earning_type,
            currency
        )
        SELECT 
            aff.id,
            NEW.id,
            NEW.amount * (100 - aff.label_percentage) / 100,
            NEW.amount * aff.label_percentage / 100,
            NEW.amount,
            NEW.platform,
            NEW.earning_type,
            NEW.currency
        FROM label_artist_affiliations aff
        WHERE aff.artist_id = NEW.user_id 
        AND aff.status = 'active'
        AND aff.can_manage_earnings = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on earnings_log table
DROP TRIGGER IF EXISTS trigger_split_earnings ON earnings_log;
CREATE TRIGGER trigger_split_earnings
    AFTER INSERT ON earnings_log
    FOR EACH ROW
    EXECUTE FUNCTION split_earnings_for_affiliations();

-- 7. COMMENTS
COMMENT ON TABLE affiliation_requests IS 'Stores invitation requests from label admins to artists';
COMMENT ON TABLE label_artist_affiliations IS 'Stores active partnerships between label admins and artists';
COMMENT ON TABLE shared_earnings IS 'Automatically tracks earnings splits between artists and labels';

COMMENT ON COLUMN affiliation_requests.artist_id IS 'UUID of artist if they exist in system, NULL if inviting new artist';
COMMENT ON COLUMN affiliation_requests.artist_name IS 'Artist stage name for invitation';
COMMENT ON COLUMN affiliation_requests.artist_first_name IS 'Artist first name for invitation';
COMMENT ON COLUMN affiliation_requests.artist_last_name IS 'Artist last name for invitation';

