-- Add Chartmetric integration fields to user_profiles

-- Add Chartmetric linking fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_artist_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spotify_artist_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS apple_music_artist_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS youtube_artist_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_linked_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_chartmetric_sync TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_data JSONB DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_chartmetric_id ON user_profiles(chartmetric_artist_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_spotify_id ON user_profiles(spotify_artist_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_chartmetric_sync ON user_profiles(last_chartmetric_sync);

-- Create table for track-level Chartmetric data
CREATE TABLE IF NOT EXISTS track_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    
    -- Chartmetric track data
    chartmetric_track_id TEXT,
    spotify_track_id TEXT,
    apple_music_track_id TEXT,
    
    -- Analytics data
    streams INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    skip_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Playlist data
    total_playlists INTEGER DEFAULT 0,
    editorial_playlists INTEGER DEFAULT 0,
    playlist_followers INTEGER DEFAULT 0,
    
    -- Geographic data
    top_countries JSONB DEFAULT '[]',
    geographic_diversity_score INTEGER DEFAULT 0,
    
    -- Chart data
    chart_positions JSONB DEFAULT '{}',
    peak_position INTEGER,
    
    -- Sync metadata
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    data_freshness TEXT DEFAULT 'real-time',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, asset_id)
);

-- Enable RLS on track_analytics
ALTER TABLE track_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own track analytics
CREATE POLICY "users_own_track_analytics" ON track_analytics
    FOR ALL
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin')
        )
    );

-- Grant permissions
GRANT ALL ON track_analytics TO postgres, service_role;

-- Update existing artist profiles with sample Chartmetric linking
UPDATE user_profiles 
SET 
    chartmetric_verified = TRUE,
    chartmetric_linked_at = NOW(),
    chartmetric_data = '{"social_footprint": {"instagram": {"followers": 12500, "engagement_rate": 3.2}, "tiktok": {"followers": 8900, "likes": 145000}, "youtube": {"subscribers": 15600, "views": 890000}, "twitter": {"followers": 5400, "engagement": 2.1}}, "streaming_stats": {"spotify": {"followers": 18900, "monthly_listeners": 45600}, "apple_music": {"followers": 12300}, "youtube_music": {"subscribers": 8700}}}'::jsonb
WHERE id IN (
    SELECT ura.user_id 
    FROM user_role_assignments ura 
    WHERE ura.role_name = 'artist'
) AND chartmetric_artist_id IS NULL;

-- Set sample Chartmetric IDs for testing
UPDATE user_profiles 
SET chartmetric_artist_id = 'cm_' || SUBSTR(id::text, 1, 8)
WHERE chartmetric_artist_id IS NULL 
AND id IN (
    SELECT ura.user_id 
    FROM user_role_assignments ura 
    WHERE ura.role_name = 'artist'
);
