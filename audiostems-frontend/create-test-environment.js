const axios = require('axios');
const { ManagementClient } = require('auth0');

// Configuration
const STRAPI_URL = 'http://localhost:1337';
const AUTH0_DOMAIN = 'dev-x2t2bdk6z050yxkr.uk.auth0.com';
const AUTH0_CLIENT_ID = 'XuGhHG90AAh2GXfcj7QKDmKdc26Gu1fb';
const AUTH0_CLIENT_SECRET = 'd_uz_xfELEL1_gy9MvXzfe5US1FhG-miRC1avrwThEJLB7GizI6Mj07KITVyPdu6';

// Test Users Configuration
const TEST_USERS = [
  // SUPER ADMIN USER
  {
    username: 'superadmin',
    email: 'superadmin@mscandco.com',
    password: 'Test@2025',
    role: 'super_admin',
    brand: 'MSC & Co',
    firstName: 'Super',
    lastName: 'Admin',
    stageName: 'MSC Admin'
  },
  
  // YHWH MSC USERS
  {
    username: 'yhwh_admin',
    email: 'admin@yhwhmsc.com',
    password: 'Test@2025',
    role: 'company_admin',
    brand: 'YHWH MSC',
    firstName: 'YHWH',
    lastName: 'Admin',
    stageName: 'YHWH Admin'
  },
  {
    username: 'yhwh_artist1',
    email: 'artist1@yhwhmsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'YHWH MSC',
    firstName: 'Grace',
    lastName: 'Johnson',
    stageName: 'Grace Johnson'
  },
  {
    username: 'yhwh_artist2',
    email: 'artist2@yhwhmsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'YHWH MSC',
    firstName: 'Michael',
    lastName: 'Thompson',
    stageName: 'Michael T'
  },
  
  // AUDIO MSC USERS
  {
    username: 'audio_admin',
    email: 'admin@audiomsc.com',
    password: 'Test@2025',
    role: 'company_admin',
    brand: 'Audio MSC',
    firstName: 'Audio',
    lastName: 'Admin',
    stageName: 'Audio Admin'
  },
  {
    username: 'audio_artist1',
    email: 'artist1@audiomsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'Audio MSC',
    firstName: 'Sarah',
    lastName: 'Chen',
    stageName: 'Sarah Chen'
  },
  {
    username: 'audio_artist2',
    email: 'artist2@audiomsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'Audio MSC',
    firstName: 'David',
    lastName: 'Martinez',
    stageName: 'David M'
  },
  
  // DISTRIBUTION PARTNERS
  {
    username: 'dist_admin',
    email: 'distadmin@mscandco.com',
    password: 'Test@2025',
    role: 'distribution_partner_admin',
    brand: 'MSC & Co',
    firstName: 'Distribution',
    lastName: 'Admin',
    stageName: 'Dist Admin'
  },
  {
    username: 'distributor1',
    email: 'distributor1@mscandco.com',
    password: 'Test@2025',
    role: 'distributor',
    brand: 'MSC & Co',
    firstName: 'John',
    lastName: 'Distributor',
    stageName: 'John D'
  }
];

