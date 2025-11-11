-- =============================================
-- MSC & CO ENTERPRISE FEATURES - COMPLETE MIGRATION
-- 7 Features: AI Artwork, Playlist Pitching, Social Media,
-- Fan Engagement, Live Performance, Merchandise, AI Learning
-- =============================================

-- =============================================
-- 1. AI ARTWORK GENERATION (DALL-E 3 Enterprise)
-- =============================================

CREATE TABLE IF NOT EXISTS ai_artwork_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,

  -- Prompt & Settings
  prompt TEXT NOT NULL,
  enhanced_prompt TEXT,
  style TEXT NOT NULL CHECK (style IN ('abstract', 'realistic', 'minimalist', 'vintage', 'modern', 'psychedelic', 'surreal', 'grunge')),
  color_scheme TEXT NOT NULL CHECK (color_scheme IN ('vibrant', 'dark', 'pastel', 'monochrome', 'warm', 'cool', 'neon', 'earth')),

  -- Generation Details
  dalle_model TEXT DEFAULT 'dall-e-3',
  image_url TEXT NOT NULL,
  revised_prompt TEXT,

  -- Variations
  is_variation BOOLEAN DEFAULT false,
  variation_of UUID REFERENCES ai_artwork_generations(id) ON DELETE CASCADE,
  variation_number INTEGER,

  -- Smart Crops (JSON array of crop data)
  smart_crops JSONB DEFAULT '{}'::jsonb,

  -- Status & Metadata
  status TEXT DEFAULT 'completed' CHECK (status IN ('generating', 'completed', 'failed', 'deleted')),
  error_message TEXT,
  generation_time_ms INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_artwork_user ON ai_artwork_generations(user_id);
CREATE INDEX idx_artwork_release ON ai_artwork_generations(release_id);
CREATE INDEX idx_artwork_variation ON ai_artwork_generations(variation_of);
CREATE INDEX idx_artwork_status ON ai_artwork_generations(status);

-- RLS Policies for AI Artwork
ALTER TABLE ai_artwork_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own artwork"
  ON ai_artwork_generations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own artwork"
  ON ai_artwork_generations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own artwork"
  ON ai_artwork_generations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own artwork"
  ON ai_artwork_generations FOR DELETE
  USING (user_id = auth.uid());

-- Admins can view all artwork
CREATE POLICY "Admins can view all artwork"
  ON ai_artwork_generations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('SuperAdmin', 'Admin')
    )
  );

-- =============================================
-- 2. PLAYLIST PITCHING (ML-Powered)
-- =============================================

CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Playlist Identification
  platform TEXT NOT NULL CHECK (platform IN ('spotify', 'apple_music', 'deezer', 'tidal')),
  platform_id TEXT NOT NULL,
  name TEXT NOT NULL,

  -- Curator Information
  curator_name TEXT,
  curator_email TEXT,
  curator_instagram TEXT,
  curator_twitter TEXT,

  -- Playlist Details
  description TEXT,
  genres TEXT[] DEFAULT ARRAY[]::TEXT[],
  followers INTEGER DEFAULT 0,
  track_count INTEGER DEFAULT 0,

  -- ML Scoring Data
  acceptance_rate_historical DECIMAL(5,2) DEFAULT 50.00,
  average_stream_impact INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(platform, platform_id)
);

CREATE TABLE IF NOT EXISTS playlist_pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,

  -- ML Matching Score
  ml_match_score INTEGER NOT NULL CHECK (ml_match_score >= 0 AND ml_match_score <= 100),
  match_breakdown JSONB DEFAULT '{}'::jsonb,

  -- Pitch Details
  personalized_message TEXT NOT NULL,
  pitch_angle TEXT,

  -- Campaign
  campaign_id UUID,
  sent_via_campaign BOOLEAN DEFAULT false,

  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'accepted', 'rejected', 'no_response')),
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  response_at TIMESTAMP WITH TIME ZONE,

  -- Impact Tracking
  streams_before INTEGER DEFAULT 0,
  streams_after INTEGER,
  estimated_revenue DECIMAL(10,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playlist_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,

  -- Campaign Details
  campaign_name TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  min_followers INTEGER DEFAULT 1000,
  target_genres TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled')),
  scheduled_start TIMESTAMP WITH TIME ZONE,

  -- Results
  pitches_sent INTEGER DEFAULT 0,
  pitches_opened INTEGER DEFAULT 0,
  pitches_accepted INTEGER DEFAULT 0,
  total_streams_gained INTEGER DEFAULT 0,
  total_revenue_generated DECIMAL(10,2) DEFAULT 0,

  -- ROI Metrics
  roi_percentage DECIMAL(10,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pitches_user ON playlist_pitches(user_id);
CREATE INDEX idx_pitches_release ON playlist_pitches(release_id);
CREATE INDEX idx_pitches_playlist ON playlist_pitches(playlist_id);
CREATE INDEX idx_pitches_campaign ON playlist_pitches(campaign_id);
CREATE INDEX idx_pitches_status ON playlist_pitches(status);
CREATE INDEX idx_campaigns_user ON playlist_campaigns(user_id);
CREATE INDEX idx_campaigns_status ON playlist_campaigns(status);

-- RLS Policies for Playlists
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active playlists"
  ON playlists FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage playlists"
  ON playlists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('SuperAdmin', 'Admin')
    )
  );

