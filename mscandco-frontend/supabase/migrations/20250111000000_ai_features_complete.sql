-- ============================================
-- AI FEATURES COMPLETE MIGRATION
-- Features: Lyrics Analysis, AI Artwork Generation,
-- Playlist Pitching, Social Media Automation, Fan Engagement
-- ============================================

-- ============================================
-- 1. LYRICS ANALYSIS AI
-- ============================================

CREATE TABLE IF NOT EXISTS lyrics_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,

  -- Input
  lyrics_text TEXT NOT NULL,
  language_code TEXT,

  -- AI Analysis Results
  theme TEXT, -- Main theme/topic
  mood TEXT, -- Overall mood/emotion
  emotions JSONB, -- Array of detected emotions with scores
  profanity_detected BOOLEAN DEFAULT false,
  profanity_words JSONB, -- Array of flagged words
  rhyme_scheme TEXT, -- Detected rhyme pattern
  storytelling_structure TEXT, -- Verse-chorus structure analysis
  readability_score INTEGER, -- 1-100 score

  -- AI Suggestions
  suggestions JSONB, -- Array of improvement suggestions
  alternative_lines JSONB, -- AI-suggested alternative lyrics

  -- Metadata
  ai_model TEXT DEFAULT 'gpt-4-turbo',
  processing_time_ms INTEGER,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lyrics_analysis_user ON lyrics_analysis(user_id);
CREATE INDEX idx_lyrics_analysis_release ON lyrics_analysis(release_id);
CREATE INDEX idx_lyrics_analysis_track ON lyrics_analysis(track_id);
CREATE INDEX idx_lyrics_analysis_created ON lyrics_analysis(created_at DESC);

-- ============================================
-- 2. AI ARTWORK GENERATION
-- ============================================

CREATE TABLE IF NOT EXISTS ai_artwork_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,

  -- Generation Prompt
  prompt TEXT NOT NULL,
  genre TEXT,
  mood TEXT,
  style TEXT, -- realistic, abstract, vintage, modern, etc.
  color_scheme TEXT, -- warm, cool, vibrant, monochrome, etc.

  -- AI Model Details
  ai_model TEXT DEFAULT 'dall-e-3',
  model_version TEXT,

  -- Generated Images
  images JSONB NOT NULL, -- Array of {url, revised_prompt, size}
  selected_image_url TEXT, -- Which one artist chose

  -- Usage
  used_for_release BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,

  -- Cost Tracking
  generation_cost DECIMAL(10,4), -- In credits or dollars

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artwork_gen_user ON ai_artwork_generations(user_id);
CREATE INDEX idx_artwork_gen_release ON ai_artwork_generations(release_id);
CREATE INDEX idx_artwork_gen_created ON ai_artwork_generations(created_at DESC);

-- ============================================
-- 3. AUTOMATED PLAYLIST PITCHING
-- ============================================

CREATE TABLE IF NOT EXISTS playlist_pitch_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,

  -- Campaign Info
  campaign_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),

  -- Target Playlists
  target_genre TEXT,
  target_mood TEXT,
  min_followers INTEGER DEFAULT 1000,
  max_followers INTEGER,
  target_platforms JSONB DEFAULT '["spotify"]', -- spotify, apple_music, youtube

  -- Pitch Content (AI Generated)
  pitch_template TEXT, -- AI-generated pitch email template
  pitch_subject TEXT,

  -- Results
  playlists_found INTEGER DEFAULT 0,
  pitches_sent INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  placements_confirmed INTEGER DEFAULT 0,

  -- Metadata
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playlist_pitch_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES playlist_pitch_campaigns(id) ON DELETE CASCADE,

  -- Playlist Info
  playlist_name TEXT NOT NULL,
  playlist_url TEXT NOT NULL,
  curator_name TEXT,
  curator_email TEXT,
  curator_contact TEXT, -- SubmitHub, Instagram, etc.

  platform TEXT DEFAULT 'spotify' CHECK (platform IN ('spotify', 'apple_music', 'youtube', 'other')),
  follower_count INTEGER,
  genre TEXT,

  -- Pitch Status
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'pitched', 'responded', 'accepted', 'rejected', 'no_response')),
  pitched_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_message TEXT,

  -- Placement Details
  placement_confirmed BOOLEAN DEFAULT false,
  placement_date TIMESTAMPTZ,
  playlist_position INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pitch_campaign_user ON playlist_pitch_campaigns(user_id);
CREATE INDEX idx_pitch_campaign_status ON playlist_pitch_campaigns(status);
CREATE INDEX idx_pitch_targets_campaign ON playlist_pitch_targets(campaign_id);
CREATE INDEX idx_pitch_targets_status ON playlist_pitch_targets(status);

