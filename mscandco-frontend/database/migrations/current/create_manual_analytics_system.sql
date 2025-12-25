-- Manual Analytics System Database Schema
-- Create tables for admin-managed analytics data

-- Latest Release Performance table
CREATE TABLE IF NOT EXISTS artist_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  featuring TEXT, -- optional
  release_date DATE NOT NULL,
  release_type TEXT NOT NULL, -- Single, EP, Album, etc
  audio_file_url TEXT, -- file upload path
  cover_image_url TEXT, -- file upload path
  platforms JSONB DEFAULT '[]'::jsonb, -- [{name, value, percentage}]
  is_live BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft', -- draft, live, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recent Milestones table
CREATE TABLE IF NOT EXISTS artist_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  title TEXT NOT NULL, -- bold text
  highlight TEXT NOT NULL, -- green highlighted text
  description TEXT NOT NULL, -- grey text below
  milestone_date DATE NOT NULL, -- for calculating "2 days ago"
  category TEXT DEFAULT 'advanced', -- basic or advanced
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artist Rankings table (manual admin input)
CREATE TABLE IF NOT EXISTS artist_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  country_rank INTEGER,
  global_rank INTEGER,
  primary_genre_rank INTEGER,
  secondary_genre_rank INTEGER,
  tertiary_genre_rank INTEGER,
  momentum_score TEXT, -- e.g. "+245"
  continent_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career Snapshot table (manual admin input)
CREATE TABLE IF NOT EXISTS artist_career_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  career_stage TEXT DEFAULT 'Mid-Level', -- Developing, Mid-Level, Mainstream, Superstar, Legendary
  recent_momentum TEXT DEFAULT 'Growth', -- Decline, Gradual Decline, Steady, Gradual Growth, Explosive Growth
  network_strength TEXT DEFAULT 'Active', -- Inactive, Limited, Moderate, Active, Established
  social_engagement TEXT DEFAULT 'Active', -- Inactive, Limited, Moderate, Active, Influential
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audience Demographics table (manual admin input)
CREATE TABLE IF NOT EXISTS artist_demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  social_footprint TEXT DEFAULT '7.5M',
  primary_market TEXT DEFAULT 'Nigeria',
  secondary_market TEXT DEFAULT 'United States',
  primary_gender TEXT DEFAULT 'Male (58.1%)',
  primary_age TEXT DEFAULT '25-34',
  countries JSONB DEFAULT '[
    {"name": "Nigeria", "percentage": 52.7, "flag": "🇳🇬", "streams": "1,560,000"},
    {"name": "United States", "percentage": 10.1, "flag": "🇺🇸", "streams": "298,000"},
    {"name": "Ghana", "percentage": 8.3, "flag": "🇬🇭", "streams": "245,000"},
    {"name": "United Kingdom", "percentage": 6.8, "flag": "🇬🇧", "streams": "201,000"},
    {"name": "South Africa", "percentage": 5.2, "flag": "🇿🇦", "streams": "154,000"}
  ]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Performance table (manual admin input)
CREATE TABLE IF NOT EXISTS artist_platform_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  platforms JSONB DEFAULT '[
    {
      "name": "Spotify",
      "color": "#1DB954",
      "growth": "+12.5%",
      "rank": "(2,882nd)",
      "metrics": [
        {"label": "Followers", "value": "1.45M", "rank": "(2,882nd)"},
        {"label": "Monthly Listeners", "value": "1.26M", "rank": "(10,944th)"},
        {"label": "Popularity Score", "value": "60/100", "rank": "(9,138th)"},
        {"label": "Playlist Reach", "value": "6.76M", "rank": ""},
        {"label": "Fan Conversion Rate", "value": "115.61%", "rank": ""},
        {"label": "Reach/Followers Ratio", "value": "4.65x", "rank": ""}
      ]
    },
    {
      "name": "Instagram",
      "color": "#E4405F",
      "growth": "+3.8%",
      "rank": "(3,576th)",
      "metrics": [
        {"label": "Followers", "value": "2.54M", "rank": "(3,576th)"},
        {"label": "Posts", "value": "1,234", "rank": ""},
        {"label": "Avg Likes", "value": "115K", "rank": ""},
        {"label": "Engagement Rate", "value": "4.2%", "rank": ""}
      ]
    }
  ]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_artist_releases_artist_id ON artist_releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_releases_is_live ON artist_releases(is_live);
CREATE INDEX IF NOT EXISTS idx_artist_milestones_artist_id ON artist_milestones(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_milestones_category ON artist_milestones(category);
CREATE INDEX IF NOT EXISTS idx_artist_rankings_artist_id ON artist_rankings(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_career_snapshot_artist_id ON artist_career_snapshot(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_demographics_artist_id ON artist_demographics(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_platform_performance_artist_id ON artist_platform_performance(artist_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE artist_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_career_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_platform_performance ENABLE ROW LEVEL SECURITY;

-- Allow artists to view their own data
CREATE POLICY "Artists can view own releases" ON artist_releases FOR SELECT USING (artist_id = auth.uid());
CREATE POLICY "Artists can view own milestones" ON artist_milestones FOR SELECT USING (artist_id = auth.uid());
CREATE POLICY "Artists can view own rankings" ON artist_rankings FOR SELECT USING (artist_id = auth.uid());
CREATE POLICY "Artists can view own career snapshot" ON artist_career_snapshot FOR SELECT USING (artist_id = auth.uid());
CREATE POLICY "Artists can view own demographics" ON artist_demographics FOR SELECT USING (artist_id = auth.uid());
CREATE POLICY "Artists can view own platform performance" ON artist_platform_performance FOR SELECT USING (artist_id = auth.uid());

-- Allow admins to manage all data (implement role checking in application layer)
CREATE POLICY "Admins can manage all releases" ON artist_releases FOR ALL USING (true);
CREATE POLICY "Admins can manage all milestones" ON artist_milestones FOR ALL USING (true);
CREATE POLICY "Admins can manage all rankings" ON artist_rankings FOR ALL USING (true);
CREATE POLICY "Admins can manage all career snapshots" ON artist_career_snapshot FOR ALL USING (true);
CREATE POLICY "Admins can manage all demographics" ON artist_demographics FOR ALL USING (true);
CREATE POLICY "Admins can manage all platform performance" ON artist_platform_performance FOR ALL USING (true);