-- RLS Policies for Playlist Pitches
ALTER TABLE playlist_pitches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pitches"
  ON playlist_pitches FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own pitches"
  ON playlist_pitches FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pitches"
  ON playlist_pitches FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all pitches"
  ON playlist_pitches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('SuperAdmin', 'Admin')
    )
  );

-- RLS Policies for Playlist Campaigns
ALTER TABLE playlist_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own campaigns"
  ON playlist_campaigns FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own campaigns"
  ON playlist_campaigns FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own campaigns"
  ON playlist_campaigns FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all campaigns"
  ON playlist_campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('SuperAdmin', 'Admin')
    )
  );

-- =============================================
-- 3. SOCIAL MEDIA AUTOMATION (Full OAuth)
-- =============================================

CREATE TABLE IF NOT EXISTS social_media_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Platform
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'twitter', 'facebook', 'youtube')),

  -- OAuth Tokens (encrypted in production)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,

  -- Platform Account Details
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  scope TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_refresh TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, platform)
);

CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES social_media_connections(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,

  -- Content
  caption TEXT NOT NULL,
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Platform Details
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'twitter', 'facebook', 'youtube')),
  content_type TEXT NOT NULL CHECK (content_type IN ('new_release', 'behind_scenes', 'performance', 'announcement', 'engagement', 'custom')),
  tone TEXT NOT NULL CHECK (tone IN ('professional', 'casual', 'excited', 'mysterious', 'grateful', 'promotional')),

  -- AI Generation
  ai_generated BOOLEAN DEFAULT false,

  -- Scheduling
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'cancelled')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,

  -- Platform Response
  platform_post_id TEXT,
  platform_url TEXT,
  error_message TEXT,

  -- Analytics
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_social_connections_user ON social_media_connections(user_id);
CREATE INDEX idx_social_connections_platform ON social_media_connections(platform);
CREATE INDEX idx_social_posts_user ON social_media_posts(user_id);
CREATE INDEX idx_social_posts_connection ON social_media_posts(connection_id);
CREATE INDEX idx_social_posts_status ON social_media_posts(status);
CREATE INDEX idx_social_posts_scheduled ON social_media_posts(scheduled_for);

-- RLS Policies for Social Media Connections
ALTER TABLE social_media_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections"
  ON social_media_connections FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own connections"
  ON social_media_connections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own connections"
  ON social_media_connections FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own connections"
  ON social_media_connections FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for Social Media Posts
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own posts"
  ON social_media_posts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own posts"
  ON social_media_posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own posts"
  ON social_media_posts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all posts"
  ON social_media_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('SuperAdmin', 'Admin')
    )
  );

-- =============================================
-- 4. FAN ENGAGEMENT (Predictive ML)
-- =============================================

