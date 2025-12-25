-- ============================================================================
-- MSC & CO PLATFORM - COMING SOON FEATURES IMPLEMENTATION
-- ============================================================================
-- This migration adds 7 new major features:
-- 1. Lyrics Analysis AI
-- 2. AI Artwork Generation
-- 3. Automated Playlist Pitching
-- 4. Social Media Automation
-- 5. Fan Engagement Tools
-- 6. Live Performance Analytics
-- 7. Merchandise Integration
-- ============================================================================

-- ============================================================================
-- 1. LYRICS ANALYSIS AI
-- ============================================================================

-- Store lyrics for analysis
CREATE TABLE IF NOT EXISTS lyrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    track_number INTEGER NOT NULL,
    track_name TEXT NOT NULL,
    lyrics_text TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(release_id, track_number)
);

-- Store AI analysis results
CREATE TABLE IF NOT EXISTS lyrics_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lyrics_id UUID REFERENCES lyrics(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- sentiment, themes, readability, language_quality, profanity, copyright_risk
    analysis_data JSONB NOT NULL, -- Store detailed analysis results
    confidence_score DECIMAL(5,2), -- 0-100
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed_by VARCHAR(50) DEFAULT 'openai-gpt4', -- AI model used
    UNIQUE(lyrics_id, analysis_type)
);

-- Store lyrics improvements/suggestions
CREATE TABLE IF NOT EXISTS lyrics_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lyrics_id UUID REFERENCES lyrics(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(50) NOT NULL, -- grammar, rhyme, flow, vocabulary, structure
    original_line TEXT NOT NULL,
    suggested_line TEXT NOT NULL,
    explanation TEXT,
    confidence_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, applied
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. AI ARTWORK GENERATION
-- ============================================================================

-- Store artwork generation requests
CREATE TABLE IF NOT EXISTS artwork_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    style VARCHAR(50), -- abstract, realistic, minimalist, vintage, modern, etc.
    color_scheme VARCHAR(50), -- vibrant, dark, pastel, monochrome, etc.
    ai_model VARCHAR(50) DEFAULT 'dall-e-3', -- dall-e-3, midjourney, stable-diffusion
    generation_params JSONB, -- Additional AI parameters
    status VARCHAR(20) DEFAULT 'pending', -- pending, generating, completed, failed
    generated_image_url TEXT,
    thumbnail_url TEXT,
    cost_credits INTEGER DEFAULT 1, -- Credits used for generation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Store user's artwork preferences
CREATE TABLE IF NOT EXISTS artwork_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
    favorite_styles TEXT[], -- Array of preferred styles
    favorite_colors TEXT[], -- Array of preferred colors
    excluded_elements TEXT[], -- Things user doesn't want
    reference_images TEXT[], -- URLs to reference artworks
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artwork generation credits
CREATE TABLE IF NOT EXISTS artwork_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 0,
    source VARCHAR(50) NOT NULL, -- purchased, subscription, bonus, refund
    amount INTEGER NOT NULL, -- Positive for additions, negative for usage
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. AUTOMATED PLAYLIST PITCHING
-- ============================================================================

-- Store playlist targets
CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL, -- spotify, apple_music, youtube_music, etc.
    playlist_id VARCHAR(255) NOT NULL, -- Platform-specific ID
    playlist_name TEXT NOT NULL,
    curator_name TEXT,
    curator_email TEXT,
    curator_contact_info JSONB, -- Social media, website, etc.
    genre TEXT[],
    follower_count INTEGER,
    submission_type VARCHAR(20) DEFAULT 'email', -- email, form, api
    submission_url TEXT,
    acceptance_rate DECIMAL(5,2), -- Historical success rate
    avg_response_days INTEGER,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(platform, playlist_id)
);

-- Store pitch campaigns
CREATE TABLE IF NOT EXISTS playlist_pitches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    target_genre TEXT[],
    target_follower_min INTEGER,
    target_follower_max INTEGER,
    pitch_message TEXT,
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, completed
    auto_pitch BOOLEAN DEFAULT true, -- Automatically pitch to matching playlists
    max_pitches INTEGER DEFAULT 50,
    pitches_sent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Individual pitch submissions
