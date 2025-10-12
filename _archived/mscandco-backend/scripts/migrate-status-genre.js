const { RELEASE_STATUSES, GENRES, RELEASE_TYPES } = require('../lib/constants');

// Migration script to update existing project data to use standardized values
async function migrateProjectData() {
  console.log('Starting migration of project data...');
  
  try {
    // Get all projects
    const projects = await strapi.entityService.findMany('api::project.project', {
      populate: {
        artist: true,
        genre: true,
        trackListing: true
      }
    });
    
    console.log(`Found ${projects.length} projects to migrate`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const project of projects) {
      try {
        const updateData = {};
        let needsUpdate = false;
        
        // Map old status values to new standardized values
        if (project.status) {
          const statusMapping = {
            'in_progress': RELEASE_STATUSES.SUBMITTED,
            'approved': RELEASE_STATUSES.COMPLETED,
            'scheduled': RELEASE_STATUSES.UNDER_REVIEW,
            'released': RELEASE_STATUSES.LIVE,
            'cancelled': RELEASE_STATUSES.DRAFT
          };
          
          if (statusMapping[project.status]) {
            updateData.status = statusMapping[project.status];
            needsUpdate = true;
            console.log(`  Project ${project.id}: Status "${project.status}" → "${updateData.status}"`);
          }
        }
        
        // Map old release type values to new standardized values
        if (project.releaseType) {
          const releaseTypeMapping = {
            'single': 'Single',
            'ep': 'EP',
            'album': 'Album',
            'mixtape': 'Mixtape',
            'compilation': 'Album',
            'live_album': 'Album',
            'remix_album': 'Album',
            'soundtrack': 'Album'
          };
          
          if (releaseTypeMapping[project.releaseType]) {
            updateData.releaseType = releaseTypeMapping[project.releaseType];
            needsUpdate = true;
            console.log(`  Project ${project.id}: Release Type "${project.releaseType}" → "${updateData.releaseType}"`);
          }
        }
        
        // Handle genre migration
        if (project.genre && project.genre.title) {
          // If genre is a relation, extract the title and map it
          const genreTitle = project.genre.title;
          
          // Check if the genre title is already in our standardized list
          if (GENRES.includes(genreTitle)) {
            updateData.genre = genreTitle;
            needsUpdate = true;
            console.log(`  Project ${project.id}: Genre "${genreTitle}" → "${updateData.genre}"`);
          } else {
            // Map common variations to standardized genres
            const genreMapping = {
              'Electronic Music': 'Electronic',
              'Hip-Hop': 'Hip Hop',
              'R&B/Soul': 'R&B',
              'Rock & Roll': 'Rock',
              'Pop Music': 'Pop',
              'Jazz Music': 'Jazz',
              'Classical Music': 'Classical',
              'Country Music': 'Country',
              'Blues Music': 'Blues',
              'Folk Music': 'Folk',
              'Reggae Music': 'Reggae',
              'Punk Rock': 'Punk',
              'Heavy Metal': 'Metal',
              'House Music': 'House',
              'Techno Music': 'Techno',
              'Ambient Music': 'Ambient',
              'Experimental Music': 'Experimental',
              'Latin Music': 'Latin',
              'World Music': 'World',
              'Gospel Music': 'Gospel',
              'Funk Music': 'Funk',
              'Indie Music': 'Indie',
              'Soul Music': 'Soul',
              'Acoustic Music': 'Acoustic',
              'Alternative Rock': 'Alternative',
              'Dance Music': 'Dance'
            };
            
            if (genreMapping[genreTitle]) {
              updateData.genre = genreMapping[genreTitle];
              needsUpdate = true;
              console.log(`  Project ${project.id}: Genre "${genreTitle}" → "${updateData.genre}"`);
            } else {
              // Default to 'Electronic' if no mapping found
              updateData.genre = 'Electronic';
              needsUpdate = true;
              console.log(`  Project ${project.id}: Genre "${genreTitle}" → "Electronic" (default)`);
            }
          }
        }
        
        // Update track listing to include BPM and Key fields if missing
        if (project.trackListing && Array.isArray(project.trackListing)) {
          const updatedTrackListing = project.trackListing.map(track => ({
            ...track,
            bpm: track.bpm || null,
            songKey: track.songKey || null,
            isrc: track.isrc || null
          }));
          
          updateData.trackListing = updatedTrackListing;
          needsUpdate = true;
          console.log(`  Project ${project.id}: Updated track listing with BPM/Key fields`);
        }
        
        // Update the project if changes are needed
        if (needsUpdate) {
          await strapi.entityService.update('api::project.project', project.id, {
            data: updateData
          });
          updatedCount++;
        }
        
      } catch (error) {
        console.error(`  Error migrating project ${project.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\nMigration completed:`);
    console.log(`  ✅ Successfully updated: ${updatedCount} projects`);
    console.log(`  ❌ Errors: ${errorCount} projects`);
    
    // Clean up old genre relations if they exist
    console.log('\nCleaning up old genre relations...');
    try {
      // This would need to be done carefully in a real migration
      // For now, we'll just log that it should be done
      console.log('  Note: Old genre relations should be cleaned up manually if needed');
    } catch (error) {
      console.error('  Error cleaning up genre relations:', error.message);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Export the migration function
module.exports = {
  migrateProjectData
};

// Run migration if called directly
if (require.main === module) {
  migrateProjectData()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
} 