// Sample Songs Data
const SAMPLE_SONGS = [
  // YHWH MSC Songs
  {
    title: "Heaven's Glory",
    artist: "Grace Johnson",
    genre: "Contemporary Gospel",
    duration: "4:23",
    bpm: 128,
    key: "C Major",
    mood: "Uplifting",
    brand: "YHWH MSC",
    description: "A powerful contemporary gospel anthem celebrating God's glory",
    lyrics: "Heaven's glory fills the earth...",
    tags: ["gospel", "worship", "uplifting", "contemporary"],
    streams: 15420,
    earnings: 1250.50,
    releaseDate: "2024-01-15"
  },
  {
    title: "Grace Abounds",
    artist: "Grace Johnson",
    genre: "Worship",
    duration: "3:45",
    bpm: 85,
    key: "G Major",
    mood: "Peaceful",
    brand: "YHWH MSC",
    description: "A peaceful worship song about God's abundant grace",
    lyrics: "Grace abounds in every season...",
    tags: ["worship", "peaceful", "grace", "meditation"],
    streams: 8920,
    earnings: 750.25,
    releaseDate: "2024-02-20"
  },
  {
    title: "Mighty Redeemer",
    artist: "Michael T",
    genre: "Gospel Rock",
    duration: "5:12",
    bpm: 140,
    key: "E Minor",
    mood: "Powerful",
    brand: "YHWH MSC",
    description: "A powerful gospel rock anthem about redemption",
    lyrics: "Mighty Redeemer, strong to save...",
    tags: ["gospel", "rock", "powerful", "redemption"],
    streams: 18750,
    earnings: 1650.75,
    releaseDate: "2024-03-10"
  },
  {
    title: "Holy Spirit Flow",
    artist: "Michael T",
    genre: "Contemporary Worship",
    duration: "4:56",
    bpm: 92,
    key: "D Major",
    mood: "Spiritual",
    brand: "YHWH MSC",
    description: "A spiritual worship song inviting the Holy Spirit",
    lyrics: "Holy Spirit flow through me...",
    tags: ["worship", "spiritual", "holy spirit", "contemporary"],
    streams: 12340,
    earnings: 1100.00,
    releaseDate: "2024-04-05"
  },
  {
    title: "Jesus Saves",
    artist: "Grace Johnson & Michael T",
    genre: "Traditional Gospel",
    duration: "3:38",
    bpm: 110,
    key: "F Major",
    mood: "Joyful",
    brand: "YHWH MSC",
    description: "A joyful collaboration celebrating salvation",
    lyrics: "Jesus saves, Jesus saves...",
    tags: ["gospel", "collaboration", "joyful", "salvation"],
    streams: 22100,
    earnings: 1950.50,
    releaseDate: "2024-05-15"
  },
  {
    title: "Breakthrough",
    artist: "Grace Johnson",
    genre: "Modern Worship",
    duration: "4:45",
    bpm: 125,
    key: "A Major",
    mood: "Triumphant",
    brand: "YHWH MSC",
    description: "A triumphant modern worship song about breakthrough",
    lyrics: "Breakthrough is coming, breakthrough is here...",
    tags: ["worship", "triumphant", "breakthrough", "modern"],
    streams: 16890,
    earnings: 1450.25,
    releaseDate: "2024-06-20"
  },
  
  // Audio MSC Songs
  {
    title: "Midnight Drive",
    artist: "Sarah Chen",
    genre: "Synthwave",
    duration: "3:28",
    bpm: 115,
    key: "B Minor",
    mood: "Nostalgic",
    brand: "Audio MSC",
    description: "A nostalgic synthwave track perfect for night driving",
    tags: ["synthwave", "nostalgic", "electronic", "night"],
    streams: 23450,
    earnings: 2100.75,
    releaseDate: "2024-01-10"
  },
  {
    title: "Summer Nights",
    artist: "Sarah Chen",
    genre: "Pop",
    duration: "3:15",
    bpm: 120,
    key: "C Major",
    mood: "Happy",
    brand: "Audio MSC",
    description: "A happy pop song about summer romance",
    tags: ["pop", "happy", "summer", "romance"],
    streams: 18920,
    earnings: 1700.50,
    releaseDate: "2024-02-15"
  },
  {
    title: "Electric Dreams",
    artist: "David M",
    genre: "Electronic",
    duration: "4:32",
    bpm: 130,
    key: "F# Minor",
    mood: "Energetic",
    brand: "Audio MSC",
    description: "An energetic electronic track with futuristic vibes",
    tags: ["electronic", "energetic", "futuristic", "dance"],
    streams: 15670,
    earnings: 1400.25,
    releaseDate: "2024-03-20"
  },
  {
    title: "City Lights",
    artist: "David M",
    genre: "Indie Rock",
    duration: "4:02",
    bpm: 105,
    key: "G Minor",
    mood: "Melancholic",
    brand: "Audio MSC",
    description: "A melancholic indie rock song about urban life",
    tags: ["indie rock", "melancholic", "urban", "atmospheric"],
    streams: 9870,
    earnings: 850.75,
    releaseDate: "2024-04-25"
  },
  {
    title: "Together We Rise",
    artist: "Sarah Chen & David M",
    genre: "Anthemic Pop",
    duration: "4:18",
    bpm: 128,
    key: "D Major",
    mood: "Inspiring",
    brand: "Audio MSC",
    description: "An inspiring anthem about unity and strength",
    tags: ["pop", "anthemic", "inspiring", "unity"],
    streams: 28750,
    earnings: 2600.00,
    releaseDate: "2024-05-30"
  }
];

