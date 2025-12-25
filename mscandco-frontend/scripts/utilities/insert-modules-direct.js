import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false
    }
  }
);

console.log('🌱 Seeding learning modules directly...\n');

// First, clear existing modules
console.log('Clearing existing modules...');
const { error: deleteError } = await supabase
  .from('learning_modules')
  .delete()
  .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

if (deleteError && deleteError.code !== 'PGRST116') {
  console.error('Warning clearing modules:', deleteError.message);
}

// Use raw SQL inserts
const insertSQL = `
INSERT INTO learning_modules (title, description, category, difficulty, estimated_duration_minutes, content_markdown, learning_objectives, is_published, is_featured, order_index)
SELECT * FROM (VALUES
  ('Introduction to Music Distribution', 'Learn the fundamentals of digital music distribution and how to get your music on streaming platforms worldwide.', 'music_distribution', 'beginner', 30, '# Introduction to Music Distribution

## What is Music Distribution?

Music distribution is the process of delivering your music to digital streaming platforms (DSPs) like Spotify, Apple Music, Amazon Music, and hundreds of others worldwide.

### Key Concepts

- ISRC codes
- UPC/EAN codes
- Metadata management
- Platform requirements

### Why Use a Distributor?

- Access to all major streaming platforms
- Automated royalty collection
- Professional metadata management
- Analytics and reporting', ARRAY['Understand the difference between traditional and digital distribution', 'Learn the basic workflow of music distribution', 'Identify key metadata requirements (ISRC, UPC)', 'Understand why distributors are necessary'], true, true, 1),

  ('Preparing Your Music for Release', 'Master the technical requirements for releasing music on streaming platforms, including audio quality, artwork specifications, and metadata best practices.', 'music_distribution', 'beginner', 45, '# Preparing Your Music for Release

## Audio File Requirements

**Accepted Formats:**
- WAV (Recommended)
- FLAC
- AIFF

**Quality Standards:**
- Sample Rate: 44.1 kHz or 48 kHz
- Bit Depth: 16-bit minimum, 24-bit recommended

## Artwork Requirements

**Dimensions:** 3000 x 3000 pixels minimum
**Format:** JPG or PNG
**Color Mode:** RGB (not CMYK)', ARRAY['Master audio file format requirements and quality standards', 'Create compliant artwork for streaming platforms', 'Complete metadata accurately and professionally', 'Develop a comprehensive pre-release checklist'], true, false, 2),

  ('Understanding Streaming Economics', 'Decode how streaming royalties work, payment rates across platforms, and strategies to maximize your streaming revenue.', 'music_distribution', 'intermediate', 50, '# Understanding Streaming Economics

## How Streaming Royalties Work

Streaming platforms use a pro-rata payment system. Understanding the economics helps you make better strategic decisions.

### Per-Stream Rates

- Spotify: $0.003 - $0.005
- Apple Music: $0.007 - $0.010
- Amazon Music: $0.004 - $0.007
- YouTube Music: $0.002 - $0.004', ARRAY['Understand how streaming royalty payments work', 'Calculate realistic streaming revenue expectations', 'Identify strategies to maximize per-stream earnings', 'Develop a diversified music income strategy'], true, false, 3),

  ('Copyright Fundamentals for Musicians', 'Essential copyright knowledge every musician needs - understanding your rights, protecting your work, and avoiding legal issues.', 'copyright', 'beginner', 40, '# Copyright Fundamentals for Musicians

## Two Types of Copyright in Music

### 1. Composition Copyright (Musical Work)
- Melody, lyrics, arrangement
- Owned by songwriter(s)

### 2. Sound Recording Copyright (Master)
- The specific recording
- Owned by recording artist', ARRAY['Understand the two types of music copyright (composition and recording)', 'Know your rights as a copyright owner', 'Learn when and how to register copyrights', 'Identify common copyright scenarios and solutions'], true, true, 1),

  ('Social Media Marketing for Musicians', 'Build an engaged fanbase and promote your music effectively across Instagram, TikTok, YouTube, and other platforms.', 'marketing', 'beginner', 45, '# Social Media Marketing for Musicians

## Platform-Specific Strategies

### TikTok
- Post 1-3 times daily
- Use trending sounds
- First 3 seconds crucial

### Instagram
- Stories: Daily behind-the-scenes (50%)
- Reels: Short-form viral content (20%)
- Feed: Polished promotional content (20%)', ARRAY['Develop platform-specific social media strategies', 'Create engaging content that builds fanbase', 'Understand social media algorithms and best practices', 'Convert social media followers into streaming listeners and fans'], true, false, 1),

  ('Building Your Email List', 'Email marketing remains one of the most effective tools for musicians. Learn how to build and nurture your fan email list.', 'marketing', 'intermediate', 35, '# Building Your Email List

## Why Email Marketing Matters

- You own your list
- Direct communication with fans
- Email marketing returns $42 for every $1 spent

## List Building Strategies

1. Website Integration
2. Social Media
3. Pre-Save Campaigns
4. Lead Magnets
5. Live Shows', ARRAY['Understand the importance of email marketing for musicians', 'Set up and configure an email marketing platform', 'Implement effective list-building strategies', 'Create engaging email content that converts'], true, false, 2),

  ('Getting on Playlists', 'Learn proven strategies to get your music featured on Spotify, Apple Music, and independent playlists to boost your streams.', 'marketing', 'intermediate', 40, '# Getting on Playlists

## Types of Playlists

1. Editorial Playlists (Platform-Curated)
2. Algorithmic Playlists
3. Independent/User-Curated Playlists

## Spotify Editorial Playlist Pitching

Submit at least 7 days before release through Spotify for Artists.', ARRAY['Understand different types of playlists and their impact', 'Master the Spotify and Apple Music editorial pitch process', 'Build relationships with independent playlist curators', 'Implement strategies to trigger algorithmic playlist inclusion'], true, true, 3),

  ('Reading Your Analytics Dashboard', 'Understand your streaming analytics, what metrics matter, and how to use data to make informed decisions about your music career.', 'analytics', 'beginner', 35, '# Reading Your Analytics Dashboard

## Key Metrics

### Streams vs Listeners
- Streams: Total number of plays
- Listeners: Unique people

### Save Rate
Formula: Saves / Listeners × 100
- 5%+ is decent
- 10%+ is strong
- 15%+ is excellent', ARRAY['Navigate major streaming platform analytics dashboards', 'Identify and track key performance metrics', 'Interpret geographic and demographic data for decision-making', 'Develop a systematic analytics review process'], true, false, 1),

  ('Music Royalties Explained', 'Comprehensive guide to understanding all types of music royalties, how they are calculated, and how to collect what you are owed.', 'financial', 'intermediate', 50, '# Music Royalties Explained

## Types of Royalties

1. Mechanical Royalties
2. Performance Royalties
3. Synchronization (Sync) Royalties
4. Digital Performance Royalties
5. Neighboring Rights

## Collection Societies You Need to Join

- PRO (ASCAP, BMI, or SESAC)
- SoundExchange
- MLC (Mechanical Licensing Collective)', ARRAY['Understand all types of music royalties and how they work', 'Identify which collection societies to join and why', 'Learn to read and verify royalty statements', 'Implement a system to maximize royalty collection globally'], true, true, 1),

  ('Platform Tools Masterclass', 'Master all the tools available on the MSC & Co platform to streamline your music distribution, analytics, and business operations.', 'platform_tools', 'beginner', 40, '# Platform Tools Masterclass

## Distribution Tools

- Release Management
- Metadata Manager
- Platform Selection
- Territory Management

## Analytics Dashboard

- Real-Time Metrics
- Revenue Tracking
- Geographic Insights

## Marketing Tools

- Pre-Save Campaigns
- Smart Links
- Email Marketing', ARRAY['Navigate the entire MSC & Co platform efficiently', 'Master distribution, analytics, and marketing tools', 'Optimize workflow with automation and shortcuts', 'Leverage all available resources for music career growth'], true, false, 1)
) AS v(title, description, category, difficulty, estimated_duration_minutes, content_markdown, learning_objectives, is_published, is_featured, order_index);
`;