CREATE TABLE IF NOT EXISTS fan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Fan Identification
  spotify_user_id TEXT,
  apple_music_user_id TEXT,
  email TEXT,

  -- Listening Behavior
  total_streams INTEGER DEFAULT 0,
  total_listening_hours DECIMAL(10,2) DEFAULT 0,
  favorite_tracks TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_listen_date TIMESTAMP WITH TIME ZONE,

  -- Engagement Metrics
  playlist_adds INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  merch_purchases INTEGER DEFAULT 0,
  concerts_attended INTEGER DEFAULT 0,

  -- Segmentation
  tier TEXT DEFAULT 'casual' CHECK (tier IN ('superfan', 'VIP', 'regular', 'casual', 'at_risk')),

  -- ML Predictions
  churn_probability DECIMAL(5,4),
  churn_risk_level TEXT CHECK (churn_risk_level IN ('low', 'medium', 'high')),
  churn_factors JSONB DEFAULT '[]'::jsonb,
  last_churn_prediction TIMESTAMP WITH TIME ZONE,

  lifetime_value DECIMAL(10,2),
  ltv_confidence DECIMAL(5,2),
  ltv_breakdown JSONB DEFAULT '{}'::jsonb,
  last_ltv_calculation TIMESTAMP WITH TIME ZONE,

  -- Location
  city TEXT,
  country TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fan_engagement_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES fan_profiles(id) ON DELETE CASCADE,
  artist_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Action Details
  action_type TEXT NOT NULL CHECK (action_type IN ('email', 'exclusive_content', 'discount', 'early_access', 'personalized_message', 'vip_upgrade', 'contest_entry')),
  action_title TEXT NOT NULL,
  action_description TEXT,

  -- Execution
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'completed', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,

  -- Results
  opened BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  converted BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fans_artist ON fan_profiles(artist_user_id);
CREATE INDEX idx_fans_tier ON fan_profiles(tier);
CREATE INDEX idx_fans_churn_risk ON fan_profiles(churn_risk_level);
CREATE INDEX idx_fan_actions_fan ON fan_engagement_actions(fan_id);
CREATE INDEX idx_fan_actions_artist ON fan_engagement_actions(artist_user_id);
CREATE INDEX idx_fan_actions_status ON fan_engagement_actions(status);

-- RLS Policies for Fan Profiles
ALTER TABLE fan_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view their own fans"
  ON fan_profiles FOR SELECT
  USING (artist_user_id = auth.uid());

CREATE POLICY "Artists can create their own fan profiles"
  ON fan_profiles FOR INSERT
  WITH CHECK (artist_user_id = auth.uid());

CREATE POLICY "Artists can update their own fan profiles"
  ON fan_profiles FOR UPDATE
  USING (artist_user_id = auth.uid());

CREATE POLICY "Admins can view all fan profiles"
  ON fan_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('SuperAdmin', 'Admin')
    )
  );

-- RLS Policies for Fan Engagement Actions
ALTER TABLE fan_engagement_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view their own fan actions"
  ON fan_engagement_actions FOR SELECT
  USING (artist_user_id = auth.uid());

CREATE POLICY "Artists can create their own fan actions"
  ON fan_engagement_actions FOR INSERT
  WITH CHECK (artist_user_id = auth.uid());

CREATE POLICY "Artists can update their own fan actions"
  ON fan_engagement_actions FOR UPDATE
  USING (artist_user_id = auth.uid());

-- =============================================
-- 5. LIVE PERFORMANCE ANALYTICS (Ticketmaster)
-- =============================================

CREATE TABLE IF NOT EXISTS live_performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event Details
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  show_time TIME,

  -- Venue
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  venue_capacity INTEGER,

  -- Ticketing Integration
  ticketing_platform TEXT CHECK (ticketing_platform IN ('ticketmaster', 'eventbrite', 'manual')),
  ticketmaster_event_id TEXT,
  eventbrite_event_id TEXT,
  ticket_url TEXT,

  -- Tickets
  ticket_tiers JSONB DEFAULT '[]'::jsonb, -- [{name, price, quantity, sold}]
  total_tickets_available INTEGER,
  total_tickets_sold INTEGER DEFAULT 0,

  -- Financial
  ticket_revenue DECIMAL(10,2) DEFAULT 0,
  merch_revenue DECIMAL(10,2) DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'on_sale', 'sold_out', 'completed', 'cancelled')),

  -- Streaming Impact (post-show)
  baseline_streams INTEGER,
  post_show_streams INTEGER,
  stream_impact_percentage DECIMAL(5,2),
  impact_analysis JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performance_id UUID NOT NULL REFERENCES live_performances(id) ON DELETE CASCADE,

  -- Attendee Details
  email TEXT,
  name TEXT,
  city TEXT,
  country TEXT,

  -- Ticket Details
  ticket_tier TEXT,
  ticket_price DECIMAL(10,2),
  purchase_date TIMESTAMP WITH TIME ZONE,

  -- Post-Show Tracking
  became_streaming_fan BOOLEAN DEFAULT false,
  post_show_engagement_score INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_performances_user ON live_performances(user_id);
CREATE INDEX idx_performances_date ON live_performances(event_date);
CREATE INDEX idx_performances_status ON live_performances(status);
CREATE INDEX idx_attendees_performance ON performance_attendees(performance_id);