CREATE TABLE IF NOT EXISTS playlist_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID REFERENCES playlist_pitches(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, no_response
    response_date TIMESTAMP WITH TIME ZONE,
    response_notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE, -- When track was added to playlist
    removed_at TIMESTAMP WITH TIME ZONE, -- If track was removed
    streams_generated INTEGER DEFAULT 0,
    UNIQUE(pitch_id, playlist_id)
);

-- ============================================================================
-- 4. SOCIAL MEDIA AUTOMATION
-- ============================================================================

-- Store connected social media accounts
CREATE TABLE IF NOT EXISTS social_media_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- instagram, tiktok, twitter, facebook, youtube
    account_username TEXT NOT NULL,
    account_id TEXT, -- Platform-specific ID
    access_token TEXT, -- Encrypted access token
    refresh_token TEXT, -- Encrypted refresh token
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_connected BOOLEAN DEFAULT true,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, platform, account_username)
);

-- Store scheduled posts
CREATE TABLE IF NOT EXISTS social_media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
    platforms TEXT[] NOT NULL, -- Which platforms to post to
    post_type VARCHAR(50) NOT NULL, -- image, video, story, reel, carousel
    caption TEXT,
    media_urls TEXT[], -- Images/videos to post
    hashtags TEXT[],
    mention_accounts TEXT[],
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, posting, posted, failed
    posted_at TIMESTAMP WITH TIME ZONE,
    post_urls JSONB, -- Platform -> URL mapping of posted content
    engagement_data JSONB, -- Likes, comments, shares, views
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI-generated content library
CREATE TABLE IF NOT EXISTS social_media_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
    content_type VARCHAR(50) NOT NULL, -- caption, hashtags, bio, story_text
    content_text TEXT NOT NULL,
    platform VARCHAR(50), -- Optimized for specific platform
    ai_generated BOOLEAN DEFAULT true,
    quality_score DECIMAL(5,2), -- AI confidence score
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post templates
CREATE TABLE IF NOT EXISTS post_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- new_release, milestone, behind_scenes, engagement
    platforms TEXT[],
    caption_template TEXT,
    hashtag_groups TEXT[],
    media_requirements JSONB, -- Image/video specs
    schedule_pattern VARCHAR(50), -- daily, weekly, on_release, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. FAN ENGAGEMENT TOOLS
-- ============================================================================

-- Fan interactions database
CREATE TABLE IF NOT EXISTS fan_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    fan_email TEXT,
    fan_name TEXT,
    platform_data JSONB, -- Spotify ID, Apple Music ID, etc.
    location_country VARCHAR(2),
    location_city TEXT,
    first_stream_date DATE,
    total_streams INTEGER DEFAULT 0,
    favorite_tracks TEXT[],
    engagement_score INTEGER DEFAULT 0, -- 0-100 based on activity
    tier VARCHAR(20) DEFAULT 'casual', -- casual, regular, superfan, vip
    tags TEXT[], -- Custom tags by artist
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fan engagement campaigns
CREATE TABLE IF NOT EXISTS fan_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    campaign_name TEXT NOT NULL,
    campaign_type VARCHAR(50) NOT NULL, -- email_blast, contest, exclusive_content, meet_greet, early_access
    target_tiers TEXT[], -- Which fan tiers to target
    target_countries TEXT[],
    min_engagement_score INTEGER,
    message_subject TEXT,
    message_body TEXT,
    reward_description TEXT,
    reward_data JSONB, -- Contest rules, exclusive link, etc.
    scheduled_for TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, active, completed
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fan rewards and exclusives
CREATE TABLE IF NOT EXISTS fan_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    reward_name TEXT NOT NULL,
    reward_type VARCHAR(50) NOT NULL, -- exclusive_track, behind_scenes, video_call, merchandise_discount, concert_ticket
    reward_description TEXT,
    reward_data JSONB, -- Download link, discount code, meeting link, etc.
    required_tier VARCHAR(20) NOT NULL, -- Which tier can access
    required_engagement_score INTEGER,
    max_redemptions INTEGER, -- NULL for unlimited
    redemptions_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fan reward redemptions
CREATE TABLE IF NOT EXISTS fan_reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID REFERENCES fan_rewards(id) ON DELETE CASCADE,
    fan_id UUID REFERENCES fan_profiles(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    redemption_code TEXT UNIQUE,
    was_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(reward_id, fan_id)
);

