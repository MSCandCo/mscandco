'use strict';

/**
 * creation controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::creation.creation', ({ strapi }) => ({
  // Custom find method with advanced filtering
  async find(ctx) {
    const { query } = ctx;
    
    // Build advanced filters
    const filters = {};
    
    // Text search across multiple fields
    if (query.search) {
      filters.$or = [
        { title: { $containsi: query.search } },
        { lyrics: { $containsi: query.search } },
        { credits: { $containsi: query.search } },
        { notes: { $containsi: query.search } },
        { composer: { $containsi: query.search } },
        { arranger: { $containsi: query.search } },
        { producer: { $containsi: query.search } }
      ];
    }
    
    // Status filter
    if (query.status) {
      filters.status = query.status;
    }
    
    // Priority filter
    if (query.priority) {
      filters.priority = query.priority;
    }
    
    // Project filter
    if (query.project) {
      filters.project = query.project;
    }
    
    // Genre filter
    if (query.genre) {
      filters.genre = query.genre;
    }
    
    // Vocal type filter
    if (query.vocals) {
      filters.vocals = query.vocals;
    }
    
    // Mood filter
    if (query.mood) {
      filters.mood = query.mood;
    }
    
    // Tempo filter
    if (query.tempo) {
      filters.tempo = query.tempo;
    }
    
    // BPM range filter
    if (query.bpmMin || query.bpmMax) {
      filters.bpm = {};
      if (query.bpmMin) filters.bpm.$gte = parseInt(query.bpmMin);
      if (query.bpmMax) filters.bpm.$lte = parseInt(query.bpmMax);
    }
    
    // Duration range filter
    if (query.durationMin || query.durationMax) {
      filters.duration = {};
      if (query.durationMin) filters.duration.$gte = parseInt(query.durationMin);
      if (query.durationMax) filters.duration.$lte = parseInt(query.durationMax);
    }
    
    // Boolean filters
    if (query.isExplicit !== undefined) {
      filters.isExplicit = query.isExplicit === 'true';
    }
    
    if (query.isInstrumental !== undefined) {
      filters.isInstrumental = query.isInstrumental === 'true';
    }
    
    // Key filter
    if (query.key) {
      filters.key = query.key;
    }
    
    // Language filter
    if (query.language) {
      filters.language = query.language;
    }
    
    // License type filter
    if (query.licenseType) {
      filters.licenseType = query.licenseType;
    }
    
    // Exclusivity filter
    if (query.exclusivity) {
      filters.exclusivity = query.exclusivity;
    }
    
    // Tags filter
    if (query.tags) {
      const tagArray = Array.isArray(query.tags) ? query.tags : [query.tags];
      filters.tags = { $contains: tagArray };
    }
    
    // Date range filters
    if (query.recordingDateFrom) {
      filters.recordingDate = { $gte: query.recordingDateFrom };
    }
    if (query.recordingDateTo) {
      filters.recordingDate = { ...filters.recordingDate, $lte: query.recordingDateTo };
    }
    
    // Update the query with our filters
    ctx.query.filters = { ...ctx.query.filters, ...filters };
    
    // Add populate for related data
    ctx.query.populate = {
      project: {
        fields: ['id', 'projectName', 'releaseType', 'status'],
        populate: {
          artist: {
            fields: ['id', 'stageName', 'firstName', 'lastName']
          }
        }
      },
      genre: {
        fields: ['id', 'title']
      },
      audioFile: true
    };
    
    // Call the default find method
    const { data, meta } = await super.find(ctx);
    
    return { data, meta };
  },
  
  // Custom findOne method with full population
  async findOne(ctx) {
    const { id } = ctx.params;
    
    ctx.query.populate = {
      project: {
        fields: ['id', 'projectName', 'releaseType', 'status', 'expectedReleaseDate'],
        populate: {
          artist: {
            fields: ['id', 'stageName', 'firstName', 'lastName', 'email']
          },
          artwork: true
        }
      },
      genre: {
        fields: ['id', 'title']
      },
      audioFile: true
    };
    
    const { data, meta } = await super.findOne(ctx);
    
    return { data, meta };
  },
  
  // Get creations by project
  async getByProject(ctx) {
    const { projectId } = ctx.params;
    
    const creations = await strapi.entityService.findMany('api::creation.creation', {
      filters: { project: projectId },
      populate: {
        genre: {
          fields: ['id', 'title']
        },
        audioFile: true
      },
      sort: { trackNumber: 'asc' }
    });
    
    return { data: creations };
  },
  
  // Get creation statistics
  async getStatistics(ctx) {
    const { projectId } = ctx.query;
    
    const filters = {};
    if (projectId) {
      filters.project = projectId;
    }
    
    const creations = await strapi.entityService.findMany('api::creation.creation', {
      filters,
      fields: ['id', 'status', 'duration', 'bpm', 'vocals', 'mood', 'tempo', 'isExplicit', 'isInstrumental']
    });
    
    const stats = {
      total: creations.length,
      byStatus: {},
      byVocals: {},
      byMood: {},
      byTempo: {},
      totalDuration: 0,
      averageBpm: 0,
      explicitCount: 0,
      instrumentalCount: 0
    };
    
    let totalBpm = 0;
    let bpmCount = 0;
    
    creations.forEach(creation => {
      // Count by status
      stats.byStatus[creation.status] = (stats.byStatus[creation.status] || 0) + 1;
      
      // Count by vocals
      if (creation.vocals) {
        stats.byVocals[creation.vocals] = (stats.byVocals[creation.vocals] || 0) + 1;
      }
      
      // Count by mood
      if (creation.mood) {
        stats.byMood[creation.mood] = (stats.byMood[creation.mood] || 0) + 1;
      }
      
      // Count by tempo
      if (creation.tempo) {
        stats.byTempo[creation.tempo] = (stats.byTempo[creation.tempo] || 0) + 1;
      }
      
      // Duration calculations
      if (creation.duration) {
        stats.totalDuration += creation.duration;
      }
      
      // BPM calculations
      if (creation.bpm) {
        totalBpm += creation.bpm;
        bpmCount++;
      }
      
      // Boolean counts
      if (creation.isExplicit) {
        stats.explicitCount++;
      }
      
      if (creation.isInstrumental) {
        stats.instrumentalCount++;
      }
    });
    
    // Calculate averages
    if (bpmCount > 0) {
      stats.averageBpm = Math.round(totalBpm / bpmCount);
    }
    
    return { data: stats };
  },
  
  // Upload audio file and generate waveform
  async uploadAudio(ctx) {
    const { id } = ctx.params;
    const { audioFile } = ctx.request.files;
    
    if (!audioFile) {
      return ctx.badRequest('No audio file provided');
    }
    
    try {
      // Upload the file
      const uploadedFile = await strapi.plugins.upload.services.upload.upload({
        data: {},
        files: audioFile
      });
      
      // Update the creation with the audio file
      const updatedCreation = await strapi.entityService.update('api::creation.creation', id, {
        data: {
          audioFile: uploadedFile[0].id
        }
      });
      
      // TODO: Generate waveform data here
      // This would typically involve calling an audio processing service
      
      return { data: updatedCreation };
    } catch (error) {
      return ctx.badRequest('Error uploading audio file', { error: error.message });
    }
  }
})); 