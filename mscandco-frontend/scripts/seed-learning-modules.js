import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const modules = [
  {
    title: 'Introduction to Music Distribution',
    description: 'Learn the fundamentals of digital music distribution and how to get your music on streaming platforms worldwide.',
    category: 'music_distribution',
    difficulty: 'beginner',
    estimated_duration_minutes: 30,
    content_markdown: `# Introduction to Music Distribution

## What is Music Distribution?

Music distribution is the process of delivering your music to digital streaming platforms (DSPs) like Spotify, Apple Music, Amazon Music, and hundreds of others worldwide.

### Traditional vs Digital Distribution

**Traditional Distribution:**
- Physical CDs, vinyl, cassettes
- Through record labels and distributors
- Limited geographic reach
- High upfront costs

**Digital Distribution:**
- Streaming platforms and download stores
- Direct access for independent artists
- Global reach instantly
- Lower barrier to entry

## How Digital Distribution Works

1. **Upload Your Music**: Provide your audio files, artwork, and metadata
2. **Distribution**: Your distributor sends your music to all selected platforms
3. **Publication**: Your music goes live on streaming services
4. **Royalties**: You earn money when people stream or download your music
5. **Analytics**: Track your performance across all platforms

## Key Concepts

### Metadata
Information about your music:
- Artist name
- Song title
- Album name
- Genre
- Release date
- ISRC codes
- UPC/EAN codes

### ISRC (International Standard Recording Code)
- Unique identifier for each recording
- Format: CC-XXX-YY-NNNNN
- Required for royalty tracking
- One per recording/version

### UPC/EAN (Universal Product Code)
- Unique identifier for each release/album
- 12-13 digit barcode number
- One per album/EP/single

## Why Use a Distributor?

### Direct Benefits:
- Access to all major streaming platforms
- Automated royalty collection
- Professional metadata management
- Analytics and reporting
- Keep 100% of your rights

### Platform Requirements:
Most streaming platforms don't accept direct submissions from artists - they require an approved distributor.

## Next Steps

In the following modules, you'll learn:
- How to prepare your music for distribution
- Choosing the right distributor
- Optimizing your releases
- Maximizing your streaming revenue`,
    learning_objectives: [
      'Understand the difference between traditional and digital distribution',
      'Learn the basic workflow of music distribution',
      'Identify key metadata requirements (ISRC, UPC)',
      'Understand why distributors are necessary'
    ],
    is_published: true,
    is_featured: true,
    order_index: 1
  },
  {
    title: 'Preparing Your Music for Release',
    description: 'Master the technical requirements for releasing music on streaming platforms, including audio quality, artwork specifications, and metadata best practices.',
    category: 'music_distribution',
    difficulty: 'beginner',
    estimated_duration_minutes: 45,
    content_markdown: `# Preparing Your Music for Release

## Audio File Requirements

### Format Specifications

**Accepted Formats:**
- WAV (Recommended)
- FLAC
- AIFF

**Not Accepted:**
- MP3 (lossy compression)
- AAC
- OGG

### Quality Standards

**Sample Rate:** 44.1 kHz or 48 kHz
**Bit Depth:** 16-bit minimum, 24-bit recommended
**Channels:** Stereo (2.0) or Mono

### Audio Mastering Checklist

✅ **Loudness:**
- Target: -14 LUFS for streaming platforms
- Peak level: -1 dB True Peak maximum
- Avoid excessive compression

✅ **No Clipping:**
- Check for digital distortion
- Watch your peak meters
- Leave headroom

✅ **Consistent Levels:**
- Balance between tracks on an album
- No jarring volume changes

## Artwork Requirements

### Album Cover Specifications

**Dimensions:**
- Minimum: 3000 x 3000 pixels
- Recommended: 3000 x 3000 pixels
- Format: JPG or PNG
- Color Mode: RGB (not CMYK)
- File Size: Under 10MB

### Content Guidelines

**Required:**
✅ High-resolution, professional quality
✅ Clear and legible text
✅ Artist name and album title (if text is included)

**Prohibited:**
❌ Contact information (website, social media, email)
❌ Pricing information
❌ Time-sensitive content (dates, tour info)
❌ Streaming service logos
❌ Low-resolution or pixelated images
❌ Explicit content without proper labeling

## Pre-Release Checklist

### 2-4 Weeks Before Release

- [ ] Audio files mastered and finalized
- [ ] Artwork created and approved
- [ ] Metadata completed and verified
- [ ] ISRC codes obtained
- [ ] UPC code obtained (if album/EP)
- [ ] Distribution platform selected
- [ ] Release date chosen`,
    learning_objectives: [
      'Master audio file format requirements and quality standards',
      'Create compliant artwork for streaming platforms',
      'Complete metadata accurately and professionally',
      'Develop a comprehensive pre-release checklist'
    ],
    is_published: true,
    order_index: 2
  },
  {
    title: 'Understanding Streaming Economics',
    description: 'Decode how streaming royalties work, payment rates across platforms, and strategies to maximize your streaming revenue.',
    category: 'music_distribution',
    difficulty: 'intermediate',
    estimated_duration_minutes: 50,
    content_markdown: `# Understanding Streaming Economics

## How Streaming Royalties Work

### The Payment Model

Streaming platforms use a **pro-rata payment system**:

1. Platform collects subscription fees and ad revenue
2. Takes their cut (typically 30%)
3. Remaining 70% goes to rights holders
4. Payment distributed based on total stream share

### Per-Stream Rates (Approximate 2024)

| Platform | Average Per Stream | Range |
|----------|-------------------|-------|
| Spotify | $0.003 - $0.005 | Varies by country |
| Apple Music | $0.007 - $0.010 | Generally higher |
| Amazon Music | $0.004 - $0.007 | Varies by tier |
| YouTube Music | $0.002 - $0.004 | Ad vs Premium |
| Tidal | $0.010 - $0.013 | Highest rates |
| Deezer | $0.006 - $0.008 | Mid-range |

**Important:** These rates fluctuate based on:
- Listener's country/region
- Subscription tier (free vs premium)
- Platform's total revenue
- Your total market share

## Maximizing Your Streaming Revenue

### 1. Focus on High-Paying Platforms

**Premium vs Free:**
- Premium subscribers pay 2-3x more per stream
- Target playlists that reach premium listeners

**Geographic Strategy:**
- US, UK, Canada, Australia pay higher rates
- European countries generally good rates
- Some developing markets pay significantly less

### 2. Build Playlist Presence

**Editorial Playlists (Platform-Curated):**
- Highest impact
- Millions of followers
- Very competitive

**Algorithmic Playlists:**
- Discover Weekly
- Release Radar
- Personalized mixes`,
    learning_objectives: [
      'Understand how streaming royalty payments work',
      'Calculate realistic streaming revenue expectations',
      'Identify strategies to maximize per-stream earnings',
      'Develop a diversified music income strategy'
    ],
    is_published: true,
    order_index: 3
  },
  {
    title: 'Copyright Fundamentals for Musicians',
    description: 'Essential copyright knowledge every musician needs - understanding your rights, protecting your work, and avoiding legal issues.',
    category: 'copyright',
    difficulty: 'beginner',
    estimated_duration_minutes: 40,
    content_markdown: `# Copyright Fundamentals for Musicians

## What is Copyright?

Copyright is a legal right that grants the creator of an original work exclusive rights to its use and distribution.

### Automatic Protection

**Good News:** Copyright is automatic!
- You own copyright the moment you create an original work
- No registration required (in most countries)
- Lasts your lifetime plus 70 years (in most jurisdictions)

## Two Types of Copyright in Music

### 1. Composition Copyright (Musical Work)
**What it covers:**
- Melody
- Lyrics
- Chord progressions
- Arrangement

**Who owns it:**
- Songwriter(s)
- Publisher (if assigned)

### 2. Sound Recording Copyright (Master)
**What it covers:**
- The specific recording
- Performance
- Production

**Who owns it:**
- Recording artist
- Record label (if signed)
- Producer (sometimes)

## Your Rights as a Copyright Owner

The "Bundle of Rights":

1. **Reproduction Right**
   - Make copies of your work
   - CDs, downloads, streaming

2. **Distribution Right**
   - Sell or distribute copies
   - Physical and digital

3. **Public Performance Right**
   - Perform publicly
   - Radio, streaming, live venues

4. **Derivative Works Right**
   - Create new versions
   - Remixes, samples, covers

5. **Display Right**
   - Show lyrics, artwork
   - Less relevant for pure audio

## Protecting Your Copyright

### Best Practices

1. **Keep Records**
   - Save early demos with timestamps
   - Email yourself final versions
   - Document the creative process

2. **Use Metadata**
   - Embed copyright info in audio files
   - Include © symbol, year, your name

3. **Copyright Notice**
   - Use © [Year] [Your Name]
   - Not required but helps deter infringement`,
    learning_objectives: [
      'Understand the two types of music copyright (composition and recording)',
      'Know your rights as a copyright owner',
      'Learn when and how to register copyrights',
      'Identify common copyright scenarios and solutions'
    ],
    is_published: true,
    is_featured: true,
    order_index: 1
  },
  {
    title: 'Social Media Marketing for Musicians',
    description: 'Build an engaged fanbase and promote your music effectively across Instagram, TikTok, YouTube, and other platforms.',
    category: 'marketing',
    difficulty: 'beginner',
    estimated_duration_minutes: 45,
    content_markdown: `# Social Media Marketing for Musicians

## Why Social Media Matters

**Statistics:**
- 63% of music discovery happens on social media
- Artists with active social media get 3x more streams
- TikTok drives 67% of music discovery for Gen Z

## Platform-Specific Strategies

### TikTok
**Best for:** Viral music discovery, reaching new audiences

**Content Ideas:**
- Behind-the-scenes studio sessions
- Song snippets (15-30 seconds)
- Duets and challenges
- Trending sounds usage
- Artist life content

**Algorithm Tips:**
- Post 1-3 times daily
- Use trending sounds
- First 3 seconds crucial
- Engage with comments
- Consistent posting schedule

### Instagram
**Best for:** Building community, visual storytelling

**Content Mix:**
- **Feed:** Polished promotional content (20%)
- **Stories:** Daily behind-the-scenes (50%)
- **Reels:** Short-form viral content (20%)
- **Live:** Direct fan interaction (10%)

**Growth Tactics:**
- Consistent aesthetic
- Story polls and questions
- Collaboration with other artists
- Use all features (IG favors this)
- Post when audience is active

### YouTube
**Best for:** Long-form content, music videos, monetization

**Content Types:**
- Music videos
- Lyric videos
- Behind-the-scenes vlogs
- Live performances
- Tutorial/educational content
- Shorts for discovery

## Content Creation Framework

### The 80/20 Rule
- 80% value/entertainment
- 20% promotion

### Content Pillars (4-5 core themes)

Example for indie artist:
1. **Music:** New releases, snippets, creative process
2. **Lifestyle:** Day in the life, tour stories
3. **Education:** Music tips, gear reviews
4. **Community:** Fan features, Q&As
5. **Inspiration:** Influences, favorites

## Growing Your Following

### Organic Growth Tactics

1. **Collaborate**
   - Feature other artists
   - Cross-promote
   - Duets and shared content

2. **Engage Actively**
   - Reply to every comment (early on)
   - Like and comment on others' posts
   - Join conversations in your niche

3. **Use Hashtags Strategically**
   - Mix of popular and niche
   - 5-10 relevant hashtags
   - Create branded hashtag`,
    learning_objectives: [
      'Develop platform-specific social media strategies',
      'Create engaging content that builds fanbase',
      'Understand social media algorithms and best practices',
      'Convert social media followers into streaming listeners and fans'
    ],
    is_published: true,
    order_index: 1
  },
  {
    title: 'Building Your Email List',
    description: 'Email marketing remains one of the most effective tools for musicians. Learn how to build and nurture your fan email list.',
    category: 'marketing',
    difficulty: 'intermediate',
    estimated_duration_minutes: 35,
    content_markdown: `# Building Your Email List

## Why Email Marketing Matters

**You Own Your List:**
- Social media platforms can change algorithms
- Your email list belongs to you
- Direct communication with fans
- No algorithm filtering your messages

**ROI Statistics:**
- Email marketing returns $42 for every $1 spent
- Open rates for music industry: 25-35%
- Click rates: 3-5%
- Conversion rates higher than social media

## Getting Started

### Choose an Email Service Provider

**Recommended Platforms:**
- **Mailchimp** - Free up to 500 subscribers
- **ConvertKit** - Great for creators
- **MailerLite** - Good free tier
- **Substack** - Newsletter-focused

### Creating Your Signup Form

**Essential Elements:**
1. Clear headline
2. Brief description of what subscribers get
3. Simple form (email only to start)
4. Privacy assurance
5. Strong call-to-action

**Example:**
"Join my email list for exclusive early access to new music, behind-the-scenes content, and special offers. No spam, unsubscribe anytime."

## List Building Strategies

### 1. Website Integration
- Popup (timed or exit-intent)
- Header/footer bars
- Dedicated signup page
- Blog post CTAs

### 2. Social Media
- Link in bio
- Story swipe-ups
- Posts about joining list
- Exclusive content teasers

### 3. Pre-Save Campaigns
- Collect emails for early access
- Spotify pre-save + email signup
- Build hype before releases

### 4. Lead Magnets

**Free Offerings:**
- Exclusive unreleased track
- Behind-the-scenes documentary
- Instrumental/acoustic versions
- Sample pack or preset
- Songwriting tips PDF
- Meet & greet entry

### 5. Live Shows
- QR codes at merch table
- Verbal announcements
- Printed signup sheets
- Text-to-join campaigns

## Content Strategy

### Welcome Sequence

**Email 1** (Immediate):
- Thank you
- Deliver promised content
- Set expectations

**Email 2** (2-3 days):
- Your story
- Why you make music
- What subscribers can expect

**Email 3** (1 week):
- Favorite track/video
- Ask for feedback
- Encourage replies

### Regular Emails

**Frequency:**
- Minimum: Monthly
- Sweet spot: Bi-weekly
- Maximum: Weekly (unless daily content)

**Content Ideas:**
- New release announcements
- Behind-the-scenes updates
- Personal stories
- Show announcements
- Exclusive content
- Fan spotlights
- Industry tips
- Playlists and recommendations

### Email Structure

1. **Subject Line:**
   - 50 characters or less
   - Personal, intriguing
   - Avoid spam words
   - Use emoji sparingly

2. **Preview Text:**
   - First line that shows in inbox
   - Complements subject line

3. **Body:**
   - Personal greeting
   - One main topic/CTA
   - Scannable format
   - Images (but not too many)
   - Clear call-to-action

4. **Signature:**
   - Your name
   - Links to socials
   - P.S. for secondary CTA

## Engagement Best Practices

### Personalization
- Use subscriber's first name
- Segment your list
- Send targeted content
- Track preferences

### Segmentation Ideas
- Location (tour announcements)
- Engagement level
- Purchase history
- Music preferences
- Sign-up source

### Increasing Open Rates
- Send on Tuesday-Thursday
- Avoid Monday mornings
- Test send times
- A/B test subject lines
- Clean your list regularly

### Growing Click Rates
- One primary CTA
- Button vs text link testing
- Above the fold placement
- Create urgency
- Make it visually obvious

## Monetization

### Direct Sales
- New release pre-orders
- Merchandise
- Concert tickets
- VIP packages
- Online courses

### Indirect Revenue
- Streaming links (drives streams)
- YouTube video premieres
- Patreon/membership tiers
- Crowdfunding campaigns

## Legal Requirements

### GDPR & CAN-SPAM Compliance

**Required Elements:**
- Clear unsubscribe link
- Physical mailing address
- Permission-based signup
- Honor opt-outs within 10 days
- Accurate "From" information

### Privacy
- Secure email storage
- Never sell email lists
- Be transparent about usage
- Allow data export/deletion

## Tools & Resources

**Email Design:**
- Canva (email templates)
- BEE Free (drag-and-drop editor)
- Litmus (email testing)

**Analytics:**
- ESP built-in analytics
- Google Analytics UTM codes
- A/B testing tools

**List Cleaning:**
- Remove inactive subscribers (12+ months)
- Re-engagement campaigns first
- Maintain good sender reputation

## Measuring Success

### Key Metrics

**Open Rate:**
- Industry average: 20-30%
- Above 30% is excellent
- Track over time

**Click-Through Rate:**
- Industry average: 2-5%
- Above 5% is excellent
- Measures engagement quality

**Conversion Rate:**
- Depends on goal
- Track per campaign
- A/B test to improve

**List Growth Rate:**
(New Subscribers - Unsubscribes) / Total Subscribers × 100

### Goals Beyond Numbers
- Deeper fan relationships
- Direct communication channel
- Independence from platforms
- Long-term career sustainability

## Common Mistakes to Avoid

❌ Buying email lists (illegal & ineffective)
❌ Emailing too frequently
❌ No clear call-to-action
❌ All promotional, no value
❌ Not mobile-optimized
❌ Ignoring analytics
❌ No welcome sequence
❌ Difficult unsubscribe process

## Advanced Strategies

### Automation
- Welcome sequences
- Birthday emails
- Re-engagement campaigns
- Post-purchase follow-ups
- Abandoned cart (merch)

### Email Course
- 5-7 day educational series
- Builds authority
- Nurtures subscribers
- Higher engagement

### VIP Tier
- Separate list for superfans
- Exclusive content
- Early access
- Special pricing
- Direct engagement

## Action Plan

**Week 1:**
1. Choose email service provider
2. Create signup form
3. Add to website/social media
4. Write welcome sequence

**Month 1:**
1. Set monthly email schedule
2. Plan content calendar
3. Create lead magnet
4. Grow to 100 subscribers

**Year 1:**
1. Build to 1,000+ subscribers
2. Segment your list
3. Test and optimize
4. Drive measurable revenue
5. Build genuine community

Remember: Your email list is your most valuable digital asset. Treat subscribers like the VIPs they are, provide genuine value, and watch your music career grow through direct relationships with your fans.`,
    learning_objectives: [
      'Understand the importance of email marketing for musicians',
      'Set up and configure an email marketing platform',
      'Implement effective list-building strategies',
      'Create engaging email content that converts'
    ],
    is_published: true,
    order_index: 2
  },
  {
    title: 'Getting on Playlists',
    description: 'Learn proven strategies to get your music featured on Spotify, Apple Music, and independent playlists to boost your streams.',
    category: 'marketing',
    difficulty: 'intermediate',
    estimated_duration_minutes: 40,
    content_markdown: `# Getting on Playlists

## Why Playlists Matter

**The Numbers:**
- 67% of Spotify users discover new music through playlists
- Playlist placement can increase streams by 1000%+
- Editorial playlist = career-changing moment
- Algorithmic playlists reward good fundamentals

## Types of Playlists

### 1. Editorial Playlists (Platform-Curated)

**Characteristics:**
- Created by Spotify, Apple Music staff
- Millions of followers
- Highly competitive
- Significant impact

**Examples:**
- Spotify: New Music Friday, RapCaviar, Today's Top Hits
- Apple Music: A-List Pop, Best New Songs

**How to Submit:**
- Spotify: Pitch through Spotify for Artists (7+ days before release)
- Apple Music: Submit through Apple Music for Artists
- Others: Usually no direct submission

### 2. Algorithmic Playlists

**How They Work:**
- AI-generated based on user behavior
- Personalized to individual listeners
- You can't directly submit
- Quality and engagement trigger inclusion

**Key Playlists:**
- **Discover Weekly**: New music based on listening habits
- **Release Radar**: New releases from followed artists
- **Daily Mix**: Genre-specific personalized playlists
- **Radio**: Based on artist/song selection

**How to Get Featured:**
- Strong engagement metrics
- Good completion rates
- Saves and playlist adds
- Similar artist association

### 3. Independent/User-Curated Playlists

**Characteristics:**
- Created by influencers, bloggers, fans
- Varying follower counts
- More accessible
- Relationship-based

**Finding Curators:**
- Playlist submission platforms
- Social media search
- Genre-specific communities
- Direct research

## Spotify Editorial Playlist Pitching

### Preparation (Before Release)

**Timeline:**
- 7 days minimum before release
- 2-4 weeks recommended
- One pitch per song

**Requirements:**
1. Spotify for Artists access
2. Unreleased track
3. Complete metadata
4. High-quality audio
5. Professional artwork

### Crafting Your Pitch

**Essential Information:**
1. **Genre** (be specific and accurate)
2. **Mood** (multiple selections allowed)
3. **Language**
4. **Description** (500 characters)

**Writing Your Description:**

✅ **Do:**
- Highlight unique elements
- Mention notable collaborators
- Share backstory briefly
- Note sync placements/media coverage
- Include relevant achievements

❌ **Don't:**
- Oversell or hype
- Make demands
- Compare to huge artists
- Include contact info
- Write a novel

**Example Pitch:**
"Indie rock anthem blending The Strokes' energy with modern production. Featured on college radio across 50 stations. Recorded at Abbey Road with engineer from Arctic Monkeys sessions. About overcoming anxiety through music."

### After Pitching

**What Happens:**
- Editors review (no guaranteed response)
- No notification if rejected
- Feature could happen weeks/months later
- Keep promoting regardless

## Apple Music Playlist Strategy

### Apple Music for Artists

**Pitch Process:**
- Similar to Spotify
- Submit before release
- Editorial team reviews
- Focus on quality and story

**Advantages:**
- Higher per-stream rates
- Quality-focused curation
- Less saturated than Spotify

## Independent Playlist Outreach

### Finding the Right Playlists

**Research Criteria:**
1. **Follower Count**: 500+ (start small)
2. **Engagement**: Regular updates
3. **Genre Match**: Fits your music
4. **Curator Activity**: Responsive
5. **Quality**: Well-curated, not spam

**Research Tools:**
- **SubmitHub**: Paid submission platform
- **Playlist Push**: Connects artists with curators
- **Soundplate**: Playlist database
- **Manual Search**: Spotify/Apple Music search
- **Social Media**: Instagram, Twitter curator accounts

### Outreach Best Practices

**Finding Contact Info:**
- Playlist description
- Curator social media
- Website/blog
- Submission platforms

**Email Template:**

Subject: [Genre] Track for [Playlist Name]

Hi [Curator Name],

I'm [Your Name], an [genre] artist from [location]. I've been following [Playlist Name] and love your recent additions, especially [specific song].

I think my new track "[Song Name]" would fit well alongside [similar artist in their playlist]. It's a [brief, specific description].

[Private SoundCloud or Spotify link]

No pressure - I know you get tons of submissions! Either way, keep up the great curation.

Best,
[Your Name]
[Social Links]

**Follow-Up:**
- Wait 1-2 weeks
- One polite follow-up maximum
- Thank them regardless of outcome

### Paid Submission Platforms

**SubmitHub:**
- Credits system ($1-3 per submission)
- Curator feedback guaranteed
- Stats on approval rates
- Playlist + blog submissions

**Pros:**
- Curators incentivized to listen
- Feedback helps improve
- Some real placements

**Cons:**
- Can get expensive
- No guarantee of placement
- Some low-quality curators

**Best Practices:**
- Research curator history
- Check approval rates
- Use standard credits first
- Save premium for top playlists

### Playlist Push

**How it Works:**
- $300-800 per campaign
- Genre-matched curators
- Guaranteed reviews
- Placements likely

**Best For:**
- Serious releases
- Budget available
- Professional campaigns

## Building Your Own Playlist

### Why Create Playlists?

**Benefits:**
- Include your own music
- Build curator relationships
- Understanding the curator perspective
- Grow your following
- Demonstrate your taste

### Playlist Strategy

**Structure:**
1. Your song every 5-10 tracks
2. Theme-based or genre-based
3. Mix of popular + emerging artists
4. Regular updates (weekly)
5. Professional cover image

**Promotion:**
- Share on social media
- Add to your profile
- Pitch to followers
- Collaborate with other artists

## Maximizing Playlist Impact

### Before Playlist Placement

**Pre-Save Campaign:**
- Build momentum
- Increase saves on release day
- Shows demand to curators
- Triggers algorithmic playlists

**Social Media Prep:**
- Tease the release
- Build anticipation
- Prepare shareable content
- Have promo assets ready

### After Getting Playlist Placement

**Promotion:**
1. Thank the curator publicly
2. Share to your audience
3. Screenshot/graphic
4. Tag the playlist
5. Drive traffic to it

**Conversion:**
- Link in bio
- Instagram stories
- Email blast
- Website announcement
- Other social platforms

**Engagement:**
- Watch your stats daily
- Note spike timing
- Leverage momentum
- Plan next moves

## Algorithmic Playlist Triggers

### What Triggers Inclusion?

**Key Metrics:**
1. **Save Rate**: High saves = quality signal
2. **Completion Rate**: Listeners finish song
3. **Skip Rate**: Low skips = engaging
4. **Playlist Adds**: Users adding to playlists
5. **Share Rate**: Social sharing
6. **Repeat Listens**: People coming back

### Optimization Strategies

**Song Structure:**
- Engaging first 5 seconds
- Optimal length (2:30-3:30)
- Strong hook within 30 seconds
- Quality production
- No dead space

**Release Strategy:**
- Release on Friday
- Pitch to editorial
- Drive early engagement
- Follow-up singles
- Consistent releases

**Engagement Tactics:**
- Pre-save campaigns
- Social media push
- Email list announcement
- Playlist submission
- Paid advertising (sparingly)

## Playlist Maintenance

### Getting Removed

**Why It Happens:**
- Curator updating playlist
- Seasonal rotation
- Performance metrics
- Playlist rebranding

**What to Do:**
- Don't take personally
- Thank curator for opportunity
- Stay in touch for future releases
- Continue building relationships

### Tracking Placements

**Tools:**
- Spotify for Artists
- Chartmetric
- Soundcharts
- Manual tracking spreadsheet

**What to Track:**
1. Playlist name
2. Follower count
3. Date added
4. Position in playlist
5. Curator contact
6. Streams attributed

## Red Flags & Scams

### Warning Signs:

❌ Guaranteed editorial placement
❌ Pay for playlist adds (payola)
❌ Playlists with fake followers
❌ Bots/low-quality accounts
❌ Upfront payment to curator
❌ Too good to be true promises

### Safe Practices:

✅ Research curator reputation
✅ Check playlist engagement
✅ Look for real accounts
✅ Use reputable platforms
✅ Build genuine relationships
✅ Focus on organic growth

## Advanced Strategies

### Playlist Ecosystem

**Cross-Pollination:**
- Get on multiple genre playlists
- Build curator network
- Recommend other artists
- Create curator community

### PR Integration

**Media Coverage = Playlist Leverage:**
- Press mentions in pitch
- Blog features
- Radio play
- Sync placements
- Awards/recognition

### Timing Strategy

**Release Schedule:**
- Avoid major releases (big artists)
- Consider seasonal themes
- Plan for playlist update cycles
- Friday releases for best shot

## Case Studies

### Success Pattern:

1. Artist releases quality track
2. Pitches to editorial (Spotify/Apple)
3. Simultaneously submits to 20-30 indie playlists
4. Gets on 5-10 small playlists (1k-10k followers)
5. Drives traffic through social media
6. Good engagement triggers algorithm
7. Lands on Discover Weekly
8. Momentum leads to editorial consideration
9. Streams snowball

### Timeline:
- Week 1: Small playlist adds
- Week 2-3: Algorithmic inclusion
- Week 4-8: Potential editorial
- Month 2-3: Sustainable growth

## Action Plan

**Week 1:**
1. Set up Spotify/Apple Artist profiles
2. Research 50 relevant playlists
3. Join SubmitHub
4. Prepare pitch assets
5. Create tracking spreadsheet

**Week 2:**
1. Pitch to editorial (7 days before release)
2. Submit to 20 indie playlists
3. Launch pre-save campaign
4. Prepare social content
5. Create your own playlist

**Release Week:**
1. Monitor placements
2. Thank curators
3. Promote any adds
4. Drive engagement
5. Track metrics

**Ongoing:**
1. Weekly playlist research
2. Relationship building
3. Monthly playlist pitch
4. Analyze what works
5. Refine strategy

Remember: Playlist placement is a marathon, not a sprint. Focus on creating genuinely great music, building real relationships with curators, and understanding that each placement builds momentum for the next. Stay persistent, be professional, and treat curators with respect.`,
    learning_objectives: [
      'Understand different types of playlists and their impact',
      'Master the Spotify and Apple Music editorial pitch process',
      'Build relationships with independent playlist curators',
      'Implement strategies to trigger algorithmic playlist inclusion'
    ],
    is_published: true,
    is_featured: true,
    order_index: 3
  },
  {
    title: 'Reading Your Analytics Dashboard',
    description: 'Understand your streaming analytics, what metrics matter, and how to use data to make informed decisions about your music career.',
    category: 'analytics',
    difficulty: 'beginner',
    estimated_duration_minutes: 35,
    content_markdown: `# Reading Your Analytics Dashboard

## Why Analytics Matter

**Data-Driven Decisions:**
- Understand who your fans are
- See what's working
- Optimize marketing spend
- Plan tours strategically
- Identify growth opportunities

## Key Platforms

### Spotify for Artists

**Access:** spotify.com/artists
**Data Delay:** 2-3 days

**Key Metrics:**
1. Streams
2. Listeners
3. Followers
4. Playlist adds
5. Geographic data
6. Demographic data

### Apple Music for Artists

**Access:** artists.apple.com
**Data Delay:** Daily updates

**Key Metrics:**
1. Plays
2. Listeners
3. Shazams
4. Song purchases
5. Location data
6. Playlist adds

## Understanding Core Metrics

### Streams vs Listeners

**Streams:**
- Total number of plays
- Includes multiple plays by same person
- Good for revenue calculation
- Can be inflated by superfans

**Listeners:**
- Unique people who played your music
- More accurate audience size
- Better growth indicator

**Example:**
- 10,000 streams / 2,000 listeners = 5 streams per listener
- High ratio = engaged fanbase
- Low ratio = casual listeners

### Monthly Listeners

**What it shows:**
- Unique listeners in last 28 days
- Rolling window
- Most visible metric
- Impacts algorithm

**Growth Indicators:**
- Steady increase = healthy growth
- Spikes = viral moment or playlist add
- Decrease = need new strategy

### Follower Count

**Why it matters:**
- Permanent connection
- Release Radar inclusion
- Long-term audience
- More valuable than one-time listeners

**How to grow:**
- Remind in social media
- Link in bio
- Include in emails
- Artist profile optimization

### Save Rate

**Formula:**
- Saves / Listeners × 100

**Good Rate:**
- 5%+ is decent
- 10%+ is strong
- 15%+ is excellent

**Why it matters:**
- Quality signal to algorithm
- Indicates repeat listen intent
- Playlist consideration factor

### Skip Rate

**What it shows:**
- % of listeners who skip before 30 seconds
- Quality indicator
- Playlist performance

**Target:**
- Under 50% is good
- Under 30% is great
- Under 20% is exceptional

**How to improve:**
- Engaging intros
- Better song structure
- Right playlist targeting

## Geographic Data

### Location Insights

**What to look for:**
1. **Top Cities:**
   - Where your fans are
   - Tour planning
   - Advertising targets
   - Media outreach

2. **Unexpected Markets:**
   - Hidden opportunities
   - International appeal
   - Niche communities

### Using Geographic Data

**Tour Planning:**
- Prioritize top 10 cities
- Minimum viable audience = 1,000 monthly listeners
- Partner with local artists
- Target regional playlists

**Marketing:**
- Geo-targeted ads
- Local influencer outreach
- City-specific content
- Regional playlist pitching

## Demographic Data

### Age & Gender

**What to analyze:**
- Primary age group
- Secondary audiences
- Gender split
- Unexpected demographics

**Application:**
- Marketing message
- Visual branding
- Collaboration choices
- Content strategy

**Example:**
- 18-24 male dominant = TikTok, gaming, hip-hop collabs
- 25-34 female dominant = Instagram, lifestyle, pop collaborations

## Playlist Performance

### Types to Track

**Editorial:**
- Highest impact
- Track closely
- Note add/remove dates
- Leverage in PR

**Algorithmic:**
- Discover Weekly
- Release Radar
- Radio
- Daily Mixes

**User-Generated:**
- Independent curators
- Fan playlists
- Growing reach

### Metrics to Monitor

**For Each Playlist:**
1. Follower count
2. Your song position
3. Streams attributed
4. Date added
5. Still active?

## Source Analysis

### Understanding Sources

**Where streams come from:**
- Playlists
- Search
- Your profile
- Other artist pages
- External (social, websites)

**What it reveals:**
- Discovery method
- Fan behavior
- Marketing effectiveness
- Growth opportunities

### Optimizing by Source

**High Playlist Streams:**
- Focus on playlist pitching
- Optimize for playlists
- Create playlist-friendly music

**High Search:**
- SEO opportunity
- Name recognition growing
- Capitalize with content

**High Profile Visits:**
- Fans seeking more content
- Upload more songs
- Optimize bio
- Regular releases

## Engagement Trends

### Pattern Recognition

**Weekly Patterns:**
- What days stream most?
- Weekend vs weekday
- Posting optimization
- Ad timing

**Seasonal Patterns:**
- Summer vs winter
- Holiday impacts
- Genre seasonality
- Release timing

**Growth Patterns:**
- Steady vs spiky
- Sustainable strategies
- Campaign effectiveness

## Platform Comparison

### Spotify vs Apple Music vs YouTube

**Track:**
- Which platform performs best
- Where to focus marketing
- Audience differences
- Revenue implications

**Example Analysis:**
- Strong Spotify = playlist game working
- Strong Apple Music = premium audience
- Strong YouTube = video content resonating

## Advanced Metrics

### Listener Journey

**First Listen:**
- How people discover you
- Most played track
- Retention rate

**Repeat Listeners:**
- % who come back
- Average listens per fan
- True fan identification

### Conversion Rates

**Social to Streaming:**
- Instagram clicks to Spotify
- YouTube views to streams
- Email clicks to plays
- Ad spend ROI

## Tools Beyond Native Analytics

### Third-Party Platforms

**Chartmetric:**
- Cross-platform analytics
- Playlist tracking
- Competitor analysis
- Industry trends

**Soundcharts:**
- Radio airplay
- Playlist history
- Social media tracking
- Chart performance

**SubmitHub:**
- Submission stats
- Approval rates
- Playlist reach

### Social Media Analytics

**Instagram Insights:**
- Post engagement
- Story views
- Link clicks
- Follower growth

**TikTok Analytics:**
- Video views
- Engagement rate
- Sound usage
- Follower demographics

## Red Flags in Data

### Warning Signs:

❌ Sudden unexplained spike (potential fraud)
❌ High streams, low followers (bot farms)
❌ Streams from suspicious locations
❌ 100% completion on long tracks
❌ Unnatural growth patterns

### Healthy Patterns:

✅ Gradual follower growth
✅ Geographic diversity
✅ Multiple traffic sources
✅ Engaged listeners (saves, shares)
✅ Platform consistency

## Creating Your Analytics Routine

### Weekly Check-In (15 min)

1. Check stream totals
2. Review top tracks
3. Monitor playlist adds
4. Note anomalies
5. Track followers

### Monthly Deep Dive (1 hour)

1. Full platform review
2. Geographic analysis
3. Demographic shifts
4. Source breakdown
5. Playlist performance
6. Campaign effectiveness
7. Competitive analysis
8. Strategy adjustment

### Quarterly Strategic Review (2-3 hours)

1. Overall growth trends
2. Goal vs actual
3. ROI on marketing
4. Platform strategy
5. Release planning
6. Tour feasibility
7. Revenue forecast
8. Year ahead planning

## Making Data-Driven Decisions

### Campaign Evaluation

**Before:**
- Set clear goals
- Define success metrics
- Budget allocation

**During:**
- Monitor daily
- Quick adjustments
- Capitalize on wins

**After:**
- ROI calculation
- Lessons learned
- Optimize next time

### A/B Testing

**What to Test:**
- Release timing
- Song versions
- Artwork variations
- Ad creative
- Social content

**How to Measure:**
- Engagement rates
- Conversion metrics
- Cost per result
- Long-term impact

## Common Mistakes

❌ Obsessing over daily fluctuations
❌ Ignoring qualitative feedback
❌ Not connecting data to action
❌ Vanity metrics over meaningful ones
❌ Analysis paralysis
❌ Not tracking campaigns
❌ Comparing to wrong artists

## Action Plan

**This Week:**
1. Set up all analytics dashboards
2. Take baseline screenshots
3. Create tracking spreadsheet
4. Set weekly calendar reminder
5. Define your key metrics

**This Month:**
1. Identify top 3 growth opportunities
2. Implement one test campaign
3. Track results systematically
4. Build city/demographic profiles
5. Plan data-informed releases

**This Year:**
1. Grow by measurable %
2. Optimize by platform
3. Data-driven tour planning
4. ROI-positive marketing
5. Build analytics expertise

Remember: Data without action is useless. Use analytics to inform decisions, not to stress over numbers. Focus on meaningful metrics that align with your goals, and always remember that great music is the foundation of all good data.`,
    learning_objectives: [
      'Navigate major streaming platform analytics dashboards',
      'Identify and track key performance metrics',
      'Interpret geographic and demographic data for decision-making',
      'Develop a systematic analytics review process'
    ],
    is_published: true,
    order_index: 1
  },
  {
    title: 'Music Royalties Explained',
    description: 'Comprehensive guide to understanding all types of music royalties, how they\'re calculated, and how to collect what you\'re owed.',
    category: 'financial',
    difficulty: 'intermediate',
    estimated_duration_minutes: 50,
    content_markdown: `# Music Royalties Explained

## Overview of Music Royalties

Music royalties are payments made to rights holders for the use of their music. Understanding royalties is crucial for maximizing your income as a musician.

## Types of Royalties

### 1. Mechanical Royalties

**What they are:**
- Payment for reproduction of musical composition
- Covers physical & digital copies
- Includes streaming (though lower rates)

**Who gets paid:**
- Songwriters
- Publishers

**Rates (US 2024):**
- Physical/Download: 12.4¢ per copy
- Streaming: Fraction of a penny
- Determined by Copyright Royalty Board

**How to collect:**
- Join a mechanical rights organization
- US: MLC (Mechanical Licensing Collective)
- UK: MCPS (Mechanical-Copyright Protection Society)

### 2. Performance Royalties

**What they are:**
- Payment when music is performed publicly
- Radio, TV, streaming, live venues, restaurants
- "Public" = anywhere outside private home

**Who gets paid:**
- Songwriters (writer's share)
- Publishers (publisher's share)

**Two separate payments:**
1. Performance right (composition)
2. Neighboring right (recording)

**How to collect:**
- Join a PRO (Performing Rights Organization)
- **US:** ASCAP, BMI, SESAC, GMR
- **UK:** PRS for Music
- **Global:** various (SOCAN, APRA, GEMA, etc.)

### 3. Synchronization (Sync) Royalties

**What they are:**
- Payment for music in visual media
- TV shows, films, commercials, video games
- YouTube videos, social media content

**Who gets paid:**
- Songwriters
- Publishers
- Master recording owners

**How it works:**
- Negotiated deals (no standard rate)
- One-time fees or ongoing
- Both composition AND master clearance needed

**Typical Rates:**
- Independent film: $0 - $5,000
- National commercial: $50,000 - $500,000+
- Video game: $2,500 - $100,000
- TV show: $1,500 - $25,000 per episode

**How to collect:**
- Direct licensing
- Sync agents
- Music libraries
- Publisher representation

### 4. Print Music Royalties

**What they are:**
- Sheet music, songbooks, tablature
- Less common in modern era

**Who gets paid:**
- Songwriters
- Publishers

**How to collect:**
- Direct from print publisher
- Through admin deals

### 5. Digital Performance Royalties

**What they are:**
- Streaming on platforms (Spotify, Apple Music)
- Internet radio (Pandora, SiriusXM)
- YouTube (interactive streaming)

**Who gets paid:**
- Both songwriters AND recording artists
- Separate streams

**How to collect:**
- Recording: Directly from distributor
- Composition: Through PRO + MLC

### 6. Neighboring Rights

**What they are:**
- Artist/performer payments for radio/TV broadcast
- Does NOT include streaming
- Recording performance rights

**Who gets paid:**
- Featured artists
- Session musicians
- Recording owners

**Important:**
- Not collected in US for terrestrial radio
- Satellite/digital radio: Yes
- International broadcasts: Yes

**How to collect:**
- **US:** SoundExchange
- **International:** Various societies

## The Money Flow

### Composition Copyright Revenue

1. **Mechanical Royalties:**
   Streaming Platform → MLC → Songwriter/Publisher

2. **Performance Royalties:**
   Radio/Venue → PRO → Songwriter/Publisher

3. **Sync Royalties:**
   TV/Film Production → Songwriter/Publisher (direct deal)

### Sound Recording Revenue

1. **Streaming Revenue:**
   Platform → Distributor → Recording Owner → Artist

2. **Neighboring Rights:**
   Radio/TV → SoundExchange → Artist/Label

## Royalty Splits

### Standard Splits

**Composition:**
- 50% Writer's Share
- 50% Publisher's Share

**If you're unsigned:**
- You own 100% (both shares)
- Still split into two for accounting

**If co-written:**
- Split writer's share (e.g., 25%/25%)
- Each may have own publisher

**Sound Recording:**
- If independent: 100% to you
- If signed: Label takes 50-95%

## Collection Societies

### You Need to Join:

**1. Performing Rights Organization (PRO)**

Choose ONE:
- **ASCAP** (ascap.com)
- **BMI** (bmi.com)
- **SESAC** (sesac.com)

Free to join (ASCAP/BMI)
Collects: Performance royalties (composition)

**2. SoundExchange**

Register at soundexchange.com
Free to join
Collects: Digital performance royalties (recording)

**3. Mechanical Licensing Collective (MLC)**

Register at themlc.com
Free to join
Collects: Streaming mechanical royalties (composition)

### Optional Services:

**Music Publishing Administrator:**
- **TuneCore Publishing**
- **Songtrust**
- **CD Baby Pro**
- **Sentric Music**

Takes: 10-20% commission
Collects: Worldwide publishing royalties
Worth it if: You have significant streams/usage

## International Royalties

### The Challenge

- 70+ countries have different systems
- Royalties trapped if not claimed
- Complex registration process
- Different societies for each country

### Solution Options:

**1. DIY Registration:**
- Register with each country's society
- Time-consuming
- Free (except membership fees)

**2. Publishing Administrator:**
- Global collection services
- One registration
- Commission fee (15-20%)
- Recommended for most artists

### Major International Societies:

- **UK:** PRS (performance), MCPS (mechanical)
- **Canada:** SOCAN
- **Australia:** APRA/AMCOS
- **Germany:** GEMA
- **France:** SACEM
- **Japan:** JASRAC

## Royalty Statements

### Reading Your Statement

**Key Sections:**
1. Reporting period
2. Revenue source breakdown
3. Territory/country
4. Per-track earnings
5. Deductions
6. Net payment

**Common Items:**
- Streams by platform
- Radio plays
- Public performance
- Downloads/physical
- Adjustments/reserves

### Red Flags:

❌ Unexplained deductions
❌ Missing major platforms
❌ International territories at $0
❌ Math doesn't add up
❌ No detail/transparency

## Maximizing Royalty Income

### 1. Register Everything

**Checklist:**
- [x] Join PRO (ASCAP/BMI/SESAC)
- [x] Register with MLC
- [x] SoundExchange account
- [x] Publishing administrator
- [x] Proper metadata everywhere

### 2. Claim All Usages

**Monitor:**
- Radio plays (terrestrial, satellite)
- TV appearances
- Streaming platforms
- Live performance venues
- Background music (Spotify, YouTube)

### 3. Collect Internationally

**Options:**
- Publishing admin (recommended)
- Direct registration (time-intensive)
- Publisher deal (gives up ownership)

### 4. Optimize Splits

**Best Practices:**
- Split agreements in writing
- Register splits with PRO
- IPI/CAE numbers for all writers
- Clear ownership percentages

## Common Questions

### Q: Can I switch PROs?

A: Yes, but only at specific times (usually end of year). Check your agreement.

### Q: How long until I get paid?

A: Typically 3-6 months after streams/usage
- Streaming: 2-4 months
- Radio: 3-6 months
- International: 6-12+ months

### Q: Do I need a publisher?

A: No, if you're independent. You can:
- Self-publish (own 100%)
- Use publishing administrator (keep ownership)
- Sign publishing deal (give up some ownership for advance)

### Q: What's a black box?

A: Unclaimed royalties. Billions sitting unclaimed because:
- Missing registrations
- Incorrect metadata
- Unknown international societies
- Not joined collection societies

## Royalty Audits

### When to Audit:

- Significant discrepancies
- Missing major platforms
- Suspect accounting
- Large catalogs
- Distribution/label deals

### How to Audit:

1. Review all statements carefully
2. Cross-reference with analytics
3. Request detailed reporting
4. Hire audit firm (if big money)
5. Legal action (last resort)

## Protecting Your Royalties

### Registration Best Practices

**1. Accurate Metadata:**
- Full legal names
- IPI/CAE numbers
- ISRC codes
- UPC codes
- Pro affiliations

**2. Copyright Registration:**
- Not required for royalties
- Helps prove ownership
- Required for lawsuits (US)

**3. Split Sheets:**
- Written agreements
- Signed by all writers
- Before release
- Filed with PRO

**4. Contracts:**
- Read everything
- Understand percentages
- Know your rights
- Legal review for major deals

## Tax Considerations

### Royalty Income is Taxable

**US Tax Rules:**
- Schedule C (self-employed)
- Quarterly estimated taxes
- Deductions available
- Might need accountant

**Deductions:**
- Production costs
- Marketing
- Equipment
- Home studio
- Travel
- Professional services

**International Taxes:**
- May be withheld
- Tax treaty benefits
- Form W-8BEN (non-US)
- Consult tax professional

## Future-Proofing

### Blockchain & NFTs

**Emerging:**
- Smart contracts
- Automated royalty splits
- Direct fan payments
- Transparent accounting

**Not Mainstream Yet:**
- Still use traditional systems
- Monitor developments
- Experiment carefully

### User-Centric Payment

**Current:** Pro-rata (pool-based)
**Proposed:** User-centric (individual-based)

**Potential Impact:**
- More fair for niche artists
- Less reliance on gaming system
- Not widely adopted yet

## Action Checklist

**Immediate (This Week):**
- [ ] Join a PRO
- [ ] Register with MLC
- [ ] Sign up for SoundExchange
- [ ] Review distributor splits
- [ ] Check all metadata

**Short-Term (This Month):**
- [ ] Consider publishing admin
- [ ] Create split sheet template
- [ ] Organize royalty statements
- [ ] Set tracking system
- [ ] Verify all registrations

**Long-Term (This Year):**
- [ ] Claim international royalties
- [ ] Quarterly royalty reviews
- [ ] Optimize collection strategy
- [ ] Consider sync opportunities
- [ ] Build royalty forecasting

## Resources

**Collection:**
- themlc.com (US mechanicals)
- soundexchange.com (digital performance)
- ascap.com, bmi.com, sesac.com (PROs)

**Administration:**
- songtrust.com
- tunecore.com/publishing
- cdbaby.com/pro

**Education:**
- Royalty Exchange (blog)
- Future of Music Coalition
- Music Business Worldwide

**Tools:**
- Royalty tracking spreadsheets
- Accounting software (QuickBooks)
- Music income apps

Remember: Unclaimed royalties don't disappear - they go to a "black box" and eventually get redistributed to major publishers. Register everything, understand your rights, and collect what you've earned. Your music has value - make sure you're getting paid for it.`,
    learning_objectives: [
      'Understand all types of music royalties and how they work',
      'Identify which collection societies to join and why',
      'Learn to read and verify royalty statements',
      'Implement a system to maximize royalty collection globally'
    ],
    is_published: true,
    is_featured: true,
    order_index: 1
  },
  {
    title: 'Platform Tools Masterclass',
    description: 'Master all the tools available on the MSC & Co platform to streamline your music distribution, analytics, and business operations.',
    category: 'platform_tools',
    difficulty: 'beginner',
    estimated_duration_minutes: 40,
    content_markdown: `# Platform Tools Masterclass

## Welcome to MSC & Co

This module will help you navigate and master all the powerful tools available on our platform.

## Dashboard Overview

### Your Hub

**Key Sections:**
1. **Quick Stats** - Streams, revenue, releases at a glance
2. **Recent Activity** - Latest updates across platforms
3. **Upcoming Releases** - Scheduled distribution
4. **Tasks** - Action items and reminders
5. **Notifications** - Platform updates and alerts

### Customization

**Personalize Your Dashboard:**
- Drag widgets to reorder
- Show/hide sections
- Set default date ranges
- Choose metric preferences
- Dark/light mode toggle

## Distribution Tools

### Release Management

**Creating a Release:**
1. Navigate to Distribution → New Release
2. Choose release type (Single/EP/Album)
3. Upload audio files (WAV/FLAC)
4. Add artwork (3000x3000px JPG/PNG)
5. Enter metadata (artist, title, genre, etc.)
6. Select platforms
7. Set release date (2+ weeks recommended)
8. Review and submit

**Best Practices:**
- Upload at least 2 weeks early
- Double-check all metadata
- Verify artwork specs
- Preview before submission
- Save as draft if unsure

### Metadata Manager

**Bulk Editing:**
- Update multiple releases
- Fix common errors
- Add missing information
- Export/import spreadsheet
- Version history

**Required Fields:**
- Artist name
- Track title
- ISRC code
- Genre (primary + secondary)
- Language
- Parental advisory
- Copyright notice

**Optional but Recommended:**
- Lyrics
- Credits (producers, writers, etc.)
- Recording location
- Label name
- Catalog number

### Platform Selection

**Available Platforms:**
- Spotify
- Apple Music
- YouTube Music
- Amazon Music
- Tidal
- Deezer
- Pandora
- 150+ more

**Territory Management:**
- Worldwide (recommended)
- Specific countries only
- Exclude territories
- Territory-based pricing

## Analytics Dashboard

### Streaming Analytics

**Real-Time Metrics:**
- Total streams
- Unique listeners
- Save rate
- Skip rate
- Completion rate
- Playlist adds

**Filter Options:**
- Date range
- Platform
- Territory
- Track
- Demographic

**Export Options:**
- CSV download
- PDF reports
- Scheduled emails
- API access

### Revenue Tracking

**Income Overview:**
- Total earnings
- Platform breakdown
- Track performance
- Payout schedule
- Historical trends

**Payment Methods:**
- PayPal
- Bank transfer
- Wire transfer
- Stripe
- Minimum threshold settings

### Geographic Insights

**Location Data:**
- Top countries
- Top cities
- Heat map visualization
- Growth by region
- Export city lists

**Applications:**
- Tour planning
- Advertising targeting
- Regional promotion
- Playlist pitching

## Playlist Pitching Tool

### Editorial Submissions

**Process:**
1. Select unreleased track
2. Choose target playlists
3. Fill pitch form
4. Add context/story
5. Submit 7+ days before release

**Pitch Components:**
- Genre tags
- Mood descriptors
- Inspiration/influences
- Notable achievements
- Media coverage
- Backstory (500 chars)

**Tips:**
- Be specific, not generic
- Highlight unique elements
- No hype or demands
- Professional tone
- Proofread carefully

### Independent Curator Outreach

**Curator Database:**
- Search by genre
- Filter by follower count
- Contact information
- Submission guidelines
- Response history

**Track Submissions:**
- Attach to curators
- Monitor status
- Follow up tools
- Success rate tracking

## Collaboration Hub

### Finding Collaborators

**Search Features:**
- Genre filters
- Location
- Skills (producer, vocalist, etc.)
- Availability
- Rate range

**Profile Elements:**
- Portfolio/samples
- Reviews/ratings
- Response time
- Completed projects
- Verification status

### Project Management

**Collaboration Tools:**
- File sharing
- Version control
- Comments/feedback
- Milestone tracking
- Payment escrow

**Communication:**
- Direct messaging
- Video calls
- Screen sharing
- Activity feed
- Notifications

## Rights Management

### Copyright Registration

**Upload Proof:**
- Audio files
- Timestamps
- Copyright certificates
- Split sheets
- Contracts

**Tracking:**
- All works registered
- Ownership percentages
- Co-writer details
- Publisher information
- Status updates

### Split Sheet Generator

**Create Agreements:**
1. Add collaborators
2. Define percentages
3. Specify roles
4. Sign digitally
5. Store securely
6. Send to PRO

**Fields:**
- Writer names
- IPI/CAE numbers
- Publisher info
- Splits (must = 100%)
- Signatures
- Date

## Marketing Tools

### Pre-Save Campaigns

**Setup:**
1. Select upcoming release
2. Choose landing page template
3. Customize design
4. Set incentives (contest, exclusive content)
5. Generate shareable link
6. Track conversions

**Analytics:**
- Pre-save count
- Traffic sources
- Geographic breakdown
- Social shares
- Email captures

### Smart Links

**Universal Links:**
- One link → All platforms
- Automatic redirect
- Fan choice
- Brand customization
- Deep linking

**Features:**
- Custom domain support
- QR code generation
- Analytics tracking
- Geo-targeting
- Retargeting pixels

### Email Marketing

**Integrated Tool:**
- Import contacts
- Segment lists
- Email templates
- Automated campaigns
- Performance metrics

**Campaign Types:**
- New release announcements
- Show promotions
- Exclusive content
- Merch launches
- Fan engagement

## Content Library

### Asset Management

**Organized Storage:**
- Audio files
- Artwork
- Press photos
- Videos
- Documents
- Press kit materials

**Features:**
- Unlimited storage
- Version history
- Quick search
- Folders/tags
- Bulk operations
- CDN delivery

### Press Kit Builder

**Auto-Generated:**
- Bio (pulled from profile)
- High-res photos
- Logos
- Streaming links
- Press quotes
- Contact info
- One-click download

## Royalty Tracker

### Collection Status

**Monitor:**
- PRO registrations
- MLC status
- SoundExchange
- International societies
- Publishing admin
- Missing royalties

**Alerts:**
- Unclaimed royalties
- Missing registrations
- Action required
- Payment delays

### Forecasting

**Predict Earnings:**
- Based on trends
- Release schedules
- Historical data
- Growth patterns
- Seasonal factors

## Support & Learning

### Help Center

**Resources:**
- Video tutorials
- Written guides
- FAQs
- Best practices
- Case studies
- Industry news

**Search:**
- Keyword search
- Category browse
- Recommended articles
- Recent updates

### Community Forum

**Engage:**
- Ask questions
- Share experiences
- Network
- Find collaborators
- Industry discussions

**Categories:**
- Distribution
- Marketing
- Production
- Legal
- Business
- Feedback

### Live Support

**Contact Options:**
- Live chat (business hours)
- Email support (24-48 hours)
- Priority support (Pro tier)
- Phone support (Enterprise)

**Before Contacting:**
- Check help center
- Search forum
- Review FAQs
- Gather account details

## Mobile App

### Available Features

**On-the-Go Access:**
- View analytics
- Check payments
- Upload releases
- Respond to messages
- Get notifications
- Access press kit

**Download:**
- iOS App Store
- Google Play Store
- Tablet optimized

## API & Integrations

### Developer Access

**API Capabilities:**
- Pull analytics data
- Upload releases
- Manage metadata
- Track royalties
- Webhook notifications

**Documentation:**
- API reference
- Code examples
- Authentication
- Rate limits
- Support

### Third-Party Integrations

**Connected Apps:**
- Social media (auto-posting)
- Email marketing platforms
- Accounting software
- Calendar/scheduling
- Website builders

## Account Settings

### Profile Management

**Your Profile:**
- Artist bio
- Photos/branding
- Social media links
- Genre tags
- Location
- Verification

### Preferences

**Customize:**
- Email notifications
- Dashboard layout
- Date/time format
- Currency
- Language
- Privacy settings

### Team Access

**Multi-User:**
- Add team members
- Set permissions
- Role assignments
- Activity logging
- Revoke access

**Roles:**
- Owner (full access)
- Admin
- Manager
- Analyst (view only)
- Custom roles

## Subscription & Billing

### Plan Tiers

**Free:**
- Basic distribution
- Standard analytics
- Email support

**Pro ($):**
- Advanced features
- Priority support
- No revenue cap
- Extra tools

**Enterprise ($$$):**
- Custom solutions
- Dedicated support
- White label
- API access

### Payment History

**View:**
- Past invoices
- Receipts
- Payment method
- Upgrade/downgrade
- Referral credits

## Tips for Power Users

### Keyboard Shortcuts

**Navigate Faster:**
- Cmd/Ctrl + K: Quick search
- Cmd/Ctrl + N: New release
- Cmd/Ctrl + D: Dashboard
- Cmd/Ctrl + A: Analytics
- Cmd/Ctrl + /: Shortcuts list

### Workflow Automation

**Set Up:**
- Auto-distribute to all platforms
- Scheduled social posts
- Email sequences
- Report generation
- Backup reminders

### Batch Operations

**Save Time:**
- Bulk metadata edits
- Multi-track upload
- Mass messaging
- Export multiple reports
- Archive old releases

## Troubleshooting

### Common Issues

**Release Rejected:**
- Check audio quality
- Verify artwork specs
- Review metadata
- Confirm ISRC validity
- Contact support

**Missing Analytics:**
- Data lag (2-3 days normal)
- Platform reporting delays
- Verify release is live
- Check date filters

**Payment Delays:**
- Review minimum threshold
- Confirm payment method
- Check processing schedule
- Verify tax forms

## Best Practices

### Weekly Routine

**Recommended:**
1. Check dashboard
2. Review analytics
3. Respond to messages
4. Update upcoming releases
5. Engage with community

### Monthly Tasks

**Don't Forget:**
1. Review royalty statements
2. Update press kit
3. Check platform statuses
4. Analyze campaign performance
5. Plan next release
6. Backup important files

### Quarterly Reviews

**Strategic:**
1. Assess growth trends
2. Evaluate tools usage
3. Optimize workflows
4. Review subscriptions
5. Set next quarter goals

## What's New

### Recent Updates

**Latest Features:**
- Enhanced analytics dashboard
- AI-powered playlist recommendations
- Improved mobile app
- New integration partnerships
- Expanded territory support

**Coming Soon:**
- Live performance tracking
- Merch integration
- Fan insights tool
- Sync licensing marketplace
- NFT/Web3 features

## Getting Help

**Still have questions?**

1. Search Help Center
2. Ask in Community Forum
3. Contact Support
4. Book a demo call
5. Check status page

**Pro Tips:**
- Bookmark frequently used pages
- Enable email notifications
- Join community
- Follow our blog
- Attend webinars

Remember: The platform is built for you. Explore, experiment, and don't hesitate to reach out if you need assistance. We're here to help you succeed!`,
    learning_objectives: [
      'Navigate the entire MSC & Co platform efficiently',
      'Master distribution, analytics, and marketing tools',
      'Optimize workflow with automation and shortcuts',
      'Leverage all available resources for music career growth'
    ],
    is_published: true,
    order_index: 1
  }
];

async function seedModules() {
  console.log('🌱 Starting to seed learning modules...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const module of modules) {
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .insert([module])
        .select();

      if (error) throw error;

      console.log(`✅ Created: ${module.title}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error creating "${module.title}":`, error.message);
      errorCount++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Success: ${successCount} modules`);
  console.log(`❌ Errors: ${errorCount} modules`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

seedModules();
