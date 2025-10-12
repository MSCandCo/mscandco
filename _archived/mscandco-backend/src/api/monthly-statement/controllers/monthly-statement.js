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
  },

  // Get track earnings for artist
  async getTrackEarnings(ctx) {
    const { user } = ctx.state;
    const { platform, minEarnings, dateRange } = ctx.query;

    // Mock track earnings data - in production this would come from streaming platforms
    const mockTrackEarnings = [
      {
        id: 1,
        title: "Midnight Dreams",
        artist: "HTay",
        project: "Night Sessions EP",
        totalEarnings: 1250.50,
        thisMonth: 180.25,
        streams: 45000,
        platforms: ["Spotify", "Apple Music", "YouTube"]
      },
      {
        id: 2,
        title: "Ocean Waves",
        artist: "HTay", 
        project: "Night Sessions EP",
        totalEarnings: 980.75,
        thisMonth: 145.80,
        streams: 32000,
        platforms: ["Spotify", "Apple Music"]
      },
      {
        id: 3,
        title: "City Lights",
        artist: "HTay",
        project: "Urban Vibes",
        totalEarnings: 2100.00,
        thisMonth: 320.45,
        streams: 78000,
        platforms: ["Spotify", "Apple Music", "YouTube", "Amazon"]
      },
      {
        id: 4,
        title: "Desert Wind",
        artist: "HTay",
        project: "Desert Journey",
        totalEarnings: 750.25,
        thisMonth: 95.60,
        streams: 22000,
        platforms: ["Spotify", "Apple Music"]
      },
      {
        id: 5,
        title: "Mountain Echo",
        artist: "HTay",
        project: "Nature Sounds",
        totalEarnings: 1650.80,
        thisMonth: 210.30,
        streams: 55000,
        platforms: ["Spotify", "Apple Music", "YouTube"]
      }
    ];

    // Apply filters
    let filteredTracks = mockTrackEarnings;

    if (platform && platform !== 'all') {
      filteredTracks = filteredTracks.filter(track => 
        track.platforms.some(p => p.toLowerCase().includes(platform.toLowerCase()))
      );
    }

    if (minEarnings) {
      filteredTracks = filteredTracks.filter(track => track.totalEarnings >= parseFloat(minEarnings));
    }

    return {
      data: filteredTracks,
      total: filteredTracks.length,
      totalEarnings: filteredTracks.reduce((sum, track) => sum + track.totalEarnings, 0),
      thisMonthTotal: filteredTracks.reduce((sum, track) => sum + track.thisMonth, 0)
    };
  },

  // Get project earnings for artist
  async getProjectEarnings(ctx) {
    const { user } = ctx.state;

    // Mock project earnings data
    const mockProjectEarnings = [
      {
        id: 1,
        title: "Night Sessions EP",
        type: "EP",
        totalEarnings: 2231.25,
        trackCount: 4,
        averagePerTrack: 557.81,
        growth: 12.5,
        releaseDate: "2024-03-15",
        tracks: ["Midnight Dreams", "Ocean Waves", "Starlight", "Moon Phase"]
      },
      {
        id: 2,
        title: "Urban Vibes",
        type: "Album",
        totalEarnings: 4200.00,
        trackCount: 8,
        averagePerTrack: 525.00,
        growth: 8.3,
        releaseDate: "2024-01-20",
        tracks: ["City Lights", "Street Rhythm", "Neon Dreams", "Urban Flow", "Metro Beat", "Night Drive", "City Pulse", "Urban Echo"]
      },
      {
        id: 3,
        title: "Desert Journey",
        type: "EP",
        totalEarnings: 1500.50,
        trackCount: 3,
        averagePerTrack: 500.17,
        growth: -2.1,
        releaseDate: "2024-05-10",
        tracks: ["Desert Wind", "Sand Storm", "Oasis"]
      },
      {
        id: 4,
        title: "Nature Sounds",
        type: "Album",
        totalEarnings: 3300.60,
        trackCount: 6,
        averagePerTrack: 550.10,
        growth: 15.7,
        releaseDate: "2024-02-28",
        tracks: ["Mountain Echo", "Forest Whisper", "River Flow", "Bird Song", "Wind Through Trees", "Rain on Leaves"]
      }
    ];

    return {
      data: mockProjectEarnings,
      total: mockProjectEarnings.length,
      totalEarnings: mockProjectEarnings.reduce((sum, project) => sum + project.totalEarnings, 0),
      averageGrowth: mockProjectEarnings.reduce((sum, project) => sum + project.growth, 0) / mockProjectEarnings.length
    };
  },

  // Get platform analytics for artist
  async getPlatformAnalytics(ctx) {
    const { user } = ctx.state;
    const { dateRange } = ctx.query;

    // Mock platform analytics data
    const mockPlatformAnalytics = {
      platforms: {
        "Spotify": {
          totalEarnings: 4500.75,
          streams: 180000,
          growth: 15.2,
          marketShare: 45.2,
          topTracks: ["City Lights", "Midnight Dreams", "Mountain Echo"]
        },
        "Apple Music": {
          totalEarnings: 3200.50,
          streams: 125000,
          growth: 8.7,
          marketShare: 32.1,
          topTracks: ["Ocean Waves", "Desert Wind", "Starlight"]
        },
        "YouTube": {
          totalEarnings: 1800.25,
          streams: 95000,
          growth: 22.5,
          marketShare: 18.1,
          topTracks: ["City Lights", "Mountain Echo", "Urban Flow"]
        },
        "Amazon Music": {
          totalEarnings: 450.00,
          streams: 25000,
          growth: 5.3,
          marketShare: 4.5,
          topTracks: ["Night Drive", "Street Rhythm", "Neon Dreams"]
        }
      },
      geographicData: {
        "United Kingdom": { earnings: 2800.50, streams: 110000 },
        "United States": { earnings: 3200.75, streams: 130000 },
        "Germany": { earnings: 1200.25, streams: 48000 },
        "Canada": { earnings: 800.00, streams: 32000 },
        "Australia": { earnings: 600.50, streams: 24000 }
      },
      trends: {
        monthlyGrowth: [5.2, 8.1, 12.3, 15.7, 18.2, 22.1, 19.8, 16.5, 14.2, 11.8, 9.5, 7.2],
        platformGrowth: {
          "Spotify": [12.5, 15.2, 18.7, 22.1, 25.3, 28.9],
          "Apple Music": [8.2, 10.5, 12.8, 15.1, 17.4, 19.7],
          "YouTube": [18.5, 22.1, 25.8, 29.4, 32.1, 35.7],
          "Amazon Music": [3.2, 4.1, 4.8, 5.2, 5.7, 6.1]
        }
      }
    };

    return mockPlatformAnalytics;
  },

  // Generate PDF statement
  async generatePDFStatement(ctx) {
    const { user } = ctx.state;
    const { month, year } = ctx.query;

    // Mock PDF generation - in production this would use a PDF library
    const statementData = {
      user: user,
      month: month,
      year: year,
      totalEarnings: 1250.50,
      platformBreakdown: {
        "Spotify": 562.73,
        "Apple Music": 400.13,
        "YouTube": 225.06,
        "Amazon Music": 62.58
      },
      trackBreakdown: [
        { title: "City Lights", earnings: 420.15, streams: 15600 },
        { title: "Midnight Dreams", earnings: 315.20, streams: 11800 },
        { title: "Ocean Waves", earnings: 280.45, streams: 10400 },
        { title: "Mountain Echo", earnings: 234.70, streams: 8700 }
      ],
      generatedAt: new Date().toISOString()
    };

    return {
      success: true,
      message: "PDF statement generated successfully",
      data: statementData,
      downloadUrl: `/api/monthly-statements/download/${month}-${year}-statement.pdf`
    };
  },

  // Get payment history
  async getPaymentHistory(ctx) {
    const { user } = ctx.state;

    // Mock payment history
    const mockPaymentHistory = [
      {
        id: 1,
        date: "2024-07-01",
        amount: 1250.50,
        status: "processed",
        method: "bank_transfer",
        reference: "PAY-2024-001",
        description: "June 2024 earnings"
      },
      {
        id: 2,
        date: "2024-06-01",
        amount: 1180.25,
        status: "processed",
        method: "bank_transfer",
        reference: "PAY-2024-002",
        description: "May 2024 earnings"
      },
      {
        id: 3,
        date: "2024-05-01",
        amount: 1050.75,
        status: "processed",
        method: "bank_transfer",
        reference: "PAY-2024-003",
        description: "April 2024 earnings"
      },
      {
        id: 4,
        date: "2024-08-01",
        amount: 1350.80,
        status: "pending",
        method: "bank_transfer",
        reference: "PAY-2024-004",
        description: "July 2024 earnings"
      }
    ];

    return {
      data: mockPaymentHistory,
      total: mockPaymentHistory.length,
      totalProcessed: mockPaymentHistory.filter(p => p.status === 'processed').reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: mockPaymentHistory.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
    };
  },

  // Update bank details
  async updateBankDetails(ctx) {
    const { user } = ctx.state;
    const bankData = ctx.request.body;

    // Validate bank data
    if (!bankData.accountHolderName || !bankData.accountNumber || !bankData.sortCode) {
      return ctx.badRequest('Missing required bank details');
    }

    // In production, this would update the user's bank details in the database
    // For now, we'll just return success
    return {
      success: true,
      message: "Bank details updated successfully",
      data: {
        accountHolderName: bankData.accountHolderName,
        accountNumber: "****" + bankData.accountNumber.slice(-4),
        sortCode: bankData.sortCode,
        bankName: bankData.bankName,
        accountType: bankData.accountType
      }
    };
  }
})); 