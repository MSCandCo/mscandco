// Seed modules via Supabase REST API (bypasses JS client cache issues)
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const modules = [
  {
    title: 'Introduction to Music Distribution',
    description: 'Learn the fundamentals of digital music distribution and how to get your music on streaming platforms worldwide.',
    category: 'music_distribution',
    difficulty: 'beginner',
    estimated_duration_minutes: 30,
    content_markdown: '# Introduction to Music Distribution\n\nMusic distribution delivers your music to DSPs worldwide.',
    learning_objectives: ['Understand digital distribution', 'Learn metadata requirements', 'Identify key platforms'],
    is_published: true,
    is_featured: true,
    order_index: 1
  },
  {
    title: 'Preparing Your Music for Release',
    description: 'Master the technical requirements for releasing music on streaming platforms.',
    category: 'music_distribution',
    difficulty: 'beginner',
    estimated_duration_minutes: 45,
    content_markdown: '# Preparing Your Music\n\nAudio quality, artwork specs, and metadata best practices.',
    learning_objectives: ['Master audio requirements', 'Create compliant artwork'],
    is_published: true,
    is_featured: false,
    order_index: 2
  },
  {
    title: 'Understanding Streaming Economics',
    description: 'Decode how streaming royalties work and maximize your revenue.',
    category: 'music_distribution',
    difficulty: 'intermediate',
    estimated_duration_minutes: 50,
    content_markdown: '# Streaming Economics\n\nPer-stream rates and revenue strategies.',
    learning_objectives: ['Understand royalty payments', 'Calculate revenue expectations'],
    is_published: true,
    is_featured: false,
    order_index: 3
  },
  {
    title: 'Copyright Fundamentals for Musicians',
    description: 'Essential copyright knowledge every musician needs.',
    category: 'copyright',
    difficulty: 'beginner',
    estimated_duration_minutes: 40,
    content_markdown: '# Copyright Fundamentals\n\nComposition vs Recording copyright explained.',
    learning_objectives: ['Understand copyright types', 'Know your rights'],
    is_published: true,
    is_featured: true,
    order_index: 1
  },
  {
    title: 'Music Publishing Explained',
    description: 'Understanding music publishing and collecting royalties.',
    category: 'copyright',
    difficulty: 'intermediate',
    estimated_duration_minutes: 45,
    content_markdown: '# Music Publishing\n\nPublishing deals and royalty collection.',
    learning_objectives: ['Understand publishing', 'Identify revenue streams'],
    is_published: true,
    is_featured: false,
    order_index: 2
  },
  {
    title: 'Social Media Marketing for Musicians',
    description: 'Build an engaged fanbase across social platforms.',
    category: 'marketing',
    difficulty: 'beginner',
    estimated_duration_minutes: 45,
    content_markdown: '# Social Media Marketing\n\nTikTok, Instagram, and YouTube strategies.',
    learning_objectives: ['Platform strategies', 'Content creation', 'Build fanbase'],
    is_published: true,
    is_featured: false,
    order_index: 1
  },
  {
    title: 'Building Your Email List',
    description: 'Email marketing for musicians.',
    category: 'marketing',
    difficulty: 'intermediate',
    estimated_duration_minutes: 35,
    content_markdown: '# Email Marketing\n\nList building and engagement strategies.',
    learning_objectives: ['Set up email platform', 'Build subscribers'],
    is_published: true,
    is_featured: false,
    order_index: 2
  },
  {
    title: 'Getting on Playlists',
    description: 'Get featured on Spotify, Apple Music, and independent playlists.',
    category: 'marketing',
    difficulty: 'intermediate',
    estimated_duration_minutes: 40,
    content_markdown: '# Playlist Strategies\n\nEditorial, algorithmic, and user-curated playlists.',
    learning_objectives: ['Understand playlist types', 'Master pitching'],
    is_published: true,
    is_featured: true,
    order_index: 3
  },
  {
    title: 'Reading Your Analytics Dashboard',
    description: 'Understand streaming analytics and metrics.',
    category: 'analytics',
    difficulty: 'beginner',
    estimated_duration_minutes: 35,
    content_markdown: '# Analytics Dashboard\n\nStreams, listeners, and key metrics explained.',
    learning_objectives: ['Navigate dashboards', 'Track metrics'],
    is_published: true,
    is_featured: false,
    order_index: 1
  },
  {
    title: 'Using Data to Grow Your Audience',
    description: 'Advanced analytics strategies for growth.',
    category: 'analytics',
    difficulty: 'intermediate',
    estimated_duration_minutes: 40,
    content_markdown: '# Data-Driven Growth\n\nGeographic targeting and audience insights.',
    learning_objectives: ['Analyze data', 'Identify opportunities'],
    is_published: true,
    is_featured: false,
    order_index: 2
  },
  {
    title: 'Music Royalties Explained',
    description: 'Understanding all types of music royalties.',
    category: 'financial',
    difficulty: 'intermediate',
    estimated_duration_minutes: 50,
    content_markdown: '# Music Royalties\n\nMechanical, performance, sync, and more.',
    learning_objectives: ['Understand royalty types', 'Maximize collection'],
    is_published: true,
    is_featured: true,
    order_index: 1
  },
  {
    title: 'Taxes for Musicians',
    description: 'Tax essentials for independent musicians.',
    category: 'financial',
    difficulty: 'intermediate',
    estimated_duration_minutes: 35,
    content_markdown: '# Music Taxes\n\nDeductions, quarterly taxes, and record keeping.',
    learning_objectives: ['Understand taxation', 'Track expenses'],
    is_published: true,
    is_featured: false,
    order_index: 2
  },
  {
    title: 'Platform Tools Masterclass',
    description: 'Master the MSC & Co platform tools.',
    category: 'platform_tools',
    difficulty: 'beginner',
    estimated_duration_minutes: 40,
    content_markdown: '# Platform Tools\n\nDistribution, analytics, and marketing features.',
    learning_objectives: ['Navigate platform', 'Use tools effectively'],
    is_published: true,
    is_featured: false,
    order_index: 1
  },
  {
    title: 'Advanced Distribution Strategies',
    description: 'Optimize your distribution workflow.',
    category: 'platform_tools',
    difficulty: 'intermediate',
    estimated_duration_minutes: 35,
    content_markdown: '# Advanced Distribution\n\nRelease scheduling and metadata optimization.',
    learning_objectives: ['Optimize workflow', 'Maximize efficiency'],
    is_published: true,
    is_featured: false,
    order_index: 2
  }
];

async function seedModules() {
  console.log('🌱 Seeding modules via REST API...\n');

  // First, clear existing
  const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/learning_modules?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'DELETE',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=minimal'
    }
  });

  console.log(`Cleared existing modules: ${deleteResponse.ok ? 'OK' : 'FAILED'}\n`);

  let success = 0;
  let errors = 0;

  for (const module of modules) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/learning_modules`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(module)
    });

    if (response.ok) {
      console.log(`✅ ${module.title}`);
      success++;
    } else {
      const error = await response.text();
      console.error(`❌ ${module.title}: ${error}`);
      errors++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Verify
  const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/learning_modules?select=id,title,category`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });

  if (verifyResponse.ok) {
    const data = await verifyResponse.json();
    console.log(`📚 Total modules in database: ${data.length}`);

    const byCategory = {};
    data.forEach(m => {
      byCategory[m.category] = (byCategory[m.category] || 0) + 1;
    });

    console.log('\nBy category:');
    Object.entries(byCategory).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
  }
}

seedModules().catch(console.error);
