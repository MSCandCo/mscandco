const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🚀 Creating social/community tables...\n');

  // Create tables one by one
  const tables = [
    {
      name: 'social_connections',
      sql: `
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
      `
    },
    {
      name: 'social_posts',
      sql: `
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
      `
    },
    {
      name: 'user_followers',
      sql: `
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
      `
    },
    {
      name: 'community_posts',
      sql: `
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
      `
    },
    {
      name: 'community_post_likes',
      sql: `
        CREATE TABLE IF NOT EXISTS community_post_likes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(post_id, user_id)
        );
      `
    },
    {
      name: 'community_post_comments',
      sql: `
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
      `
    }
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { query: table.sql });

      if (error) throw error;
      console.log(`✅ Created table: ${table.name}`);
    } catch (error) {
      // Table might already exist
      console.log(`⚠️  Table ${table.name}: ${error.message}`);
    }
  }

  // Enable RLS
  console.log('\n🔒 Enabling Row Level Security...\n');

  const rls_tables = [
    'social_connections',
    'social_posts',
    'user_followers',
    'community_posts',
    'community_post_likes',
    'community_post_comments'
  ];

  for (const table of rls_tables) {
    try {
      await supabase.rpc('exec_sql', {
        query: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      });
      console.log(`✅ Enabled RLS on: ${table}`);
    } catch (error) {
      console.log(`⚠️  RLS on ${table}: ${error.message}`);
    }
  }

  // Verify tables
  console.log('\n🔍 Verifying tables exist...\n');

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      console.log(`✅ Table ${table.name} is accessible (${count || 0} rows)`);
    } catch (error) {
      console.log(`❌ Table ${table.name}: ${error.message}`);
    }
  }

  console.log('\n✨ Done!\n');
}

createTables().catch(error => {
  console.error('💥 Error:', error);
  process.exit(1);
});
