-- ============================================
-- SOCIAL/COMMUNITY FEATURES DATABASE SCHEMA
-- ============================================
-- Single source of truth for social features
-- Persistent, accurate data storage
-- Full database connectivity for community page
-- ============================================

-- Social Platform Connections Table
-- Stores OAuth connections to social platforms
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'twitter', 'youtube', 'facebook')),
  platform_user_id TEXT,
  username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Social Posts Table
-- Stores scheduled and published social media posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed')),
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  post_immediately BOOLEAN DEFAULT false,
  platform_post_ids JSONB DEFAULT '{}'::JSONB,
  engagement_stats JSONB DEFAULT '{}'::JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Followers Table
-- Stores follower/following relationships between platform users
CREATE TABLE IF NOT EXISTS user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'pending')),
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Community Posts Table
-- Internal platform community posts (like a social feed)
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'none')),
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Post Likes Table
CREATE TABLE IF NOT EXISTS community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Community Post Comments Table
CREATE TABLE IF NOT EXISTS community_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES community_post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Social Connections Indexes
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_connections(platform);
CREATE INDEX IF NOT EXISTS idx_social_connections_active ON social_connections(user_id, is_active);

-- Social Posts Indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_posts_release_id ON social_posts(release_id);

-- User Followers Indexes
CREATE INDEX IF NOT EXISTS idx_user_followers_follower ON user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following ON user_followers(following_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_status ON user_followers(status);

-- Community Posts Indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_visibility ON community_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_community_posts_release_id ON community_posts(release_id);

-- Community Post Likes Indexes
CREATE INDEX IF NOT EXISTS idx_community_post_likes_post_id ON community_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user_id ON community_post_likes(user_id);

-- Community Post Comments Indexes
CREATE INDEX IF NOT EXISTS idx_community_post_comments_post_id ON community_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_user_id ON community_post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_parent ON community_post_comments(parent_comment_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;

-- Social Connections Policies
DROP POLICY IF EXISTS "Users can view their own social connections" ON social_connections;
CREATE POLICY "Users can view their own social connections"
  ON social_connections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own social connections" ON social_connections;
CREATE POLICY "Users can insert their own social connections"
  ON social_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own social connections" ON social_connections;
CREATE POLICY "Users can update their own social connections"
  ON social_connections FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own social connections" ON social_connections;
CREATE POLICY "Users can delete their own social connections"
  ON social_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Social Posts Policies
DROP POLICY IF EXISTS "Users can view their own social posts" ON social_posts;
CREATE POLICY "Users can view their own social posts"
  ON social_posts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own social posts" ON social_posts;
CREATE POLICY "Users can insert their own social posts"
  ON social_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own social posts" ON social_posts;
CREATE POLICY "Users can update their own social posts"
  ON social_posts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own social posts" ON social_posts;
CREATE POLICY "Users can delete their own social posts"
  ON social_posts FOR DELETE
  USING (auth.uid() = user_id);

-- User Followers Policies
DROP POLICY IF EXISTS "Users can view their followers and following" ON user_followers;
CREATE POLICY "Users can view their followers and following"
  ON user_followers FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

DROP POLICY IF EXISTS "Users can follow others" ON user_followers;
CREATE POLICY "Users can follow others"
  ON user_followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow others" ON user_followers;
CREATE POLICY "Users can unfollow others"
  ON user_followers FOR DELETE
  USING (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can update their follow status" ON user_followers;
CREATE POLICY "Users can update their follow status"
  ON user_followers FOR UPDATE
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Community Posts Policies
DROP POLICY IF EXISTS "Users can view public community posts" ON community_posts;
CREATE POLICY "Users can view public community posts"
  ON community_posts FOR SELECT
  USING (
    visibility = 'public' OR
    auth.uid() = user_id OR
    (visibility = 'followers' AND EXISTS (
      SELECT 1 FROM user_followers
      WHERE following_id = community_posts.user_id
      AND follower_id = auth.uid()
      AND status = 'active'
    ))
  );

DROP POLICY IF EXISTS "Users can insert their own community posts" ON community_posts;
CREATE POLICY "Users can insert their own community posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own community posts" ON community_posts;
CREATE POLICY "Users can update their own community posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own community posts" ON community_posts;
CREATE POLICY "Users can delete their own community posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Community Post Likes Policies
DROP POLICY IF EXISTS "Users can view all post likes" ON community_post_likes;
CREATE POLICY "Users can view all post likes"
  ON community_post_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON community_post_likes;
CREATE POLICY "Users can like posts"
  ON community_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON community_post_likes;
CREATE POLICY "Users can unlike posts"
  ON community_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Community Post Comments Policies
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON community_post_comments;
CREATE POLICY "Users can view comments on visible posts"
  ON community_post_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = community_post_comments.post_id
      AND (
        visibility = 'public' OR
        user_id = auth.uid() OR
        (visibility = 'followers' AND EXISTS (
          SELECT 1 FROM user_followers
          WHERE following_id = community_posts.user_id
          AND follower_id = auth.uid()
          AND status = 'active'
        ))
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert comments on visible posts" ON community_post_comments;
CREATE POLICY "Users can insert comments on visible posts"
  ON community_post_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = community_post_comments.post_id
      AND (
        visibility = 'public' OR
        user_id = auth.uid() OR
        (visibility = 'followers' AND EXISTS (
          SELECT 1 FROM user_followers
          WHERE following_id = community_posts.user_id
          AND follower_id = auth.uid()
          AND status = 'active'
        ))
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own comments" ON community_post_comments;
CREATE POLICY "Users can update their own comments"
  ON community_post_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON community_post_comments;
CREATE POLICY "Users can delete their own comments"
  ON community_post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_social_connections_updated_at ON social_connections;
CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON social_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_posts_updated_at ON social_posts;
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_followers_updated_at ON user_followers;
CREATE TRIGGER update_user_followers_updated_at
  BEFORE UPDATE ON user_followers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_post_comments_updated_at ON community_post_comments;
CREATE TRIGGER update_community_post_comments_updated_at
  BEFORE UPDATE ON community_post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR COUNTER UPDATES
-- ============================================

-- Function to update post likes count
CREATE OR REPLACE FUNCTION update_community_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update post comments count
CREATE OR REPLACE FUNCTION update_community_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply counter triggers
DROP TRIGGER IF EXISTS update_likes_count_trigger ON community_post_likes;
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON community_post_likes
  FOR EACH ROW EXECUTE FUNCTION update_community_post_likes_count();

DROP TRIGGER IF EXISTS update_comments_count_trigger ON community_post_comments;
CREATE TRIGGER update_comments_count_trigger
  AFTER INSERT OR DELETE ON community_post_comments
  FOR EACH ROW EXECUTE FUNCTION update_community_post_comments_count();

-- ============================================
-- HELPER VIEWS FOR QUERIES
-- ============================================

-- View for user follower counts
CREATE OR REPLACE VIEW user_follower_stats AS
SELECT
  u.id AS user_id,
  COALESCE(followers.count, 0) AS followers_count,
  COALESCE(following.count, 0) AS following_count
FROM auth.users u
LEFT JOIN (
  SELECT following_id, COUNT(*) AS count
  FROM user_followers
  WHERE status = 'active'
  GROUP BY following_id
) followers ON u.id = followers.following_id
LEFT JOIN (
  SELECT follower_id, COUNT(*) AS count
  FROM user_followers
  WHERE status = 'active'
  GROUP BY follower_id
) following ON u.id = following.follower_id;

-- View for enriched community posts
CREATE OR REPLACE VIEW community_posts_enriched AS
SELECT
  cp.*,
  up.artist_name,
  up.display_name,
  up.profile_picture_url,
  up.role,
  r.title AS release_title,
  r.artwork_url AS release_artwork_url
FROM community_posts cp
LEFT JOIN user_profiles up ON cp.user_id = up.user_id
LEFT JOIN releases r ON cp.release_id = r.id;

-- Grant access to views
GRANT SELECT ON user_follower_stats TO authenticated;
GRANT SELECT ON community_posts_enriched TO authenticated;

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- To verify all tables were created successfully, run:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('social_connections', 'social_posts', 'user_followers', 'community_posts', 'community_post_likes', 'community_post_comments')
-- ORDER BY table_name;
