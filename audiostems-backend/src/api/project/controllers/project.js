'use strict';

/**
 * project controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::project.project', ({ strapi }) => ({
  // Custom find method with advanced filtering
  async find(ctx) {
    const { query } = ctx;
    
    // Build advanced filters
    const filters = {};
    
    // Text search across multiple fields
    if (query.search) {
      filters.$or = [
        { projectName: { $containsi: query.search } },
        { credits: { $containsi: query.search } },
        { publishingNotes: { $containsi: query.search } },
        { feedback: { $containsi: query.search } },
        { marketingPlan: { $containsi: query.search } }
      ];
    }
    
    // Status filter
    if (query.status) {
      filters.status = query.status;
    }
    
    // Release type filter
    if (query.releaseType) {
      filters.releaseType = query.releaseType;
    }
    
    // Priority filter
    if (query.priority) {
      filters.priority = query.priority;
    }
    
    // Date range filters
    if (query.submissionDateFrom) {
      filters.submissionDate = { $gte: query.submissionDateFrom };
    }
    if (query.submissionDateTo) {
      filters.submissionDate = { ...filters.submissionDate, $lte: query.submissionDateTo };
    }
    
    if (query.expectedReleaseDateFrom) {
      filters.expectedReleaseDate = { $gte: query.expectedReleaseDateFrom };
    }
    if (query.expectedReleaseDateTo) {
      filters.expectedReleaseDate = { ...filters.expectedReleaseDate, $lte: query.expectedReleaseDateTo };
    }
    
    // Artist filter
    if (query.artist) {
      filters.artist = query.artist;
    }
    
    // Genre filter
    if (query.genre) {
      filters.genre = query.genre;
    }
    
    // Tags filter
    if (query.tags) {
      const tagArray = Array.isArray(query.tags) ? query.tags : [query.tags];
      filters.tags = { $contains: tagArray };
    }
    
    // Budget range filter
    if (query.budgetMin || query.budgetMax) {
      filters.budget = {};
      if (query.budgetMin) filters.budget.$gte = parseFloat(query.budgetMin);
      if (query.budgetMax) filters.budget.$lte = parseFloat(query.budgetMax);
    }
    
    // Update the query with our filters
    ctx.query.filters = { ...ctx.query.filters, ...filters };
    
    // Add populate for related data
    ctx.query.populate = {
      artist: {
        fields: ['id', 'stageName', 'firstName', 'lastName', 'profilePhoto']
      },
      genre: {
        fields: ['id', 'title']
      },
      creations: {
        fields: ['id', 'title', 'duration', 'status'],
        populate: {
          genre: {
            fields: ['id', 'title']
          }
        }
      },
      artwork: true,
      musicFiles: true
    };
    
    // Call the default find method
    const { data, meta } = await super.find(ctx);
    
    return { data, meta };
  },
  
  // Custom findOne method with full population
  async findOne(ctx) {
    const { id } = ctx.params;
    
    ctx.query.populate = {
      artist: {
        fields: ['id', 'stageName', 'firstName', 'lastName', 'profilePhoto', 'email', 'phoneNumber']
      },
      genre: {
        fields: ['id', 'title']
      },
      creations: {
        fields: ['id', 'title', 'duration', 'bpm', 'key', 'status', 'trackNumber', 'isExplicit', 'isInstrumental', 'vocals', 'mood', 'tempo', 'lyrics', 'credits', 'notes', 'audioFile', 'waveformData'],
        populate: {
          genre: {
            fields: ['id', 'title']
          },
          audioFile: true
        }
      },
      artwork: true,
      musicFiles: true,
      trackListing: true
    };
    
    const { data, meta } = await super.findOne(ctx);
    
    return { data, meta };
  },
  
  // Custom create method with automatic lastUpdated
  async create(ctx) {
    ctx.request.body.data.lastUpdated = new Date();
    
    const { data, meta } = await super.create(ctx);
    
    return { data, meta };
  },
  
  // Custom update method with automatic lastUpdated
  async update(ctx) {
    ctx.request.body.data.lastUpdated = new Date();
    
    const { data, meta } = await super.update(ctx);
    
    return { data, meta };
  },
  
  // Get projects by status for status board
  async getStatusBoard(ctx) {
    const { status } = ctx.query;
    
    const filters = {};
    if (status) {
      filters.status = status;
    }
    
    const projects = await strapi.entityService.findMany('api::project.project', {
      filters,
      populate: {
        artist: {
          fields: ['id', 'stageName', 'firstName', 'lastName']
        },
        genre: {
          fields: ['id', 'title']
        }
      },
      sort: { expectedReleaseDate: 'asc' }
    });
    
    return { data: projects };
  },
  
  // Get release calendar data
  async getReleaseCalendar(ctx) {
    const { startDate, endDate } = ctx.query;
    
    const filters = {
      expectedReleaseDate: {}
    };
    
    if (startDate) {
      filters.expectedReleaseDate.$gte = startDate;
    }
    if (endDate) {
      filters.expectedReleaseDate.$lte = endDate;
    }
    
    const projects = await strapi.entityService.findMany('api::project.project', {
      filters,
      populate: {
        artist: {
          fields: ['id', 'stageName', 'firstName', 'lastName']
        },
        genre: {
          fields: ['id', 'title']
        },
        artwork: true
      },
      sort: { expectedReleaseDate: 'asc' }
    });
    
    return { data: projects };
  },
  
  // Get project statistics
  async getStatistics(ctx) {
    const { artistId } = ctx.query;
    
    const filters = {};
    if (artistId) {
      filters.artist = artistId;
    }
    
    const projects = await strapi.entityService.findMany('api::project.project', {
      filters,
      fields: ['id', 'status', 'releaseType', 'expectedReleaseDate', 'actualReleaseDate']
    });
    
    const stats = {
      total: projects.length,
      byStatus: {},
      byReleaseType: {},
      upcoming: 0,
      released: 0,
      overdue: 0
    };
    
    const now = new Date();
    
    projects.forEach(project => {
      // Count by status
      stats.byStatus[project.status] = (stats.byStatus[project.status] || 0) + 1;
      
      // Count by release type
      stats.byReleaseType[project.releaseType] = (stats.byReleaseType[project.releaseType] || 0) + 1;
      
      // Count upcoming, released, and overdue
      if (project.actualReleaseDate) {
        stats.released++;
      } else if (project.expectedReleaseDate) {
        const expectedDate = new Date(project.expectedReleaseDate);
        if (expectedDate > now) {
          stats.upcoming++;
        } else {
          stats.overdue++;
        }
      }
    });
    
    return { data: stats };
  }
})); 