-- ============================================
-- 4. SOCIAL MEDIA AUTOMATION
-- ============================================

CREATE TABLE IF NOT EXISTS social_media_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Platform
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'twitter', 'facebook', 'tiktok', 'threads')),

  -- Account Info
  platform_user_id TEXT,
  username TEXT NOT NULL,
  display_name TEXT,
  profile_url TEXT,

  -- Auth Tokens (ENCRYPTED)
  access_token TEXT, -- Should be encrypted
  refresh_token TEXT, -- Should be encrypted
  token_expires_at TIMESTAMPTZ,

  -- Status
  is_connected BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  last_post_at TIMESTAMPTZ,

  -- Permissions
  can_post BOOLEAN DEFAULT true,
  can_read BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, platform, username)
);

CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES social_media_accounts(id) ON DELETE SET NULL,

  -- Trigger
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('new_release', 'milestone', 'earnings_update', 'manual', 'scheduled')),
  trigger_data JSONB, -- Details about what triggered this post

  -- Post Content
  caption TEXT NOT NULL,
  hashtags TEXT[], -- Array of hashtags
  media_urls TEXT[], -- Images/videos to post
  link_url TEXT, -- Link to release, profile, etc.

  -- AI Generation
  ai_generated BOOLEAN DEFAULT true,
  ai_prompt TEXT,

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  post_immediately BOOLEAN DEFAULT false,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posting', 'posted', 'failed', 'cancelled')),
  posted_at TIMESTAMPTZ,

  -- Platform Response
  platform_post_id TEXT, -- ID from Instagram, Twitter, etc.
  platform_post_url TEXT,
  error_message TEXT,

  -- Engagement (Updated periodically)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  last_engagement_sync TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_accounts_user ON social_media_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_media_accounts(platform);
CREATE INDEX idx_social_posts_user ON social_media_posts(user_id);
CREATE INDEX idx_social_posts_status ON social_media_posts(status);
CREATE INDEX idx_social_posts_scheduled ON social_media_posts(scheduled_for) WHERE status = 'scheduled';

-- ============================================
-- 5. FAN ENGAGEMENT TOOLS
-- ============================================

CREATE TABLE IF NOT EXISTS fan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Fan Identity (Anonymous unless they sign up)
  email TEXT UNIQUE,
  name TEXT,
  location_country TEXT,
  location_city TEXT,

  -- Discovery
  discovered_via TEXT, -- spotify, apple_music, instagram, tiktok, etc.
  first_listen_date TIMESTAMPTZ,

  -- Engagement
  total_streams INTEGER DEFAULT 0,
  favorite_tracks JSONB, -- Array of track IDs
  playlists_added_to INTEGER DEFAULT 0,

  -- Communication Preferences
  email_opt_in BOOLEAN DEFAULT false,
  marketing_opt_in BOOLEAN DEFAULT false,
  last_email_sent TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artist_fan_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  fan_id UUID NOT NULL REFERENCES fan_profiles(id) ON DELETE CASCADE,

  -- Connection Stats
  total_streams INTEGER DEFAULT 0,
  total_time_listened_seconds INTEGER DEFAULT 0,
  favorite_track_id UUID REFERENCES tracks(id),

  -- Engagement
  engagement_score INTEGER DEFAULT 0, -- 0-100 calculated score
  last_stream_at TIMESTAMPTZ,
  first_stream_at TIMESTAMPTZ,

  -- Fan Type
  fan_tier TEXT DEFAULT 'casual' CHECK (fan_tier IN ('casual', 'regular', 'superfan', 'top_fan')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(artist_id, fan_id)
);

CREATE TABLE IF NOT EXISTS fan_engagement_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Campaign Details
  campaign_name TEXT NOT NULL,
  campaign_type TEXT CHECK (campaign_type IN ('pre_save', 'exclusive_content', 'fan_club', 'contest', 'newsletter')),

  -- Targeting
  target_fan_tier TEXT[], -- ['superfan', 'top_fan']
  target_location_countries TEXT[],
  min_streams INTEGER,

  -- Content
  message_subject TEXT,
  message_body TEXT,
  call_to_action TEXT,
  cta_link TEXT,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),

  -- Results
  fans_targeted INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fan_profiles_email ON fan_profiles(email) WHERE email IS NOT NULL;
