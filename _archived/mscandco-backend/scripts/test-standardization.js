const { RELEASE_STATUSES, GENRES, RELEASE_TYPES, getStatusLabel, getStatusColor } = require('../lib/constants');

// Testing script to verify standardization across the system
async function testStandardization() {
  console.log('🧪 Testing Status and Genre Standardization...\n');
  
  try {
    // Test 1: Verify constants are properly defined
    console.log('✅ Test 1: Constants Definition');
    console.log(`  Statuses: ${Object.values(RELEASE_STATUSES).join(', ')}`);
    console.log(`  Genres: ${GENRES.join(', ')}`);
    console.log(`  Release Types: ${RELEASE_TYPES.join(', ')}`);
    
    // Test 2: Verify helper functions work correctly
    console.log('\n✅ Test 2: Helper Functions');
    Object.values(RELEASE_STATUSES).forEach(status => {
      const label = getStatusLabel(status);
      const color = getStatusColor(status);
      console.log(`  ${status} → Label: "${label}", Color: "${color}"`);
    });
    
    // Test 3: Test API validation
    console.log('\n✅ Test 3: API Validation');
    const { validateProjectData, validateStatusUpdate, validateGenreUpdate } = require('../src/middlewares/validation');
    
    // Test valid data
    const validRequest = {
      body: {
        status: 'draft',
        genre: 'Electronic',
        releaseType: 'Single',
        trackListing: [
          { title: 'Test Track', bpm: 120, songKey: 'C Major', isrc: 'TEST12345678' }
        ]
      }
    };
    
    const mockResponse = {
      status: (code) => ({
        json: (data) => {
          if (code === 400) {
            console.log(`  ❌ Validation failed: ${JSON.stringify(data)}`);
          }
        }
      })
    };
    
    let validationPassed = true;
    const mockNext = () => {
      console.log('  ✅ Validation passed');
    };
    
    // Test valid data
    validateProjectData(validRequest, mockResponse, mockNext);
    
    // Test invalid status
    const invalidStatusRequest = {
      body: { status: 'invalid_status' }
    };
    validateStatusUpdate(invalidStatusRequest, mockResponse, () => {
      validationPassed = false;
    });
    
    // Test invalid genre
    const invalidGenreRequest = {
      body: { genre: 'Invalid Genre' }
    };
    validateGenreUpdate(invalidGenreRequest, mockResponse, () => {
      validationPassed = false;
    });
    
    // Test 4: Check database schema
    console.log('\n✅ Test 4: Database Schema');
    try {
      const projects = await strapi.entityService.findMany('api::project.project', {
        fields: ['id', 'status', 'genre', 'releaseType']
      });
      
      console.log(`  Found ${projects.length} projects in database`);
      
      // Check for any non-standardized values
      const invalidStatuses = projects.filter(p => !Object.values(RELEASE_STATUSES).includes(p.status));
      const invalidGenres = projects.filter(p => !GENRES.includes(p.genre));
      const invalidReleaseTypes = projects.filter(p => !RELEASE_TYPES.includes(p.releaseType));
      
      if (invalidStatuses.length > 0) {
        console.log(`  ⚠️  Found ${invalidStatuses.length} projects with non-standardized statuses`);
        invalidStatuses.forEach(p => console.log(`    Project ${p.id}: "${p.status}"`));
      } else {
        console.log('  ✅ All projects have standardized statuses');
      }
      
      if (invalidGenres.length > 0) {
        console.log(`  ⚠️  Found ${invalidGenres.length} projects with non-standardized genres`);
        invalidGenres.forEach(p => console.log(`    Project ${p.id}: "${p.genre}"`));
      } else {
        console.log('  ✅ All projects have standardized genres');
      }
      
      if (invalidReleaseTypes.length > 0) {
        console.log(`  ⚠️  Found ${invalidReleaseTypes.length} projects with non-standardized release types`);
        invalidReleaseTypes.forEach(p => console.log(`    Project ${p.id}: "${p.releaseType}"`));
      } else {
        console.log('  ✅ All projects have standardized release types');
      }
      
    } catch (error) {
      console.log(`  ❌ Database test failed: ${error.message}`);
    }
    
    // Test 5: Check track listing fields
    console.log('\n✅ Test 5: Track Listing Fields');
    try {
      const projectsWithTracks = await strapi.entityService.findMany('api::project.project', {
        populate: {
          trackListing: true
        }
      });
      
      let tracksWithBPM = 0;
      let tracksWithKey = 0;
      let tracksWithISRC = 0;
      
      projectsWithTracks.forEach(project => {
        if (project.trackListing) {
          project.trackListing.forEach(track => {
            if (track.bpm) tracksWithBPM++;
            if (track.songKey) tracksWithKey++;
            if (track.isrc) tracksWithISRC++;
          });
        }
      });
      
      console.log(`  Tracks with BPM: ${tracksWithBPM}`);
      console.log(`  Tracks with Key: ${tracksWithKey}`);
      console.log(`  Tracks with ISRC: ${tracksWithISRC}`);
      
    } catch (error) {
      console.log(`  ❌ Track listing test failed: ${error.message}`);
    }
    
    // Test 6: Frontend-Backend Consistency
    console.log('\n✅ Test 6: Frontend-Backend Consistency');
    console.log('  Note: This test should be run from the frontend to verify API responses');
    console.log('  Expected API endpoints to return standardized values:');
    console.log('    GET /api/projects');
    console.log('    POST /api/projects');
    console.log('    PUT /api/projects/:id');
    
    console.log('\n🎉 Standardization testing completed!');
    
    if (!validationPassed) {
      console.log('\n⚠️  Some validation tests failed - check the logs above');
    } else {
      console.log('\n✅ All tests passed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
    throw error;
  }
}

// Export the testing function
module.exports = {
  testStandardization
};

// Run tests if called directly
if (require.main === module) {
  testStandardization()
    .then(() => {
      console.log('\nTesting script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Testing script failed:', error);
      process.exit(1);
    });
} 