-- ============================================================================
-- 6. LIVE PERFORMANCE ANALYTICS
-- ============================================================================

-- Store live performance events
CREATE TABLE IF NOT EXISTS live_performances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- concert, festival, club, virtual, livestream
    venue_name TEXT,
    venue_address TEXT,
    venue_city TEXT,
    venue_country VARCHAR(2),
    venue_capacity INTEGER,
    event_date DATE NOT NULL,
    event_time TIME,
    ticket_price_min DECIMAL(10,2),
    ticket_price_max DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'GBP',
    tickets_sold INTEGER,
    total_attendance INTEGER,
    gross_revenue DECIMAL(12,2),
    net_revenue DECIMAL(12,2),
    setlist TEXT[], -- Array of song names performed
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance impact on streaming
CREATE TABLE IF NOT EXISTS performance_impact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_id UUID REFERENCES live_performances(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    streams_7_days_before INTEGER DEFAULT 0,
    streams_7_days_after INTEGER DEFAULT 0,
    streams_increase_pct DECIMAL(8,2),
    new_listeners INTEGER DEFAULT 0,
    new_followers INTEGER DEFAULT 0,
    social_mentions INTEGER DEFAULT 0,
    playlist_adds INTEGER DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tour planning
CREATE TABLE IF NOT EXISTS tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    tour_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    total_shows INTEGER,
    total_capacity INTEGER,
    total_tickets_sold INTEGER,
    total_gross_revenue DECIMAL(12,2),
    total_net_revenue DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'planning', -- planning, announced, ongoing, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link performances to tours
CREATE TABLE IF NOT EXISTS tour_performances (
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    performance_id UUID REFERENCES live_performances(id) ON DELETE CASCADE,
    show_number INTEGER NOT NULL,
    PRIMARY KEY (tour_id, performance_id)
);

-- Performance analytics insights
CREATE TABLE IF NOT EXISTS performance_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- best_cities, peak_seasons, revenue_trends, setlist_performance
    insight_data JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. MERCHANDISE INTEGRATION
-- ============================================================================

-- Merchandise products
CREATE TABLE IF NOT EXISTS merchandise_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_type VARCHAR(50) NOT NULL, -- tshirt, hoodie, vinyl, cd, poster, hat, accessory
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    cost_price DECIMAL(10,2), -- Manufacturing cost
    sizes_available TEXT[], -- S, M, L, XL, etc.
    colors_available TEXT[],
    inventory_count INTEGER DEFAULT 0,
    inventory_sku TEXT UNIQUE,
    product_images TEXT[], -- URLs to product images
    is_active BOOLEAN DEFAULT true,
    is_limited_edition BOOLEAN DEFAULT false,
    limited_quantity INTEGER,
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merchandise orders
CREATE TABLE IF NOT EXISTS merchandise_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    shipping_address JSONB NOT NULL, -- Full address details
    billing_address JSONB,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
    fulfillment_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    tracking_number TEXT,
    tracking_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order line items
CREATE TABLE IF NOT EXISTS merchandise_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES merchandise_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES merchandise_products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL, -- Snapshot in case product is deleted
    size TEXT,
    color TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);

-- Merchandise providers integration
CREATE TABLE IF NOT EXISTS merch_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(50) NOT NULL UNIQUE, -- printful, printify, teespring, shopify
    api_endpoint TEXT,
    is_active BOOLEAN DEFAULT true,
    features JSONB, -- Supported product types, fulfillment options
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artist's provider connections
CREATE TABLE IF NOT EXISTS artist_merch_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES merch_providers(id) ON DELETE CASCADE,
    api_key TEXT, -- Encrypted
    store_id TEXT,
    is_connected BOOLEAN DEFAULT true,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_enabled BOOLEAN DEFAULT true,
    UNIQUE(artist_id, provider_id)
);