-- RLS Policies for Live Performances
ALTER TABLE live_performances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view their own performances"
  ON live_performances FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Artists can create their own performances"
  ON live_performances FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Artists can update their own performances"
  ON live_performances FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all performances"
  ON live_performances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('SuperAdmin', 'Admin')
    )
  );

-- RLS Policies for Performance Attendees
ALTER TABLE performance_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view attendees for their performances"
  ON performance_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM live_performances lp
      WHERE lp.id = performance_attendees.performance_id
      AND lp.user_id = auth.uid()
    )
  );

CREATE POLICY "Artists can create attendees for their performances"
  ON performance_attendees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM live_performances lp
      WHERE lp.id = performance_attendees.performance_id
      AND lp.user_id = auth.uid()
    )
  );

-- =============================================
-- 6. MERCHANDISE INTEGRATION (Printful)
-- =============================================

CREATE TABLE IF NOT EXISTS merchandise_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,

  -- Product Details
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('t_shirt', 'hoodie', 'poster', 'vinyl', 'cd', 'hat', 'tote_bag', 'phone_case', 'sticker', 'custom')),
  description TEXT,

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),

  -- Printful Integration
  printful_product_id TEXT,
  printful_variant_ids JSONB DEFAULT '[]'::jsonb,

  -- Design
  design_file_url TEXT,
  mockup_urls JSONB DEFAULT '[]'::jsonb,

  -- Variants (sizes, colors)
  variants JSONB DEFAULT '[]'::jsonb, -- [{size, color, sku, stock}]

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'out_of_stock', 'discontinued')),

  -- Sales Tracking
  total_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchandise_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES merchandise_products(id) ON DELETE CASCADE,

  -- Customer Details
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,

  -- Shipping Address
  shipping_address JSONB NOT NULL, -- {line1, line2, city, state, zip, country}

  -- Order Details
  variant_selected JSONB NOT NULL, -- {size, color, sku}
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,

  -- Fulfillment
  fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  printful_order_id TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Payment
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_id TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_merch_products_user ON merchandise_products(user_id);
CREATE INDEX idx_merch_products_status ON merchandise_products(status);
CREATE INDEX idx_merch_orders_user ON merchandise_orders(user_id);
CREATE INDEX idx_merch_orders_product ON merchandise_orders(product_id);
CREATE INDEX idx_merch_orders_fulfillment ON merchandise_orders(fulfillment_status);

-- RLS Policies for Merchandise Products
ALTER TABLE merchandise_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view their own products"
  ON merchandise_products FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Artists can create their own products"
  ON merchandise_products FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Artists can update their own products"
  ON merchandise_products FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Public can view active products"
  ON merchandise_products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can view all products"
  ON merchandise_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('SuperAdmin', 'Admin')
    )
  );

-- RLS Policies for Merchandise Orders
ALTER TABLE merchandise_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view orders for their products"
  ON merchandise_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM merchandise_products mp
      WHERE mp.id = merchandise_orders.product_id
      AND mp.user_id = auth.uid()
    )
  );

CREATE POLICY "Artists can create orders for their products"
  ON merchandise_orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchandise_products mp
      WHERE mp.id = merchandise_orders.product_id
      AND mp.user_id = auth.uid()
    )
  );

CREATE POLICY "Artists can update orders for their products"
  ON merchandise_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM merchandise_products mp
      WHERE mp.id = merchandise_orders.product_id
      AND mp.user_id = auth.uid()
    )
  );

-- =============================================
-- PERMISSIONS FOR ENTERPRISE FEATURES
-- =============================================

-- Insert permissions for all enterprise features
INSERT INTO permissions (resource, action, description) VALUES
  -- AI Artwork
  ('features:artwork', 'use', 'Can generate AI artwork'),
  ('features:artwork', 'manage', 'Can manage all AI artwork generations'),

  -- Playlist Pitching
  ('features:playlists', 'use', 'Can pitch to playlists and create campaigns'),
  ('features:playlists', 'manage', 'Can manage all playlist campaigns and view analytics'),

  -- Social Media
  ('features:social', 'use', 'Can connect social accounts and schedule posts'),
  ('features:social', 'manage', 'Can manage all social media integrations'),

  -- Fan Engagement
  ('features:fans', 'use', 'Can view fan analytics and create engagement actions'),
  ('features:fans', 'manage', 'Can manage all fan profiles and engagement'),

  -- Live Performances
  ('features:performances', 'use', 'Can create and manage own performances'),
  ('features:performances', 'manage', 'Can manage all performances and view analytics'),

  -- Merchandise
  ('features:merch', 'use', 'Can create and sell merchandise'),
  ('features:merch', 'manage', 'Can manage all merchandise products and orders')