// Sample Projects Data
const SAMPLE_PROJECTS = [
  // YHWH MSC Projects
  {
    title: "Worship Sessions Vol. 1",
    artist: "Grace Johnson",
    type: "album",
    status: "in_progress",
    releaseDate: "2025-03-15",
    brand: "YHWH MSC",
    description: "A collection of contemporary worship songs",
    songs: ["Heaven's Glory", "Grace Abounds", "Breakthrough"],
    genre: "Contemporary Worship",
    targetAudience: "Christian worship communities"
  },
  {
    title: "Gospel Collaboration EP",
    artist: "Grace Johnson & Michael T",
    type: "ep",
    status: "planning",
    releaseDate: "2025-05-20",
    brand: "YHWH MSC",
    description: "A collaborative gospel EP featuring both artists",
    songs: ["Jesus Saves"],
    genre: "Gospel",
    targetAudience: "Gospel music fans"
  },
  {
    title: "Revival Tour Recordings",
    artist: "Michael T",
    type: "live_album",
    status: "recording",
    releaseDate: "2025-06-10",
    brand: "YHWH MSC",
    description: "Live recordings from the revival tour",
    songs: ["Mighty Redeemer", "Holy Spirit Flow"],
    genre: "Gospel Rock",
    targetAudience: "Live music enthusiasts"
  },
  
  // Audio MSC Projects
  {
    title: "Neon Nights Album",
    artist: "Sarah Chen",
    type: "album",
    status: "mixing",
    releaseDate: "2025-04-15",
    brand: "Audio MSC",
    description: "A full-length synthwave album",
    songs: ["Midnight Drive", "Summer Nights"],
    genre: "Synthwave",
    targetAudience: "Electronic music fans"
  },
  {
    title: "Indie Collective LP",
    artist: "David M",
    type: "album",
    status: "in_progress",
    releaseDate: "2025-07-20",
    brand: "Audio MSC",
    description: "A collaborative indie rock album",
    songs: ["Electric Dreams", "City Lights"],
    genre: "Indie Rock",
    targetAudience: "Indie music listeners"
  },
  {
    title: "Summer Hits Compilation",
    artist: "Sarah Chen & David M",
    type: "compilation",
    status: "planning",
    releaseDate: "2025-08-15",
    brand: "Audio MSC",
    description: "A summer compilation featuring both artists",
    songs: ["Together We Rise"],
    genre: "Pop",
    targetAudience: "Pop music fans"
  },
  
  // Cross-Platform Project
  {
    title: "Music for Change",
    artist: "Various Artists",
    type: "charity_compilation",
    status: "concept",
    releaseDate: "2025-12-01",
    brand: "MSC & Co",
    description: "A charity compilation featuring artists from both brands",
    songs: ["Heaven's Glory", "Together We Rise"],
    genre: "Various",
    targetAudience: "Music for social change"
  }
];

// AI Scoring Data
const AI_SCORING_DATA = [
  {
    artist: "Grace Johnson",
    creativityIndex: 8.5,
    commercialPotential: 7.8,
    marketFit: 9.2,
    technicalSkill: 8.9,
    innovationScore: 7.6,
    audienceEngagement: 8.7,
    recommendations: [
      "Focus on contemporary worship market",
      "Develop more collaborative projects",
      "Expand into digital streaming platforms"
    ]
  },
  {
    artist: "Michael T",
    creativityIndex: 8.2,
    commercialPotential: 8.1,
    marketFit: 8.8,
    technicalSkill: 8.5,
    innovationScore: 8.3,
    audienceEngagement: 8.4,
    recommendations: [
      "Explore gospel rock fusion",
      "Develop live performance content",
      "Target younger gospel audience"
    ]
  },
  {
    artist: "Sarah Chen",
    creativityIndex: 9.1,
    commercialPotential: 8.7,
    marketFit: 8.9,
    technicalSkill: 9.0,
    innovationScore: 8.8,
    audienceEngagement: 8.6,
    recommendations: [
      "Expand into film/TV licensing",
      "Develop more pop crossover hits",
      "Explore international markets"
    ]
  },
  {
    artist: "David M",
    creativityIndex: 8.8,
    commercialPotential: 7.9,
    marketFit: 8.3,
    technicalSkill: 8.7,
    innovationScore: 8.5,
    audienceEngagement: 8.2,
    recommendations: [
      "Focus on indie rock authenticity",
      "Develop atmospheric soundscapes",
      "Target alternative radio markets"
    ]
  }
];