-- Merchandise analytics
CREATE TABLE IF NOT EXISTS merchandise_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    product_id UUID REFERENCES merchandise_products(id) ON DELETE CASCADE,
    units_sold INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    profit DECIMAL(12,2) DEFAULT 0,
    refunds INTEGER DEFAULT 0,
    refund_amount DECIMAL(12,2) DEFAULT 0,
    UNIQUE(artist_id, date, product_id)
);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyrics_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyrics_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_impact ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_merch_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Lyrics
CREATE POLICY "Users can view their own lyrics" ON lyrics FOR SELECT USING (
    created_by = auth.uid() OR
    release_id IN (SELECT id FROM releases WHERE artist_id = auth.uid())
);
CREATE POLICY "Users can insert their own lyrics" ON lyrics FOR INSERT WITH CHECK (
    release_id IN (SELECT id FROM releases WHERE artist_id = auth.uid())
);
CREATE POLICY "Users can update their own lyrics" ON lyrics FOR UPDATE USING (
    created_by = auth.uid() OR
    release_id IN (SELECT id FROM releases WHERE artist_id = auth.uid())
);

-- Artwork Generations
CREATE POLICY "Users can view their own artwork" ON artwork_generations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create artwork" ON artwork_generations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their artwork" ON artwork_generations FOR UPDATE USING (user_id = auth.uid());

-- Playlist Pitches
CREATE POLICY "Users can view their own pitches" ON playlist_pitches FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create pitches" ON playlist_pitches FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their pitches" ON playlist_pitches FOR UPDATE USING (user_id = auth.uid());

-- Social Media
CREATE POLICY "Users can view their own social accounts" ON social_media_accounts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their social accounts" ON social_media_accounts FOR ALL USING (user_id = auth.uid());

-- Fan Engagement
CREATE POLICY "Artists can view their fans" ON fan_profiles FOR SELECT USING (artist_id = auth.uid());
CREATE POLICY "Artists can manage their fans" ON fan_profiles FOR ALL USING (artist_id = auth.uid());

-- Live Performances
CREATE POLICY "Artists can view their performances" ON live_performances FOR SELECT USING (artist_id = auth.uid());
CREATE POLICY "Artists can manage their performances" ON live_performances FOR ALL USING (artist_id = auth.uid());

-- Merchandise
CREATE POLICY "Artists can view their merch" ON merchandise_products FOR SELECT USING (artist_id = auth.uid());
CREATE POLICY "Artists can manage their merch" ON merchandise_products FOR ALL USING (artist_id = auth.uid());