CREATE INDEX idx_fan_profiles_country ON fan_profiles(location_country);
CREATE INDEX idx_artist_fans_artist ON artist_fan_connections(artist_id);
CREATE INDEX idx_artist_fans_fan ON artist_fan_connections(fan_id);
CREATE INDEX idx_artist_fans_tier ON artist_fan_connections(fan_tier);
CREATE INDEX idx_engagement_campaigns_user ON fan_engagement_campaigns(user_id);
CREATE INDEX idx_engagement_campaigns_status ON fan_engagement_campaigns(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE lyrics_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_artwork_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_pitch_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_pitch_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_fan_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_engagement_campaigns ENABLE ROW LEVEL SECURITY;

-- Lyrics Analysis Policies
CREATE POLICY "Users can view their own lyrics analysis" ON lyrics_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create lyrics analysis" ON lyrics_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all lyrics analysis" ON lyrics_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- AI Artwork Policies
CREATE POLICY "Users can view their own artwork" ON ai_artwork_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create artwork" ON ai_artwork_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artwork" ON ai_artwork_generations
  FOR UPDATE USING (auth.uid() = user_id);

-- Playlist Pitching Policies
CREATE POLICY "Users can view their own campaigns" ON playlist_pitch_campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create campaigns" ON playlist_pitch_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" ON playlist_pitch_campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view targets for their campaigns" ON playlist_pitch_targets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlist_pitch_campaigns
      WHERE playlist_pitch_campaigns.id = playlist_pitch_targets.campaign_id
      AND playlist_pitch_campaigns.user_id = auth.uid()
    )
  );

-- Social Media Policies
CREATE POLICY "Users can view their own social accounts" ON social_media_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social accounts" ON social_media_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own posts" ON social_media_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own posts" ON social_media_posts
  FOR ALL USING (auth.uid() = user_id);

-- Fan Engagement Policies
CREATE POLICY "Artists can view their fan connections" ON artist_fan_connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.id = artist_fan_connections.artist_id
    )
  );

CREATE POLICY "Users can view their own campaigns" ON fan_engagement_campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own campaigns" ON fan_engagement_campaigns
  FOR ALL USING (auth.uid() = user_id);

-- Fan profiles are managed by system, not directly by users
CREATE POLICY "System manages fan profiles" ON fan_profiles
  FOR ALL USING (false); -- Only accessible via service role

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lyrics_analysis_timestamp
  BEFORE UPDATE ON lyrics_analysis
  FOR EACH ROW EXECUTE FUNCTION update_ai_features_updated_at();

CREATE TRIGGER update_artwork_generations_timestamp
  BEFORE UPDATE ON ai_artwork_generations
  FOR EACH ROW EXECUTE FUNCTION update_ai_features_updated_at();

CREATE TRIGGER update_pitch_campaigns_timestamp
  BEFORE UPDATE ON playlist_pitch_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_ai_features_updated_at();

CREATE TRIGGER update_pitch_targets_timestamp
  BEFORE UPDATE ON playlist_pitch_targets
  FOR EACH ROW EXECUTE FUNCTION update_ai_features_updated_at();

CREATE TRIGGER update_social_accounts_timestamp
  BEFORE UPDATE ON social_media_accounts
  FOR EACH ROW EXECUTE FUNCTION update_ai_features_updated_at();

CREATE TRIGGER update_social_posts_timestamp
  BEFORE UPDATE ON social_media_posts
  FOR EACH ROW EXECUTE FUNCTION update_ai_features_updated_at();

CREATE TRIGGER update_fan_profiles_timestamp
  BEFORE UPDATE ON fan_profiles
  FOR EACH ROW EXECUTE FUNCTION update_ai_features_updated_at();

CREATE TRIGGER update_artist_fans_timestamp
  BEFORE UPDATE ON artist_fan_connections
  FOR EACH ROW EXECUTE FUNCTION update_ai_features_updated_at();

CREATE TRIGGER update_engagement_campaigns_timestamp
  BEFORE UPDATE ON fan_engagement_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_ai_features_updated_at();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ AI Features Complete Migration Applied Successfully!';
  RAISE NOTICE '📊 Created 9 new tables:';
  RAISE NOTICE '   - lyrics_analysis';
  RAISE NOTICE '   - ai_artwork_generations';
  RAISE NOTICE '   - playlist_pitch_campaigns';
  RAISE NOTICE '   - playlist_pitch_targets';
  RAISE NOTICE '   - social_media_accounts';
  RAISE NOTICE '   - social_media_posts';
  RAISE NOTICE '   - fan_profiles';
  RAISE NOTICE '   - artist_fan_connections';
  RAISE NOTICE '   - fan_engagement_campaigns';
  RAISE NOTICE '🔒 All tables have RLS enabled';
  RAISE NOTICE '🎯 Ready for AI feature implementation!';
END $$;
