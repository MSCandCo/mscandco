const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'admin@mscandco.com';
const ADMIN_PASSWORD = 'Test@2025';

const users = [
  // SUPER ADMIN
  {
    username: 'superadmin',
    email: 'superadmin@mscandco.com',
    password: 'Test@2025',
    role: 'super_admin',
    brand: 'msc_co',
    firstName: 'Super',
    lastName: 'Admin',
    stageName: 'Super Admin',
    artistType: 'solo_artist'
  },
  
  // YHWH MSC USERS
  {
    username: 'yhwh_admin',
    email: 'admin@yhwhmsc.com',
    password: 'Test@2025',
    role: 'company_admin',
    brand: 'yhwh_msc',
    firstName: 'YHWH',
    lastName: 'Admin',
    stageName: 'YHWH Admin',
    artistType: 'solo_artist'
  },
  {
    username: 'yhwh_artist1',
    email: 'artist1@yhwhmsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'yhwh_msc',
    firstName: 'Sarah',
    lastName: 'Chen',
    stageName: 'Sarah Chen',
    artistType: 'solo_artist'
  },
  {
    username: 'yhwh_artist2',
    email: 'artist2@yhwhmsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'yhwh_msc',
    firstName: 'Marcus',
    lastName: 'Johnson',
    stageName: 'Marcus Johnson',
    artistType: 'solo_artist'
  },
  
  // AUDIO MSC USERS
  {
    username: 'audio_admin',
    email: 'admin@audiomsc.com',
    password: 'Test@2025',
    role: 'company_admin',
    brand: 'audio_msc',
    firstName: 'Audio',
    lastName: 'Admin',
    stageName: 'Audio Admin',
    artistType: 'solo_artist'
  },
  {
    username: 'audio_artist1',
    email: 'artist1@audiomsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'audio_msc',
    firstName: 'Luna',
    lastName: 'Rodriguez',
    stageName: 'Luna Rodriguez',
    artistType: 'solo_artist'
  },
  {
    username: 'audio_artist2',
    email: 'artist2@audiomsc.com',
    password: 'Test@2025',
    role: 'artist',
    brand: 'audio_msc',
    firstName: 'David',
    lastName: 'Kim',
    stageName: 'David Kim',
    artistType: 'solo_artist'
  },
  
  // DISTRIBUTION PARTNERS
  {
    username: 'dist_admin',
    email: 'distadmin@mscandco.com',
    password: 'Test@2025',
    role: 'distribution_partner_admin',
    brand: 'msc_co',
    firstName: 'Distribution',
    lastName: 'Admin',
    stageName: 'Dist Admin',
    artistType: 'solo_artist'
  },
  {
    username: 'distributor1',
    email: 'distributor1@mscandco.com',
    password: 'Test@2025',
    role: 'distributor',
    brand: 'msc_co',
    firstName: 'Alex',
    lastName: 'Thompson',
    stageName: 'Alex Thompson',
    artistType: 'solo_artist'
  }
];

async function createUsers() {
  try {
    console.log('🚀 Creating test users for MSC & Co platform...\n');
    
    // First, try to authenticate as admin
    console.log('📝 Attempting to authenticate as admin...');
    
    for (const user of users) {
      try {
        console.log(`\n👤 Creating user: ${user.username} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Brand: ${user.brand}`);
        
        // Create user via Strapi API
        const response = await axios.post(`${STRAPI_URL}/api/auth/local/register`, {
          username: user.username,
          email: user.email,
          password: user.password,
          role: user.role,
          brand: user.brand,
          firstName: user.firstName,
          lastName: user.lastName,
          stageName: user.stageName,
          artistType: user.artistType
        });
        
        console.log(`   ✅ Successfully created ${user.username}`);
        
        // Create artist profile if it's an artist
        if (user.role === 'artist') {
          try {
            const artistResponse = await axios.post(`${STRAPI_URL}/api/artists`, {
              data: {
                firstName: user.firstName,
                lastName: user.lastName,
                stageName: user.stageName,
                name: user.stageName,
                email: user.email,
                artistType: user.artistType,
                contractStatus: 'active',
                careerStage: 'emerging',
                acquisitionSource: 'organic',
                onboardingCompleted: true,
                profileCompletion: 85,
                aiScore: Math.floor(Math.random() * 30) + 70, // 70-100
                potentialScore: Math.floor(Math.random() * 20) + 80, // 80-100
                marketFit: Math.floor(Math.random() * 25) + 75, // 75-100
                engagementRate: Math.floor(Math.random() * 30) + 70, // 70-100
                growthRate: Math.floor(Math.random() * 40) + 60, // 60-100
                socialMediaMetrics: {
                  instagram: Math.floor(Math.random() * 10000) + 1000,
                  tiktok: Math.floor(Math.random() * 50000) + 5000,
                  youtube: Math.floor(Math.random() * 5000) + 500
                },
                audienceDemographics: {
                  ageGroups: {
                    '18-24': Math.floor(Math.random() * 40) + 20,
                    '25-34': Math.floor(Math.random() * 50) + 30,
                    '35-44': Math.floor(Math.random() * 30) + 10,
                    '45+': Math.floor(Math.random() * 20) + 5
                  },
                  regions: {
                    'North America': Math.floor(Math.random() * 60) + 30,
                    'Europe': Math.floor(Math.random() * 40) + 20,
                    'Asia': Math.floor(Math.random() * 30) + 10,
                    'Other': Math.floor(Math.random() * 20) + 5
                  }
                },
                developmentGoals: [
                  'Increase streaming numbers',
                  'Build social media presence',
                  'Collaborate with other artists',
                  'Secure sync licensing deals'
                ],
                achievementBadges: [
                  'First Upload',
                  'Profile Complete',
                  'First Release'
                ],
                recommendations: [
                  'Focus on TikTok marketing',
                  'Collaborate with similar artists',
                  'Explore sync licensing opportunities'
                ]
              }
            });
            console.log(`   🎵 Created artist profile for ${user.stageName}`);
          } catch (artistError) {
            console.log(`   ⚠️  Could not create artist profile: ${artistError.message}`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Failed to create ${user.username}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 User creation process completed!');
    console.log('\n📋 Test Users Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    users.forEach(user => {
      console.log(`👤 ${user.username} (${user.email})`);
      console.log(`   Role: ${user.role} | Brand: ${user.brand}`);
      console.log(`   Password: Test@2025`);
    });
    
    console.log('\n🔗 Access URLs:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend Admin: http://localhost:1337/admin');
    console.log('   API: http://localhost:1337/api');
    
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
  }
}

createUsers(); 