-- Allow public viewing of playlists (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view playlists" ON playlists FOR SELECT TO authenticated USING (true);

-- Allow public viewing of merch providers
CREATE POLICY "Authenticated users can view merch providers" ON merch_providers FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Lyrics indexes
CREATE INDEX idx_lyrics_release_id ON lyrics(release_id);
CREATE INDEX idx_lyrics_analysis_lyrics_id ON lyrics_analysis(lyrics_id);
CREATE INDEX idx_lyrics_suggestions_lyrics_id ON lyrics_suggestions(lyrics_id);

-- Artwork indexes
CREATE INDEX idx_artwork_user_id ON artwork_generations(user_id);
CREATE INDEX idx_artwork_release_id ON artwork_generations(release_id);
CREATE INDEX idx_artwork_status ON artwork_generations(status);

-- Playlist indexes
CREATE INDEX idx_playlists_platform ON playlists(platform);
CREATE INDEX idx_playlists_genre ON playlists USING GIN(genre);
CREATE INDEX idx_playlist_pitches_user_id ON playlist_pitches(user_id);
CREATE INDEX idx_playlist_pitches_status ON playlist_pitches(status);
CREATE INDEX idx_playlist_submissions_pitch_id ON playlist_submissions(pitch_id);

-- Social media indexes
CREATE INDEX idx_social_accounts_user_id ON social_media_accounts(user_id);
CREATE INDEX idx_social_posts_user_id ON social_media_posts(user_id);
CREATE INDEX idx_social_posts_scheduled_for ON social_media_posts(scheduled_for);
CREATE INDEX idx_social_posts_status ON social_media_posts(status);

-- Fan engagement indexes
CREATE INDEX idx_fan_profiles_artist_id ON fan_profiles(artist_id);
CREATE INDEX idx_fan_profiles_tier ON fan_profiles(tier);
CREATE INDEX idx_fan_campaigns_user_id ON fan_campaigns(user_id);
CREATE INDEX idx_fan_rewards_artist_id ON fan_rewards(artist_id);

-- Performance indexes
CREATE INDEX idx_live_performances_artist_id ON live_performances(artist_id);
CREATE INDEX idx_live_performances_event_date ON live_performances(event_date);
CREATE INDEX idx_tours_artist_id ON tours(artist_id);

-- Merchandise indexes
CREATE INDEX idx_merch_products_artist_id ON merchandise_products(artist_id);
CREATE INDEX idx_merch_orders_artist_id ON merchandise_orders(artist_id);
CREATE INDEX idx_merch_orders_order_number ON merchandise_orders(order_number);
CREATE INDEX idx_merch_analytics_artist_id ON merchandise_analytics(artist_id);
CREATE INDEX idx_merch_analytics_date ON merchandise_analytics(date);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_lyrics_updated_at BEFORE UPDATE ON lyrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artwork_prefs_updated_at BEFORE UPDATE ON artwork_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_media_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fan_profiles_updated_at BEFORE UPDATE ON fan_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performances_updated_at BEFORE UPDATE ON live_performances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merch_products_updated_at BEFORE UPDATE ON merchandise_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merch_orders_updated_at BEFORE UPDATE ON merchandise_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'MSC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('merchandise_order_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS merchandise_order_seq;

CREATE TRIGGER generate_merch_order_number BEFORE INSERT ON merchandise_orders
    FOR EACH ROW WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- ============================================================================
-- INITIAL DATA / SEED DATA
-- ============================================================================

-- Insert popular public playlists (examples for Spotify)
INSERT INTO playlists (platform, playlist_id, playlist_name, curator_name, genre, follower_count, is_verified) VALUES
    ('spotify', '37i9dQZF1DXcBWIGoYBM5M', 'Today''s Top Hits', 'Spotify', ARRAY['pop', 'hip-hop'], 30000000, true),
    ('spotify', '37i9dQZF1DX0XUsuxWHRQd', 'RapCaviar', 'Spotify', ARRAY['hip-hop', 'rap'], 15000000, true),
    ('spotify', '37i9dQZF1DX4JAvHpjipBk', 'New Music Friday', 'Spotify', ARRAY['pop', 'indie'], 8000000, true),
    ('spotify', '37i9dQZF1DX4dyzvuaRJ0n', 'mint', 'Spotify', ARRAY['indie', 'alternative'], 6000000, true),
    ('spotify', '37i9dQZF1DX1lVhptIYRda', 'Hot Country', 'Spotify', ARRAY['country'], 5000000, true)
ON CONFLICT (platform, playlist_id) DO NOTHING;

-- Insert merchandise providers
INSERT INTO merch_providers (provider_name, features) VALUES
    ('printful', '{"products": ["tshirts", "hoodies", "posters", "accessories"], "fulfillment": "automatic"}'::jsonb),
    ('printify', '{"products": ["tshirts", "hoodies", "mugs", "phone_cases"], "fulfillment": "automatic"}'::jsonb),
    ('shopify', '{"products": ["all"], "fulfillment": "manual", "store_integration": true}'::jsonb),
    ('teespring', '{"products": ["apparel", "accessories"], "fulfillment": "automatic", "custom_store": true}'::jsonb)
ON CONFLICT (provider_name) DO NOTHING;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add migration tracking
INSERT INTO schema_migrations (version, name, executed_at) VALUES
    ('20250111_000002', 'coming_soon_features_complete', NOW())
ON CONFLICT (version) DO NOTHING;

COMMENT ON TABLE lyrics IS 'Stores song lyrics for AI analysis';
COMMENT ON TABLE artwork_generations IS 'AI-generated artwork for releases';
COMMENT ON TABLE playlists IS 'Curated playlists for automated pitching';
COMMENT ON TABLE playlist_pitches IS 'Automated playlist pitching campaigns';
COMMENT ON TABLE social_media_accounts IS 'Connected social media accounts';
COMMENT ON TABLE social_media_posts IS 'Scheduled social media posts';
COMMENT ON TABLE fan_profiles IS 'Artist fan database and engagement';
COMMENT ON TABLE fan_campaigns IS 'Fan engagement campaigns';
COMMENT ON TABLE live_performances IS 'Live performance tracking';
COMMENT ON TABLE tours IS 'Tour management and planning';
COMMENT ON TABLE merchandise_products IS 'Merchandise products and inventory';
COMMENT ON TABLE merchandise_orders IS 'Customer merchandise orders';