// Analytics Data
const ANALYTICS_DATA = {
  totalStreams: 189450,
  totalEarnings: 16850.25,
  monthlyGrowth: 12.5,
  topGenres: ["Gospel", "Pop", "Electronic", "Worship", "Indie Rock"],
  topMarkets: ["United States", "United Kingdom", "Canada", "Australia", "Germany"],
  audienceDemographics: {
    ageGroups: {
      "18-24": 25,
      "25-34": 35,
      "35-44": 22,
      "45-54": 12,
      "55+": 6
    },
    gender: {
      "Female": 58,
      "Male": 42
    }
  }
};

async function createAuth0Users() {
  console.log('🔐 Creating Auth0 users...');
  
  const management = new ManagementClient({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    scope: 'read:users create:users update:users'
  });

  for (const user of TEST_USERS) {
    try {
      const auth0User = await management.users.create({
        email: user.email,
        password: user.password,
        name: `${user.firstName} ${user.lastName}`,
        nickname: user.stageName,
        user_metadata: {
          username: user.username,
          role: user.role,
          brand: user.brand,
          stageName: user.stageName,
          firstName: user.firstName,
          lastName: user.lastName
        },
        app_metadata: {
          role: user.role,
          brand: user.brand
        }
      });
      
      console.log(`✅ Created Auth0 user: ${user.email}`);
    } catch (error) {
      console.log(`⚠️ Error creating Auth0 user ${user.email}:`, error.message);
    }
  }
}

async function createStrapiUsers() {
  console.log('👥 Creating Strapi users...');
  
  for (const user of TEST_USERS) {
    try {
      const strapiUser = await axios.post(`${STRAPI_URL}/api/users-permissions/users`, {
        username: user.username,
        email: user.email,
        password: user.password,
        confirmed: true,
        blocked: false,
        role: user.role,
        brand: user.brand,
        stageName: user.stageName,
        firstName: user.firstName,
        lastName: user.lastName
      });
      
      console.log(`✅ Created Strapi user: ${user.email}`);
    } catch (error) {
      console.log(`⚠️ Error creating Strapi user ${user.email}:`, error.message);
    }
  }
}

async function createArtists() {
  console.log('🎤 Creating artist profiles...');
  
  const artists = TEST_USERS.filter(user => user.role === 'artist');
  
  for (const artist of artists) {
    try {
      const artistProfile = await axios.post(`${STRAPI_URL}/api/artists`, {
        data: {
          name: artist.stageName,
          email: artist.email,
          brand: artist.brand,
          bio: `Professional ${artist.brand} artist with a passion for creating meaningful music.`,
          socialMedia: {
            instagram: `@${artist.username}`,
            twitter: `@${artist.username}`,
            facebook: artist.username
          },
          genres: artist.brand === 'YHWH MSC' ? ['Gospel', 'Worship'] : ['Pop', 'Electronic'],
          location: 'United States',
          active: true
        }
      });
      
      console.log(`✅ Created artist profile: ${artist.stageName}`);
    } catch (error) {
      console.log(`⚠️ Error creating artist ${artist.stageName}:`, error.message);
    }
  }
}

