'use strict';

/**
 * monthly-statement controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::monthly-statement.monthly-statement', ({ strapi }) => ({
  // Get statements for a specific user
  async getUserStatements(ctx) {
    const { user } = ctx.state;
    const { page = 1, pageSize = 10, year, month } = ctx.query;

    const filters = {
      user: user.id,
      ...(year && { year }),
      ...(month && { month })
    };

    const statements = await strapi.entityService.findMany('api::monthly-statement.monthly-statement', {
      filters,
      populate: ['user'],
      sort: { year: 'desc', month: 'desc' },
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });

    return statements;
  },

  // Get earnings analytics for a user
  async getEarningsAnalytics(ctx) {
    const { user } = ctx.state;
    const { year } = ctx.query;

    const filters = {
      user: user.id,
      ...(year && { year })
    };

    const statements = await strapi.entityService.findMany('api::monthly-statement.monthly-statement', {
      filters,
      sort: { year: 'asc', month: 'asc' }
    });

    // Calculate analytics
    const totalEarnings = statements.reduce((sum, stmt) => sum + parseFloat(stmt.totalEarnings || 0), 0);
    const averageMonthlyEarnings = statements.length > 0 ? totalEarnings / statements.length : 0;
    const growthRate = statements.length >= 2 ? 
      ((statements[statements.length - 1].totalEarnings - statements[statements.length - 2].totalEarnings) / statements[statements.length - 2].totalEarnings) * 100 : 0;

    const monthlyData = statements.map(stmt => ({
      month: stmt.month,
      year: stmt.year,
      earnings: parseFloat(stmt.totalEarnings || 0),
      streams: parseInt(stmt.totalStreams || 0),
      downloads: parseInt(stmt.totalDownloads || 0)
    }));

    const platformBreakdown = statements.reduce((acc, stmt) => {
      if (stmt.platformBreakdown) {
        Object.keys(stmt.platformBreakdown).forEach(platform => {
          acc[platform] = (acc[platform] || 0) + parseFloat(stmt.platformBreakdown[platform] || 0);
        });
      }
      return acc;
    }, {});

    return {
      totalEarnings,
      averageMonthlyEarnings,
      growthRate,
      monthlyData,
      platformBreakdown,
      totalStatements: statements.length
    };
  },

  // Generate monthly statement
  async generateStatement(ctx) {
    const { user } = ctx.state;
    const { month, year } = ctx.request.body;

    if (!month || !year) {
      return ctx.badRequest('Month and year are required');
    }

    // Check if statement already exists
    const existingStatement = await strapi.entityService.findMany('api::monthly-statement.monthly-statement', {
      filters: {
        user: user.id,
        month,
        year
      }
    });

    if (existingStatement.length > 0) {
      return ctx.badRequest('Statement for this month already exists');
    }

    // Calculate earnings for the month (this would integrate with streaming platforms)
    const mockEarnings = Math.random() * 1000 + 100; // Mock data
    const mockStreams = Math.floor(Math.random() * 10000) + 1000;
    const mockDownloads = Math.floor(Math.random() * 100) + 10;

    const statement = await strapi.entityService.create('api::monthly-statement.monthly-statement', {
      data: {
        user: user.id,
        month,
        year,
        totalEarnings: mockEarnings,
        currency: 'GBP',
        totalStreams: mockStreams,
        totalDownloads: mockDownloads,
        platformBreakdown: {
          'Spotify': mockEarnings * 0.4,
          'Apple Music': mockEarnings * 0.3,
          'YouTube': mockEarnings * 0.2,
          'Other': mockEarnings * 0.1
        },
        trackBreakdown: {
          'Track 1': mockEarnings * 0.3,
          'Track 2': mockEarnings * 0.25,
          'Track 3': mockEarnings * 0.2,
          'Track 4': mockEarnings * 0.15,
          'Track 5': mockEarnings * 0.1
        },
        statementDate: new Date(),
        generated: true
      }
    });

    return statement;
  },

  // Get all statements (for admin/distribution partner)
  async getAllStatements(ctx) {
    const { page = 1, pageSize = 20, user, year, month, minEarnings, maxEarnings } = ctx.query;

    const filters = {
      ...(user && { user }),
      ...(year && { year }),
      ...(month && { month }),
      ...(minEarnings && { totalEarnings: { $gte: minEarnings } }),
      ...(maxEarnings && { totalEarnings: { $lte: maxEarnings } })
    };

    const statements = await strapi.entityService.findMany('api::monthly-statement.monthly-statement', {
      filters,
      populate: ['user'],
      sort: { year: 'desc', month: 'desc' },
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });

    return statements;
  },

  // Get earnings summary for admin dashboard
  async getEarningsSummary(ctx) {
    const statements = await strapi.entityService.findMany('api::monthly-statement.monthly-statement', {
      populate: ['user'],
      sort: { year: 'desc', month: 'desc' }
    });

    const totalEarnings = statements.reduce((sum, stmt) => sum + parseFloat(stmt.totalEarnings || 0), 0);
    const totalStreams = statements.reduce((sum, stmt) => sum + parseInt(stmt.totalStreams || 0), 0);
    const totalDownloads = statements.reduce((sum, stmt) => sum + parseInt(stmt.totalDownloads || 0), 0);
    const totalLicenses = statements.reduce((sum, stmt) => sum + parseInt(stmt.totalLicenses || 0), 0);

    const monthlyTrend = statements.slice(0, 12).map(stmt => ({
      month: stmt.month,
      year: stmt.year,
      earnings: parseFloat(stmt.totalEarnings || 0)
    }));

    const topEarners = statements.reduce((acc, stmt) => {
      const userId = stmt.user?.id;
      if (userId) {
        acc[userId] = (acc[userId] || 0) + parseFloat(stmt.totalEarnings || 0);
      }
      return acc;
    }, {});

    return {
      totalEarnings,
      totalStreams,
      totalDownloads,
      totalLicenses,
      monthlyTrend,
      topEarners: Object.entries(topEarners)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([userId, earnings]) => ({ userId, earnings }))
    };
  }
})); 