try {
  const { data, error } = await supabase.rpc('exec', { sql: insertSQL });

  if (error) {
    // If RPC fails, try direct insert with service role
    console.log('RPC failed, trying direct inserts...\n');

    const modules = [
      {
        title: 'Introduction to Music Distribution',
        description: 'Learn the fundamentals of digital music distribution and how to get your music on streaming platforms worldwide.',
        category: 'music_distribution',
        difficulty: 'beginner',
        estimated_duration_minutes: 30,
        content_markdown: '# Introduction to Music Distribution\n\nMusic distribution delivers your music to DSPs worldwide.',
        learning_objectives: ['Understand digital distribution', 'Learn metadata requirements'],
        is_published: true,
        is_featured: true,
        order_index: 1
      },
      {
        title: 'Copyright Fundamentals',
        description: 'Essential copyright knowledge every musician needs.',
        category: 'copyright',
        difficulty: 'beginner',
        estimated_duration_minutes: 40,
        content_markdown: '# Copyright Fundamentals\n\nTwo types: Composition and Recording.',
        learning_objectives: ['Understand copyright types', 'Know your rights'],
        is_published: true,
        is_featured: true,
        order_index: 1
      },
      {
        title: 'Social Media Marketing',
        description: 'Build an engaged fanbase across social platforms.',
        category: 'marketing',
        difficulty: 'beginner',
        estimated_duration_minutes: 45,
        content_markdown: '# Social Media Marketing\n\nPlatform strategies for musicians.',
        learning_objectives: ['Develop platform strategies', 'Build fanbase'],
        is_published: true,
        order_index: 1
      },
      {
        title: 'Reading Analytics',
        description: 'Understand your streaming analytics and metrics.',
        category: 'analytics',
        difficulty: 'beginner',
        estimated_duration_minutes: 35,
        content_markdown: '# Analytics Dashboard\n\nKey metrics and insights.',
        learning_objectives: ['Navigate analytics', 'Track metrics'],
        is_published: true,
        order_index: 1
      },
      {
        title: 'Music Royalties',
        description: 'Understanding all types of music royalties.',
        category: 'financial',
        difficulty: 'intermediate',
        estimated_duration_minutes: 50,
        content_markdown: '# Music Royalties\n\nTypes and collection strategies.',
        learning_objectives: ['Understand royalty types', 'Maximize collection'],
        is_published: true,
        is_featured: true,
        order_index: 1
      },
      {
        title: 'Platform Tools',
        description: 'Master the MSC & Co platform tools.',
        category: 'platform_tools',
        difficulty: 'beginner',
        estimated_duration_minutes: 40,
        content_markdown: '# Platform Tools\n\nStreamline your workflow.',
        learning_objectives: ['Navigate platform', 'Use tools effectively'],
        is_published: true,
        order_index: 1
      }
    ];

    for (const module of modules) {
      const { data: inserted, error: insertError } = await supabase
        .from('learning_modules')
        .insert(module)
        .select();

      if (insertError) {
        console.error(`❌ ${module.title}:`, insertError.message);
      } else {
        console.log(`✅ ${module.title}`);
      }
    }
  } else {
    console.log('✅ Bulk insert successful');
  }

  // Verify
  const { data: modules, count } = await supabase
    .from('learning_modules')
    .select('*', { count: 'exact' });

  console.log(`\n📚 Total modules: ${count}`);

  if (modules) {
    const byCategory = {};
    modules.forEach(m => {
      byCategory[m.category] = (byCategory[m.category] || 0) + 1;
    });

    console.log('\nBy category:');
    Object.entries(byCategory).forEach(([cat, num]) => {
      console.log(`  ${cat}: ${num}`);
    });
  }

} catch (error) {
  console.error('❌ Error:', error.message);
}
