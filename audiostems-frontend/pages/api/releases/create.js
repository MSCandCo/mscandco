// API endpoint for creating releases and auto-populating roster
import { requirePermission } from '@/lib/rbac/middleware';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const releaseData = req.body;
    
    // Extract all unique contributors from all assets
    const allContributors = new Map();
    
    releaseData.assets.forEach(asset => {
      Object.entries(asset.contributors).forEach(([contributorType, contributors]) => {
        contributors.forEach(contributor => {
          if (contributor.name && contributor.name.trim()) {
            const key = contributor.name.toLowerCase().trim();
            if (!allContributors.has(key)) {
              allContributors.set(key, {
                name: contributor.name.trim(),
                type: mapContributorTypeToRosterType(contributorType),
                isni: contributor.isni || '',
                pro: contributor.pro || '',
                caeIpi: contributor.caeIpi || '',
                addedFrom: 'release',
                releaseId: releaseData.id || `release_${Date.now()}`,
                createdAt: new Date().toISOString()
              });
            }
          }
        });
      });
    });

    // TODO: Save release to database
    const savedRelease = {
      id: `release_${Date.now()}`,
      ...releaseData,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Add contributors to roster (would normally be database operation)
    // For now, we'll add them to the mock roster
    const fs = require('fs');
    const path = require('path');
    
    // Read current roster API file to update mock data
    const rosterApiPath = path.join(process.cwd(), 'pages/api/artist/roster.js');
    let rosterContent = fs.readFileSync(rosterApiPath, 'utf8');
    
    // Add contributors to roster
    Array.from(allContributors.values()).forEach(contributor => {
      // This would normally be a database insert
      console.log('Adding contributor to roster:', contributor.name, contributor.type);
    });

    console.log(`Release created with ${allContributors.size} unique contributors`);

    res.status(201).json({ 
      success: true, 
      release: savedRelease,
      contributorsAdded: Array.from(allContributors.values())
    });

  } catch (error) {
    console.error('Error creating release:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Map contributor types from release form to roster types
function mapContributorTypeToRosterType(contributorType) {
  const mapping = {
    'producers': 'producer',
    'featuredArtists': 'solo_artist',
    'backgroundVocalists': 'vocalist',
    'mixingEngineers': 'engineer',
    'masteringEngineers': 'mastering',
    'recordingEngineers': 'engineer',
    'keyboardists': 'keyboardist',
    'guitarists': 'guitarist',
    'bassists': 'bassist',
    'drummers': 'drummer',
    'executiveProducers': 'producer',
    'coProducers': 'producer',
    'assistantProducers': 'producer',
    'composers': 'composer'
  };

  return mapping[contributorType] || 'other';
}

// Protect with release:create permission
export default requirePermission('release:create')(handler);
