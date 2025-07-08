module.exports = {
  routes: [
    // Distribution Partner Creation Exports
    {
      method: 'POST',
      path: '/export/creations/excel',
      handler: 'export.exportCreationsExcel',
      config: {
        auth: {
          scope: ['distribution_partner', 'super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/export/creations/pdf',
      handler: 'export.exportCreationsPDF',
      config: {
        auth: {
          scope: ['distribution_partner', 'super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },

    // Artist Earnings Exports
    {
      method: 'POST',
      path: '/export/earnings/pdf',
      handler: 'export.exportEarningsPDF',
      config: {
        auth: {
          scope: ['artist', 'super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/export/earnings/excel',
      handler: 'export.exportEarningsExcel',
      config: {
        auth: {
          scope: ['artist', 'super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },

    // Analytics Exports
    {
      method: 'POST',
      path: '/export/analytics/pdf',
      handler: 'export.exportAnalyticsPDF',
      config: {
        auth: {
          scope: ['super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/export/analytics/excel',
      handler: 'export.exportAnalyticsExcel',
      config: {
        auth: {
          scope: ['super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },

    // Project Exports
    {
      method: 'POST',
      path: '/export/projects/pdf',
      handler: 'export.exportProjectsPDF',
      config: {
        auth: {
          scope: ['distribution_partner', 'super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/export/projects/excel',
      handler: 'export.exportProjectsExcel',
      config: {
        auth: {
          scope: ['distribution_partner', 'super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },

    // User Management Exports
    {
      method: 'POST',
      path: '/export/users/excel',
      handler: 'export.exportUsersExcel',
      config: {
        auth: {
          scope: ['super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },

    // Financial Reports
    {
      method: 'POST',
      path: '/export/financial/pdf',
      handler: 'export.exportFinancialPDF',
      config: {
        auth: {
          scope: ['super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/export/financial/excel',
      handler: 'export.exportFinancialExcel',
      config: {
        auth: {
          scope: ['super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },

    // Custom Export Templates
    {
      method: 'POST',
      path: '/export/templates/save',
      handler: 'export.saveExportTemplate',
      config: {
        auth: {
          scope: ['distribution_partner', 'super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/export/templates',
      handler: 'export.getExportTemplates',
      config: {
        auth: {
          scope: ['distribution_partner', 'super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    },

    // Export History
    {
      method: 'GET',
      path: '/export/history',
      handler: 'export.getExportHistory',
      config: {
        auth: {
          scope: ['distribution_partner', 'artist', 'super_admin', 'company_admin']
        },
        policies: [],
        middlewares: []
      }
    }
  ]
}; 