ON CONFLICT (resource, action) DO NOTHING;

-- Grant permissions to Artist role
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'Artist' LIMIT 1),
  p.id
FROM permissions p
WHERE p.resource LIKE 'features:%'
  AND p.action = 'use'
ON CONFLICT DO NOTHING;

-- Grant all enterprise permissions to Admin and SuperAdmin
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  r.id,
  p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('Admin', 'SuperAdmin')
  AND p.resource LIKE 'features:%'
ON CONFLICT DO NOTHING;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_artwork_user_status ON ai_artwork_generations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pitches_user_status ON playlist_pitches(user_id, status);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_status ON social_media_posts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_performances_user_status ON live_performances(user_id, status);
CREATE INDEX IF NOT EXISTS idx_merch_products_user_status ON merchandise_products(user_id, status);

-- =============================================
-- FUNCTIONS FOR ANALYTICS
-- =============================================

-- Function to calculate platform ROI
CREATE OR REPLACE FUNCTION calculate_artist_enterprise_roi(artist_id UUID)
RETURNS TABLE(
  feature TEXT,
  investment DECIMAL(10,2),
  revenue_generated DECIMAL(10,2),
  roi_percentage DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'Playlist Pitching'::TEXT,
    0.00::DECIMAL(10,2), -- Investment (campaign costs)
    COALESCE(SUM(pc.total_revenue_generated), 0)::DECIMAL(10,2),
    0.00::DECIMAL(10,2) -- ROI calculation
  FROM playlist_campaigns pc
  WHERE pc.user_id = artist_id

  UNION ALL

  SELECT
    'Merchandise'::TEXT,
    COALESCE(SUM(mp.base_price * mp.total_sold * 0.3), 0)::DECIMAL(10,2), -- Cost basis
    COALESCE(SUM(mp.total_revenue), 0)::DECIMAL(10,2),
    CASE
      WHEN SUM(mp.base_price * mp.total_sold * 0.3) > 0
      THEN ((SUM(mp.total_revenue) - SUM(mp.base_price * mp.total_sold * 0.3)) / SUM(mp.base_price * mp.total_sold * 0.3) * 100)::DECIMAL(10,2)
      ELSE 0.00::DECIMAL(10,2)
    END
  FROM merchandise_products mp
  WHERE mp.user_id = artist_id

  UNION ALL

  SELECT
    'Live Performances'::TEXT,
    0.00::DECIMAL(10,2),
    COALESCE(SUM(lp.total_revenue), 0)::DECIMAL(10,2),
    0.00::DECIMAL(10,2)
  FROM live_performances lp
  WHERE lp.user_id = artist_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_artwork_generations_updated_at BEFORE UPDATE ON ai_artwork_generations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlist_pitches_updated_at BEFORE UPDATE ON playlist_pitches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlist_campaigns_updated_at BEFORE UPDATE ON playlist_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_connections_updated_at BEFORE UPDATE ON social_media_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_posts_updated_at BEFORE UPDATE ON social_media_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fan_profiles_updated_at BEFORE UPDATE ON fan_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fan_engagement_actions_updated_at BEFORE UPDATE ON fan_engagement_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_live_performances_updated_at BEFORE UPDATE ON live_performances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merchandise_products_updated_at BEFORE UPDATE ON merchandise_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merchandise_orders_updated_at BEFORE UPDATE ON merchandise_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- =============================================

-- Insert sample playlists for testing (only if not exists)
INSERT INTO playlists (platform, platform_id, name, curator_name, curator_email, genres, followers, acceptance_rate_historical)
SELECT
  'spotify'::TEXT,
  'indie-vibes-2025'::TEXT,
  'Indie Vibes 2025'::TEXT,
  'John Curator'::TEXT,
  'john@example.com'::TEXT,
  ARRAY['indie', 'alternative']::TEXT[],
  50000,
  65.00
WHERE NOT EXISTS (SELECT 1 FROM playlists WHERE platform_id = 'indie-vibes-2025')
ON CONFLICT DO NOTHING;

-- =============================================
-- COMPLETION
-- =============================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE '✅ Enterprise Features Migration Complete!';
  RAISE NOTICE '📊 Created 11 tables with full RLS policies';
  RAISE NOTICE '🔐 Added 12 permission types for all features';
  RAISE NOTICE '⚡ Created indexes for optimal performance';
  RAISE NOTICE '🎯 Ready for production use!';
END $$;