async function createSongs() {
  console.log('🎵 Creating sample songs...');
  
  for (const song of SAMPLE_SONGS) {
    try {
      const songData = await axios.post(`${STRAPI_URL}/api/songs`, {
        data: {
          title: song.title,
          artist: song.artist,
          genre: song.genre,
          duration: song.duration,
          bpm: song.bpm,
          key: song.key,
          mood: song.mood,
          brand: song.brand,
          description: song.description,
          lyrics: song.lyrics,
          tags: song.tags,
          streams: song.streams,
          earnings: song.earnings,
          releaseDate: song.releaseDate,
          status: 'published'
        }
      });
      
      console.log(`✅ Created song: ${song.title}`);
    } catch (error) {
      console.log(`⚠️ Error creating song ${song.title}:`, error.message);
    }
  }
}

async function createProjects() {
  console.log('📁 Creating sample projects...');
  
  for (const project of SAMPLE_PROJECTS) {
    try {
      const projectData = await axios.post(`${STRAPI_URL}/api/projects`, {
        data: {
          title: project.title,
          artist: project.artist,
          type: project.type,
          status: project.status,
          releaseDate: project.releaseDate,
          brand: project.brand,
          description: project.description,
          songs: project.songs,
          genre: project.genre,
          targetAudience: project.targetAudience
        }
      });
      
      console.log(`✅ Created project: ${project.title}`);
    } catch (error) {
      console.log(`⚠️ Error creating project ${project.title}:`, error.message);
    }
  }
}

async function createAIScoring() {
  console.log('🤖 Creating AI scoring data...');
  
  for (const scoring of AI_SCORING_DATA) {
    try {
      const aiData = await axios.post(`${STRAPI_URL}/api/ai-insights`, {
        data: {
          artist: scoring.artist,
          insightType: 'performance',
          confidence: 0.85,
          priority: 'high',
          title: `AI Analysis: ${scoring.artist}`,
          description: `Comprehensive AI analysis for ${scoring.artist}`,
          data: {
            creativityIndex: scoring.creativityIndex,
            commercialPotential: scoring.commercialPotential,
            marketFit: scoring.marketFit,
            technicalSkill: scoring.technicalSkill,
            innovationScore: scoring.innovationScore,
            audienceEngagement: scoring.audienceEngagement
          },
          recommendations: scoring.recommendations,
          status: 'reviewed'
        }
      });
      
      console.log(`✅ Created AI scoring for: ${scoring.artist}`);
    } catch (error) {
      console.log(`⚠️ Error creating AI scoring for ${scoring.artist}:`, error.message);
    }
  }
}

async function createAnalytics() {
  console.log('📊 Creating analytics data...');
  
  try {
    const analyticsData = await axios.post(`${STRAPI_URL}/api/artist-performance`, {
      data: {
        totalStreams: ANALYTICS_DATA.totalStreams,
        totalEarnings: ANALYTICS_DATA.totalEarnings,
        monthlyGrowth: ANALYTICS_DATA.monthlyGrowth,
        topGenres: ANALYTICS_DATA.topGenres,
        topMarkets: ANALYTICS_DATA.topMarkets,
        audienceDemographics: ANALYTICS_DATA.audienceDemographics,
        period: '2024-2025',
        brand: 'MSC & Co'
      }
    });
    
    console.log(`✅ Created analytics data`);
  } catch (error) {
    console.log(`⚠️ Error creating analytics data:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting MSC & Co Test Environment Setup...\n');
  
  try {
    // Create users in both Auth0 and Strapi
    await createAuth0Users();
    await createStrapiUsers();
    
    // Create content
    await createArtists();
    await createSongs();
    await createProjects();
    await createAIScoring();
    await createAnalytics();
    
    console.log('\n🎉 Test environment setup complete!');
    console.log('\n📋 Test Users Created:');
    TEST_USERS.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.brand}`);
    });
    
    console.log('\n🎵 Sample Songs Created:', SAMPLE_SONGS.length);
    console.log('📁 Sample Projects Created:', SAMPLE_PROJECTS.length);
    console.log('🤖 AI Scoring Data Created:', AI_SCORING_DATA.length);
    
    console.log('\n🔗 Access your platform:');
    console.log('  Frontend: http://localhost:3000');
    console.log('  Backend Admin: http://localhost:1337/admin');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
main(); 