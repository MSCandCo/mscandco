-- Quick seed: Insert essential learning modules
DELETE FROM learning_modules;

INSERT INTO learning_modules (title, description, category, difficulty, estimated_duration_minutes, content_markdown, learning_objectives, is_published, is_featured, order_index) VALUES
('Introduction to Music Distribution', 'Learn the fundamentals of digital music distribution and how to get your music on streaming platforms worldwide.', 'music_distribution', 'beginner', 30, '# Introduction to Music Distribution

## What is Music Distribution?

Music distribution is the process of delivering your music to digital streaming platforms (DSPs) like Spotify, Apple Music, Amazon Music, and hundreds of others worldwide.

### Key Concepts
- ISRC codes
- UPC/EAN codes
- Metadata management
- Platform requirements', ARRAY['Understand the difference between traditional and digital distribution', 'Learn the basic workflow of music distribution', 'Identify key metadata requirements'], true, true, 1),

('Preparing Your Music for Release', 'Master the technical requirements for releasing music on streaming platforms.', 'music_distribution', 'beginner', 45, '# Preparing Your Music for Release

## Audio File Requirements

**Accepted Formats:**
- WAV (Recommended)
- FLAC
- AIFF

**Quality Standards:**
- Sample Rate: 44.1 kHz or 48 kHz
- Bit Depth: 16-bit minimum', ARRAY['Master audio file format requirements', 'Create compliant artwork', 'Complete metadata accurately'], true, false, 2),

('Understanding Streaming Economics', 'Decode how streaming royalties work and maximize your revenue.', 'music_distribution', 'intermediate', 50, '# Understanding Streaming Economics

## Per-Stream Rates
- Spotify: $0.003 - $0.005
- Apple Music: $0.007 - $0.010
- Amazon Music: $0.004 - $0.007', ARRAY['Understand streaming royalty payments', 'Calculate realistic revenue expectations', 'Maximize per-stream earnings'], true, false, 3),

('Copyright Fundamentals for Musicians', 'Essential copyright knowledge every musician needs.', 'copyright', 'beginner', 40, '# Copyright Fundamentals

## Two Types of Copyright

### 1. Composition Copyright
- Melody, lyrics, arrangement
- Owned by songwriter(s)

### 2. Sound Recording Copyright
- The specific recording
- Owned by recording artist', ARRAY['Understand the two types of music copyright', 'Know your rights as a copyright owner', 'Learn when to register copyrights'], true, true, 1),

('Music Publishing Explained', 'Understanding music publishing and how to collect all your royalties.', 'copyright', 'intermediate', 45, '# Music Publishing Explained

## What is Publishing?

Music publishing involves managing the composition copyright and collecting royalties on behalf of songwriters.', ARRAY['Understand music publishing basics', 'Learn about publishing deals', 'Identify publishing revenue streams'], true, false, 2),

('Social Media Marketing for Musicians', 'Build an engaged fanbase across social platforms.', 'marketing', 'beginner', 45, '# Social Media Marketing

## Platform Strategies

### TikTok
- Post 1-3 times daily
- Use trending sounds

### Instagram
- Stories daily
- Reels for discovery', ARRAY['Develop platform-specific strategies', 'Create engaging content', 'Build fanbase'], true, false, 1),

('Building Your Email List', 'Email marketing for musicians.', 'marketing', 'intermediate', 35, '# Building Your Email List

## Why Email Matters
- You own your list
- Direct communication
- $42 ROI per $1 spent', ARRAY['Set up email marketing', 'Build subscriber list', 'Create engaging emails'], true, false, 2),

('Getting on Playlists', 'Get featured on Spotify, Apple Music, and independent playlists.', 'marketing', 'intermediate', 40, '# Getting on Playlists

## Playlist Types
1. Editorial
2. Algorithmic
3. User-curated

Submit 7+ days before release.', ARRAY['Understand playlist types', 'Master editorial pitching', 'Build curator relationships'], true, true, 3),

('Reading Your Analytics Dashboard', 'Understand streaming analytics and metrics.', 'analytics', 'beginner', 35, '# Reading Analytics

## Key Metrics

### Streams vs Listeners
- Streams: Total plays
- Listeners: Unique people

### Save Rate
Formula: Saves / Listeners × 100', ARRAY['Navigate analytics dashboards', 'Track key metrics', 'Make data-driven decisions'], true, false, 1),

('Using Data to Grow Your Audience', 'Advanced analytics strategies for growth.', 'analytics', 'intermediate', 40, '# Using Data to Grow

## Geographic Targeting
- Identify top cities
- Plan tours strategically
- Target ads effectively', ARRAY['Analyze geographic data', 'Identify growth opportunities', 'Optimize marketing spend'], true, false, 2),

('Music Royalties Explained', 'Understanding all types of music royalties.', 'financial', 'intermediate', 50, '# Music Royalties

## Royalty Types
1. Mechanical
2. Performance
3. Sync
4. Digital Performance
5. Neighboring Rights', ARRAY['Understand all royalty types', 'Join collection societies', 'Maximize royalty collection'], true, true, 1),

('Taxes for Musicians', 'Tax essentials for independent musicians.', 'financial', 'intermediate', 35, '# Taxes for Musicians

## Tax Deductions
- Production costs
- Marketing expenses
- Equipment
- Home studio', ARRAY['Understand music income taxation', 'Track deductible expenses', 'File quarterly taxes'], true, false, 2),

('Platform Tools Masterclass', 'Master the MSC & Co platform tools.', 'platform_tools', 'beginner', 40, '# Platform Tools

## Distribution Tools
- Release Management
- Metadata Manager
- Analytics Dashboard

## Marketing Tools
- Pre-Save Campaigns
- Smart Links', ARRAY['Navigate the platform', 'Use distribution tools', 'Leverage marketing features'], true, false, 1),

('Advanced Distribution Strategies', 'Optimize your distribution workflow.', 'platform_tools', 'intermediate', 35, '# Advanced Distribution

## Best Practices
- Release scheduling
- Metadata optimization
- Territory selection
- Platform prioritization', ARRAY['Optimize release strategy', 'Automate workflows', 'Maximize platform efficiency'], true, false, 2);
