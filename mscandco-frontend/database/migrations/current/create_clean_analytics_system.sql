-- CLEAN ANALYTICS SYSTEM - NO MOCK DATA
-- Create exact database tables as specified

-- Latest Release Performance
CREATE TABLE IF NOT EXISTS releases (
  id SERIAL PRIMARY KEY,
  artist_id VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  artist VARCHAR(255),
  featuring VARCHAR(255),
  release_date DATE,
  release_type VARCHAR(50), -- Single, EP, Album, LP, Compilation, Remix, Live, Soundtrack, Mixtape
  audio_file_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  is_live BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Performance (the 4+ editable boxes)
CREATE TABLE IF NOT EXISTS platform_stats (
  id SERIAL PRIMARY KEY,
  release_id INTEGER REFERENCES releases(id) ON DELETE CASCADE,
  platform_name VARCHAR(100), -- editable: Spotify, TikTok, Instagram, Apple Music, etc
  value VARCHAR(50), -- editable: 2.4M, 1.8M, 890K, etc  
  percentage VARCHAR(20), -- editable: +12.5%, +8.3%, -2.1%, etc
  position INTEGER DEFAULT 1, -- 1,2,3,4+ for ordering the boxes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recent Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  artist_id VARCHAR(255) NOT NULL,
  title VARCHAR(255), -- bold text: "1M Streams Milestone"
  highlight VARCHAR(255), -- green text: "+25% growth"
  description TEXT, -- grey text: "Your latest single reached 1 million streams across all platforms"
  milestone_date DATE, -- calculates "2 days ago", "1 week ago", etc
  analytics_type VARCHAR(20) DEFAULT 'basic', -- 'basic' or 'advanced'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_is_live ON releases(is_live);
CREATE INDEX IF NOT EXISTS idx_platform_stats_release_id ON platform_stats(release_id);
CREATE INDEX IF NOT EXISTS idx_platform_stats_position ON platform_stats(position);
CREATE INDEX IF NOT EXISTS idx_milestones_artist_id ON milestones(artist_id);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON milestones(analytics_type);
CREATE INDEX IF NOT EXISTS idx_milestones_date ON milestones(milestone_date);

-- Disable RLS for admin access (service role needs full access)
ALTER TABLE releases DISABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;

-- Grant permissions to service role
GRANT ALL ON releases TO service_role;
GRANT ALL ON platform_stats TO service_role;
GRANT ALL ON milestones TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Add comments
COMMENT ON TABLE releases IS 'Latest release performance data managed by admins';
COMMENT ON TABLE platform_stats IS 'Platform-specific performance metrics for releases';
COMMENT ON TABLE milestones IS 'Artist milestones and achievements managed by admins';

COMMENT ON COLUMN releases.artist_id IS 'References user_profiles.id';
COMMENT ON COLUMN releases.is_live IS 'Only one release can be live per artist';
COMMENT ON COLUMN platform_stats.position IS 'Order of platform boxes (1,2,3,4+)';
COMMENT ON COLUMN milestones.analytics_type IS 'Shows in basic, advanced, or both views';
